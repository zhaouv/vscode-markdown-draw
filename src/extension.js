const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

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
    vscode.commands.executeCommand('workbench.action.editorLayoutTwoRowsRight');
    // Create and show panel
    currentPanel = vscode.window.createWebviewPanel(
      'drawNote',
      'Draw Note',
      vscode.ViewColumn.Two,
      {
        // Enable scripts in the webview
        // 实际上，您的Web视图应始终使用内容安全策略禁用内联脚本
        enableScripts: true
      }
    );

    currentPanel.webview.html = getWebviewContent();
    // Handle messages from the webview
    currentPanel.webview.onDidReceiveMessage(
      message => {

        switch (message.command) {
          case 'alert':
            // console.log(message.text);
            currentPanel.webview.postMessage({ command: 'refactor' });

            return;
          case 'editCurrentLine':
            setEditorText(message.text);
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

  function setEditorText(text) {
    console.log(text);
    if (!currentEditor || currentEditor.document.isClosed) {
      vscode.window.showErrorMessage('The text editor has been closed');
      return;
    }
    currentEditor.edit(edit => {
      let lf = '\n'
      edit.replace(new vscode.Range(currentLine, 0, currentLine + 1, 0), text + lf);
    })
      .then(() => vscode.window.showTextDocument(currentEditor.document, {
        viewColumn: currentEditor.viewColumn,
        selection: new vscode.Range(currentLine + 1, 0, currentLine + 1, 0)
      }))
      .then(() => {
        pushCurrentLine()
      })

  }


  context.subscriptions.push(
    vscode.commands.registerCommand('markdownDraw.startDrawSVG', () => {
      if (currentPanel) {
        showPanel()
      } else {
        createNewPanel()
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('markdownDraw.editCurrentLine', () => {
      pushCurrentLine()
    })
  );

}
exports.activate = activate;

function getWebviewContent() {
  return fs.readFileSync(path.join(__dirname, '..', 'webview.html'), { encoding: 'utf8' })
}