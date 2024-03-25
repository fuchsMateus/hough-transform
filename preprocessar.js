export function escalaCinza(ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        //ITU BT.709
        //Normalizar os valores sRGB para 0-1, aplicar o expoente 2.2, multiplicar pelo coeficiente, somar, aplicar o expoente reverso, reverter a normalização.
        let cinza = Math.min(255,((data[i]/255.0)**2.2*0.2126+(data[i + 1]/255.0)**2.2*0.7152+(data[i + 2]/255.0)**2.2*0.0722)**0.4545*255);
        data[i] = data[i + 1] = data[i + 2] = cinza;
       
    }
    ctx.putImageData(imageData, 0, 0);
}

export function binarizarImagem(ctx, w, h , limiar){
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if(data[i] >= limiar){
            data[i] = data[i + 1] = data[i + 2] = 255;
        }
        else{
            data[i] = data[i + 1] = data[i + 2] = 0;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

export function suavizacaoGaussiana(ctx, w ,h){
    const imageData = ctx.getImageData(0, 0, w, h);
    let gaussData = new Uint8ClampedArray(w * h *4 );
    let den = 159;
    let dViz = 2;
    let kernel = [
        [2, 4, 5, 4, 2],
        [4, 9, 12, 9, 4],
        [5, 12, 15, 12, 5],
        [4, 9, 12, 9, 4],
        [2, 4, 5, 4, 2]
        
    ]
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let px = (y * w + x) * 4;
            if(y<dViz || y >= h-dViz || x<dViz || x >= w-dViz){
                gaussData[px] = gaussData[px + 1] = gaussData[px + 2] = imageData.data[px];
                gaussData[px + 3] = 255; 
                continue;
            }
            let soma = 0;
            for (let ky = -dViz; ky <= dViz; ky++) {
                for (let kx = -dViz; kx <= dViz; kx++) {
                    let p = ((y + ky) * w + (x + kx)) * 4;
                    soma += imageData.data[p] * kernel[ky + dViz][kx + dViz];
                }
            }

            let novoValor = soma/den;

            gaussData[px] = gaussData[px + 1] = gaussData[px + 2] = novoValor; 
            gaussData[px + 3] = 255; 
        }
    }
    ctx.putImageData(new ImageData(gaussData, w, h), 0, 0);
}

export function filtroDeSobel(ctx, w ,h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    let sobelData = new Uint8ClampedArray(w * h *4 );
    let kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    let kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            let px = (y * w + x) * 4;
            let gx = 0;
            let gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    let p = ((y + ky) * w + (x + kx)) * 4;
                    gx += imageData.data[p] * kernelX[ky + 1][kx + 1];
                    gy += imageData.data[p] * kernelY[ky + 1][kx + 1];
                }
            }

            let magnitude = Math.round(Math.sqrt(gx * gx + gy * gy));

            sobelData[px] = sobelData[px + 1] = sobelData[px + 2] = magnitude; 
            sobelData[px + 3] = 255; 
        }
    }
    ctx.putImageData(new ImageData(sobelData, w, h), 0, 0);
}

