import {escalaCinza, filtroDeSobel} from './preprocessar.js'
import {criarAcumulador, votacao, encontrarPicosNMS} from './hough.js'
import {desenharLinhas, desenharEspacoHough} from './desenho.js';

const limiarPicos = 50;
const vizinhosPico = 70;

document.getElementById('input-imagem').addEventListener('change', function(e) {

  let canvas = document.getElementById('imagem-canvas');
  let ctx = canvas.getContext('2d');
  let reader = new FileReader();

  reader.onload = function(event) {
      let img = new Image();
      img.onload = function() {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          processar(ctx, canvas.width, canvas.height);
      }
      img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
});

function processar(ctx, w, h) {
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
  desenharEspacoHough(acumulador, 'parametros-canvas');
} 
