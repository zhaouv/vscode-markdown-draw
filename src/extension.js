const vscode = require("vscode");
const path = require("path");

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

}
exports.activate = activate;

function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draw Note</title>
</head>
<body>
    <h1 id="lines-of-code-counter">0</h1>

    <script>
        const counter = document.getElementById('lines-of-code-counter');

        let count = 0;
        setInterval(() => {
            counter.textContent = count++;
        }, 100);

        // Handle the message inside the webview
        window.addEventListener('message', event => {

            const message = event.data; // The JSON data our extension sent

            switch (message.command) {
                case 'refactor':
                    count = Math.ceil(count * 0.5);
                    counter.textContent = count;
                    break;
            }
        });
    </script>
    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const counter = document.getElementById('lines-of-code-counter');

            let count = 0;
            setInterval(() => {
                count = ~~counter.textContent;

                // Alert the extension when our cat introduces a bug
                if (Math.random() < 0.001 * count) {
                    vscode.postMessage({
                        command: 'alert',
                        text: '🐛  on line ' + count
                    })
                }
            }, 100);
        }())
    </script>
</body>
</html>`;
}