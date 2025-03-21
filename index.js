var generatedCSS = undefined;
var currentChars = undefined;
var pngDataURL = undefined;

function disable(what = [1, 1, 1]) {
    for (let index = 0; index < 3; index++) {
        const element = document.getElementById('step' + (index + 1));
        element.setAttribute('disabled', what[index]);
    }
}

function step1() {
    const del = document.getElementById("delMe")
    if (del) { del.remove(); }
    disable([0, 1, 1]);
}

async function step2() {
    disable([0, 0, 0]);

    const fntFile = document.getElementById('fntFile').files[0];
    const pngFile = document.getElementById('pngFile').files[0];

    if (!fntFile || !pngFile) {
        alert("Veuillez sélectionner les deux fichiers. Please select both files.");
        disable([1, 0, 0]);
        return;
    }

    const fntText = await fntFile.text();
    currentChars = parseFNT(fntText);
    pngDataURL = await readFileAsDataURL(pngFile);

    generateCSS(currentChars, pngDataURL);

    disable([0, 1, 0]);
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
    --mifont-right: ${right || 4.5};
    --mifont-bottom: ${bottom || 5};
    --mifont-charWidth: ${charW || char.width};
    --mifont-charHeight: ${charH || char.height};
  }

  /*.mifont-space {
    margin-right: calc(1em*var(--mifont-right));
  }*/

  .mibmp-font {
    transform: scale(var(--mifont-size));
    /*transform-origin: left bottom;*/
    margin-right: calc(-1em * var(--mifont-right) * 1/(var(--mifont-adaptR)*var(--mifont-size))); /* Ajustement dynamique des marges */
    margin-bottom: calc(-1em * var(--mifont-bottom) * var(--mifont-size));
    display: inline-block;
    background-image: url('${pngDataURL}');
    image-rendering: pixelated;
    vertical-align: bottom;
}\n\n`;

    chars.forEach(char => {
        css += `.mibmp-font.char-${char.id} {
width: var(--mifont-charWidth)px;
height: var(--mifont-charHeight)px;
background-position: -${char.x}px -${char.y}px;
}\n`;
    });

    const style = document.getElementById("MiFontCSS") || document.createElement('style');
    style.textContent = css;
    style.id = "MiFontCSS";
    if (!document.getElementById('MiFontCSS')) {
        document.head.appendChild(style);
    }
    generatedCSS = css; // Stocke le CSS pour le téléchargement
}



function step3() {

    disable([0, 0, 0]);

    generateCSS(currentChars, pngDataURL);

    disable([0, 0, 1]);

}


function downloadCSS() {
    const blob = new Blob([generatedCSS], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'miala-bitmap-font.css';
    link.click();
}

function downloadJS() {
    fetch('./mifont.js')
        .then(response => response.blob())
        .then(blob => {
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

function createRanges() {
    const ranges = document.getElementsByClassName("range");
    ranges.forEach(range => {
        let prop = range.getAttribute('prop');
        let max = range.getAttribute('max');
        let val = range.getAttribute('value');
        range.innerHTML = `
        --mifont-${prop}: 
        <input type="range" 
           id="${prop}Slider" 
           min="0.5" 
           max="${max}" 
           step="0.1" 
           value="${val}"
           oninput="rangeUpdate('${prop}',this.value)">
        <span id="scaleValue-${prop}">1x</span>
        `;
        range.classList.remove("range")
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    createRanges();
    step1();

    document.getElementById('testArea').addEventListener('input', function (e) {
        const preview = document.getElementById('preview');
        preview.innerHTML = e.target.value;
        convertMiFont(preview);
    });
});