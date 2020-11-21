const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/** @param {vscode.ExtensionContext} context */
function activate(context) {
    /** @type {vscode.WebviewPanel | undefined} */
    let currentPanel = undefined;

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownDraw.startDrawSVG', () => {
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.Two);
            } else {
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
                                console.log(message);
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
        })
    );

    /** @type {vscode.TextEditor | undefined} */
    let editor = undefined;
    let line = 0;
    
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownDraw.editCurrentLine', () => {

            let activeTextEditor = vscode.window.activeTextEditor;
            if (activeTextEditor) {
                editor = activeTextEditor;
                line = editor.selection.active.line
            }
            if (!editor || editor.document.isClosed) {
                vscode.window.showErrorMessage('No open text editor');
                return; // No open text editor
            }
            
            console.log(Math.random());
            console.log(editor)
            console.log(editor?.selection?.active?.line)
            console.log(editor?.selection?.active?.line===line)
            
            let text = editor.document.getText(new vscode.Range(line, 0, line+1, 0))
            if (currentPanel) currentPanel.webview.postMessage({ command: 'currentLine', content: text });
        })
    );

}
exports.activate = activate;

function getWebviewContent() {
    return fs.readFileSync(path.join(__dirname, '..', 'webview.html'), { encoding: 'utf8' })
}