export function escalaCinza(ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        //ITU BT.601
        const cinza = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = cinza;
       
    }
    ctx.putImageData(imageData, 0, 0);
}

export function filtroDeSobel(ctx, w ,h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    let sobelData = new Uint8ClampedArray(w * h * 4);
    let mascaraX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    let mascaraY = [
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
                    gx += imageData.data[p] * mascaraX[ky + 1][kx + 1];
                    gy += imageData.data[p] * mascaraY[ky + 1][kx + 1];
                }
            }

            let magnitude = Math.round(Math.sqrt(gx * gx + gy * gy));

            sobelData[px] = sobelData[px + 1] = sobelData[px + 2] = magnitude; //R, G e B
            sobelData[px + 3] = 255; //Alpha
        }
    }

    ctx.putImageData(new ImageData(sobelData, w, h), 0, 0);
}
