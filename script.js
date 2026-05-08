let instaciaGrafica = null;

window.onload = () => switchMode();

function switchMode() {
    const mode = document.getElementById('mode-selector').value;
    const container = document.getElementById('inputs-container');
    
    if (mode === 'lineal') {
        container.innerHTML = `<div class="input-group">
            <input type="number" id="m" placeholder="m" step="any">
            <input type="number" id="n" placeholder="n" step="any">
        </div>`;
    } else if (mode === 'quadratica') {
        container.innerHTML = `<div class="input-group">
            <input type="number" id="a" placeholder="a" step="any">
            <input type="number" id="b" placeholder="b" step="any">
            <input type="number" id="c" placeholder="c" step="any">
        </div>`;
    } else {
        container.innerHTML = `<div class="input-group">
            <input type="number" id="x1" placeholder="x1"> <input type="number" id="y1" placeholder="y1">
            <input type="number" id="x2" placeholder="x2"> <input type="number" id="y2" placeholder="y2">
        </div>`;
    }
}

function decimalAFraccio(decimal) {
    if (Math.abs(decimal) < 0.0001) return "0";
    if (Number.isInteger(decimal)) return decimal.toString();
    const tolerancia = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = Math.abs(decimal);
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(Math.abs(decimal) - h1 / k1) > Math.abs(decimal) * tolerancia);
    return (decimal < 0 ? "-" : "") + `${h1}/${k1}`;
}

function executar() {
    const inputs = document.querySelectorAll('input');
    for (let i of inputs) if (i.value === "") return;

    const mode = document.getElementById('mode-selector').value;
    const res = document.getElementById('resultat-text');
    let f, titol, info = "", xMin, xMax;

    if (mode === 'punts') {
        const x1 = parseFloat(document.getElementById('x1').value);
        const y1 = parseFloat(document.getElementById('y1').value);
        const x2 = parseFloat(document.getElementById('x2').value);
        const y2 = parseFloat(document.getElementById('y2').value);
        if (x1 === x2) return;

        const m = (y2 - y1) / (x2 - x1);
        const n = y1 - m * x1;
        f = (x) => m * x + n;
        
        xMin = Math.min(x1, x2);
        xMax = Math.max(x1, x2);
        const yMin = Math.min(y1, y2);
        const yMax = Math.max(y1, y2);

        titol = `f(x) = ${decimalAFraccio(m)}x ${n >= 0 ? '+ '+decimalAFraccio(n) : decimalAFraccio(n)}`;
        info = `
            <div class="badge"><b>Domini:</b> [${decimalAFraccio(xMin)}, ${decimalAFraccio(xMax)}]</div>
            <div class="badge"><b>Recorregut:</b> [${decimalAFraccio(yMin)}, ${decimalAFraccio(yMax)}]</div>
        `;
    } else if (mode === 'lineal') {
        const m = parseFloat(document.getElementById('m').value || 0);
        const n = parseFloat(document.getElementById('n').value || 0);
        f = (x) => m * x + n;
        xMin = -10; xMax = 10;
        titol = `f(x) = ${decimalAFraccio(m)}x ${n >= 0 ? '+ '+decimalAFraccio(n) : decimalAFraccio(n)}`;
        info = `<div class="badge"><b>Domini:</b> ℝ</div><div class="badge"><b>Recorregut:</b> ℝ</div>`;
    } else {
        const a = parseFloat(document.getElementById('a').value || 0);
        const b = parseFloat(document.getElementById('b').value || 0);
        const c = parseFloat(document.getElementById('c').value || 0);
        if (a === 0) return;

        f = (x) => a*x*x + b*x + c;
        const vx = -b / (2 * a);
        const vy = f(vx);
        xMin = vx - 5; xMax = vx + 5;
        
        const tipusPunt = a > 0 ? "Mínim" : "Màxim";
        const recSymbol = a > 0 ? `[${decimalAFraccio(vy)}, +∞)` : `(-∞, ${decimalAFraccio(vy)}]`;

        titol = `f(x) = ${decimalAFraccio(a)}x² ${b >= 0 ? '+ '+decimalAFraccio(b) : decimalAFraccio(b)}x ${c >= 0 ? '+ '+decimalAFraccio(c) : decimalAFraccio(c)}`;
        info = `
            <div class="badge" style="background:#e8f4fd; display:block;"><b>${tipusPunt}:</b> (${decimalAFraccio(vx)}, ${decimalAFraccio(vy)})</div>
            <div class="badge"><b>Domini:</b> ℝ</div>
            <div class="badge"><b>Recorregut:</b> ${recSymbol}</div>
        `;
    }

    res.innerHTML = `<div style="text-align:center; margin-bottom:10px;"><b>${titol}</b></div>${info}`;
    dibuixar(f, xMin, xMax, mode);
}

function dibuixar(f, xMin, xMax, mode) {
    const xValues = [];
    const yData = [];
    const pas = (xMax - xMin) / 40; 

    for (let x = xMin; x <= xMax; x += pas) {
        xValues.push(x.toFixed(2));
        yData.push(f(x));
    }

    const ctx = document.getElementById('graficaCanvas').getContext('2d');
    if (instaciaGrafica) instaciaGrafica.destroy();

    instaciaGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                data: yData,
                borderColor: '#3498db',
                borderWidth: 3,
                pointRadius: mode === 'punts' ? 5 : 0, 
                fill: false,
                tension: mode === 'quadratica' ? 0.4 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: { padding: { top: 10, bottom: 10, left: 20, right: 20 } },
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    min: xMin,
                    max: xMax,
                    grid: { color: '#ddd' }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: { color: '#ddd' },
                    beginAtZero: false,
                    grace: '5%' // Evita que els punts toquin el límit i "saltin"
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}
