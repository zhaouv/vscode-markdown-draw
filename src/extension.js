const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function loadWebviewFiles(root) {
  let main = fs.readFileSync(path.join(root, 'webview.html'), { encoding: 'utf8' })
  main = main.replace(/<[^\n]*"\.\/board\/[^\n]*>/g, s => {
    let m = /"\.\/board\/(.*?\.)(.*?)"/.exec(s)
    let content = fs.readFileSync(path.join(root, 'board', m[1] + m[2]), { encoding: 'utf8' })
    switch (m[2]) {
      case 'css':
        return '<style>' + content + '</style>'
      case 'js':
        return '<script nonce="ToBeReplacedByRandomToken">' + content + '</script>'
      default:
        return s
    }
  })
  main = main.replace(/ToBeReplacedByRandomToken/g, getNonce())
  return main
}
const webviewContent = loadWebviewFiles(path.join(__dirname, '..'));

/** @param {vscode.ExtensionContext} context */
function activate(context) {

  // values for webview status
  /** @type {vscode.WebviewPanel | undefined} */
  let currentPanel = undefined;

  // values for editting status
  /** @type {vscode.TextEditor | undefined} */
  let currentEditor = undefined;
  let currentLine = 0;
  let updateHandle = undefined;

  function createNewPanel() {
    // Create and show panel
    currentPanel = vscode.window.createWebviewPanel(
      'drawNote',
      'Draw Note',
      vscode.ViewColumn.Three,
      {
        // Enable scripts in the webview
        enableScripts: true
      }
    );

    currentPanel.webview.html = getWebviewContent();
    // Handle messages from the webview
    currentPanel.webview.onDidReceiveMessage(
      message => {

        switch (message.command) {
          case 'requestCurrentLine':
            pushCurrentLine()
            return;
          case 'editCurrentLine':
            setEditorText(message.text, message.control);
            return;
        }
      },
      undefined,
      context.subscriptions
    );

    realTimeCurrentEditorUpdate()

    currentPanel.onDidDispose(
      () => {
        if (updateHandle != undefined) {
          clearInterval(updateHandle)
          updateHandle = undefined
        }
        currentPanel = undefined;
      },
      undefined,
      context.subscriptions
    );
  }

  function showPanel() {
    currentPanel.reveal();
  }

  function getEditorText(show) {
    let currentEditor_ = currentEditor
    let currentLine_ = currentLine
    let activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
      currentEditor_ = activeTextEditor;
    }
    if (!currentEditor_ || currentEditor_.document.isClosed) {
      if (show) vscode.window.showErrorMessage('No active line');
      return {};
    }
    currentLine_ = currentEditor_.selection.active.line

    let text = currentEditor_.document.getText(new vscode.Range(currentLine_, 0, currentLine_ + 1, 0))
    return { text, currentEditor_, currentLine_ }
  }

  function pushCurrentLine() {
    let { text, currentEditor_, currentLine_ } = getEditorText(true)
    if (typeof text === 'string' && currentPanel) {
      currentEditor = currentEditor_
      currentLine = currentLine_
      currentPanel.webview.postMessage({ command: 'currentLine', content: text });
    }
  }

  function realTimeCurrentEditorUpdate() {
    let strings = ['', '']
    updateHandle = setInterval(() => {
      let { text, currentEditor_, currentLine_ } = getEditorText(false)
      if (typeof text === 'string' && currentPanel) {
        let topush = false
        if (strings[0] !== strings[1] && text === strings[0]) {
          topush = true
        }
        strings[1] = strings[0]
        strings[0] = text
        if (topush) {
          currentEditor = currentEditor_
          currentLine = currentLine_
          currentPanel.webview.postMessage({ command: 'currentLine', content: text });
        }
      }
    }, 100)
  }

  function setEditorText(text, control) {
    console.log(text.slice(0, 30), control);
    if (!currentEditor || currentEditor.document.isClosed) {
      vscode.window.showErrorMessage('The text editor has been closed');
      return;
    }
    let p = vscode.window.showTextDocument(currentEditor.document, {
      viewColumn: currentEditor.viewColumn,
      selection: new vscode.Range(currentLine, 0, currentLine, 0)
    })
      .then((editor) => editor.edit(edit => {
        let lf = '\n'
        edit.replace(new vscode.Range(currentLine, 0, currentLine + 1, 0), text + lf);
      }))
    if (control === 'nextline') {
      p = p
        .then(() => vscode.window.showTextDocument(currentEditor.document, {
          viewColumn: currentEditor.viewColumn,
          selection: new vscode.Range(currentLine + 1, 0, currentLine + 1, 0)
        })) // the next line somehow not working, so use this line
        // .then(() => currentEditor.revealRange(
        //   new vscode.Range(currentLine + 1, 0, currentLine + 1, 0)
        // )) 
        .then(() => {
          pushCurrentLine()
        })
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('markdownDraw.editCurrentLineAsSVG', () => {
      if (currentPanel) {
        showPanel()
        pushCurrentLine()
      } else {
        vscode.commands.executeCommand('workbench.action.editorLayoutTwoRowsRight')
          .then(() => {
            createNewPanel()
            pushCurrentLine()
          })
      }
    })
  );

}
exports.activate = activate;

function getWebviewContent() {
  return webviewContent
}