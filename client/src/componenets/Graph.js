import React, { useState, useRef } from "react";
import { WindupChildren } from "windups";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import HistoryIcon from '@mui/icons-material/History';


function extractText(contextString, tag1, tag2) {
  return contextString.substring(
    contextString.indexOf(tag1) + tag1.length,
    contextString.lastIndexOf(tag2)
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const Graph = () => {
  const MAX_HISTORY_LENGTH = 5;
  const DB_STATE = "<bos_db>[db_null]<eos_db>";

  const [inputValue, setInputValue] = useState("");
  const [beliefState, setBeliefState] = useState("Belief state");
  const [dbState, setDbState] = useState("DB state");
  const [response, setResponse] = useState("Response");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const context = useRef([]);

  const handleInputKeyDown = (event) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      generateAnswer();
      event.preventDefault();
      // setBeliefState("<sos_belief> [restaurant] [food] french <eos_belief>");
      // setDbState("<bos_belief>hi, there<eos_belief>");
      // setResponse("<bos_belief>hi, there<eos_belief>");
    }
  }

  const handleInputChange = (ev) => {
    setInputValue(ev.target.value);
  }

  async function generateAnswer() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        utterance: inputValue,
        context: context.current,
        db_state: "",
        max_history: MAX_HISTORY_LENGTH
      }),
    };

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/generate_answer`, requestOptions);
      if (response.ok) {
        const data = await response.json();
        setDbState("");
        setBeliefState(data["belief"]);

        await sleep(250);
        setDbState(DB_STATE)
        await sleep(500);
        setResponse(data["response"]);

        context.current.push(`<bos_user>${inputValue}<eos_user>` + data["belief"] + DB_STATE + data["response"]);
        console.log(context)
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Conversation Context
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Utterance</TableCell>
                  <TableCell>Belief</TableCell>
                  <TableCell>DB</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Response</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {context.current.length > 0
                  ? context.current.map((c, i) =>
                    <TableRow
                      key={i}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{extractText(c, "<bos_user>", "<eos_user>")}</TableCell>
                      <TableCell>{extractText(c, "<bos_belief>", "<eos_belief>")}</TableCell>
                      <TableCell>{extractText(c, "<bos_db>", "<eos_db>")}</TableCell>
                      <TableCell>{extractText(c, "<bos_act>", "<eos_act>")}</TableCell>
                      <TableCell>{extractText(c, "<bos_resp>", "<eos_resp>")}</TableCell>
                    </TableRow>
                  )
                  : <TableRow>
                    <TableCell align="center" colSpan={5}>No current context</TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        width="95%"
        style={{ maxWidth: 600 }}
        viewBox="-0.5 -0.5 432 472"
        id="svg-graph"
      >
        <defs />
        <g>
          <path
            d="M 0 160 L 20 110 L 120 110 L 140 160 Z"
            fill="#d5e8d4"
            stroke="#82b366"
            strokeMiterlimit={10}
            transform="rotate(-180,70,135)"
          />
          <path
            d="M 70 166.37 L 70 300 L 120 300"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 70 161.12 L 73.5 168.12 L 70 166.37 L 66.5 168.12 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <path
            d="M 70 110 L 70 96.37"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 70 91.12 L 73.5 98.12 L 70 96.37 L 66.5 98.12 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <rect
            x={0}
            y={110}
            width={140}
            height={50}
            fill="none"
            stroke="none"
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 138,
                    height: 1,
                    paddingTop: 135,
                    marginLeft: 1
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      Belief
                      <br />
                      Decoder
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={70}
                y={139}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                Belief...
              </text>
            </switch>
          </g>
          <path
            d="M 140 60 L 153.63 60"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 158.88 60 L 151.88 63.5 L 153.63 60 L 151.88 56.5 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <rect
            x={0}
            y={30}
            width={140}
            height={60}
            rx={9}
            ry={9}
            fill="#fafafa"
            stroke="#666666"
            strokeDasharray="3 3"
          />
          <rect
            x={220}
            y={30}
            width={210}
            height={60}
            rx={9}
            ry={9}
            fill="#fafafa"
            stroke="#666666"
            strokeDasharray="3 3"
          />
          <path
            d="M 220 160 L 240 110 L 410 110 L 430 160 Z"
            fill="#d5e8d4"
            stroke="#82b366"
            strokeMiterlimit={10}
            transform="rotate(-180,325,135)"
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 208,
                    height: 1,
                    paddingTop: 135,
                    marginLeft: 221
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      Response
                      <br />
                      Decoder
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={325}
                y={139}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                Response...
              </text>
            </switch>
          </g>
          <path
            d="M 180 85 L 180 103.63"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 180 108.88 L 176.5 101.88 L 180 103.63 L 183.5 101.88 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <path
            d="M 160 45.36 C 160 39.64 168.95 35 180 35 C 185.3 35 190.39 36.09 194.14 38.03 C 197.89 39.98 200 42.61 200 45.36 L 200 74.64 C 200 77.39 197.89 80.02 194.14 81.97 C 190.39 83.91 185.3 85 180 85 C 168.95 85 160 80.36 160 74.64 Z"
            fill="#ffe6cc"
            stroke="#d79b00"
            strokeMiterlimit={10}
          />
          <path
            d="M 200 45.36 C 200 48.11 197.89 50.74 194.14 52.68 C 190.39 54.63 185.3 55.72 180 55.72 C 168.95 55.72 160 51.08 160 45.36"
            fill="none"
            stroke="#d79b00"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 38,
                    height: 1,
                    paddingTop: 69,
                    marginLeft: 161
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      DB
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={180}
                y={72}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                DB
              </text>
            </switch>
          </g>
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 138,
                    height: 1,
                    paddingTop: 10,
                    marginLeft: 1
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 8,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font color="#4d4d4d">
                        <b>
                          <i>Belief State</i>
                        </b>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={70}
                y={12}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="8px"
                textAnchor="middle"
              >
                Belief State
              </text>
            </switch>
          </g>
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 208,
                    height: 1,
                    paddingTop: 10,
                    marginLeft: 221
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 8,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <b>
                        <i>
                          <font color="#999999">System Action</font> +{" "}
                          <font color="#4d4d4d">Response</font>
                        </i>
                      </b>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={325}
                y={12}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="8px"
                textAnchor="middle"
              >
                System Action + Response
              </text>
            </switch>
          </g>
          <path
            d="M 180 200 L 180 220 L 272.54 220 L 272.5 166.37"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 272.5 161.12 L 276.01 168.12 L 272.5 166.37 L 269.01 168.12 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <rect
            x="136.25"
            y={130}
            width="87.5"
            height={70}
            rx="10.5"
            ry="10.5"
            fill="#fafafa"
            stroke="#666666"
            strokeDasharray="3 3"
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 86,
                    height: 1,
                    paddingTop: 165,
                    marginLeft: 137
                  }}
                >
                  <div
                    data-drawio-colors="color: #333333; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(51, 51, 51)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <span style={{ fontSize: 8 }}>
                        <b style={{ fontSize: 10 }}>
                          <font color="#999999" style={{ fontSize: 10 }}>
                            <WindupChildren>
                              {dbState}
                            </WindupChildren>
                          </font>
                        </b>
                      </span>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={180}
                y={169}
                fill="#333333"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                &lt;sos_db&gt; resta...
              </text>
            </switch>
          </g>
          <path
            d="M 377.5 166.37 L 377.54 300 L 310 300"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 377.5 161.12 L 381 168.12 L 377.5 166.37 L 374 168.12 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 82,
                    height: 1,
                    paddingTop: 120,
                    marginLeft: 139
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 8,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <b style={{}}>
                        <i style={{}}>
                          <font color="#999999">DB State</font>
                        </i>
                      </b>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={180}
                y={122}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="8px"
                textAnchor="middle"
              >
                DB State
              </text>
            </switch>
          </g>
          <path
            d="M 215 331 L 217.69 331 L 217.67 316.37"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 217.66 311.12 L 221.17 318.11 L 217.67 316.37 L 214.17 318.12 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <path
            d="M 0 381 L 20 331 L 410 331 L 430 381 Z"
            fill="#dae8fc"
            stroke="#6c8ebf"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 428,
                    height: 1,
                    paddingTop: 356,
                    marginLeft: 1
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      T5 Encoder
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={215}
                y={360}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                T5 Encoder
              </text>
            </switch>
          </g>
          <rect
            x={0}
            y={390}
            width={430}
            height={60}
            rx={9}
            ry={9}
            fill="#fafafa"
            stroke="#666666"
            strokeDasharray="3 3"
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 213,
                    height: 1,
                    paddingTop: 460,
                    marginLeft: 109
                  }}
                >
                  <div
                    data-drawio-colors="color: rgb(0, 0, 0); "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 8,
                        fontFamily: "Helvetica",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <b>
                        <i>
                          <font color="#999999">Dialogue History</font> +{" "}
                          <font color="#4d4d4d">User Utterance</font>
                        </i>
                      </b>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={215}
                y={462}
                fill="rgb(0, 0, 0)"
                fontFamily="Helvetica"
                fontSize="8px"
                textAnchor="middle"
              >
                Dialogue History + User Utterance
              </text>
            </switch>
          </g>
          <rect
            x={120}
            y={290}
            width="42.56"
            height={20}
            fill="rgb(255, 255, 255)"
            stroke="rgb(0, 0, 0)"
          />
          <path
            d="M 124 290 L 124 310 M 158.56 290 L 158.56 310"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 32,
                    height: 1,
                    paddingTop: 300,
                    marginLeft: 126
                  }}
                >
                  <div
                    data-drawio-colors="color: #999999; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(153, 153, 153)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font color="#4d4d4d">
                        <mjx-container className="MathJax" jax="SVG" display="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2.049ex"
                            height="1.339ex"
                            role="img"
                            focusable="false"
                            viewBox="0 -442 905.6 592"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{ verticalAlign: "-0.339ex" }}
                          >
                            <defs>
                              <path
                                id="MJX-397-TEX-I-1D460"
                                d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"
                              />
                              <path
                                id="MJX-397-TEX-N-31"
                                d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"
                              />
                            </defs>
                            <g
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              transform="scale(1,-1)"
                            >
                              <g data-mml-node="math">
                                <g data-mml-node="msub">
                                  <g data-mml-node="mi">
                                    <use
                                      data-c="1D460"
                                      xlinkHref="#MJX-397-TEX-I-1D460"
                                    />
                                  </g>
                                  <g
                                    data-mml-node="mn"
                                    transform="translate(502,-150) scale(0.707)"
                                  >
                                    <use data-c={31} xlinkHref="#MJX-397-TEX-N-31" />
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </mjx-container>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={142}
                y={304}
                fill="#999999"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                $$s_1$$
              </text>
            </switch>
          </g>
          <rect
            x="158.19"
            y={290}
            width="42.56"
            height={20}
            fill="rgb(255, 255, 255)"
            stroke="rgb(0, 0, 0)"
          />
          <path
            d="M 162.19 290 L 162.19 310 M 196.75 290 L 196.75 310"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 32,
                    height: 1,
                    paddingTop: 300,
                    marginLeft: 164
                  }}
                >
                  <div
                    data-drawio-colors="color: #999999; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(153, 153, 153)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font color="#4d4d4d">
                        <mjx-container className="MathJax" jax="SVG" display="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2.049ex"
                            height="1.339ex"
                            role="img"
                            focusable="false"
                            viewBox="0 -442 905.6 592"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{ verticalAlign: "-0.339ex" }}
                          >
                            <defs>
                              <path
                                id="MJX-398-TEX-I-1D460"
                                d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"
                              />
                              <path
                                id="MJX-398-TEX-N-32"
                                d="M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z"
                              />
                            </defs>
                            <g
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              transform="scale(1,-1)"
                            >
                              <g data-mml-node="math">
                                <g data-mml-node="msub">
                                  <g data-mml-node="mi">
                                    <use
                                      data-c="1D460"
                                      xlinkHref="#MJX-398-TEX-I-1D460"
                                    />
                                  </g>
                                  <g
                                    data-mml-node="mn"
                                    transform="translate(502,-150) scale(0.707)"
                                  >
                                    <use data-c={32} xlinkHref="#MJX-398-TEX-N-32" />
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </mjx-container>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={180}
                y={304}
                fill="#999999"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                $$s_2$$
              </text>
            </switch>
          </g>
          <rect
            x="196.38"
            y={290}
            width="42.56"
            height={20}
            fill="rgb(255, 255, 255)"
            stroke="rgb(0, 0, 0)"
          />
          <path
            d="M 200.38 290 L 200.38 310 M 234.94 290 L 234.94 310"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 32,
                    height: 1,
                    paddingTop: 300,
                    marginLeft: 202
                  }}
                >
                  <div
                    data-drawio-colors="color: #999999; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(153, 153, 153)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font color="#4d4d4d">
                        <mjx-container className="MathJax" jax="SVG" display="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2.049ex"
                            height="1.375ex"
                            role="img"
                            focusable="false"
                            viewBox="0 -442 905.6 607.6"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{ verticalAlign: "-0.375ex" }}
                          >
                            <defs>
                              <path
                                id="MJX-399-TEX-I-1D460"
                                d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"
                              />
                              <path
                                id="MJX-399-TEX-N-33"
                                d="M127 463Q100 463 85 480T69 524Q69 579 117 622T233 665Q268 665 277 664Q351 652 390 611T430 522Q430 470 396 421T302 350L299 348Q299 347 308 345T337 336T375 315Q457 262 457 175Q457 96 395 37T238 -22Q158 -22 100 21T42 130Q42 158 60 175T105 193Q133 193 151 175T169 130Q169 119 166 110T159 94T148 82T136 74T126 70T118 67L114 66Q165 21 238 21Q293 21 321 74Q338 107 338 175V195Q338 290 274 322Q259 328 213 329L171 330L168 332Q166 335 166 348Q166 366 174 366Q202 366 232 371Q266 376 294 413T322 525V533Q322 590 287 612Q265 626 240 626Q208 626 181 615T143 592T132 580H135Q138 579 143 578T153 573T165 566T175 555T183 540T186 520Q186 498 172 481T127 463Z"
                              />
                            </defs>
                            <g
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              transform="scale(1,-1)"
                            >
                              <g data-mml-node="math">
                                <g data-mml-node="msub">
                                  <g data-mml-node="mi">
                                    <use
                                      data-c="1D460"
                                      xlinkHref="#MJX-399-TEX-I-1D460"
                                    />
                                  </g>
                                  <g
                                    data-mml-node="mn"
                                    transform="translate(502,-150) scale(0.707)"
                                  >
                                    <use data-c={33} xlinkHref="#MJX-399-TEX-N-33" />
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </mjx-container>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={218}
                y={304}
                fill="#999999"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                $$s_3$$
              </text>
            </switch>
          </g>
          <rect
            x="234.57"
            y={290}
            width="42.56"
            height={20}
            fill="rgb(255, 255, 255)"
            stroke="rgb(0, 0, 0)"
          />
          <path
            d="M 238.57 290 L 238.57 310 M 273.13 290 L 273.13 310"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 32,
                    height: 1,
                    paddingTop: 300,
                    marginLeft: 240
                  }}
                >
                  <div
                    data-drawio-colors="color: #999999; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(153, 153, 153)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font color="#4d4d4d">
                        <mjx-container className="MathJax" jax="SVG" display="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="4.383ex"
                            height="1.471ex"
                            role="img"
                            focusable="false"
                            viewBox="0 -442 1937.2 650"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{ verticalAlign: "-0.471ex" }}
                          >
                            <defs>
                              <path
                                id="MJX-400-TEX-I-1D460"
                                d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"
                              />
                              <path
                                id="MJX-400-TEX-I-1D43F"
                                d="M228 637Q194 637 192 641Q191 643 191 649Q191 673 202 682Q204 683 217 683Q271 680 344 680Q485 680 506 683H518Q524 677 524 674T522 656Q517 641 513 637H475Q406 636 394 628Q387 624 380 600T313 336Q297 271 279 198T252 88L243 52Q243 48 252 48T311 46H328Q360 46 379 47T428 54T478 72T522 106T564 161Q580 191 594 228T611 270Q616 273 628 273H641Q647 264 647 262T627 203T583 83T557 9Q555 4 553 3T537 0T494 -1Q483 -1 418 -1T294 0H116Q32 0 32 10Q32 17 34 24Q39 43 44 45Q48 46 59 46H65Q92 46 125 49Q139 52 144 61Q147 65 216 339T285 628Q285 635 228 637Z"
                              />
                              <path
                                id="MJX-400-TEX-N-2212"
                                d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"
                              />
                              <path
                                id="MJX-400-TEX-N-31"
                                d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"
                              />
                            </defs>
                            <g
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              transform="scale(1,-1)"
                            >
                              <g data-mml-node="math">
                                <g data-mml-node="msub">
                                  <g data-mml-node="mi">
                                    <use
                                      data-c="1D460"
                                      xlinkHref="#MJX-400-TEX-I-1D460"
                                    />
                                  </g>
                                  <g
                                    data-mml-node="TeXAtom"
                                    transform="translate(502,-150) scale(0.707)"
                                    data-mjx-texclass="ORD"
                                  >
                                    <g data-mml-node="mi">
                                      <use
                                        data-c="1D43F"
                                        xlinkHref="#MJX-400-TEX-I-1D43F"
                                      />
                                    </g>
                                    <g
                                      data-mml-node="mo"
                                      transform="translate(681,0)"
                                    >
                                      <use
                                        data-c={2212}
                                        xlinkHref="#MJX-400-TEX-N-2212"
                                      />
                                    </g>
                                    <g
                                      data-mml-node="mn"
                                      transform="translate(1459,0)"
                                    >
                                      <use
                                        data-c={31}
                                        xlinkHref="#MJX-400-TEX-N-31"
                                      />
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </mjx-container>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={256}
                y={304}
                fill="#999999"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                $$s_{"{"}L...
              </text>
            </switch>
          </g>
          <rect
            x="272.76"
            y={290}
            width="37.24"
            height={20}
            fill="rgb(255, 255, 255)"
            stroke="rgb(0, 0, 0)"
          />
          <path
            d="M 276.76 290 L 276.76 310 M 306 290 L 306 310"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 28,
                    height: 1,
                    paddingTop: 300,
                    marginLeft: 278
                  }}
                >
                  <div
                    data-drawio-colors="color: #999999; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(153, 153, 153)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font color="#4d4d4d">
                        <mjx-container className="MathJax" jax="SVG" display="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2.338ex"
                            height="1.339ex"
                            role="img"
                            focusable="false"
                            viewBox="0 -442 1033.5 592"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{ verticalAlign: "-0.339ex" }}
                          >
                            <defs>
                              <path
                                id="MJX-401-TEX-I-1D460"
                                d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"
                              />
                              <path
                                id="MJX-401-TEX-I-1D43F"
                                d="M228 637Q194 637 192 641Q191 643 191 649Q191 673 202 682Q204 683 217 683Q271 680 344 680Q485 680 506 683H518Q524 677 524 674T522 656Q517 641 513 637H475Q406 636 394 628Q387 624 380 600T313 336Q297 271 279 198T252 88L243 52Q243 48 252 48T311 46H328Q360 46 379 47T428 54T478 72T522 106T564 161Q580 191 594 228T611 270Q616 273 628 273H641Q647 264 647 262T627 203T583 83T557 9Q555 4 553 3T537 0T494 -1Q483 -1 418 -1T294 0H116Q32 0 32 10Q32 17 34 24Q39 43 44 45Q48 46 59 46H65Q92 46 125 49Q139 52 144 61Q147 65 216 339T285 628Q285 635 228 637Z"
                              />
                            </defs>
                            <g
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              transform="scale(1,-1)"
                            >
                              <g data-mml-node="math">
                                <g data-mml-node="msub">
                                  <g data-mml-node="mi">
                                    <use
                                      data-c="1D460"
                                      xlinkHref="#MJX-401-TEX-I-1D460"
                                    />
                                  </g>
                                  <g
                                    data-mml-node="mi"
                                    transform="translate(502,-150) scale(0.707)"
                                  >
                                    <use
                                      data-c="1D43F"
                                      xlinkHref="#MJX-401-TEX-I-1D43F"
                                    />
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </mjx-container>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={291}
                y={304}
                fill="#999999"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                $$s_L...
              </text>
            </switch>
          </g>
          <g transform="translate(-0.5 -0.5)">
            <switch>
              <foreignObject
                width="0.1%"
                height="0.1%"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ overflow: "visible", textAlign: "left" }}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    display: "flex",
                    alignItems: "unsafe center",
                    justifyContent: "unsafe center",
                    width: 98,
                    height: 1,
                    paddingTop: 321,
                    marginLeft: 169
                  }}
                >
                  <div
                    data-drawio-colors="color: #999999; "
                    style={{
                      boxSizing: "border-box",
                      fontSize: 0,
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontFamily: "Helvetica",
                        color: "rgb(153, 153, 153)",
                        lineHeight: "1.2",
                        whiteSpace: "normal",
                        overflowWrap: "normal"
                      }}
                    >
                      <font style={{ fontSize: 8 }} color="#4d4d4d">
                        <b style={{}}>
                          <i style={{}}>Sequence&nbsp; &nbsp; &nbsp; encodings</i>
                        </b>
                      </font>
                    </div>
                  </div>
                </div>
              </foreignObject>
              <text
                x={218}
                y={325}
                fill="#999999"
                fontFamily="Helvetica"
                fontSize="12px"
                textAnchor="middle"
              >
                Sequence&nbsp; &nbsp; &nbsp; en...
              </text>
            </switch>
          </g>
          <path
            d="M 325 110 L 325 96.37"
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
            strokeDasharray="1 1"
          />
          <path
            d="M 325 91.12 L 328.5 98.12 L 325 96.37 L 321.5 98.12 Z"
            fill="rgb(0, 0, 0)"
            stroke="rgb(0, 0, 0)"
            strokeMiterlimit={10}
          />
        </g>
        <g transform="translate(-0.5 -0.5)">
          <switch>
            <foreignObject
              width="0.1%"
              height="0.1%"
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
              style={{ overflow: "visible", textAlign: "left" }}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  display: "flex",
                  alignItems: "unsafe center",
                  justifyContent: "unsafe center",
                  width: 428,
                  height: 1,
                  paddingTop: 420,
                  marginLeft: 1
                }}
              >
                <div
                  data-drawio-colors="color: #333333; "
                  style={{
                    boxSizing: "border-box",
                    fontSize: 0,
                    textAlign: "center"
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontFamily: "Helvetica",
                      color: "rgb(51, 51, 51)",
                      whiteSpace: "normal",
                      overflowWrap: "normal"
                    }}
                  >
                    <font style={{ fontSize: 10 }}>
                      <foreignObject>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <div
                            style={{
                              marginRight: 7,
                              cursor: "pointer"
                            }}
                          >
                            <HistoryIcon onClick={handleOpen} />
                          </div>
                          <div>
                            <textarea
                              type="text"
                              onChange={handleInputChange}
                              onKeyDown={handleInputKeyDown}
                              value={inputValue}
                              placeholder="Enter an input"
                              style={{
                                width: 375,
                                height: 40,
                                resize: "none"
                              }}
                            ></textarea>
                          </div>
                        </div>
                      </foreignObject>
                    </font>
                  </div>
                </div>
              </div>
            </foreignObject>
            <text
              x={215}
              y={424}
              fill="#333333"
              fontFamily="Helvetica"
              fontSize="12px"
              textAnchor="middle"
            >
              &lt;sos_user&gt; ... &lt;eos_user&gt; &lt;sos_belief&gt; ...
              &lt;eos_belief&gt; &lt;sos_db&gt; ... &lt;e...
            </text>
          </switch>
        </g>
        <g transform="translate(-0.5 -0.5)">
          <switch>
            <foreignObject
              width="0.1%"
              height="50%"
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
              style={{ overflow: "visible", textAlign: "left" }}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  display: "flex",
                  alignItems: "unsafe center",
                  justifyContent: "unsafe center",
                  width: 208,
                  height: 1,
                  paddingTop: 60,
                  marginLeft: 221
                }}
              >
                <div
                  data-drawio-colors="color: #333333; "
                  style={{
                    boxSizing: "border-box",
                    fontSize: 0,
                    textAlign: "center"
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontFamily: "Helvetica",
                      color: "rgb(51, 51, 51)",
                      lineHeight: "1.2",
                      whiteSpace: "normal",
                    }}
                  >
                    <span style={{ fontSize: 10 }}>
                      <b>
                        <WindupChildren>
                          <div
                            style={{
                              overflowY: "scroll",
                              padding: 5,
                              height: 40,
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <span style={{ color: "#4d4d4d", margin: "auto" }}>{response}</span>
                          </div>
                        </WindupChildren>
                      </b>
                    </span>
                  </div>
                </div>
              </div>
            </foreignObject>
            <text
              x={325}
              y={64}
              fill="#333333"
              fontFamily="Helvetica"
              fontSize="12px"
              textAnchor="middle"
            >
              &lt;sos_action&gt; [restaurant] [inform]...
            </text>
          </switch>
        </g>
        <g transform="translate(-0.5 -0.5)">
          <switch>
            <foreignObject
              width="0.1%"
              height="0.1%"
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
              style={{ overflow: "visible", textAlign: "left" }}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  display: "flex",
                  alignItems: "unsafe center",
                  justifyContent: "unsafe center",
                  width: 138,
                  height: 1,
                  paddingTop: 60,
                  marginLeft: 1
                }}
              >
                <div
                  data-drawio-colors="color: #333333; "
                  style={{
                    boxSizing: "border-box",
                    fontSize: 0,
                    textAlign: "center"
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontFamily: "Helvetica",
                      color: "rgb(51, 51, 51)",
                      lineHeight: "1.2",
                      whiteSpace: "normal",
                      overflowWrap: "normal"
                    }}
                  >
                    <b style={{}}>
                      <font color="#4d4d4d" style={{ fontSize: 10 }}>
                        <WindupChildren>
                          <div
                            style={{
                              overflowY: "scroll",
                              padding: 5,
                              height: 40,
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <span style={{ verticalAlign: "middle" }}>{beliefState}</span>
                          </div>
                        </WindupChildren>
                      </font>
                    </b>
                  </div>
                </div>
              </div>
            </foreignObject>
          </switch>
        </g>
        <switch>
          <g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" />
          <a
            transform="translate(0,-5)"
            xlinkHref="https://www.diagrams.net/doc/faq/svg-export-text-problems"
            target="_blank"
          >
            <text textAnchor="middle" fontSize="10px" x="50%" y="100%">
              Text is not SVG - cannot display
            </text>
          </a>
        </switch>
      </svg>
    </>
  );
}

export default Graph;