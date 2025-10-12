// ==========================================================
// ==============  Traductor Voz/Text → Señas  ==============
// ==========================================================

// --- Captura de elementos del HTML ---
const boton = document.getElementById('start');
const texto = document.getElementById('texto');
const videoSeña = document.getElementById('videoSeña');
const videoSource = document.getElementById('videoSource');
const entradaTexto = document.getElementById('entradaTexto');
const startText = document.getElementById('startText'); 

if (!videoSeña || !videoSource) console.error('Faltan elementos videoSeña/videoSource en el HTML.');

// --- Config inicial ---
videoSeña.style.display = "none";
videoSeña.muted = true;

// --- Reconocimiento de voz ---
const Recon = window.SpeechRecognition || window.webkitSpeechRecognition;
const reconocimiento = Recon ? new Recon() : null;
if (reconocimiento) reconocimiento.lang = 'es-ES';

// --- Funciones utilitarias ---
function normalizar(text) {
  if (!text) return '';
  let t = String(text).toLowerCase().trim();
  t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  t = t.replace(/[¿?¡!,.]/g, '');
  t = t.replace(/\s+/g, ' ');
  return t;
}

function keyCompact(text) {
  return normalizar(text).replace(/\s+/g, '');
}

// --- Diccionario de palabras simples ---
const palabras = {
  "economia": "economia.mp4",
  "entrerios": "entrerios.mp4",
  "lapampa": "lapampa.mp4",
  "larioja": "larioja.mp4",
  "rionegro": "rionegro.mp4",
  "sanjuan": "sanjuan.mp4",
  "sanluis": "sanluis.mp4",
  "santacruz": "santacruz.mp4",
  "santafe": "santafe.mp4",
  "santiagodelestero": "santiagodelestero.mp4",
  "antartidaargentina": "antartidaargentina.mp4",
  "tierradelfuego": "tierradelfuego.mp4",
  "hijohija": "hijohija.mp4",
  "bebe": "bebe.mp4",
  "abueloabuela": "abueloabuela.mp4",
  "hermanohermana": "hermanohermana.mp4",
  "tiotia": "tiotia.mp4",
  "padrastro": "padrastro.mp4",
  "madrastra": "madrastra.mp4",
  "esposoesposa": "esposoesposa.mp4",
  "pareja": "pareja.mp4",
  "solterosoltera": "solterosoltera.mp4",
  "separadoseparada": "separadoseparada.mp4",
  "edad": "edad.mp4",
  "cumpleanos": "cumpleanos.mp4",
  "extranjeroextranjera": "extranjeroextranjera.mp4",
  "catolicocatolica": "catolicocatolica.mp4",
  "jesucristo": "jesucristo.mp4",
  "jesus": "jesus.mp4",
  "iglesia": "iglesia.mp4",
  "administrar": "administrar.mp4",
  "negociar": "negociar.mp4",
  "estafa": "estafa.mp4",
  "estafar": "estafar.mp4",
  "ahorro": "ahorro.mp4",
  "ahorrar": "ahorrar.mp4",
  "deber": "deber.mp4",
  "barato": "barato.mp4",
  "caro": "caro.mp4",
  "jefejefa": "jefejefa.mp4",
  "empleadoempleada": "empleadoempleada.mp4",
  "jubiladojubilada": "jubiladojubilada.mp4",
  "sueldo": "sueldo.mp4",
  "echar": "echar.mp4",
  "despedir": "despedir.mp4",
  "renunciar": "renunciar.mp4",
  "feriado": "feriado.mp4",
  "fiesta": "fiesta.mp4",
  "bomberobombera": "bomberobombera.mp4",
  "enfermeroenfermera": "enfermeroenfermera.mp4",
  "nacional": "nacional.mp4",
  "nacionalmente": "nacionalmente.mp4",
  "internacional": "internacional.mp4",
  "internacionalmente": "internacionalmente.mp4",
  "poder": "poder.mp4",
  "compu": "compu.mp4",
  "computadora": "computadora.mp4",
  "jugar": "jugar.mp4",
  "dibujar": "dibujar.mp4",
  "ruido": "ruido.mp4",
  "persona": "persona.mp4",
  "personas": "personas.mp4",
  "gente": "gente.mp4",
  "personalidad": "personalidad.mp4",
  "sentimiento": "sentimiento.mp4",
  "emocion": "emocion.mp4",
  "emocionado": "emocionado.mp4",
  "emocionarse": "emocionarse.mp4",
  "confianza": "confianza.mp4",
  "desconfianza": "desconfianza.mp4",
  "deseo": "deseo.mp4",
  "admiracion": "admiracion.mp4",
  "ofensa": "ofensa.mp4",
  "ofendido": "ofendido.mp4"
};

// --- Verbos y conjugaciones ---
const conjugaciones = {
  amar: ["amar","amo","amas","amás","ama","amamos","aman","amé","amaste","amó","amamos","amaron","amaba","amabas","amábamos","amaban","amaré","amarás","amará","amaremos","amarán","amaría","amarías","amaríamos","amarían","amando","amado","he amado","has amado","hemos amado","han amado"],
  querer: ["querer","quiero","quieres","querés","quiere","queremos","quieren","quise","quisiste","quiso","quisimos","quisieron","quería","querías","queríamos","querían","querré","querrás","querrá","querremos","querrán","querría","querrías","querríamos","querrían","queriendo","querido","he querido","hemos querido","han querido"],
  sentir: ["sentir","siento","sientes","sentís","siente","sentimos","sienten","sentí","sentiste","sintió","sentimos","sintieron","sentía","sentías","sentíamos","sentían","sentiré","sentirás","sentirá","sentiremos","sentirán","sentiría","sentirías","sentiríamos","sentirían","sintiendo","sentido","he sentido","hemos sentido","han sentido"],
  odiar: ["odiar","odio","odias","odiás","odia","odiamos","odian","odié","odiaste","odió","odiamos","odiaron","odiaba","odiabas","odiábamos","odiaban","odiaré","odiarás","odiará","odiaremos","odiarán","odiaría","odiarías","odiaríamos","odiarían","odiando","odiado","he odiado","hemos odiado","han odiado"],
  ahorrar: ["ahorrar","ahorro","ahorras","ahorrás","ahorra","ahorramos","ahorran","ahorré","ahorraste","ahorró","ahorramos","ahorraron","ahorraba","ahorrabas","ahorrábamos","ahorraban","ahorraré","ahorrarás","ahorrará","ahorraremos","ahorrarán","ahorraría","ahorrarías","ahorraríamos","ahorrarían","ahorrando","ahorrado","he ahorrado","hemos ahorrado","han ahorrado"],
  cantar: ["cantar","canto","cantas","cantás","canta","cantamos","cantan","canté","cantaste","cantó","cantamos","cantaron","cantaba","cantabas","cantábamos","cantaban","cantaré","cantarás","cantará","cantaremos","cantarán","cantaría","cantarías","cantaríamos","cantarían","cantando","cantado","he cantado","hemos cantado","han cantado"],
  bailar: ["bailar","bailo","bailas","bailás","baila","bailamos","bailan","bailé","bailaste","bailó","bailamos","bailaron","bailaba","bailabas","bailábamos","bailaban","bailaré","bailarás","bailará","bailaremos","bailarán","bailaría","bailarías","bailaríamos","bailarían","bailando","bailado","he bailado","hemos bailado","han bailado"]
};

// --- Alias: mapear varias palabras a un mismo video ---
const alias = {
  "esposo": "esposoesposa",
  "esposa": "esposoesposa",
  "hijo": "hijohija",
  "hija": "hijohija",
  "abuelo": "abueloabuela",
  "abuela": "abueloabuela",
  "hermano": "hermanohermana",
  "hermana": "hermanohermana",
  "tio": "tiotia",
  "tia": "tiotia",
  "soltero": "solterosoltera",
  "soltera": "solterosoltera",
  "separado": "separadoseparada",
  "separada": "separadoseparada",
  "bombero": "bomberobombera",
  "bombera": "bomberobombera",
  "enfermero": "enfermeroenfermera",
  "enfermera": "enfermeroenfermera",
  "jefe": "jefejefa",
  "jefa": "jefejefa",
  "empleado": "empleadoempleada",
  "empleada": "empleadoempleada",
  "jubilado": "jubiladojubilada",
  "jubilada": "jubiladojubilada"
};

// --- Buscar video según palabra ---
function buscarVideo(palabra) {
  const key = keyCompact(palabra);
  if (alias[key]) return palabras[alias[key]];
  if (palabras[key]) return palabras[key];
  for (const verbo in conjugaciones) {
    if (conjugaciones[verbo].includes(key)) return `${verbo}.mp4`;
  }
  return null;
}

// --- Mostrar texto ---
function mostrarTextoReconocido(text) {
  if (texto) texto.textContent = text;
}

// --- Procesar texto y reproducir video ---
function procesarTextoSecuencial(text) {
  const videoFile = buscarVideo(text);
  if (videoFile) {
    videoSource.src = `palabras/${videoFile}`;
    videoSeña.load();
    videoSeña.style.display = "block";
    videoSeña.play().catch(err => {
      console.warn("No se pudo reproducir automáticamente:", err);
    });
  } else {
    texto.textContent = "❌ Palabra no encontrada";
    videoSeña.style.display = "none";
  }
}

// --- Eventos ---
if (reconocimiento) {
  boton.addEventListener('click', () => {
    try {
      reconocimiento.start();
    } catch (err) {
      console.error('No se pudo iniciar reconocimiento:', err);
    }
  });

  reconocimiento.onresult = (event) => {
    const speechText = event.results[0][0].transcript.toLowerCase();
    mostrarTextoReconocido(speechText);
    procesarTextoSecuencial(speechText);
  };
}

entradaTexto.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const userInput = entradaTexto.value.toLowerCase().trim();
    mostrarTextoReconocido(userInput);
    procesarTextoSecuencial(userInput);
  }
});

