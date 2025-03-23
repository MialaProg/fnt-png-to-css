// Set properties of the MiFont as size, right, adaptR and bottom
function setMiFontProp(prop, value) {
    document.documentElement.style.setProperty('--mifont-' + prop, value);
}

// Get properties of the MiFont as size, right, adaptR and bottom
function getMiFontProp(prop, element = document.documentElement) {
    return element.style.getPropertyValue('--mifont-' + prop);
}

function textToMiFont(text) {
    return text.split('').map(c => {
        if (c == "\n") {
            return "<br>";
        }
        const code = c.charCodeAt(0);
        const char = currentChars.find(ch => ch.id === code);
        return char ? `<span class="mibmp-font char-${code}"></span>` : `<span class="mifont-nochar">${c}</span>`;
    }).join('');
}

function convertMiFont(element, parent = undefined) {

    try {
        if (element.nodeType === Node.TEXT_NODE) {
            let txt = textToMiFont(element.nodeValue);
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