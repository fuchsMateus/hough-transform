export function desenharLinhas(ctx, picos, w, h) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    picos.forEach(linha => {
        let { theta, rho } = linha;
        theta *= (Math.PI / 180);
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

export function desenharCirculos(ctx, picos) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    picos.forEach(circulo => {
        let [r, b, a] = circulo;
        ctx.beginPath();
        ctx.arc(a, b, r, 0, 2 * Math.PI);
        ctx.stroke();
    });
}


export function desenharEspacoHough(acumulador, canvasId, picos, h, valorMaximo) {

    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext('2d');
    let h2 = acumulador.length;
    let w2 = acumulador[0].length;

    canvas.width = w2;
    canvas.height = h;

    for (let rho = 0; rho < h2; rho++) {
        for (let theta = 0; theta < w2; theta++) {
            let valor = acumulador[rho][theta];

            let intensidade = Math.round((valor / valorMaximo) * 255);
            ctx.fillStyle = `rgb(${intensidade}, ${intensidade}, ${intensidade})`;
            ctx.beginPath();
            ctx.fillRect(theta, rho / (h2 / h), 1, 1);
            ctx.closePath();

        }
    }

    ctx.fillStyle = `rgb(255,0,0)`;

    picos.forEach(linha => {
        let { theta, rho } = linha;
        ctx.beginPath();
        ctx.fillRect(theta - 1, rho / (h2 / h) - 1, 3, 3);
        ctx.closePath();
    });

}

export function desenharEspacoHough3D(canvasId, acumulador, picos, w, h, valorMaximo) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    canvas.height = h;
    canvas.width = w;

    let imagensR = [];
    let timer; // Para controlar o setTimeout

    for (let r = 0; r < acumulador.length; r++) {
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, w, h);

        for (let b = 0; b < h; b++) {
            for (let a = 0; a < w; a++) {
                let valor = acumulador[r][b][a];
                let intensidade = Math.round((valor / valorMaximo) * 255);

                ctx.fillStyle = `rgb(${intensidade}, ${intensidade}, ${intensidade})`;
                ctx.fillRect(a, b, 1, 1);
            }
        }

        ctx.fillStyle = `rgb(255,0,0)`;
        picos.forEach(circulo => {
            let [r, b, a] = circulo;
            ctx.beginPath();
            ctx.fillRect(a - 1, b - 1, 3, 3);
            ctx.closePath();
        });

        imagensR.push(canvas.toDataURL("image/jpg"));
    }
    
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };

    let indiceAtual = 0;

    function passarImagem() {
        if (indiceAtual >= imagensR.length) {
            indiceAtual = 0; // Volta ao início se tiver atingido o fim da lista de imagens
        }

        img.src = imagensR[indiceAtual++];
        timer = setTimeout(passarImagem, 41.6667); // Aproximadamente 24 fps
    }

    passarImagem(); // Inicia a animação

    // Retorna uma função de parada
    return function pararAnimacao() {
        clearTimeout(timer);
    };
}
