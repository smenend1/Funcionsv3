let instaciaGrafica = null;

window.onload = () => switchMode();

function switchMode() {
    const mode = document.getElementById('mode-selector').value;
    const container = document.getElementById('inputs-container');
    container.innerHTML = mode === 'lineal' ? 
        `<div class="input-group"><input type="number" id="m" placeholder="m"><input type="number" id="n" placeholder="n"></div>` :
        mode === 'quadratica' ? 
        `<div class="input-group"><input type="number" id="a" placeholder="a"><input type="number" id="b" placeholder="b"><input type="number" id="c" placeholder="c"></div>` :
        `<div class="input-group"><input type="number" id="x1" placeholder="x1"><input type="number" id="y1" placeholder="y1"><input type="number" id="x2" placeholder="x2"><input type="number" id="y2" placeholder="y2"></div>`;
}

function decimalAFraccio(decimal) {
    if (Math.abs(decimal) < 0.0001) return "0";
    if (Number.isInteger(decimal)) return decimal.toString();
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = Math.abs(decimal);
    for (let i=0; i<8; i++) {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        if (Math.abs(Math.abs(decimal) - h1/k1) < 0.001) break;
        b = 1 / (b - a);
    }
    return (decimal < 0 ? "-" : "") + h1 + "/" + k1;
}

function executar() {
    const inputs = document.querySelectorAll('input');
    for (let i of inputs) if (i.value === "") return;

    const mode = document.getElementById('mode-selector').value;
    const res = document.getElementById('resultat-text');
    let f, titol, info = "", xMin, xMax, puntsTaula = [], tallsX = "";

    if (mode === 'punts') {
        const x1 = parseFloat(document.getElementById('x1').value), y1 = parseFloat(document.getElementById('y1').value);
        const x2 = parseFloat(document.getElementById('x2').value), y2 = parseFloat(document.getElementById('y2').value);
        const m = (y2 - y1) / (x2 - x1), n = y1 - m * x1;
        f = (x) => m * x + n;
        xMin = Math.min(x1, x2); xMax = Math.max(x1, x2);
        titol = `f(x) = ${decimalAFraccio(m)}x ${n>=0?'+':''} ${decimalAFraccio(n)}`;
        info = `<div class="badge"><b>Domini:</b> [${decimalAFraccio(xMin)}, ${decimalAFraccio(xMax)}]</div><br>
                <div class="badge"><b>Recorregut:</b> [${decimalAFraccio(Math.min(y1,y2))}, ${decimalAFraccio(Math.max(y1,y2))}]</div>`;
        puntsTaula = [xMin, (xMin+xMax)/2, xMax];
    } else if (mode === 'quadratica') {
        const a = parseFloat(document.getElementById('a').value), b = parseFloat(document.getElementById('b').value), c = parseFloat(document.getElementById('c').value);
        f = (x) => a*x*x + b*x + c;
        const vx = -b/(2*a), vy = f(vx);
        xMin = vx - 8; xMax = vx + 8;
        
        let disc = b*b - 4*a*c;
        if (disc > 0) {
            let r1 = (-b + Math.sqrt(disc))/(2*a), r2 = (-b - Math.sqrt(disc))/(2*a);
            tallsX = `(${decimalAFraccio(r1)}, 0) i (${decimalAFraccio(r2)}, 0)`;
            puntsTaula.push(r1, r2);
        } else if (disc === 0) {
            let r = -b/(2*a); tallsX = `(${decimalAFraccio(r)}, 0)`; puntsTaula.push(r);
        } else { tallsX = "Cap"; }

        titol = `f(x) = ${decimalAFraccio(a)}x² ${b>=0?'+':''} ${decimalAFraccio(b)}x ${c>=0?'+':''} ${decimalAFraccio(c)}`;
        info = `<div class="badge"><b>Domini:</b> ℝ</div><br>
                <div class="badge"><b>Vèrtex:</b> (${decimalAFraccio(vx)}, ${decimalAFraccio(vy)})</div><br>
                <div class="badge"><b>Talls X:</b> ${tallsX} | <b>Tall Y:</b> (0, ${decimalAFraccio(c)})</div><br>
                <div class="badge"><b>Recorregut:</b> ${a > 0 ? `[${decimalAFraccio(vy)}, +∞)` : `(-∞, ${decimalAFraccio(vy)}]`}</div>`;
        puntsTaula.push(vx - 2, vx, vx + 2, 0);
    } else {
        const m = parseFloat(document.getElementById('m').value), n = parseFloat(document.getElementById('n').value);
        f = (x) => m * x + n; xMin = -10; xMax = 10;
        titol = `f(x) = ${decimalAFraccio(m)}x ${n>=0?'+':''} ${decimalAFraccio(n)}`;
        info = `<div class="badge"><b>Domini:</b> ℝ</div><br><div class="badge"><b>Recorregut:</b> ℝ</div>`;
        puntsTaula = [-5, 0, 5];
    }

    puntsTaula = [...new Set(puntsTaula.filter(px => !isNaN(px)))].sort((a,b) => a-b);
    let taulaHTML = `<div style="overflow-x:auto; margin-top:10px;"><table style="width:100%; border-collapse:collapse; font-size:0.85rem;" border="1">
        <tr style="background:#eee"><th>x</th><th>f(x)</th></tr>`;
    puntsTaula.forEach(px => { taulaHTML += `<tr><td>${px.toFixed(2)}</td><td>${decimalAFraccio(f(px))}</td></tr>`; });
    taulaHTML += `</table></div>`;

    res.innerHTML = `<b>${titol}</b><br>${info}${taulaHTML}`;
    dibuixar(f, xMin, xMax, mode);
}

function dibuixar(f, xMin, xMax, mode) {
    const dataPoints = [];
    let yMinVal = Infinity, yMaxVal = -Infinity;

    // Limitem la generació de dades per no saturar la RAM
    for (let x = xMin; x <= xMax; x += (xMax-xMin)/30) {
        let valY = f(x);
        // Filtre de seguretat: si y és massa gran, no la dibuixem
        if (Math.abs(valY) < 500) {
            dataPoints.push({x: x, y: valY});
            if (valY < yMinVal) yMinVal = valY;
            if (valY > yMaxVal) yMaxVal = valY;
        }
    }

    const ctx = document.getElementById('graficaCanvas').getContext('2d');
    if (instaciaGrafica) instaciaGrafica.destroy();

    instaciaGrafica = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: [{ data: dataPoints, showLine: true, borderColor: '#3498db', borderWidth: 2, pointRadius: mode==='punts'?4:0, fill: false, tension: mode==='quadratica'?0.4:0 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            // Bloquejar el canvi d'escala per evitar "salts"
            scales: {
                x: { type: 'linear', min: xMin, max: xMax, grid: { color: (c) => c.tick.value === 0 ? '#000' : '#eee', lineWidth: (c) => c.tick.value === 0 ? 2 : 1 } },
                y: { type: 'linear', min: yMinVal - 5, max: yMaxVal + 5, grid: { color: (c) => c.tick.value === 0 ? '#000' : '#eee', lineWidth: (c) => c.tick.value === 0 ? 2 : 1 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
