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
        currentPanel.onDidDispose(
            () => {
                currentPanel = undefined;
            },
            undefined,
            context.subscriptions
        );
    }

    function showPanel() {
        currentPanel.reveal();
    }

    function getEditorText() {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            currentEditor = activeTextEditor;
        }
        if (!currentEditor || currentEditor.document.isClosed) {
            vscode.window.showErrorMessage('No open text editor');
            return; // No open text editor
        }
        currentLine = currentEditor.selection.active.line

        let text = currentEditor.document.getText(new vscode.Range(currentLine, 0, currentLine + 1, 0))
        return text
    }

    function setEditorText(text) {
        console.log(text);
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

            let text = getEditorText()
            if (currentPanel) currentPanel.webview.postMessage({ command: 'currentLine', content: text });
        })
    );

}
exports.activate = activate;

function getWebviewContent() {
    return fs.readFileSync(path.join(__dirname, '..', 'webview.html'), { encoding: 'utf8' })
}