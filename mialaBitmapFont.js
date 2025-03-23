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

function convertMiFont(element) {
    if (element.nodeType === Node.TEXT_NODE) {
        try {
            let txt = textToMiFont(element.textContent);
            element.textContent = '';
            element.innerHTML = txt + element.innerHTML;
            element.setAttribute('beforeMiFont', txt);
     
            
        } catch (error) {
            console.log(element);
            console.log(error);
        }
           } else {
        element.childNodes.forEach(child => convertMiFont(child));
    }
}