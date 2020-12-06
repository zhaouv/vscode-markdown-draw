/* 
Recognitize handwritten text to latex using api of myscript.com
Create a account at https://developer.myscript.com/getting-started/web to get token
It is free for 2000 calls/month
*/
var fff=()=>{

var token = {
    applicationKey: 'PasteYourTokenHere',
    hmacKey: 'PasteYourTokenHere',
}
var addGap = true

var iink_cdn = 'https://cdn.jsdelivr.net/npm/iink-js@1.4.5/dist/iink.min.js'
// var iink_cdn = https://unpkg.com/iink-js@1.4.5/dist/iink.min.js
// var iink_cdn = https://myscript.github.io/iinkJS/dist/iink.min.js

var icon = 'square-root-alt'
var title = 'Recognize to latex'

document.querySelector('div.svg-operate').insertAdjacentHTML('beforeEnd', (addGap ? "<span class='svgiconspliter'></span>" : "") + "<div class='svg-btn fa fa-" + icon + "' title='" + title + "'><span></span></div>");
var btnElement = document.querySelector('div.svg-operate > :last-child')
btnElement.onclick = ()=>{drawAPI.unstable.setTextContent('loading script')}

var svg = drawAPI.unstable.getSVGElement()

var getStrokeGroups = () => {
    let strokes = []
    for (const item of svg.children) {
        if (item.nodeName === 'path') {
            let points = item
                .getAttributeNS(null, "d")
                .split(/M |L /g)
                .slice(1)
                .map(item => {
                    return {
                        x: parseFloat(item.split(",")[0]),
                        y: parseFloat(item.split(",")[1])
                    };
                })
            strokes.push({ x: points.map(v => v.x), y: points.map(v => v.y) })
        }
    }
    console.log(strokes);
    return [{ "penStyle": null, "strokes": strokes }]
}

var s1 = document.createElement('script')
s1.setAttribute('nonce', drawAPI.unstable.nonce())
s1.src = iink_cdn
s1.onload = () => {

    const onclick = () => {
        drawAPI.unstable.setTextContent('calling the API')
        // Creating a recognizer
        const iinkRecognizer = iink.DefaultBehaviors.recognizerList.find(x => {
            const infos = x.getInfo();
            return infos.protocol === 'REST';
        });

        // Creating a empty model
        const model = iink.InkModel.createModel();
        // Filling the model with the stroke groups
        model.strokeGroups = getStrokeGroups();

        // Creating a recognizer context with the configuration attached
        const recognizerContext = iink.RecognizerContext.createEmptyRecognizerContext({
            configuration: iink.DefaultConfiguration
        });

        recognizerContext.editor.configuration.recognitionParams = {
            type: 'MATH',
            protocol: 'REST',
            server: {
                scheme: 'https',
                // host: 'webdemoapi.myscript.com',
                host: 'cloud.myscript.com',
                applicationKey: token.applicationKey,
                hmacKey: token.hmacKey
            },
            iink: {
                math: {
                    mimeTypes: [
                        'application/x-latex',
                    ],
                }
            }
        }

        // Assigning a theme to the document
        recognizerContext.editor.theme = iink.DefaultTheme;

        // Defining the behaviour on recognition result
        const recognitionCallback = (err, x) => {
            if (!err) {
                Object.entries(x.exports)
                    .forEach(([mimeType, exportValue]) => {

                        let latex = x.exports[mimeType]
                        let content = '\n$$'+latex.trim()+'$$ '+' '
                        drawAPI.unstable.setTextContent('')
                        drawAPI.unstable.editCurrentLine({
                            control: 0,
                            text: content
                        })
                    });
            }
        };

        // Triggering the recognition
        iinkRecognizer.export_(recognizerContext, model)
            .then((values) => {
                values.forEach((value) => {
                    recognitionCallback(undefined, value);
                });
            })
            .catch(err => recognitionCallback(err, undefined));
    }

    btnElement.onclick = onclick
}
document.body.appendChild(s1)

}
var sss=fff.toString().slice(7,-2).replace(/ +/g,' ')
var ooo={"type":"script","version":"0.1.2","function":sss}
console.log(JSON.stringify(ooo))
// drawAPI.unstable.customOperate(ooo)