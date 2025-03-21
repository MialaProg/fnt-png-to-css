// Set properties of the MiFont as size, right, adaptR and bottom
function setMiFontProp(prop, value) {
    document.documentElement.style.setProperty('--mifont-' + prop, value);
}

function miFontToConvert(obj){
    obj.classList.add('mifont');
    obj.classList.remove('convertedIntoMialaFont');
}


function convertMiFonts() {
    const miFontObjs = document.querySelectorAll('.mifont');
    miFontObjs.forEach(miFontObj => {
        if (!miFontObj.classList.contains('convertedIntoMialaFont')) {
            const text = miFontObj.innerHTML;
            miFontObj.setAttribute('initHTML', text);
            const output = text.split('').map(c => {
                if (c == "\n") {
                    return "<br>";
                }
                const code = c.charCodeAt(0);
                const char = currentChars.find(ch => ch.id === code);
                return char ? `<span class="mibmp-font char-${code}"></span>` : `<span style="margin-right: calc(1em*var(--mifont-right));"></span>`;
            }).join('');

            miFontObj.innerHTML = output;
            miFontObj.classList.add('convertedIntoMialaFont');
        }
    });
}