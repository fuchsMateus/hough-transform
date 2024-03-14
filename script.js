// Importações dos módulos necessários
import { escalaCinza, filtroDeSobel } from './preprocessar.js';
import { criarAcumulador, votacao, encontrarPicosNMS } from './houghLinha.js';
import { desenharLinhas, desenharEspacoHough, desenharCirculos } from './desenho.js';
import { criarAcumuladorC, votacaoC, encontrarPicosNMSC } from './houghCirculo.js';

// Seleção dos elementos do DOM
const inputLp = document.getElementById('input-lp');
const inputLv = document.getElementById('input-lv');

const inputRl = document.getElementById('deteccao-linhas');
const inputRc = document.getElementById('deteccao-circulos');

const inputRaioMinimo = document.getElementById('raioMinimo');
const inputRaioMaximo = document.getElementById('raioMaximo');

const divRaios = document.getElementById('div-raios');

const btnProcessar = document.getElementById('btn-processar');

const maxTamanhoImagem = 400;
let img;
let canvas = document.getElementById('imagem-canvas');
let ctx = canvas.getContext('2d');

function radioListener() {
  const encontrarCirculo = inputRc.checked;
  divRaios.hidden = !encontrarCirculo;
}

function rangeListener() {
  document.getElementById('label-lp').innerText = `Limiar da Votação = ${inputLp.value}`;
  document.getElementById('label-lv').innerText = `Limiar de vizinhos do NMS =  ${inputLv.value}`;
}

function raioListener() {
  let max = parseInt(inputRaioMaximo.value, 10);
  let min = parseInt(inputRaioMinimo.value, 10);
  const faixa = 40;
  if (inputRaioMinimo.value == '') inputRaioMaximo.value = '';
  else if (min < 0) {
    inputRaioMaximo.value = '';
    inputRaioMinimo.value = '';
  }
  else inputRaioMaximo.value = min + faixa;

}

rangeListener();
radioListener();

inputLp.addEventListener('input', rangeListener);
inputLv.addEventListener('input', rangeListener);
inputRl.addEventListener('change', radioListener);
inputRc.addEventListener('change', radioListener);
inputRaioMinimo.addEventListener('input', raioListener);

async function processar(img, ctx, w, h) {
  ctx.drawImage(img, 0, 0, w, h);
  const limiarPicos = inputLp.value;
  const vizinhosPico = inputLv.value;

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
    img = new Image();
    img.onload = function () {
      let razao = img.height / img.width;
      if (img.height > maxTamanhoImagem || img.width > maxTamanhoImagem) {
        if (razao > 1) {
          canvas.height = maxTamanhoImagem;
          canvas.width = maxTamanhoImagem / razao;
        } else {
          canvas.width = maxTamanhoImagem;
          canvas.height = maxTamanhoImagem * razao;
        }
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      document.getElementById('msg').hidden = true;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      btnProcessar.onclick = () => {
        btnProcessar.setAttribute('aria-busy', 'true');
        setTimeout(() => {
          processar(img, ctx, canvas.width, canvas.height)
            .finally(() => {
              btnProcessar.removeAttribute('aria-busy');
            });
        }, 10);
      };

    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});
