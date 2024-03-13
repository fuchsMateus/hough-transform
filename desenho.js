export function desenharLinhas(ctx, picos, w, h) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    picos.forEach(linha => {
        const { theta, rho } = linha;
        let x0 = 0;
        let y0 = (rho - x0 * Math.cos(theta)) / Math.sin(theta);
        let x1 = w;
        let y1 = (rho - x1 * Math.cos(theta)) / Math.sin(theta);

        if (theta === 0) {
            x0 = rho;
            y0 = 0;
            x1 = rho;
            y1 = h;
        }

        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
    });

    ctx.stroke();
}

export function desenharEspacoHough(acumulador, canvasId) {
    let valorMaximo = Math.max(...acumulador.flat());

    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext('2d');
    let altura = acumulador.length;
    let largura = acumulador[0].length;

    canvas.width = largura;
    canvas.height = altura;

    for (let i = 0; i < altura; i++) {
        for (let j = 0; j < largura; j++) {
            let valor = acumulador[i][j];

            let intensidade = Math.round((valor / valorMaximo) * 255);
            ctx.fillStyle = `rgb(${intensidade}, ${intensidade}, ${intensidade})`;
            ctx.fillRect(j, i, 1, 1);
        }
    }
}


