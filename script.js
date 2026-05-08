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
    if (Math.abs(decimal) < 0.00001) return "0";
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
    // Evitar càlculs si un camp està buit mentre s'escriu
    const inputs = document.querySelectorAll('input');
    for (let i of inputs) if (i.value === "") return;

    const mode = document.getElementById('mode-selector').value;
    const res = document.getElementById('resultat-text');
    let f, titol, info = "";

    if (mode === 'punts') {
        const x1 = parseFloat(document.getElementById('x1').value);
        const y1 = parseFloat(document.getElementById('y1').value);
        const x2 = parseFloat(document.getElementById('x2').value);
        const y2 = parseFloat(document.getElementById('y2').value);
        if (x1 === x2) return;

        const m = (y2 - y1) / (x2 - x1);
        const n = y1 - m * x1;
        titol = `f(x) = ${m.toFixed(2)}x ${n >= 0 ? '+'+n.toFixed(2) : n.toFixed(2)}`;
        f = (x) => m * x + n;
        info = `<div class="badge">Equació: <b>${decimalAFraccio(m)}x ${n>=0?'+':''} ${decimalAFraccio(n)}</b></div>
                <div class="badge">Domini: <b>ℝ</b></div>
                <div class="badge">Recorregut: <b>ℝ</b></div>`;
    } else if (mode === 'lineal') {
        const m = parseFloat(document.getElementById('m').value || 0);
        const n = parseFloat(document.getElementById('n').value || 0);
        titol = `f(x) = ${m}x ${n >= 0 ? '+'+n : n}`;
        f = (x) => m * x + n;
        info = `<div class="badge">Domini: <b>ℝ</b></div><div class="badge">Recorregut: <b>ℝ</b></div>`;
    } else {
        const a = parseFloat(document.getElementById('a').value || 0);
        const b = parseFloat(document.getElementById('b').value || 0);
        const c = parseFloat(document.getElementById('c').value || 0);
        if (a === 0) return;

        titol = `f(x) = ${a}x² ${b >= 0 ? '+'+b : b}x ${c >= 0 ? '+'+c : c}`;
        f = (x) => a*x*x + b*x + c;
        
        const vx = -b / (2 * a);
        const vy = f(vx);
        const tipusPunt = a > 0 ? "Mínim" : "Màxim";
        const recorregut = a > 0 ? `[${vy.toFixed(2)}, +∞)` : `(-∞, ${vy.toFixed(2)}]`;

        info = `
            <div class="badge">${tipusPunt}: <b>(${vx.toFixed(2)}, ${vy.toFixed(2)})</b></div>
            <div class="badge">Domini: <b>ℝ</b></div>
            <div class="badge">Recorregut: <b>${recorregut}</b></div>
        `;
    }

    res.innerHTML = `<h4>${titol}</h4>${info}`;
    dibuixar(f, titol);
}

function dibuixar(f, label) {
    const xL = [], yD = [];
    let minY = Infinity;
    let maxY = -Infinity;

    for (let x = -10; x <= 10; x += 0.5) {
        xL.push(x);
        let valY = f(x);
        yD.push(valY);
        if (valY < minY) minY = valY;
        if (valY > maxY) maxY = valY;
    }

    // AJUST D'ESCALA: Si el rang és massa gran, el limitem per veure bé el vèrtex
    let margin = 5;
    let viewMin = minY - margin;
    let viewMax = maxY + margin;

    // Si és una paràbola molt punteguda, limitem a un rang de 40 unitats per no perdre el detall
    if (viewMax - viewMin > 40) {
        // Busquem un rang més "humà" al voltant del valor més baix/alt significatiu
        viewMax = Math.min(viewMax, 50);
        viewMin = Math.max(viewMin, -50);
    }

    const ctx = document.getElementById('graficaCanvas').getContext('2d');
    if (instaciaGrafica) {
        instaciaGrafica.destroy();
        instaciaGrafica = null;
    }

    try {
        instaciaGrafica = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xL,
                datasets: [{ 
                    label: label, 
                    data: yD, 
                    borderColor: '#3498db', 
                    borderWidth: 2,
                    pointRadius: 0, // Traç net
                    fill: false, 
                    tension: 0.3 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Millora el rendiment al mòbil
                scales: {
                    y: {
                        min: viewMin,
                        max: viewMax,
                        grid: { color: '#f0f0f0' }
                    },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    } catch (e) { console.error(e); }
}
