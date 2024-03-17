import { escalaCinza, binarizarImagem, suavizacaoGaussiana, filtroDeSobel } from './preprocessar.js';
import { criarAcumulador, votacao, encontrarPicosNMS } from './houghLinha.js';
import { desenharLinhas, desenharEspacoHough, desenharCirculos, desenharEspacoHough3D } from './desenho.js';
import { criarAcumuladorC, votacaoC, encontrarPicosNMSC } from './houghCirculo.js';
import { afinar } from './op_morfologica.js';

const inputLb = document.getElementById('input-lb');
const inputLp = document.getElementById('input-lp');
const inputLv = document.getElementById('input-lv');

const inputRl = document.getElementById('deteccao-linhas');
const inputRc = document.getElementById('deteccao-circulos');

const checkAfinamento = document.getElementById('afinamento');

const inputRaioMinimo = document.getElementById('raioMinimo');
const inputRaioMaximo = document.getElementById('raioMaximo');

const divRaios = document.getElementById('div-raios');

const btnProcessar = document.getElementById('btn-processar');

const maxTamanhoImagem = 400;
let img;
let canvas = document.getElementById('imagem-canvas');
let canvasEH = document.getElementById('parametros-canvas');
let ctx = canvas.getContext('2d');
let ctxEH = canvasEH.getContext('2d');
let pararDeExibir = 0;

function radioListener() {
  const encontrarCirculo = inputRc.checked;
  divRaios.hidden = !encontrarCirculo;
}

function rangeListener() {
  document.getElementById('label-lb').innerText = `Limiar de Binarização = ${inputLb.value}`;
  document.getElementById('label-lp').innerText = `Limiar da Votação = ${inputLp.value}`;
  document.getElementById('label-lv').innerText = `Tamanho da vizinhança do NMS =  ${inputLv.value}`;
}

function raioListener() {
  let min = parseInt(inputRaioMinimo.value, 10);
  const faixa = 20;
  if (inputRaioMinimo.value == '') inputRaioMaximo.value = '';
  else if (min < 0) {
    inputRaioMaximo.value = '';
    inputRaioMinimo.value = '';
  }
  else inputRaioMaximo.value = min + faixa;

}

rangeListener();
radioListener();

inputLb.addEventListener('input', rangeListener);
inputLp.addEventListener('input', rangeListener);
inputLv.addEventListener('input', rangeListener);
inputRl.addEventListener('change', radioListener);
inputRc.addEventListener('change', radioListener);
inputRaioMinimo.addEventListener('input', raioListener);

async function processar(img, ctx, w, h) {

  if(pararDeExibir!=0) pararDeExibir();
  ctxEH.clearRect(0,0,canvasEH.width, canvasEH.height);
  ctx.drawImage(img, 0, 0, w, h);
  const limiarBinarizacao = inputLb.value;
  const limiarPicos = inputLp.value;
  const vizinhosPico = inputLv.value;

  escalaCinza(ctx, w, h);
  suavizacaoGaussiana(ctx,w,h);
  filtroDeSobel(ctx, w, h);
  binarizarImagem(ctx, w, h, limiarBinarizacao);
  if(checkAfinamento.checked) afinar(ctx, w, h);

  if (inputRl.checked) {
    const [ acumulador,  valorMaximo] = votacao(criarAcumulador(w, h), ctx, w, h);
    const picos = encontrarPicosNMS(acumulador, limiarPicos, vizinhosPico);
    desenharLinhas(ctx, picos, w, h);
    desenharEspacoHough(acumulador, 'parametros-canvas', picos, h, valorMaximo);
  } else {
    const rMin = inputRaioMinimo.value;
    const rMax = inputRaioMaximo.value;
    const [ acumulador,  valorMaximo] = votacaoC(criarAcumuladorC(w, h, rMin, rMax), ctx, w, h);
    const picos = encontrarPicosNMSC(acumulador, limiarPicos, vizinhosPico);
    desenharCirculos(ctx, picos);
    pararDeExibir = desenharEspacoHough3D('parametros-canvas', acumulador, picos, w, h, valorMaximo)
  }
}

document.getElementById('input-imagem').addEventListener('change', function (e) {
  if(pararDeExibir!=0) pararDeExibir();

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

      ctxEH.clearRect(0,0,canvasEH.width, canvasEH.height);
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