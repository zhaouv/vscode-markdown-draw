if (typeof require !== 'undefined') {
  var { initPaint } = require('./main')
} else {
  var { initPaint } = exports
}

const exposedFunctions = initPaint("svg");

const lineContentInput = document.querySelector('input[type=text]');

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
    setTextContent(content) {
      lineContentInput.value = content;
    },
    setSVGContent(content) {
      // 可能有问题的替换
      document.getElementById('svg').innerHTML = content
        .replace(/<svg id="svg"[^>]*>/, '')
        .replace(/<\/svg>/, '')
      drawAPI.unstable.reRegisterSVG()
    },
    setContent(content) {
      drawAPI.unstable.setTextContent(content)
      document.querySelector("#svg-clean")?.dispatchEvent(new Event('click'))
      // 不准确的检查, 先这么写
      if (content.startsWith('<svg id="svg"')) {
        drawAPI.unstable.setSVGContent(content)
      }
    },
    custom(content) {
      console.log(content);
      if (content.operate) {
        content.operate.forEach(drawAPI.unstable.customOperate);
      }
    },
    customOperate(operate){
      console.log(operate);
      if (operate.type==='script') {
        let func = new Function(operate.function)
        func()
      }
    },
  },
}
window.drawAPI = drawAPI

// Handle the message inside the webview
window.addEventListener('message', event => {

  const message = event.data // The JSON data our extension sent
    || event.detail; // for debug in chrome

  switch (message.command) {
    case 'currentLine':
      drawAPI.unstable.setContent(message.content);
      break;
    case 'custom':
      drawAPI.unstable.custom(message.content);
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
    vscode.postMessage({ command: 'requestCustom' })
  }
}());