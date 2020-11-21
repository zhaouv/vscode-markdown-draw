
# realization
 
一些实现涉及的细节和参考也记录在这里

## webview

框架照搬 cat coding 来写, 额外需要能编辑文本, 需要涉及`vscode.window.activeTextEditor`之类的

主要参考以下内容以及之前自己写的markdown有关的插件

https://code.visualstudio.com/api/extension-guides/webview

http://blog.haoji.me/vscode-plugin-webview.html

https://github.com/sxei/vscode-plugin-demo

### current file

```js
let editor = vscode.window.activeTextEditor;
if (!editor) {
    return; // No open text editor
}
let selection = editor.selection;
editor.edit(edit => {
    edit.replace(selection, content);
});
```

??
```js
const line = document.lineAt(position);
```

### link to file

https://github.com/Microsoft/vscode/issues/63073

```js
// ?
// (workspace.workspaceFolders || []).map(folder => folder.uri)

panel.webview.onDidReceiveMessage(async message => {
    if (message.command === "open") {
        const uri = Uri.parse(message.link);
        const line = (+uri.fragment.substring(1)) - 1;
        const editor = await window.showTextDocument(uri);
        editor.revealRange(new Range(line, 0, line, 0), TextEditorRevealType.InCenterIfOutsideViewport);
    }
});
```

```js
const path = '/Users/somefile.txt';
const options = {
	// 选中第3行第9列到第3行第17列
	selection: new vscode.Range(new vscode.Position(2, 8), new vscode.Position(2, 16));
	// 是否预览，默认true，预览的意思是下次再打开文件是否会替换当前文件
	preview: false,
	// 显示在第二个编辑器
	viewColumn: vscode.ViewColumn.Two
}; // 可选, 可以不加入这个对象, 只用path和callback
vscode.window.showTextDocument(vscode.Uri.file(path), options, editor => {
	// 可以操作文档的editor对象
});
```

### 更换位置重新激活

能实时跟随光标最好

不能的话要用过快捷键和菜单掉命令来做

```json
"keybindings": [
    {
        "command": "...",
        "key": "...",
        "mac": "...",
        "when": "editorTextFocus"
    }
],
"menus": {
    "editor/context": [
        {
            "command": "...",
            "when": "editorFocus",
            "group": "7_modification" // 或者 navigation 放在最上面
        }
    ]
}
```

```js
// 当从编辑器中右键菜单执行时则会将当前打开文件路径URI传过去；
// 当直接按Ctrl+Shift+P执行命令时，这个参数为空；
context.subscriptions.push(vscode.commands.registerCommand('...', (uri) => {
	vscode.window.showInformationMessage(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
}));

// vscode.commands.registerTextEditorCommand命令，仅在有被编辑器被激活时调用才生效，此外，这个命令可以访问到当前活动编辑器textEditor：
context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.testEditorCommand', (textEditor, edit) => {
	console.log('正在执行编辑器命令！');
	console.log(textEditor, edit);
}));
```



## svg

准备修改这个项目来实现

open ~/s/graffiti-board/index.html

https://github.com/syfxlin/graffiti-board

https://github.com/syfxlin/xkeditor
