# Draw Note

[![](https://img.shields.io/github/stars/zhaouv/vscode-markdown-draw.svg)](https://github.com/zhaouv/vscode-markdown-draw/stargazers) [![](https://img.shields.io/github/forks/zhaouv/vscode-markdown-draw.svg)](https://github.com/zhaouv/vscode-markdown-draw/network/members) [![](https://img.shields.io/github/issues/zhaouv/vscode-markdown-draw.svg)](https://github.com/zhaouv/vscode-markdown-draw/issues) [![](https://img.shields.io/github/license/zhaouv/vscode-markdown-draw.svg)](https://github.com/zhaouv/vscode-markdown-draw/blob/master/LICENSE) [![](https://vsmarketplacebadge.apphb.com/version/zhaouv.vscode-markdown-draw.svg)](https://marketplace.visualstudio.com/items?itemName=zhaouv.vscode-markdown-draw)

**This project is in the prototype stage !**

Draw svg quick-responsively with a mouse or pen,  
Designed for note-taking, formulas drafting

OCR to latex supported now (by [Customize-Buttons and myscript API](#Convert-formulas-to-latex))

![](img_md/mainuidemo.png)

## Usage

open markdown file, right click at some line,  
`Edit/Create current line as SVG`

or press `F1`, type `svg`, click the command

## Prototype Stage

> Compatibility is not guaranteed in prototype stage

Todo:

+ [ ] fold the svg automatically and add a command to fold all svg
+ [ ] adjust behavior of pens
+ [ ] fix the bug of polygon

Welcome [star](https://github.com/zhaouv/vscode-markdown-draw/stargazers) to support the project or [issue](https://github.com/zhaouv/vscode-markdown-draw/issues) to provide ideas

## Customize Buttons

I have not decided the interface. In this stage, it could work this way.

Step 1. You should change the following code(icon/title/onclick), run it in chrome console. It prints one line of string.

```js
console.log(JSON.stringify((()=>{

    // find a icon from https://fontawesome.com/v5.8.2/icons
    const icon = 'beer' 
    const title = 'a new button'
    const addGap = true
    const onclick = ()=>{
        drawAPI.unstable.setTextContent('a custom button works')
    }

    document.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd',(addGap?"<span class='svgiconspliter'></span>":"")+"<div class='svg-btn fa fa-"+icon+"' title='"+title+"'><span></span></div>");
    document.querySelector('div.svg-operate > :last-child').onclick=onclick

}).toString().slice(7,-2)))
```

`"    // find a icon from https://fontawesome.com/v5.8.2/icons\n    const icon = 'beer' \n    const title = 'a new button'\n    const addGap = true\n    const onclick = ()=>{\n        drawAPI.unstable.setTextContent('a custom button works')\n    }\n\n    document.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd',(addGap?\"<span class='svgiconspliter'></span>\":\"\")+\"<div class='svg-btn fa fa-\"+icon+\"' title='\"+title+\"'><span></span></div>\");\n    document.querySelector('div.svg-operate > :last-child').onclick=onclick\n"`

Step 2. Push the string into your settings.json

```json
    "markdown-draw.customized-buttons": [
        {
            "type": "script",
            "version": "0.1.2",
            "function": "    // find a icon from https://fontawesome.com/v5.8.2/icons\n    const icon = 'beer' \n    const title = 'a new button'\n    const addGap = true\n    const onclick = ()=>{\n        drawAPI.unstable.setTextContent('a custom button works')\n    }\n\n    document.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd',(addGap?\"<span class='svgiconspliter'></span>\":\"\")+\"<div class='svg-btn fa fa-\"+icon+\"' title='\"+title+\"'><span></span></div>\");\n    document.querySelector('div.svg-operate > :last-child').onclick=onclick\n"
        }
    ]
```

### Convert formulas to latex

<details open>
<summary>myscript API</summary>

Recognitize handwritten text to latex using API of myscript.com  
which declares `MyScript has been working on this matter for over two decades now and there is no question that our technology is ahead of Microsoft Ink Recognizer. ` at their [article](https://medium.com/@myscript/microsoft-ink-recognizer-an-opportunity-for-myscript-9e55fe45afae).  
Create a account at https://developer.myscript.com/getting-started/web to get token.  
It is free for 2000 calls/month.  

Paste your token on `PasteYourTokenHere`, and push this into setting.json following the previous section [Customize Buttons](#Customize-Buttons). The json generated from [this script](https://github.com/zhaouv/vscode-markdown-draw/blob/master/buttons_demo/htr_to_latex_myscriptapi.js)

```json
{"type":"script","version":"0.1.2","function":"var token = {\n applicationKey: 'PasteYourTokenHere',\n hmacKey: 'PasteYourTokenHere',\n}\nvar addGap = true\n\nvar iink_cdn = 'https://cdn.jsdelivr.net/npm/iink-js@1.4.5/dist/iink.min.js'\n// var iink_cdn = https://unpkg.com/iink-js@1.4.5/dist/iink.min.js\n// var iink_cdn = https://myscript.github.io/iinkJS/dist/iink.min.js\n\nvar icon = 'square-root-alt'\nvar title = 'Recognize to latex'\n\ndocument.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd', (addGap ? \"<span class='svgiconspliter'></span>\" : \"\") + \"<div class='svg-btn fa fa-\" + icon + \"' title='\" + title + \"'><span></span></div>\");\nvar btnElement = document.querySelector('div.svg-operate > :last-child')\nbtnElement.onclick = ()=>{drawAPI.unstable.setTextContent('loading script')}\n\nvar svg = drawAPI.unstable.getSVGElement()\n\nvar getStrokeGroups = () => {\n let strokes = []\n for (const item of svg.children) {\n if (item.nodeName === 'path') {\n let points = item\n .getAttributeNS(null, \"d\")\n .split(/M |L /g)\n .slice(1)\n .map(item => {\n return {\n x: parseFloat(item.split(\",\")[0]),\n y: parseFloat(item.split(\",\")[1])\n };\n })\n strokes.push({ x: points.map(v => v.x), y: points.map(v => v.y) })\n }\n }\n console.log(strokes);\n return [{ \"penStyle\": null, \"strokes\": strokes }]\n}\n\nvar s1 = document.createElement('script')\ns1.setAttribute('nonce', drawAPI.unstable.nonce())\ns1.src = iink_cdn\ns1.onload = () => {\n\n const onclick = () => {\n drawAPI.unstable.setTextContent('calling the API')\n // Creating a recognizer\n const iinkRecognizer = iink.DefaultBehaviors.recognizerList.find(x => {\n const infos = x.getInfo();\n return infos.protocol === 'REST';\n });\n\n // Creating a empty model\n const model = iink.InkModel.createModel();\n // Filling the model with the stroke groups\n model.strokeGroups = getStrokeGroups();\n\n // Creating a recognizer context with the configuration attached\n const recognizerContext = iink.RecognizerContext.createEmptyRecognizerContext({\n configuration: iink.DefaultConfiguration\n });\n\n recognizerContext.editor.configuration.recognitionParams = {\n type: 'MATH',\n protocol: 'REST',\n server: {\n scheme: 'https',\n // host: 'webdemoapi.myscript.com',\n host: 'cloud.myscript.com',\n applicationKey: token.applicationKey,\n hmacKey: token.hmacKey\n },\n iink: {\n math: {\n mimeTypes: [\n 'application/x-latex',\n ],\n }\n }\n }\n\n // Assigning a theme to the document\n recognizerContext.editor.theme = iink.DefaultTheme;\n\n // Defining the behaviour on recognition result\n const recognitionCallback = (err, x) => {\n if (!err) {\n Object.entries(x.exports)\n .forEach(([mimeType, exportValue]) => {\n\n let latex = x.exports[mimeType]\n let content = '\\n$$'+latex.trim()+'$$ '+' '\n drawAPI.unstable.setTextContent('')\n drawAPI.unstable.editCurrentLine({\n control: 0,\n text: content\n })\n });\n }\n };\n\n // Triggering the recognition\n iinkRecognizer.export_(recognizerContext, model)\n .then((values) => {\n values.forEach((value) => {\n recognitionCallback(undefined, value);\n });\n })\n .catch(err => recognitionCallback(err, undefined));\n }\n\n btnElement.onclick = onclick\n}\ndocument.body.appendChild(s1)\n"}
```

Actually it is HTR not OCR.  

</details>

<details>
<summary>mathpix API (click to expand)</summary>

The mathpix API is a popular choice for OCR to latex.  
Its API it free for 1000/month, but you have to provide a card. 
They charge a one-time non-refundable setup fee of $1.  

The following script also supports drag and paste image to latex by mathpix API.  

And I am considering providing another independent extension to convert the clipbord-picture to latex.  
Which need not to open a webview panel and provides a command and is able to bind keys.  
(It will be <https://github.com/zhaouv/vscode-paste-to-latex-mathpix.git> if it becomes existence.)


```json
{"type":"script","version":"0.1.2","function":"var token = { app_id: 'PasteYourTokenHere', app_key: 'PasteYourTokenHere' }\nvar addGap = true\nvar icon = 'square-root-alt'\nvar title = 'Recognize to latex'\n\ndocument.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd', (addGap ? \"<span class='svgiconspliter'></span>\" : \"\") + \"<div class='svg-btn fa fa-\" + icon + \"' title='\" + title + \"'><span></span></div>\");\nvar btnElement = document.querySelector('div.svg-operate > :last-child')\nbtnElement.onclick = () => {\n\n drawAPI.unstable.getPNG((dataURL) => {\n drawAPI.unstable.setTextContent('calling the API')\n xhrPost(dataURL, (err,ret)=>{\n console.log(err,ret)\n let latex = JSON.parse(ret)['latex']\n let content = '\\n$$'+latex.trim()+'$$ '+' '\n drawAPI.unstable.setTextContent('')\n drawAPI.unstable.editCurrentLine({\n control: 0,\n text: content\n })\n })\n })\n}\n\nfunction xhrPost(dataURL, callback) {\n var xhr = new XMLHttpRequest();\n xhr.onreadystatechange = function () {\n if (xhr.readyState == 4) {\n if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {\n callback(null, xhr.responseText);\n } else {\n callback([xhr.status, xhr.responseText], null);\n }\n }\n }\n xhr.open('post', 'https://api.mathpix.com/v3/latex');\n xhr.setRequestHeader('app_id', token.app_id)\n xhr.setRequestHeader('app_key', token.app_key)\n xhr.setRequestHeader('Content-type', 'application/json')\n xhr.send(JSON.stringify({ 'url': dataURL }));\n}\n\n// drag and paste image\nfunction convertImage(dataURL) {\n drawAPI.unstable.setTextContent('calling the API to convert image')\n xhrPost(dataURL, (err,ret)=>{\n console.log(err,ret)\n let latex = JSON.parse(ret)['latex']\n let content = '\\n$$'+latex.trim()+'$$ '+' '\n drawAPI.unstable.setTextContent('')\n drawAPI.unstable.editCurrentLine({\n control: 0,\n text: content\n })\n })\n\n}\nfunction getImage(items, cb) {\n var file = null;\n if (items && items.length) {\n for (var i = 0; i < items.length; i++) {\n if (items[i].type.indexOf('image') !== -1) {\n file = items[i].getAsFile();\n break;\n }\n }\n }\n // console.log(file);\n if (file) {\n var reader = new FileReader()\n reader.onload = function (event) {\n cb(event.target.result);\n }\n reader.readAsDataURL(file);\n }\n}\nvar bindElement = document.body\nbindElement.addEventListener('paste', function (event) {\n var items = event.clipboardData?.items;\n getImage(items,convertImage);\n});\nbindElement.ondragover = function (ev) {\n ev.preventDefault();\n}\nbindElement.ondrop = function (ev) {\n ev.preventDefault();\n var items = ev.dataTransfer.items;\n getImage(items,convertImage);\n}\n"}
```
Paste your token on `PasteYourTokenHere`, and push this into setting.json following the previous section [Customize Buttons](#Customize-Buttons). The json generated from [this script](https://github.com/zhaouv/vscode-markdown-draw/blob/master/buttons_demo/ocr_to_latex_mathpix.js)

</details>

## webview-keybindings

default keybind is
```json
    "markdown-draw.webview-keybindings": [
        {
            "key": "ctrl+s",
            "command": "change and stay"
        },
        {
            "key": "ctrl+z",
            "command": "undo"
        },
        {
            "key": "ctrl+y",
            "command": "redo"
        },
        {
            "key": "ctrl+l",
            "command": "Recognize to latex"
        },
        {
            "key": "f2",
            "command": "line"
        },
        {
            "key": "f4",
            "command": "pen"
        },
        {
            "key": "f6",
            "command": "eraser"
        },
        {
            "key": "f7",
            "command": "rect"
        },
        {
            "key": "f8",
            "command": "circle"
        },
        {
            "key": "f9",
            "command": "select"
        },
        {
            "key": "f10",
            "command": "clear board"
        }
    ]
```

Only support `ctrl+<some char>` `f<1~12>` now (just because I am lazy, PR is willcome to support `ctrl+shift+<some char>` and etc.).

If you want to cancel a keybinding, just move it out of the list or change it as
```json
        {
            "key": "f2",
            "command": ""
        },
```

When you press the key. A click will send to the first title-match button.

## License

[Apache-2.0](./LICENSE)

board adapted from [syfxlin/graffiti-board](https://github.com/syfxlin/graffiti-board/tree/5945b126c945073eced5e6eb78658bc2a7375881) Apache-2.0  
> with lots of changes

board/Font-Awesome-5-8-2-all-min.css from Font Awesome Free 5.8.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)  
> replace webfonts/fa-solid-900.woff2 by base64