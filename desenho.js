export function desenharLinhas(ctx, picos, w, h) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    picos.forEach(linha => {
        let { theta, rho } = linha;
        rho -= Math.sqrt(w * w + h * h);
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

export function desenharEspacoHough(acumulador, canvasId, w, h) {
    let valorMaximo = Math.max(...acumulador.flat());

    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext('2d');
    let h2 = acumulador.length;
    let w2 = acumulador[0].length;

    canvas.width = w;
    canvas.height = h;

    for (let rho = 0; rho < h2; rho++) { 
        for (let theta = 0; theta < w2; theta++) { 
            let valor = acumulador[rho][theta]; 

            let intensidade = Math.round((valor / valorMaximo) * 255);
            ctx.fillStyle = `rgb(${intensidade}, ${intensidade}, ${intensidade})`;
            ctx.beginPath();
            ctx.fillRect(theta, rho/(h2/h), 1, 1);
            ctx.closePath();
            
        }
    }
}