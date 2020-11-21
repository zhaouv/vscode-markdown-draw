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
                                console.log(message.text);
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
    
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownDraw.editCurrentLine', () => {
            if (currentPanel) currentPanel.webview.postMessage({ command: 'currentLine', content: String(Math.random()) });
        })
    );

}
exports.activate = activate;

function getWebviewContent() {
    return fs.readFileSync(path.join(__dirname, '..', 'webview.html'), { encoding: 'utf8' })
}