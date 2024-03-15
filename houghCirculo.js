let rMax = 0;
let rMin = 0;
let aMax = 0;
let bMax = 0;

export function criarAcumuladorC(w, h, rMinp, rMaxp) {
    if (rMinp == '') {
        rMin = 0;
    }
    else { rMin = parseInt(rMinp); }

    if (rMaxp == '') {
        rMax = 1;
    }
    else { rMax= parseInt(rMaxp);}
  
    aMax = Math.round(w);
    bMax = Math.round(h);

    return Array.from({ length: rMax-rMin+1 }, () =>
        Array.from({ length: bMax }, () =>
            Array.from({ length: aMax }, () => 0)
        )
    );
}

export function votacaoC(acumulador, ctx, w, h) {
    let valorMaximo = 0;
    const imageData = ctx.getImageData(0, 0, w, h).data;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const pixelIndex = (y * w + x) * 4;
            if (imageData[pixelIndex] >= 224) {
                for (let b = 0; b < bMax; b++) {
                    for (let a = 0; a < aMax; a++) {
                        let r = Math.round(Math.sqrt((x - a) * (x - a) + (y - b) * (y - b)));
                        if (r <= rMax && r >= rMin) {
                            acumulador[r-rMin][b][a]++;
                            let atual = acumulador[r-rMin][b][a];
                            if(atual > valorMaximo) valorMaximo = atual;
                        }
                    }
                }
            }
        }
    }
    return [acumulador,valorMaximo];
}

export function encontrarPicosNMSC(acumulador, limiar, tamanhoVizinhanca) {
    let picos = [];

    for (let r = 0; r < rMax-rMin+1; r++) {
        for (let b = 0; b < bMax; b++) {
            for (let a = 0; a < aMax; a++) {

                if (acumulador[r][b][a] < limiar) {
                    continue;
                }

                let isMax = true;
                for (let di = -tamanhoVizinhanca; di <= tamanhoVizinhanca && isMax; di++) {
                    for (let dj = -tamanhoVizinhanca; dj <= tamanhoVizinhanca && isMax; dj++) {
                        for (let dk = -tamanhoVizinhanca; dk <= tamanhoVizinhanca; dk++) {
                            if (di == 0 && dj == 0 && dk == 0) {
                                continue;
                            }

                            let ni = r + di;
                            let nj = b + dj;
                            let nk = a + dk;

                            if (ni >= 0 && ni < rMax-rMin+1 && nj >= 0 && nj < bMax && nk >= 0 && nk < aMax) {
                                if (acumulador[ni][nj][nk] > acumulador[r][b][a]) {
                                    isMax = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (isMax) {
                    picos.push([r+rMin, b, a]);
                }
            }
        }
    }

    return picos;
}
