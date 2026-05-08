let instaciaGrafica = null;

window.onload = () => switchMode();

function switchMode() {
    const mode = document.getElementById('mode-selector').value;
    const container = document.getElementById('inputs-container');
    
    if (mode === 'lineal') {
        container.innerHTML = `<div class="input-group">
            <input type="number" id="m" placeholder="m (pendent)">
            <input type="number" id="n" placeholder="n (origen)">
        </div>`;
    } else if (mode === 'quadratica') {
        container.innerHTML = `<div class="input-group">
            <input type="number" id="a" placeholder="a">
            <input type="number" id="b" placeholder="b">
            <input type="number" id="c" placeholder="c">
        </div>`;
    } else {
        container.innerHTML = `<div class="input-group">
            <input type="number" id="x1" placeholder="x1"> <input type="number" id="y1" placeholder="y1">
            <input type="number" id="x2" placeholder="x2"> <input type="number" id="y2" placeholder="y2">
        </div>`;
    }
}

function executar() {
    const mode = document.getElementById('mode-selector').value;
    const res = document.getElementById('resultat-text');
    let f, titol, info = "";

    if (mode === 'punts') {
        const x1 = parseFloat(document.getElementById('x1').value);
        const y1 = parseFloat(document.getElementById('y1').value);
        const x2 = parseFloat(document.getElementById('x2').value);
        const y2 = parseFloat(document.getElementById('y2').value);
        const m = (y2 - y1) / (x2 - x1);
        const n = y1 - m * x1;
        titol = `f(x) = ${m.toFixed(2)}x ${n >= 0 ? '+'+n.toFixed(2) : n.toFixed(2)}`;
        f = (x) => m * x + n;
        info = `Pendent (m): ${m.toFixed(2)} | Origen (n): ${n.toFixed(2)}`;
    } else if (mode === 'lineal') {
        const m = parseFloat(document.getElementById('m').value || 0);
        const n = parseFloat(document.getElementById('n').value || 0);
        titol = `f(x) = ${m}x + ${n}`;
        f = (x) => m * x + n;
    } else {
        const a = parseFloat(document.getElementById('a').value || 0);
        const b = parseFloat(document.getElementById('b').value || 0);
        const c = parseFloat(document.getElementById('c').value || 0);
        titol = `f(x) = ${a}x² + ${b}x + ${c}`;
        f = (x) => a*x*x + b*x + c;
        
        // Vèrtex
        const vx = -b / (2 * a);
        const vy = f(vx);
        // Arrels
        const disc = b*b - 4*a*c;
        let arrels = "No té arrels reals";
        if (disc > 0) {
            const x1 = (-b + Math.sqrt(disc)) / (2*a);
            const x2 = (-b - Math.sqrt(disc)) / (2*a);
            arrels = `x1: ${x1.toFixed(2)}, x2: ${x2.toFixed(2)}`;
        } else if (disc === 0) {
            arrels = `x: ${(-b/(2*a)).toFixed(2)}`;
        }
        info = `Vèrtex: (${vx.toFixed(2)}, ${vy.toFixed(2)}) <br> Arrels: ${arrels}`;
    }

    res.innerHTML = `<strong>${titol}</strong><br><span class="badge">${info}</span>`;
    dibuixar(f, titol);
}

function dibuixar(f, label) {
    const xLabels = [], yData = [];
    for (let x = -10; x <= 10; x += 0.5) {
        xLabels.push(x);
        yData.push(f(x));
    }
    const ctx = document.getElementById('graficaCanvas').getContext('2d');
    if (instaciaGrafica) instaciaGrafica.destroy();
    instaciaGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [{ label: label, data: yData, borderColor: '#3498db', tension: 0.3 }]
        }
    });
}