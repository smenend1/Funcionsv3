let instaciaGrafica = null;

// Inicialització al carregar la pàgina
window.onload = () => switchMode();

/**
 * Funció per canviar els inputs segons el mode seleccionat
 */
function switchMode() {
    const mode = document.getElementById('mode-selector').value;
    const container = document.getElementById('inputs-container');
    
    if (mode === 'lineal') {
        container.innerHTML = `
            <div class="input-group">
                <input type="number" id="m" placeholder="m (pendent)" step="any">
                <input type="number" id="n" placeholder="n (origen)" step="any">
            </div>`;
    } else if (mode === 'quadratica') {
        container.innerHTML = `
            <div class="input-group">
                <input type="number" id="a" placeholder="a" step="any">
                <input type="number" id="b" placeholder="b" step="any">
                <input type="number" id="c" placeholder="c" step="any">
            </div>`;
    } else {
        container.innerHTML = `
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">Introdueix les coordenades de dos punts coneguts:</p>
            <div class="input-group">
                <input type="number" id="x1" placeholder="x1"> <input type="number" id="y1" placeholder="y1">
                <input type="number" id="x2" placeholder="x2"> <input type="number" id="y2" placeholder="y2">
            </div>`;
    }
}

/**
 * Converteix un decimal a una fracció simplificada
 */
function decimalAFraccio(decimal) {
    if (Math.abs(decimal) < 0.00001) return "0";
    if (Number.isInteger(decimal)) return decimal.toString();
    
    const tolerancia = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = Math.abs(decimal);
    
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(Math.abs(decimal) - h1 / k1) > Math.abs(decimal) * tolerancia);

    return (decimal < 0 ? "-" : "") + `${h1}/${k1}`;
}

/**
 * Lògica principal de càlcul
 */
function executar() {
    const mode = document.getElementById('mode-selector').value;
    const res = document.getElementById('resultat-text');
    let f, titol, info = "";

    if (mode === 'punts') {
        const x1 = parseFloat(document.getElementById('x1').value);
        const y1 = parseFloat(document.getElementById('y1').value);
        const x2 = parseFloat(document.getElementById('x2').value);
        const y2 = parseFloat(document.getElementById('y2').value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return alert("Siusplau, omple tots els camps dels punts.");
        if (x1 === x2) return alert("Error: x1 i x2 no poden ser iguals (pendent vertical).");

        const m = (y2 - y1) / (x2 - x1);
        const n = y1 - m * x1;

        const mFrac = decimalAFraccio(m);
        const nFrac = decimalAFraccio(n);
        const nSigne = n >= 0 ? '+ ' : '- ';
        const nValorAbsFrac = decimalAFraccio(Math.abs(n));

        titol = `f(x) = ${m.toFixed(2)}x ${n >= 0 ? '+ '+n.toFixed(2) : n.toFixed(2)}`;
        f = (x) => m * x + n;
        
        info = `
            <div class="badge">Pendent (m): <b>${m.toFixed(2)}</b> [${mFrac}]</div>
            <div class="badge">Origen (n): <b>${n.toFixed(2)}</b> [${nFrac}]</div>
            <div class="badge" style="background:#d4edda; display:block; margin-top:10px;">
                <b>Equació exacta:</b> f(x) = ${mFrac}x ${nSigne}${nValorAbsFrac}
            </div>
        `;
    } else if (mode === 'lineal') {
        const m = parseFloat(document.getElementById('m').value || 0);
        const n = parseFloat(document.getElementById('n').value || 0);
        titol = `f(x) = ${m}x ${n >= 0 ? '+ '+n : n}`;
        f = (x) => m * x + n;
        info = `Funció lineal amb pendent ${m} i tall en ${n}.`;
    } else {
        const a = parseFloat(document.getElementById('a').value || 0);
        const b = parseFloat(document.getElementById('b').value || 0);
        const c = parseFloat(document.getElementById('c').value || 0);
        
        if (a === 0) return alert("Si 'a' és 0, no és una funció quadràtica. Usa el mode lineal.");

        titol = `f(x) = ${a}x² ${b >= 0 ? '+ '+b : b}x ${c >= 0 ? '+ '+c : c}`;
        f = (x) => a*x*x + b*x + c;
        
        // Càlcul del Vèrtex
        const vx = -b / (2 * a);
        const vy = f(vx);
        
        // Càlcul de les Arrels (Eix X)
        const disc = b*b - 4*a*c;
        let arrelsText = "";
        if (disc > 0) {
            const x1 = (-b + Math.sqrt(disc)) / (2*a);
            const x2 = (-b - Math.sqrt(disc)) / (2*a);
            arrelsText = `x₁: ${x1.toFixed(2)}, x₂: ${x2.toFixed(2)}`;
        } else if (disc === 0) {
            arrelsText = `x: ${(-b/(2*a)).toFixed(2)} (Arrel única)`;
        } else {
            arrelsText = "No té arrels reals";
        }
        
        info = `
            <div class="badge">Vèrtex: <b>(${vx.toFixed(2)}, ${vy.toFixed(2)})</b></div>
            <div class="badge">Arrels: <b>${arrelsText}</b></div>
            <div class="badge">Concavitat: <b>${a > 0 ? 'Cap amunt (∪)' : 'Cap avall (∩)'}</b></div>
        `;
    }

    res.innerHTML = `<h3 style="margin-top:0">${titol}</h3>${info}`;
    dibuixar(f, titol);
}

/**
 * Genera la gràfica amb Chart.js
 */
function dibuixar(f, label) {
    const xLabels = [], yData = [];
    // Generem punts per a la gràfica (de -10 a 10)
    for (let x = -10; x <= 10; x += 0.5) {
        xLabels.push(x);
        const valorY = f(x);
        // Limitem valors molt grans per no trencar l'escala visual
        yData.push(valorY);
    }

    const ctx = document.getElementById('graficaCanvas').getContext('2d');
    
    if (instaciaGrafica) instaciaGrafica.destroy();
    
    instaciaGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [{
                label: label,
                data: yData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#e0e0e0' }
                },
                x: {
                    grid: { color: '#e0e0e0' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
