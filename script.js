// ==========================================================
// ============== Traductor Voz/Text → Señas ==============
// ==========================================================

// 🔤 Normalización que elimina tildes pero preserva la ñ
function normalizar(texto) {
  if (!texto) return '';
  let t = String(texto).trim().toLowerCase();
  t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // elimina tildes
  t = t.replace(/[¿?¡!,.]/g, ''); // elimina signos
  t = t.replace(/\s+/g, ' '); // colapsa espacios
  return t;
}

// 🎯 Captura de elementos del DOM
const boton = document.getElementById('start');
const texto = document.getElementById('texto');
const videoSeña = document.getElementById('videoSeña');
const videoSource = document.getElementById('videoSource');
const entradaTexto = document.getElementById('entradaTexto');
const startText = document.getElementById('startText'); // Texto del botón

// 🎬 Ocultar el video al cargar la página
videoSeña.style.display = "none";

// 🗣️ Configuración del reconocimiento de voz
const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconocimiento.lang = 'es-ES'; // Idioma español

// ▶️ Evento al hacer clic en el botón de inicio
boton.addEventListener('click', () => {
  activarMicrofono(); // Enciende indicador visual
  if (startText) startText.textContent = "Escuchando..."; // Cambia texto del botón
  reconocimiento.start(); // Inicia el reconocimiento de voz
});

// 🎧 Evento cuando se detecta voz
reconocimiento.onresult = (event) => {
  const speechText = normalizar(event.results[0][0].transcript); // Normaliza el texto
  mostrarTextoReconocido(speechText); // Muestra el texto en pantalla
  procesarTextoSecuencial(speechText); // Procesa el texto para mostrar señas
};

// 🛑 Evento cuando finaliza el reconocimiento
reconocimiento.onend = () => {
  desactivarMicrofono(); // Apaga indicador visual
  if (startText) startText.textContent = "Hablar"; // Restaura texto del botón
};

// ⌨️ Evento al presionar Enter en el input de texto
entradaTexto.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    // ✅ Usamos la función "normalizar" que preserva la ñ y quita tildes
    let userInput = normalizar(entradaTexto.value);
    mostrarTextoReconocido(userInput);
    procesarTextoSecuencial(userInput);
  }
});


// ==========================================================
// ===============  Conjugaciones por verbo  =================
// (mantenemos el mismo formato que ya usabas)
// ==========================================================
const conjugaciones = {
    dialogar: [
        "dialogar", "dialogo", "dialogás", "dialogas", "dialoga", "dialogamos", "dialogan",
        "dialogué", "dialogaste", "dialogó", "dialogamos", "dialogaron",
        "dialogaba", "dialogabas", "dialogábamos", "dialogaban",
        "dialogaré", "dialogarás", "dialogará", "dialogaremos", "dialogarán",
        "dialogaría", "dialogarías", "dialogaríamos", "dialogarían",
        "dialogando", "dialogado", "he dialogado", "hemos dialogado", "han dialogado"
    ],
    hablar: [
        "hablar", "hablo", "hablás", "hablas", "habla", "hablamos", "hablan",
        "hablé", "hablaste", "habló", "hablamos", "hablaron",
        "hablaba", "hablabas", "hablábamos", "hablaban",
        "hablaré", "hablarás", "hablará", "hablaremos", "hablarán",
        "hablaría", "hablarías", "hablaríamos", "hablarían",
        "hablando", "hablado", "he hablado", "hemos hablado", "han hablado"
    ],
    decir: [
        "decir", "digo", "decís", "dices", "dice", "decimos", "dicen",
        "dije", "dijiste", "dijo", "dijimos", "dijeron",
        "decía", "decías", "decíamos", "decían",
        "diré", "dirás", "dirá", "diremos", "dirán",
        "diría", "dirías", "diríamos", "dirían",
        "diciendo", "dicho", "he dicho", "hemos dicho", "han dicho"
    ],
    contar: [
        "contar", "cuento", "contás", "contas", "cuenta", "contamos", "cuentan",
        "conté", "contaste", "contó", "contamos", "contaron",
        "contaba", "contabas", "contábamos", "contaban",
        "contaré", "contarás", "contará", "contaremos", "contarán",
        "contaría", "contarías", "contaríamos", "contarían",
        "contando", "contado", "he contado", "hemos contado", "han contado"
    ],
    narrar: [
        "narrar", "narro", "narrás", "narras", "narra", "narramos", "narran",
        "narré", "narraste", "narró", "narramos", "narraron",
        "narraba", "narrabas", "narrábamos", "narraban",
        "narraré", "narrarás", "narrará", "narraremos", "narrarán",
        "narrando", "narrado", "he narrado", "hemos narrado", "han narrado"
    ],
    explicar: [
        "explicar", "explico", "explicás", "explicas", "explica", "explicamos", "explican",
        "expliqué", "explicaste", "explicó", "explicamos", "explicaron",
        "explicaba", "explicabas", "explicábamos", "explicaban",
        "explicaré", "explicarás", "explicará", "explicaremos", "explicarán",
        "explicando", "explicado", "he explicado", "hemos explicado", "han explicado"
    ],
    estar: [
        "estar", "estoy", "estás", "está", "estamos", "están",
        "estuve", "estuviste", "estuvo", "estuvimos", "estuvieron",
        "estaba", "estabas", "estábamos", "estaban",
        "estaré", "estarás", "estará", "estaremos", "estarán",
        "estando", "estado", "he estado", "hemos estado", "han estado"
    ],


    apurar: [
        "apurar", "apuro", "apurás", "apuras", "apura", "apuramos", "apuran",
        "apuré", "apuraste", "apuró", "apuramos", "apuraron",
        "apuraba", "apurabas", "apurábamos", "apuraban",
        "apuraré", "apurarás", "apurará", "apuraremos", "apurarán",
        "apuraría", "apurarías", "apuraríamos", "apurarían",
        "apurando", "apurado", "he apurado", "hemos apurado", "han apurado"
    ],
    llegar: [
        "llegar", "llego", "llegás", "llegas", "llega", "llegamos", "llegan",
        "llegué", "llegaste", "llegó", "llegamos", "llegaron",
        "llegaba", "llegabas", "llegábamos", "llegaban",
        "llegaré", "llegarás", "llegará", "llegaremos", "llegarán",
        "llegaría", "llegarías", "llegaríamos", "llegarían",
        "llegando", "llegado", "he llegado", "hemos llegado", "han llegado"
    ]
};

// ==========================================================
// ==================  Palabras fijas  =======================
// (incluye nuevas de la carpeta; se agregan variantes sin tilde)
// ==========================================================
const palabrasFijas = {
    // Ya existentes
    "lengua oral": "Lengua oral",
    si: "Si", "sí": "Si",
    no: "No",
    negar: "Negar",
    también: "Tambien", "tambien": "Tambien",
    tampoco: "Tampoco",
    yo: "Yo",
    vos: "Vos",
    ustedes: "Ustedes",
    "el": "El o Ella",
    "ella": "El o Ella",
    "nosotros": "Nosotros o Nosotras",
    "nosotras": "Nosotros o Nosotras",

    // ===== Nuevas palabras/expresiones (según tu carpeta) =====
    // Tiempo / frecuencia
    "ayer": "Ayer",
    "hoy": "Hoy",
    "mañana": "Mañana",
    "año": "Año",
    "año pasado": "Año pasado",
    "Futuro": "futuro",
    "pasado": "Pasado",
    "ultimo": "Ultimo",
    "Minuto": "minuto",
    "hora": "Hora",
    "mes": "Mes",
    "semana": "Semana",
    "domingo": "Domingo",
    "lunes": "Lunes",
    "martes": "Martes",
    "miercoles": "Miercoles",
    "jueves": "Jueves",
    "viernes": "Viernes",
    "sabado": "Sabado",
    "mediodía": "Mediodia",
    "todavía": "Todavia",
    "siempre": "Siempre",
    "rapido": "Rapido",
    "despacio": "Despacio",
    "temprano": "Temprano",
    "tarde": "Tarde",
    "hasta": "Hasta",
    "internacional": "Internacional",
    "administracion": "administracion",

    // Lugar / direcciones / cualidades
    "cerca": "Cerca",
    "derecha": "Derecha",
    "izquierda": "Izquierda",
    "importante": "Importante",
    "limpio": "Limpio",

    // Días y frases sociales
    "hola": "hola",
    "no": "No",
    "si": "Si", "sí": "Si",

    // ¡Ojo! Las frases multi-palabra se manejan abajo con includes(),
    // pero igual ponemos aquí las formas de UNA palabra para que
    // funcionen si vienen sueltas.
};

// ==========================================================
// =========  Procesamiento secuencial (con frases) =========
// ==========================================================
function procesarTextoSecuencial(text) {
    const palabras = text.split(" ");
    const videosAReproducir = [];

    // Analiza de izquierda a derecha respetando el orden del texto
    for (let i = 0; i < palabras.length; i++) {
        let palabra = palabras[i].trim();

        // 👉 Detección de frases compuestas directamente en el flujo
        const dosPalabras = (palabras[i] + " " + (palabras[i + 1] || "")).trim();
        const tresPalabras = (palabras[i] + " " + (palabras[i + 1] || "") + " " + (palabras[i + 2] || "")).trim();

        // === Frases ===
        if (tresPalabras === "vos cómo te llamas" || tresPalabras === "cómo te llamas") {
            videosAReproducir.push("Palabras/comotellamas.mp4");
            i += 2; // saltar las siguientes palabras
            continue;
        }
        if (dosPalabras === "como estas" || dosPalabras === "cómo estás") {
            videosAReproducir.push("Palabras/comoestas.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "me llamo luana") {
            videosAReproducir.push("Palabras/llamoluana.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "como quieres" || dosPalabras === "cómo quieres") {
            videosAReproducir.push("Palabras/comoquieras.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "lo siento") {
            videosAReproducir.push("Palabras/losiento.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "hace poco") {
            videosAReproducir.push("Palabras/hacepoco.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "a veces") {
            videosAReproducir.push("Palabras/aveces.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "toda la" && (palabras[i + 2] || "") === "noche") {
            videosAReproducir.push("Palabras/todalanoche.mp4");
            i += 2;
            continue;
        }
        if (tresPalabras === "todos los dias" || tresPalabras === "todos los días") {
            videosAReproducir.push("Palabras/todoslosdias.mp4");
            i += 2;
            continue;
        }
        if (dosPalabras === "primera vez") {
            videosAReproducir.push("Palabras/primeravez.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "año pasado" || dosPalabras === "ano pasado") {
            videosAReproducir.push("Palabras/añopasado.mp4");
            i += 1;
            continue;
        }

        // === Palabras individuales ===
        // Letras
        const letras = ["a","b","c","d","e","f","g","h","i","j","k","l","ll","m","n","ñ","o","p","q","r","s","t","u","v","w","x","y","z","ch"];
        if (letras.includes(palabra)) {
            videosAReproducir.push(`Palabras/letra${palabra.toUpperCase()}.mp4`);
            continue;
        }

        // Verbos
        for (let verbo in conjugaciones) {
            if (conjugaciones[verbo].includes(palabra)) {
                const nombreArchivo = (verbo === "contar" || verbo === "narrar")
                    ? "Contar o Narrar"
                    : verbo.charAt(0).toUpperCase() + verbo.slice(1);
                videosAReproducir.push(`Palabras/${nombreArchivo}.mp4`);
                break;
            }
        }

        // Palabras fijas
        for (let fija in palabrasFijas) {
            if (palabra === fija) {
                videosAReproducir.push(`Palabras/${palabrasFijas[fija]}.mp4`);
                break;
            }
        }

        // Palabras sueltas exactas
        const archivosUnaPalabra = [
            "ayer","hoy","mañana","manana","futuro","pasado","ultimo","último",
            "minuto","hora","mes","semana","domingo","lunes","martes",
            "miercoles","miércoles","jueves","viernes","sabado","sábado",
            "mediodia","mediodía","todavia","todavía","siempre","rapido","rápido",
            "despacio","temprano","tarde","cerca","derecha","izquierda",
            "importante","limpio"
        ];
        if (archivosUnaPalabra.includes(palabra)) {
            const normalizaciones = {
                "manana":"mañana","miércoles":"miercoles","sabado":"sabado","sábado":"sabado",
                "mediodía":"mediodia","todavía":"todavia","rápido":"rapido","último":"ultimo"
            };
            const nombre = normalizaciones[palabra] || palabra;
            videosAReproducir.push(`Palabras/${nombre}.mp4`);
        }
    }

    reproducirSecuencialmente(videosAReproducir);
}

// ==========================================================
// ==============  Reproducción secuencial  =================
// ==========================================================

// ====== Velocidad global (fix) ======
let currentSpeed = (() => {
  const sc = document.getElementById("speedControl");
  const val = sc ? parseFloat(sc.value) : NaN;
  return Number.isFinite(val) ? val : 0.75;
})();

function reproducirSecuencialmente(lista) {
    if (lista.length === 0) {
        videoSeña.style.display = "none";
        return;
    }

    const path = lista.shift();
    videoSource.src = path;
    videoSeña.load();
    videoSeña.muted = true; // 🔇 Mutea el video automáticamente
    videoSeña.style.display = "block";

    // ✅ Usar la velocidad actual elegida por el usuario (no pisar con 0.75)
    videoSeña.playbackRate = currentSpeed;

    videoSeña.onended = () => {
        setTimeout(() => {
            reproducirSecuencialmente(lista);
        }, 100); // delay de 100ms
    };
    videoSeña.play();
}

// ==========================================================
// =====================  Extras UI  ========================
// ==========================================================

// 🎚 Control de velocidad
const speedControl = document.getElementById("speedControl");
const speedValue = document.getElementById("speedValue");

// Sincronizar la etiqueta al cargar
if (speedValue && speedControl) {
  speedValue.textContent = parseFloat(speedControl.value) + "x";
}

speedControl.addEventListener("input", () => {
  currentSpeed = parseFloat(speedControl.value);   // actualizar velocidad global
  videoSeña.playbackRate = currentSpeed;           // aplicar de inmediato si está reproduciendo
  speedValue.textContent = currentSpeed + "x";
});

// 🎤 Indicador de micrófono
function activarMicrofono() {
  boton.classList.add("mic-active");
}
function desactivarMicrofono() {
  boton.classList.remove("mic-active");
}

// ✨ Glow en el texto cuando hay input
function mostrarTextoReconocido(textoReconocido) {
  texto.textContent = textoReconocido;
  texto.classList.add("glow");
  setTimeout(() => texto.classList.remove("glow"), 1000);
}

// ♿ Toggle de alto contraste
const contrastToggle = document.getElementById("contrastToggle");
contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});
























