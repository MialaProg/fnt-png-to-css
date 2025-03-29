var generatedCSS = undefined;
var currentChars = undefined;
var pngDataURL = undefined;

function disableLoop(element, disabled) {
    try {
        if (disabled) {
            element.setAttribute('disabled', true);
        } else {
            element.removeAttribute('disabled');
        }

        element.childNodes.forEach(child => disableLoop(child, disabled));
    } catch (error) {
    }


}

function disable(what = [1, 1, 1]) {
    for (let index = 0; index < 3; index++) {
        const element = document.getElementById('step' + (index + 1));
        disableLoop(element, what[index])
    }
}

function step1() {
    const del = document.getElementById("delMe")
    if (del) { del.remove(); }
    document.getElementById("charS").innerHTML = "";
    disable([0, 1, 1]);
}

async function step2() {
    disable([1, 1, 1]);

    const fntFile = document.getElementById('fntFile').files[0];
    const pngFile = document.getElementById('pngFile').files[0];

    if (!fntFile || !pngFile) {
        alert("Veuillez sélectionner les deux fichiers. Please select both files.");
        disable([0, 1, 1]);
        return;
    }

    const fntText = await fntFile.text();
    currentChars = parseFNT(fntText);
    pngDataURL = await readFileAsDataURL(pngFile);

    generateCSS(currentChars, pngDataURL);

    disable([1, 0, 1]);
}

function parseFNT(fntText) {
    const chars = [];
    const lines = fntText.split("\n");

    for (const line of lines) {
        if (line.startsWith("char ")) {
            const parts = line.split(/\s+/).reduce((acc, part) => {
                const [key, val] = part.split("=");
                if (val) acc[key] = parseInt(val);
                return acc;
            }, {});
            chars.push(parts);
        }
    }
    return chars;
}

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function generateCSS(chars, pngDataURL) {
    let [size, right, bottom, charW, charH] = [
        getMiFontProp('size'),
        getMiFontProp('right'),
        getMiFontProp('bottom'),
        getMiFontProp('charWidth'),
        getMiFontProp('charHeight'),
    ]

    let css = `:root {
    /* Variable CSS pour le contrôle de l'échelle */
    --mifont-size: ${size || 1};
    /*--mifont-right: ${right || 4.5};
    --mifont-bottom: ${bottom || 5};*/
    --mifont-charWidth: calc(${charW || chars[0].width});
    --mifont-charHeight: calc(${charH || chars[0].height});
  }

  /*.mifont-space {
    margin-right: calc(1em*var(--mifont-right));
  }*/

 .mifont-nochar {
  font-size: calc(.7px * var(--mifont-charHeight) * var(--mifont-size)); 
  min-width: calc(1px * .6 * var(--mifont-charWidth) * var(--mifont-size));
  display: inline-block;
  }

  .mibmp-font {
    /*background-color: black;*/
    transform: scale(var(--mifont-size));
    transform-origin: left top;
    /*margin-right: calc(-1em * var(--mifont-right) * .1/var(--mifont-size));
    margin-bottom: calc(-1em * var(--mifont-bottom) * 1.1/var(--mifont-size));*/
    display: inline-block;
    image-rendering: pixelated;
    vertical-align: bottom;
    width: calc(1px * var(--mifont-charWidth));
    height: calc(1px * var(--mifont-charHeight));
    margin-right: calc(-1px * var(--mifont-charWidth) * (1 - var(--mifont-size)));
    margin-bottom: calc(-1px * var(--mifont-charHeight) * (1 - var(--mifont-size)));
    background-image: url('${pngDataURL}');
}\n\n`;

    chars.forEach(char => {
        css += `.mibmp-font.char-${char.id} {
background-position: calc(1px * (-${char.x} - ${char.width / 2} + var(--mifont-charWidth) / 2)) calc(1px * (-${char.y} - ${char.height / 2} + var(--mifont-charHeight) / 2));
}\n`;
    });

    const style = document.getElementById("MiFontCSS") || document.createElement('style');
    style.textContent = css;
    style.id = "MiFontCSS";
    if (!document.getElementById('MiFontCSS')) {
        document.head.appendChild(style);
    }
    generatedCSS = css; // Stocke le CSS pour le téléchargement

    // Create ranges for charWidth and charHeight
    const charS = document.getElementById("charS");
    const charWidthRange = document.createElement('div');
    charWidthRange.className = 'range';
    charWidthRange.setAttribute('max', chars[0].width);
    charWidthRange.setAttribute('value', chars[0].width);
    charWidthRange.setAttribute('prop', 'charWidth');
    createRange(charWidthRange);

    const charHeightRange = document.createElement('div');
    charHeightRange.className = 'range';
    charHeightRange.setAttribute('max', chars[0].height);
    charHeightRange.setAttribute('value', chars[0].height);
    charHeightRange.setAttribute('prop', 'charHeight');
    createRange(charHeightRange);

    charS.appendChild(charWidthRange);
    charS.appendChild(document.createElement('br'));

    charS.appendChild(charHeightRange);
    charS.appendChild(document.createElement('br'));

}



function step3() {

    disable([1, 1, 1]);

    generateCSS(currentChars, pngDataURL);

    disable([1, 1, 0]);

}


function downloadCSS() {
    const blob = new Blob([generatedCSS], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'miala-bitmap-font.css';
    link.click();
}

function downloadJS() {
    fetch('./mialaBitmapFont.js')
        .then(response => response.text())
        .then(text => {
            let updatedText = text + "var currentChars = " + JSON.stringify(currentChars) + ";\n";
            updatedText += "currentChars = JSON.parse(currentChars);\n";

            const blob = new Blob([updatedText], { type: 'application/javascript' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'mifont.js';
            link.click();
        })
        .catch(error => console.error('Error fetching the JS file:', error));
}




function rangeUpdate(prop, val) {
    document.getElementById('scaleValue-' + prop).textContent = val + ';';
    setMiFontProp(prop, val);
}

function createRange(range) {
    let prop = range.getAttribute('prop');
    let max = range.getAttribute('max');
    let val = range.getAttribute('value');
    range.innerHTML = `
        --mifont-${prop}: 
        <input type="range" 
           id="${prop}Slider" 
           min="0.1" 
           max="${max}" 
           step="0.1" 
           value="${val}"
           oninput="rangeUpdate('${prop}',this.value)">
        <span id="scaleValue-${prop}">${val}</span>
        `;
    range.classList.remove("range");
}

function createRanges() {
    const ranges = document.getElementsByClassName("range");
    for (let index = 0; index < ranges.length; index++) {
        const range = ranges[index];
        createRange(range);
    };
}

document.addEventListener('DOMContentLoaded', (event) => {
    setInterval(() => {
    createRanges();
    }, 1000);

    step1();

    document.getElementById('testArea').addEventListener('input', function (e) {
        const preview = document.getElementById('preview');
        preview.innerHTML = e.target.value;
        convertMiFont(preview);
    });
});