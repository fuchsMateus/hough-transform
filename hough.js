const thetaMax = 180;
let tabelaCos = new Array(thetaMax);
let tabelaSen = new Array(thetaMax);
let theta = 0;
for (let i = 0; i < thetaMax; i++) {
    theta = i * (Math.PI / 180);
    tabelaCos[i] = Math.cos(theta);
    tabelaSen[i] = Math.sin(theta);
}

export function criarAcumulador(w, h) {
    let rhoMax = Math.sqrt(w * w + h * h) + 1;
    return Array.from({ length: thetaMax }, () =>
        Array.from({ length: rhoMax }, () => 0)
    );
}

export function votacao(acumulador, ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h).data;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const pixelIndex = (y * w + x) * 4;
            if (imageData[pixelIndex] == 255) {
                for (let theta = 0; theta < thetaMax; theta++) {
                    const rho = Math.round(x * tabelaCos[theta] + y * tabelaSen[theta]);
                    if (rho >= 0 && rho < acumulador[theta].length) {
                        acumulador[theta][rho] += 1;
                    }
                }
            }
        }
    }
    return acumulador;
}

export function encontrarPicosNMS(acumulador, limiar, tamanhoVizinhanca) {
    let picos = [];
    const thetaMax = acumulador.length;
    const rhoMax = acumulador[0].length;

    for (let i = 0; i < thetaMax; i++) {
        for (let j = 0; j < rhoMax; j++) {
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

                    if (ni >= 0 && ni < thetaMax && nj >= 0 && nj < rhoMax) {
                        if (acumulador[ni][nj] > acumulador[i][j]) {
                            isMax = false;
                            break;
                        }
                    }
                }
            }

            if (isMax) {
                picos.push({ theta: i * (Math.PI / 180), rho: j });
            }
        }
    }

    return picos;
}



