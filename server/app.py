from flask import Flask, request, jsonify
from flask_cors import CORS
from itertools import chain

import torch
from transformers import T5Tokenizer
from transformers.modeling_outputs import BaseModelOutput

import definitions
from model import T5WithSpan

device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")

def init_tokenizer(backbone):
  tokenizer = T5Tokenizer.from_pretrained(backbone)

  special_tokens = []

  # add domains
  domains = definitions.ALL_DOMAINS + ["general"]
  for domain in sorted(domains):
    token = "[" + domain + "]"
    special_tokens.append(token)

  # add intents
  intents = list(set(chain(*definitions.DIALOG_ACTS.values())))
  for intent in sorted(intents):
    token = "[" + intent + "]"
    special_tokens.append(token)

  # add slots
  slots = list(set(definitions.ALL_INFSLOT + definitions.ALL_REQSLOT))

  for slot in sorted(slots):
    token = "[value_" + slot + "]"
    special_tokens.append(token)

  special_tokens.extend(definitions.SPECIAL_TOKENS)
  tokenizer.add_special_tokens({"additional_special_tokens": special_tokens})

  return tokenizer

tokenizer = init_tokenizer("t5-small")

# max_seq_len is set to a constant for the Gumbel-Softmax variant
model = T5WithSpan.from_pretrained("trained_model",
                                    num_span=7,
                                    consistency_task=True,
                                    max_seq_len=104,
                                    expected_vocab_size=len(tokenizer)).eval().to(device)

def extract_sequence_fragment(sequence, bos_token, eos_token, tokenizer_eos):
  if bos_token in sequence:
    sequence = sequence[sequence.index(bos_token):]

  if sequence[-1] == tokenizer_eos:
    sequence = sequence[:-1]

  if eos_token in sequence:
    sequence = sequence[:sequence.index(eos_token)+1]
  
  return sequence

def generate_answer(utterance, context=[], db_state="", max_history=4):
  bos_action_token_id = tokenizer.convert_tokens_to_ids(definitions.BOS_ACTION_TOKEN)
  eos_action_token_id = tokenizer.convert_tokens_to_ids(definitions.EOS_ACTION_TOKEN)
  bos_resp_token_id = tokenizer.convert_tokens_to_ids(definitions.BOS_RESP_TOKEN)
  eos_resp_token_id = tokenizer.convert_tokens_to_ids(definitions.EOS_RESP_TOKEN)
  bos_db_token_id = tokenizer.convert_tokens_to_ids(definitions.BOS_DB_TOKEN)
  eos_db_token_id = tokenizer.convert_tokens_to_ids(definitions.EOS_DB_TOKEN)

  input = ""

  for turn in context[-4:]:
    input += turn

  current_input = definitions.BOS_USER_TOKEN + utterance + definitions.EOS_USER_TOKEN
  context.append(current_input)

  tokenized_input = tokenizer([input + current_input])

  input_ids = torch.tensor(tokenized_input.input_ids).to(device)
  attention_mask = torch.tensor(tokenized_input.attention_mask).to(device)

  encoder_outputs = model(input_ids=input_ids,
                          attention_mask=attention_mask,
                          return_dict=False,
                          encoder_only=True,
                          span_task=True)

  span_outputs, encoder_hidden_states = encoder_outputs

  if isinstance(encoder_hidden_states, tuple):
      last_hidden_state = encoder_hidden_states[0]
  else:
      last_hidden_state = encoder_hidden_states

  encoder_outputs = BaseModelOutput(
      last_hidden_state=last_hidden_state)

  belief_outputs = model.generate(encoder_outputs=encoder_outputs,
                                  attention_mask=attention_mask,
                                  max_length=100,
                                  top_p=0.7,
                                  decoder_type="belief")
  

  generated_belief = belief_outputs.cpu().numpy().tolist()[0]

  if generated_belief[-1] == tokenizer.eos_token_id:
    generated_belief = generated_belief[:-1]

  if db_state == None or db_state == "":
    db_state = definitions.DB_NULL_TOKEN

  resp_decoder_input_ids = list(generated_belief)
  resp_decoder_input_ids += tokenizer.encode(definitions.BOS_DB_TOKEN + db_state + definitions.EOS_DB_TOKEN)[:-1]
  resp_decoder_input_ids = torch.tensor([resp_decoder_input_ids]).to(device)

  encoder_outputs = BaseModelOutput(last_hidden_state=last_hidden_state)

  resp_outputs = model.generate(
      encoder_outputs=encoder_outputs,
      attention_mask=attention_mask,
      decoder_input_ids=resp_decoder_input_ids,
      eos_token_id=tokenizer.eos_token_id,
      max_length=200,
      top_p=0.7,
      decoder_type="resp")

  generated_resp = resp_outputs.cpu().numpy().tolist()[0]

  resp_tokens = extract_sequence_fragment(generated_resp,
                                          bos_action_token_id,
                                          eos_resp_token_id,
                                          tokenizer.eos_token_id)
  


  full_context_tokens = generated_belief + generated_resp
  context.append(tokenizer.decode(full_context_tokens))

  return tokenizer.decode(generated_belief), tokenizer.decode(resp_tokens)


# FLASK
app = Flask(__name__)
CORS(app)

@app.route("/generate_answer", methods=["POST"])
def api_generate_answer():
    data = request.get_json()
    if "utterance" not in data:
        return jsonify({"error": "Missing \"utterance\" in request data"}), 400

    context = data.get("context", [])
    db_state = data.get("db_state", "")
    max_history = data.get("max_history", 4)

    belief, response = generate_answer(data["utterance"], context, db_state, max_history)

    return jsonify({
       "response": response,
       "belief": belief,
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
