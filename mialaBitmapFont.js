// Set properties of the MiFont as size, bottom, charWidth & charHeight
function setMiFontProp(prop, value) {
    document.documentElement.style.setProperty('--mifont-' + prop, value);
}

// Get properties of the MiFont as size, right, adaptR and bottom
function getMiFontProp(prop, element = document.documentElement) {
    while (element && element.style) {
        const value = element.style.getPropertyValue('--mifont-' + prop);
        if (value) {
            return value;
        }
        element = element.parentElement;
    }
    return null;
}

var lengthMiFont = 0;
var wordMiFont = "";
function textToMiFont(text, width=getMiFontProp('charWidth')*getMiFontProp('size'), maxW=window.innerWidth) {
    
    lengthMiFont = 0;
    wordMiFont = "";
    let split = text.split('');
    let i = 0;
    return split.map(c => {
        i+=1;

        //TODO: wordMi support

        if (c == "\n") {
            let returned = wordMiFont;
            lengthMiFont = 0;
            wordMiFont = "";
            return returned + "<br>";
        }


        const code = c.charCodeAt(0);
        let char = currentChars.find(ch => ch.id === code);
        char = char ? `<span class="mibmp-font char-${code}"></span>` : `<span class="mifont-nochar">${c}</span>`;
        

        wordMiFont += char;

        lengthMiFont += width;
        if (lengthMiFont > maxW) {
            let returned = wordMiFont;
            lengthMiFont = 0;
            return "<br>" + returned;
        }

        if (c == " " || i === split.lenght) {
            let returned = wordMiFont;
            wordMiFont = "";
            return returned;
        }
    }).join('');
}

function convertMiFont(element, parent = undefined) {

    try {
        const size = parseFloat(getMiFontProp('size', element));
        let width = parseFloat(getMiFontProp('charWidth', element));
        if (isNaN(width) || isNaN(size)) {
            width = 1;
        } else {
            width *= size;
        }

        if (element.nodeType === Node.TEXT_NODE) {
            let txt = textToMiFont(element.nodeValue, width, parent.clientWidth);
            const div = document.createElement('div');
            div.innerHTML = txt;
            div.setAttribute('beforeMiFont', element.nodeValue);

            parent.replaceChild(div, element);

        } else if (element.nodeType === Node.ELEMENT_NODE) {
            element.childNodes.forEach(child => convertMiFont(child, element));
        }
    } catch (error) {
        console.log(element);
        console.log(error);
    }
}