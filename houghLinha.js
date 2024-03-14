const thetaMax = 180;
let rhoMax = 0;
let tabelaCos = new Array(thetaMax);
let tabelaSen = new Array(thetaMax);
let theta = 0;
for (let i = 0; i < thetaMax; i++) {
    theta = i * (Math.PI / thetaMax);
    tabelaCos[i] = Math.cos(theta);
    tabelaSen[i] = Math.sin(theta);
}

export function criarAcumulador(w, h) {
    rhoMax = Math.round(2 * Math.sqrt(w * w + h * h));
    return Array.from({ length: rhoMax}, () =>
        Array.from({ length: thetaMax }, () => 0)
    );
}

export function votacao(acumulador, ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h).data;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const pixelIndex = (y * w + x) * 4;
            if (imageData[pixelIndex] >= 224) {
                for (let theta = 0; theta < thetaMax; theta++) {
                    let rho = Math.round(x * tabelaCos[theta] + y * tabelaSen[theta] + Math.sqrt(w * w + h * h));
                    acumulador[rho][theta] ++;
                }
            }
        }
    }
    return acumulador;
}

export function encontrarPicosNMS(acumulador, limiar, tamanhoVizinhanca) {
    let picos = [];
    for (let i = 0; i < rhoMax; i++) {
        for (let j = 0; j < thetaMax; j++) {
            if (acumulador[i][j] < limiar) {
                continue;
            }

            let isMax = true;
            for (let di = -tamanhoVizinhanca; di <= tamanhoVizinhanca && isMax; di++) {
                for (let dj = -tamanhoVizinhanca; dj <= tamanhoVizinhanca; dj++) {
                    if (di == 0 && dj == 0) {
                        continue;
                    }

                    let ni = i + di;
                    let nj = j + dj;

                    if (ni >= 0 && ni < rhoMax && nj >= 0 && nj < thetaMax) {
                        if (acumulador[ni][nj] > acumulador[i][j]) {
                            isMax = false;
                            break;
                        }
                    }
                }
            }

            if (isMax) {
                picos.push({ theta: j, rho: i });
            }
        }
    }

    return picos;
}



