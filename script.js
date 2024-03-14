// Importações dos módulos necessários
import { escalaCinza, filtroDeSobel } from './preprocessar.js';
import { criarAcumulador, votacao, encontrarPicosNMS } from './houghLinha.js';
import { desenharLinhas, desenharEspacoHough, desenharCirculos } from './desenho.js';
import { criarAcumuladorC, votacaoC, encontrarPicosNMSC } from './houghCirculo.js';

// Seleção dos elementos do DOM
const inputLp = document.getElementById('input-lp');
const inputLv = document.getElementById('input-lv');
const inputRl = document.getElementById('deteccao-linhas');
inputRl.checked = true;
const inputRc = document.getElementById('deteccao-circulos');
const inputRaioMinimo = document.getElementById('raioMinimo');
const inputRaioMaximo = document.getElementById('raioMaximo');
const divRaios = document.getElementById('div-raios');

// Variáveis de controle
const maxTamanhoImagem = 400;
let imgOriginal;
let canvas = document.getElementById('imagem-canvas');
let ctx = canvas.getContext('2d');

// Funções
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function rListener() {
  const encontrarCirculo = inputRc.checked;
  divRaios.hidden = !encontrarCirculo;
  if (imgOriginal) {
    processar(imgOriginal, canvas, ctx, canvas.width, canvas.height);
  }
}

function processar(img, canvas, ctx, w, h) {
  const limiarPicos = inputLp.value;
  const vizinhosPico = inputLv.value;
  document.getElementById('label-lp').innerText = `Limiar da Votação = ${limiarPicos}`;
  document.getElementById('label-lv').innerText = `Limiar de vizinhos do NMS = ${vizinhosPico}`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, w, h);

  escalaCinza(ctx, w, h);
  filtroDeSobel(ctx, w, h);

  if (inputRl.checked) {
    const acumulador = votacao(criarAcumulador(w, h), ctx, w, h);
    const picos = encontrarPicosNMS(acumulador, limiarPicos, vizinhosPico);
    desenharLinhas(ctx, picos, w, h);
    desenharEspacoHough(acumulador, 'parametros-canvas', picos, h);
  } else {
    const rMin = inputRaioMinimo.value;
    const rMax = inputRaioMaximo.value;
    const acumulador = votacaoC(criarAcumuladorC(w, h, rMin, rMax), ctx, w, h);

    const picos = encontrarPicosNMSC(acumulador, limiarPicos, vizinhosPico);
    console.log(picos)
    desenharCirculos(ctx, picos);
  }
}

document.getElementById('input-imagem').addEventListener('change', function (e) {
  let reader = new FileReader();

  reader.onload = function (event) {
    imgOriginal = new Image();
    imgOriginal.onload = function () {
      let razao = imgOriginal.height / imgOriginal.width;
      if (imgOriginal.height > maxTamanhoImagem || imgOriginal.width > maxTamanhoImagem) {
        if (razao > 1) {
          canvas.height = maxTamanhoImagem;
          canvas.width = maxTamanhoImagem / razao;
        } else {
          canvas.width = maxTamanhoImagem;
          canvas.height = maxTamanhoImagem * razao;
        }
      } else {
        canvas.width = imgOriginal.width;
        canvas.height = imgOriginal.height;
      }

      inputLp.removeAttribute('disabled');
      inputLv.removeAttribute('disabled');
      document.getElementById('msg').hidden = true;

      const processarDebounced = debounce(() => processar(imgOriginal, canvas, ctx, canvas.width, canvas.height), 1000);

      inputLp.addEventListener('input', processarDebounced);
      inputLv.addEventListener('input', processarDebounced);
      inputRaioMinimo.addEventListener('input', processarDebounced);
      inputRaioMaximo.addEventListener('input', processarDebounced);

      processar(imgOriginal, canvas, ctx, canvas.width, canvas.height);
    };
    imgOriginal.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

inputRl.addEventListener('change', rListener);
inputRc.addEventListener('change', rListener);
