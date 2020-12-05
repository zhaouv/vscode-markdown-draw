if (typeof require !== 'undefined') {
  var { initPaint } = require('./main')
} else {
  var { initPaint } = exports
}

const exposedFunctions = initPaint("svg");
const drawAPI = {
  unstable: {
    nonce: () => 'ToBeReplacedByRandomToken',
    /**
     * 
     * @param {String} text text
     * @param {Number} control moving number of the cursor
     */
    editCurrentLine({ text, control }) {
      console.log({
        text,
        control,
        command: 'editCurrentLine',
      });
    },
    reRegisterSVG() {
      exposedFunctions.reInit();
    },
  },
}
window.drawAPI = drawAPI

const lineContentInput = document.querySelector('input[type=text]');

function setContent(message) {
  lineContentInput.value = message.content;
  document.querySelector("#svg-clean")?.dispatchEvent(new Event('click'))
  // 不准确的检查, 先这么写
  if (message.content.startsWith('<svg id="svg"')) {
    document.getElementById('svg').innerHTML = message.content
      .replace(/<svg id="svg"[^>]*>/, '')
      .replace(/<\/svg>/, '')
    drawAPI.unstable.reRegisterSVG()
  }
}

// Handle the message inside the webview
window.addEventListener('message', event => {

  const message = event.data // The JSON data our extension sent
    || event.detail; // for debug in chrome

  switch (message.command) {
    case 'currentLine':
      setContent(message);
      break;
  }
});

document.querySelector('#text-nextline').onclick = function () {
  drawAPI.unstable.editCurrentLine({
    control: 1,
    text: lineContentInput.value
  })
};
document.querySelector('#text-change-stay').onclick = function () {
  drawAPI.unstable.editCurrentLine({
    control: 0,
    text: lineContentInput.value
  })
};
document.querySelector('#text-change-nextline').onclick = function () {
  drawAPI.unstable.editCurrentLine({
    control: 1,
    text: lineContentInput.value
  })
};

(function () {
  if (typeof acquireVsCodeApi !== 'undefined') {
    const vscode = acquireVsCodeApi();
    drawAPI.unstable.editCurrentLine = ({ text, control }) => {
      vscode.postMessage({
        text,
        control,
        command: 'editCurrentLine',
      })
    }
    vscode.postMessage({ command: 'requestCurrentLine' })
  }
}());