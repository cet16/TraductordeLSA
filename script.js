// ✅ Traductor de Voz y Texto a Lengua de Señas - Versión Final

const video = document.getElementById("videoSeña");
const videoSource = document.getElementById("videoSource");
const inputTexto = document.getElementById("entradaTexto");
const texto = document.getElementById("texto");
const speedControl = document.getElementById("speedControl");
const speedValue = document.getElementById("speedValue");

const videoPath = "palabras/";

// ✅ Diccionario: palabra o sinónimo → archivo de video
const videos = {
  // Frases comunes
  "hola": "hola.mp4",
  "como estas": "comoestas.mp4",
  "como estás": "comoestas.mp4",
  "cómo estás": "comoestas.mp4",
  "me llamo luana": "llamoluana.mp4"

  // Provincias
  "entrerios": "Entrerios.mp4",
  "lapampa": "Lapampa.mp4",
  "larioja": "Larioja.mp4",
  "rionegro": "Rionegro.mp4",
  "sanjuan": "Sanjan.mp4",
  "sanluis": "Sanluis.mp4",
  "santacruz": "Santacruz.mp4",
  "santafe": "Santafe.mp4",
  "santiagodelestero": "Santiagodelestero.mp4",
  "antartidaargentina": "Antártidaargentina.mp4",
  "tierradelfuego": "Tierradelfuego.mp4",

  // Familia
  "hijo": "Hijohija.mp4",
  "hija": "Hijohija.mp4",
  "bebe": "Bebé.mp4",
  "abuelo": "Abueloabuela.mp4",
  "abuela": "Abueloabuela.mp4",
  "hermano": "Hermanohermana.mp4",
  "hermana": "Hermanohermana.mp4",
  "tio": "Tiotia.mp4",
  "tia": "Tiotia.mp4",
  "padrastro": "Padrastro.mp4",
  "madrastra": "Madrastra.mp4",
  "esposo": "Esposoesposa.mp4",
  "esposa": "Esposoesposa.mp4",
  "pareja": "Pareja.mp4",
  "soltero": "Solterosoltera.mp4",
  "soltera": "Solterosoltera.mp4",
  "separado": "Separadoseparada.mp4",
  "separada": "Separadoseparada.mp4",

  // Edad y cumpleaños
  "edad": "Edad.mp4",
  "cumpleaños": "Cumpleaños.mp4",

  // Nacionalidad / religión
  "extranjero": "Extranjeroextranjera.mp4",
  "extranjera": "Extranjeroextranjera.mp4",
  "catolico": "Catolicocatolica.mp4",
  "catolica": "Catolicocatolica.mp4",
  "jesucristo": "Jesucristo.mp4",
  "jesus": "Jesus.mp4",
  "iglesia": "Iglesia.mp4",

  // Trabajo / economía
  "administrar": "Administrar.mp4",
  "negociar": "Negociar.mp4",
  "estafa": "Estafa.mp4",
  "estafar": "Estafar.mp4",
  "ahorro": "Ahorro.mp4",
  "ahorrar": "Ahorrar.mp4",
  "deber": "Deber.mp4",
  "barato": "Barato.mp4",
  "caro": "Caro.mp4",
  "jefe": "Jefejefa.mp4",
  "jefa": "Jefejefa.mp4",
  "empleado": "Empleadoempleada.mp4",
  "empleada": "Empleadoempleada.mp4",
  "jubilado": "Jubiladojubilada.mp4",
  "jubilada": "Jubiladojubilada.mp4",
  "sueldo": "Sueldo.mp4",
  "echar": "Echar.mp4",
  "despedir": "Despedir.mp4",
  "renunciar": "Renunciar.mp4",
  "feriado": "Feriado.mp4",
  "fiesta": "Fiesta.mp4",
  "bombero": "Bomberobombera.mp4",
  "bombera": "Bomberobombera.mp4",
  "nacional": "Nacional.mp4",
  "nacionalmente": "Nacionalmente.mp4",
  "internacional": "Internacional.mp4",
  "internacionalmente": "Internacionalmente.mp4",
  "poder": "Poder.mp4",
  "compu": "Compu.mp4",
  "computadora": "Computadora.mp4",
  "economia": "Economia.mp4",

  // Acciones y emociones
  "jugar": "Jugar.mp4",
  "dibujar": "Dibujar.mp4",
  "ruido": "Ruido.mp4",
  "persona": "Persona.mp4",
  "personas": "Personas.mp4",
  "gente": "Gente.mp4",
  "personalidad": "Personalidad.mp4",

  // Verbos conjugados (todos apuntan al infinitivo principal)
  "amar": "Amar.mp4", "amo": "Amar.mp4", "amas": "Amar.mp4", "amamos": "Amar.mp4", "aman": "Amar.mp4",
  "querer": "Querer.mp4", "quiero": "Querer.mp4", "quieres": "Querer.mp4", "quiere": "Querer.mp4", "queremos": "Querer.mp4", "quieren": "Querer.mp4",
  "sentir": "Sentir.mp4", "siento": "Sentir.mp4", "sientes": "Sentir.mp4", "siente": "Sentir.mp4", "sentimos": "Sentir.mp4", "sienten": "Sentir.mp4",
  "odiar": "Odiar.mp4", "odio": "Odiar.mp4", "odias": "Odiar.mp4", "odia": "Odiar.mp4", "odiamos": "Odiar.mp4", "odian": "Odiar.mp4",
  "ahorrar": "Ahorrar.mp4", "ahorro": "Ahorrar.mp4", "ahorras": "Ahorrar.mp4", "ahorra": "Ahorrar.mp4", "ahorramos": "Ahorrar.mp4", "ahorran": "Ahorrar.mp4",
  "cantar": "Cantar.mp4", "canto": "Cantar.mp4", "cantas": "Cantar.mp4", "canta": "Cantar.mp4", "cantamos": "Cantar.mp4", "cantan": "Cantar.mp4",
  "bailar": "Bailar.mp4", "bailo": "Bailar.mp4", "bailas": "Bailar.mp4", "baila": "Bailar.mp4", "bailamos": "Bailar.mp4", "bailan": "Bailar.mp4",

  // Emociones
  "sentimiento": "Sentimiento.mp4",
  "emocion": "Emoción.mp4",
  "emocionado": "Emocionado.mp4",
  "emocionarse": "Emocionarse.mp4",
  "confiar": "Confiar.mp4",
  "confianza": "Confianza.mp4",
  "desconfiar": "Desconfiar.mp4",
  "desconfianza": "Desconfianza.mp4",
  "deseo": "Deseo.mp4",
  "desear": "Desear.mp4",
  "admirar": "Admirar.mp4",
  "admiracion": "Admiración.mp4",
  "ofender": "Ofender.mp4",
  "ofensa": "Ofensa.mp4",
  "ofendido": "Ofendido.mp4",
  "odio": "Odiar.mp4"
};

// ✅ Generar automáticamente el abecedario
for (let i = 97; i <= 122; i++) {
  const letra = String.fromCharCode(i);
  videos[letra] = `Letra${letra}.mp4`;
}

// 🎬 Reproducir el video correspondiente
function reproducirVideo(palabra) {
  palabra = palabra.toLowerCase().replace(/\s+/g, '');
  texto.textContent = palabra;

  let archivo = videos[palabra];
  if (!archivo) {
    // Si no hay palabra, reproducir letra por letra
    const letras = palabra.split('');
    reproducirLetras(letras);
    return;
  }

  const nombreArchivo = archivo.charAt(0).toUpperCase() + archivo.slice(1);
  const ruta = `${videoPath}${nombreArchivo}`;

  videoSource.src = ruta;
  video.load();
  video.play().catch(e => console.error("❌ Error al reproducir:", e));
}

// 🅰️ Si no hay palabra, mostrar cada letra
async function reproducirLetras(letras) {
  for (const letra of letras) {
    const archivo = `Letra${letra}.mp4`;
    const ruta = `${videoPath}${archivo}`;
    videoSource.src = ruta;
    video.load();
    await video.play().catch(() => {});
    await new Promise(resolve => video.onended = resolve);
  }
}

// 🎤 Entrada de texto manual
inputTexto.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const palabra = inputTexto.value.trim();
    if (palabra) reproducirVideo(palabra);
  }
});

// 🎧 Control de velocidad
speedControl.addEventListener("input", function () {
  const velocidad = parseFloat(this.value);
  video.playbackRate = velocidad;
  speedValue.textContent = `${velocidad.toFixed(2)}x`;
});

// ♿ Contraste alto
document.getElementById("contrastToggle").addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});
