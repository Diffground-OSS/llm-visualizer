export function extractText(contextString, tag1, tag2) {
  return contextString.substring(
    contextString.indexOf(tag1) + tag1.length,
    contextString.lastIndexOf(tag2)
  );
}

let timeouts = [];

export function delay(ms) {
  return new Promise(resolve => timeouts.push(setTimeout(resolve, ms)));
}

export function clearDelays() {
  timeouts.forEach(x => clearTimeout(x) && timeouts.shift());
  timeouts = [];
}