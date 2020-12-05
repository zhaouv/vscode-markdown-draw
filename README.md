# Draw Note

**This project is in the prototype stage !**

## Goals

Draw svg quick-responsively with a mouse or pen,  
Mainly used for note-taking, formulas drafting

## Usage

open markdown file, right click at some line,  
`Edit/Create current line as SVG`

or press `F1`, type `svg`, click the command

## Customize Buttons

I have not decided the interface. In this stage, it could work this way.

Step 1. You should change the following code, run it on chrome, it prints one line of string.

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

Step 2. Push the string to your setting.json

```json
    "markdown-draw.customized-buttons": [
        {
            "type": "script",
            "function": "    // find a icon from https://fontawesome.com/v5.8.2/icons\n    const icon = 'beer' \n    const title = 'a new button'\n    const addGap = true\n    const onclick = ()=>{\n        drawAPI.unstable.setTextContent('a custom button works')\n    }\n\n    document.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd',(addGap?\"<span class='svgiconspliter'></span>\":\"\")+\"<div class='svg-btn fa fa-\"+icon+\"' title='\"+title+\"'><span></span></div>\");\n    document.querySelector('div.svg-operate > :last-child').onclick=onclick\n"
        }
    ]
```

## License

[Apache-2.0](./LICENSE)

board adapted from [syfxlin/graffiti-board](https://github.com/syfxlin/graffiti-board/tree/5945b126c945073eced5e6eb78658bc2a7375881) Apache-2.0  
> with lots of changes

board/Font-Awesome-5-8-2-all-min.css from Font Awesome Free 5.8.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)  
> replace webfonts/fa-solid-900.woff2 by base64