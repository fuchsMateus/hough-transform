import { escalaCinza, filtroDeSobel } from './preprocessar.js'
import { criarAcumulador, votacao, encontrarPicosNMS } from './hough.js'
import { desenharLinhas, desenharEspacoHough } from './desenho.js';

const inputLp = document.getElementById('input-lp');
const inputLv = document.getElementById('input-lv');
const maxTamanhoImagem = 400;

let canvasOriginal;
let ctxOriginal;
let imgOriginal;

document.getElementById('input-imagem').addEventListener('change', function (e) {
  let canvas = canvasOriginal = document.getElementById('imagem-canvas');
  let ctx = ctxOriginal =  canvas.getContext('2d');
  let reader = new FileReader();

  reader.onload = function (event) {
    let img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      let razao = canvas.height / canvas.width;
      if (canvas.height > maxTamanhoImagem || canvas.width > maxTamanhoImagem) {
        if (razao > 1) {
          canvas.height = maxTamanhoImagem;
          canvas.width = maxTamanhoImagem / razao
        }
        else {
          canvas.width = maxTamanhoImagem;
          canvas.height = maxTamanhoImagem * razao
        }
      }
      imgOriginal = img;
      

      inputLp.removeAttribute('disabled')
      inputLv.removeAttribute('disabled')
      document.getElementById('msg').hidden = true;

      function debounce(func, wait) {
        let timeout;
        return function(...args) {
          const context = this;
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(context, args), wait);
        };
      }
      
      const processarDebounced = debounce(function(img, canvas, ctx, w, h) {
        processar(img, canvas, ctx, w, h);
      }, 250);
      
      inputLp.addEventListener('input', () => processarDebounced(imgOriginal, canvas, ctx, canvas.width, canvas.height));
      inputLv.addEventListener('input', () => processarDebounced(imgOriginal, canvas, ctx, canvas.width, canvas.height));
      

      processar(img, canvas, ctx, canvas.width, canvas.height);
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
});


function processar(img, canvas, ctx, w, h) {
  let limiarPicos = inputLp.value;
  let vizinhosPico = inputLv.value;
  document.getElementById('label-lp').innerText = 'Limiar da Votação = '+limiarPicos;
  document.getElementById('label-lv').innerText = 'Limiar de vizinhos do NMS = '+vizinhosPico;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  //Passo 1: transformar a imagem para escala de cinza
  escalaCinza(ctx, w, h);
  //Passo 2: aplicar filtro de sobel
  filtroDeSobel(ctx, w, h);
  // Passo 3: criação do acumulador e votação
  let acumulador = votacao(criarAcumulador(w, h), ctx, w, h);
  //Passo 4: encontrar os picos do acumulador
  let picos = encontrarPicosNMS(acumulador, limiarPicos, vizinhosPico);
  //Passo 5: desenhar linhas encontradas
  desenharLinhas(ctx, picos, w, h, acumulador);
  desenharEspacoHough(acumulador, 'parametros-canvas', w, h);
} 
