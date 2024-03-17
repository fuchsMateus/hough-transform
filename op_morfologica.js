function hitOrMiss(ctx, w, h, elementoEstruturante) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    let homData = new Uint8ClampedArray(w * h * 4);
    
    let limY = (elementoEstruturante.length-1)/2
    let limX = (elementoEstruturante[0].length-1)/2

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let px = (y * w + x) * 4;
            let b = true;

            loopEstruturante:
            for (let ky = 0; ky < elementoEstruturante.length; ky++) {
                for (let kx = 0; kx < elementoEstruturante[ky].length; kx++) {
                    if (elementoEstruturante[ky][kx] === -1) {
                        continue; 
                    }
                    let ny = y + ky - limY;
                    let nx = x + kx - limX;
                    if (ny < 0 || ny >= h || nx < 0 || nx >= w) {
                        b = false;
                        break loopEstruturante;
                    }
                    let p = (ny * w + nx) * 4;
                    if ((elementoEstruturante[ky][kx] === 1 && data[p] == 0) ||
                        (elementoEstruturante[ky][kx] === 0 && data[p] == 255)) {
                        b = false;
                        break loopEstruturante;
                    }
                }
            }

            if (b) {
                homData[px] = homData[px + 1] = homData[px + 2] = 255;
            } else {
                homData[px] = homData[px + 1] = homData[px + 2] = 0;
            }
            homData[px + 3] = 255; 
        }
    }

    return homData;
}

export function afinar(ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    let data = imageData.data;

    const elementosBase = [
        [
            [0, -1, 1],
            [0, -1, 1],
            [0, -1, 1]
        ],

        [
            [0, 0, -1],
            [0, -1, 1],
            [-1, 1, -1]
        ]
    ]

    let elementosERotacoes = [];
    elementosBase.forEach(el => {
        let r1 = rotacionarMatrizQuadrada(el);
        let r2 = rotacionarMatrizQuadrada(r1);
        let r3 = rotacionarMatrizQuadrada(r2)
        elementosERotacoes.push(el, r1, r2, r3);
    });

    let dataAnterior = data;
    let convergencia = 0;
    while(convergencia<10) {
        elementosERotacoes.forEach(el => {
            let homData = hitOrMiss(ctx, w, h, el);
            data = subtracaoImgBinaria(data, homData);
            if(dadosIguais(data,dataAnterior)) convergencia+=1;
            else convergencia = 0;
            dataAnterior = data;
            ctx.putImageData(new ImageData(data, w, h), 0, 0);

        });
    }

}

function subtracaoImgBinaria(data1,data2){
    let subData = new Uint8ClampedArray(data1.length);

    for (let i = 0; i < data1.length; i+=4) {
        let resultado = data1[i]-data2[i];
        if(resultado<0) resultado = 0;

        subData[i] = subData[i+1] = subData[i+2] = resultado;
        subData[i+3] = 255
        
    }
    return subData;
}

function dadosIguais(data1,data2){
    for (let i = 0; i < data1.length; i++) {
        if (data1[i] !== data2[i]) {
            return false;
        }
    }
    return true;
}

function rotacionarMatrizQuadrada(matriz){
    let novaMatriz =[];
    let d = matriz.length;
    for (let i = 0; i < d; i++) {
        novaMatriz.push([]);
        for (let j = d-1; j >= 0; j--) {
            novaMatriz[i].push(matriz[j][d-(1+i)])
        }
    }
    novaMatriz.reverse();
   return novaMatriz;
}