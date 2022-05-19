if (typeof require !== 'undefined') {
  var { initPaint } = require('./main')
} else {
  var { initPaint } = exports
}

const exposedFunctions = initPaint("svg");

const svgElement = document.getElementById('svg')
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
    getSVGElement: () => svgElement,
    /**
     * 
     * @param {(dataURL:String)=>undefined} cb callback
     */
    getPNG(cb) {
      var svg = drawAPI.unstable.getSVGElement()
      var { x, y, width, height } = svg.getBBox();
      var b = 10
      var b2 = 2 * b
      var wb = width + x + b
      var hb = height + x + b
      var w = width + b2
      var h = height + b2
      var data = svg.outerHTML.replace('<svg id="svg">',
        `<svg id="svgpng" viewbox="${x - b},${y - b},${w},${h}" style="height:${h}" xmlns="http://www.w3.org/2000/svg">`);
      var r = window.devicePixelRatio || 1;
      var setsize = (ele, ww, hh) => {
        ele.style.width = ww + 'px'
        ele.style.height = hh + 'px'
        ele.setAttribute('width', ww * r)
        ele.setAttribute('height', hh * r)
      }
      var can = document.createElement('canvas')
      setsize(can, w, h)
      var ctx = can.getContext('2d')
      var can2 = document.createElement('canvas')
      setsize(can2, wb, hb)
      var ctx2 = can2.getContext('2d')
      ctx2.scale(r, r)
      var img = new Image();
      setsize(img, wb, hb)
      img.onload = function () {
        ctx2.drawImage(img, 0, 0)
        ctx.putImageData(ctx2.getImageData((x - b) * r, (y - b) * r, w * r, h * r), 0, 0);
        cb(can.toDataURL())
        // document.body.append(can)
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
    },
    reRegisterSVG() {
      exposedFunctions.reInit();
    },
    setTextContent(content) {
      lineContentInput.value = content;
    },
    setSVGContent(content) {
      // 可能有问题的替换
      svgElement.innerHTML = content
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
      else if (match = /!\[.*\]\((.*\.svg)\)/.exec(content)) {
        drawAPI.unstable.readSVGContent(match[1])
      }
    },
    custom(content) {
      console.log(content);
      if (content.operate) {
        content.operate.forEach(drawAPI.unstable.customOperate);
      }
    },
    customOperate(operate) {
      console.log(operate);
      if (operate.type === 'script') {
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
    case 'readFile':
      drawAPI.unstable.setSVGContent(message.content);
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
    drawAPI.unstable.readSVGContent = (file) => {
      vscode.postMessage({
        file,
        command: 'readFile',
      })
    }
    vscode.postMessage({ command: 'requestCurrentLine' })
    vscode.postMessage({ command: 'requestCustom' })
  }
}());