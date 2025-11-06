// ==========================================================
// ============== Traductor Voz/Text → Señas ==============
// ==========================================================

// 🔤 Normalización
function normalizar(texto) {
  if (!texto) return '';
  let t = String(texto).trim();

  // proteger ñ
  t = t.replace(/ñ/g, '__ENHE__').replace(/Ñ/g, '__ENHE__');

  t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  t = t.replace(/__ENHE__/g, 'ñ');

  t = t.toLowerCase();
  t = t.replace(/[¿?¡!,.]/g, '');
  t = t.replace(/\s+/g, ' ');
  return t;
}

// 🎯 
const boton = document.getElementById('start');
const texto = document.getElementById('texto');
const videoSeña = document.getElementById('videoSeña');
const videoSource = document.getElementById('videoSource');
const entradaTexto = document.getElementById('entradaTexto');
const startText = document.getElementById('startText'); 
const reproducirBtn = document.getElementById('reproducirBtn'); 

// 🎛️ 
const sizeControl = document.getElementById('sizeControl');
const sizeValue = document.getElementById('sizeValue');

sizeControl.addEventListener('input', () => {
  const newSize = sizeControl.value;
  sizeValue.textContent = `${newSize}px`;
  videoSeña.style.display = "block"; 
  videoSeña.style.maxWidth = `${newSize}px`;
  videoSeña.style.maxHeight = `${Math.round(newSize * 0.75)}px`;
});

// 🎬 
videoSeña.style.display = "none";

// 🗣️ 
const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconocimiento.lang = 'es-ES'; 

// ▶️ 
boton.addEventListener('click', () => {
  activarMicrofono(); 
  if (startText) startText.textContent = "Escuchando..."; 
  reconocimiento.start(); 
});

// 🎧 
reconocimiento.onresult = (event) => {
  const speechText = normalizar(event.results[0][0].transcript); 
  mostrarTextoReconocido(speechText); 
  procesarTextoSecuencial(speechText);
};

// 🛑 
reconocimiento.onend = () => {
  desactivarMicrofono(); 
  if (startText) startText.textContent = "Hablar"; 
};

// ⌨️ Enter
entradaTexto.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    let userInput = normalizar(entradaTexto.value);
    mostrarTextoReconocido(userInput);
    procesarTextoSecuencial(userInput);
  }
});

// ▶️ "Reproducir"
reproducirBtn.addEventListener('click', () => {
  let userInput = normalizar(entradaTexto.value);
  mostrarTextoReconocido(userInput);
  procesarTextoSecuencial(userInput);
});

// ==========================================================
// ===============  Conjugaciones por verbo  =================
// ==========================================================
const conjugaciones = {
dialogar: [
  "dialogar", "dialogo", "dialogas", "dialoga", "dialogamos", "dialogan",
  "dialogue", "dialogaste", "dialogo", "dialogamos", "dialogaron",
  "dialogaba", "dialogabas", "dialogabamos", "dialogaban",
  "dialogare", "dialogaras", "dialogara", "dialogaremos", "dialogaran",
  "dialogaria", "dialogarias", "dialogariamos", "dialogarian",
  "dialogando", "dialogado", "he dialogado", "hemos dialogado", "han dialogado"
],
hablar: [
  "hablar", "hablo", "hablas", "habla", "hablamos", "hablan",
  "hable", "hablaste", "hablo", "hablamos", "hablaron",
  "hablaba", "hablabas", "hablabamos", "hablaban",
  "hablare", "hablaras", "hablara", "hablaremos", "hablaran",
  "hablaria", "hablarias", "hablariamos", "hablarian",
  "hablando", "hablado", "he hablado", "hemos hablado", "han hablado"
],
decir: [
  "decir", "digo", "decis", "dices", "dice", "decimos", "dicen",
  "dije", "dijiste", "dijo", "dijimos", "dijeron",
  "decia", "decias", "deciamos", "decian",
  "dire", "diras", "dira", "diremos", "diran",
  "diria", "dirias", "diriamos", "dirian",
  "diciendo", "dicho", "he dicho", "hemos dicho", "han dicho"
],
contar: [
  "contar", "cuento", "contas", "conta", "contamos", "cuentan",
  "conte", "contaste", "conto", "contamos", "contaron",
  "contaba", "contabas", "contabamos", "contaban",
  "contare", "contaras", "contara", "contaremos", "contaran",
  "contaria", "contarias", "contariamos", "contarian",
  "contando", "contado", "he contado", "hemos contado", "han contado"
],
narrar: [
  "narrar", "narro", "narras", "narra", "narramos", "narran",
  "narre", "narraste", "narro", "narramos", "narraron",
  "narraba", "narrabas", "narrabamos", "narraban",
  "narrare", "narraras", "narrara", "narraremos", "narraran",
  "narraria", "narrarias", "narrariamos", "narrarian",
  "narrando", "narrado", "he narrado", "hemos narrado", "han narrado"
],
explicar: [
  "explicar", "explico", "explicas", "explica", "explicamos", "explican",
  "explique", "explicaste", "explico", "explicamos", "explicaron",
  "explicaba", "explicabas", "explicabamos", "explicaban",
  "explicare", "explicaras", "explicara", "explicaremos", "explicaran",
  "explicaria", "explicarias", "explicariamos", "explicarian",
  "explicando", "explicado", "he explicado", "hemos explicado", "han explicado"
],
estar: [
  "estar", "estoy", "estas", "esta", "estamos", "estan",
  "estuve", "estuviste", "estuvo", "estuvimos", "estuvieron",
  "estaba", "estabas", "estabamos", "estaban",
  "estare", "estaras", "estara", "estaremos", "estaran",
  "estando", "estado", "he estado", "hemos estado", "han estado"
],
apurar: [
  "apurar", "apuro", "apuras", "apura", "apuramos", "apuran",
  "apure", "apuraste", "apuro", "apuramos", "apuraron",
  "apuraba", "apurabas", "apurabamos", "apuraban",
  "apurare", "apuraras", "apurara", "apuraremos", "apuraran",
  "apuraria", "apurarias", "apurariamos", "apurarían",
  "apurando", "apurado", "he apurado", "hemos apurado", "han apurado"
],
llegar: [
  "llegar", "llego", "llegas", "llega", "llegamos", "llegan",
  "llegue", "llegaste", "llego", "llegamos", "llegaron",
  "llegaba", "llegabas", "llegabamos", "llegaban",
  "llegare", "llegaras", "llegara", "llegaremos", "llegaran",
  "llegaria", "llegarias", "llegariamos", "llegarian",
  "llegando", "llegado", "he llegado", "hemos llegado", "han llegado"
],
ahorrar: [
  "ahorrar", "ahorro", "ahorras", "ahorra", "ahorramos", "ahorran",
  "ahorre", "ahorraste", "ahorro", "ahorramos", "ahorraron",
  "ahorraba", "ahorrabas", "ahorrabamos", "ahorraban",
  "ahorrare", "ahorraras", "ahorrara", "ahorraremos", "ahorraran",
  "ahorraria", "ahorrarias", "ahorrariamos", "ahorrarian",
  "ahorrando", "ahorrado", "he ahorrado", "hemos ahorrado", "han ahorrado"
],
amar: [
  "amar", "amo", "amas", "ama", "amamos", "aman",
  "ame", "amaste", "amo", "amamos", "amaron",
  "amaba", "amabas", "amabamos", "amaban",
  "amare", "amaras", "amara", "amaremos", "amaran",
  "amaria", "amarias", "amariamos", "amarian",
  "amando", "amado", "he amado", "hemos amado", "han amado"
],
bailar: [
  "bailar", "bailo", "bailas", "baila", "bailamos", "bailan",
  "baile", "bailaste", "bailo", "bailamos", "bailaron",
  "bailaba", "bailabas", "bailabamos", "bailaban",
  "bailare", "bailaras", "bailara", "bailaremos", "bailaran",
  "bailaria", "bailarias", "bailariamos", "bailarian",
  "bailando", "bailado", "he bailado", "hemos bailado", "han bailado"
  ],
cantar: [
  "cantar", "canto", "cantas", "canta", "cantamos", "cantan",
  "cante", "cantaste", "canto", "cantaron",
  "cantaba", "cantabas", "cantaban",
  "cantare", "cantaras", "cantara", "cantaremos", "cantaran",
  "cantaria", "cantarias", "cantariamos", "cantarian",
  "cantando", "cantado", "he cantado", "hemos cantado", "han cantado"
],
comprar: [
  "comprar", "compro", "compras", "compra", "compramos", "compran",
  "compre", "compraste", "compro", "compraron",
  "compraba", "comprabas", "compraban",
  "comprare", "compraras", "comprara", "compraremos", "compraran",
  "compraria", "comprarias", "comprariamos", "comprarian",
  "comprando", "comprado", "he comprado", "hemos comprado", "han comprado"
],
confiar: [
  "confiar", "confio", "confias", "confia", "confiamos", "confian",
  "confie", "confiaste", "confio", "confiaron",
  "confiaba", "confiabas", "confiaban",
  "confiare", "confiaras", "confiara", "confiaremos", "confiaran",
  "confiaria", "confiarias", "confiariamos", "confiarian",
  "confiando", "confiado", "he confiado", "hemos confiado", "han confiado"
],
deber: [
  "deber", "debo", "debes", "debe", "debemos", "deben",
  "debi", "debiste", "debio", "debimos", "debieron",
  "debia", "debias", "debian",
  "debere", "deberas", "debera", "deberemos", "deberan",
  "deberia", "deberias", "deberiamos", "deberian",
  "debiendo", "debido", "he debido", "hemos debido", "han debido"
],
desconfiar: [
  "desconfiar", "desconfio", "desconfias", "desconfia", "desconfiamos", "desconfian",
  "desconfie", "desconfiaste", "desconfio", "desconfiaron",
  "desconfiaba", "desconfiabas", "desconfiaban",
  "desconfiare", "desconfiaras", "desconfiara", "desconfiaremos", "desconfiaran",
  "desconfiaria", "desconfiarias", "desconfiariamos", "desconfiarian",
  "desconfiando", "desconfiado", "he desconfiado", "hemos desconfiado", "han desconfiado"
],
desear: [
  "desear", "deseo", "deseas", "desea", "deseamos", "desean",
  "desee", "deseaste", "deseo", "desearon",
  "deseaba", "deseabas", "deseaban",
  "deseara", "deseare", "desearas", "desearemos", "desearan",
  "desearia", "desearias", "deseariamos", "desearian",
  "deseando", "deseado", "he deseado", "hemos deseado", "han deseado"
],
dibujar: [
  "dibujar", "dibujo", "dibujas", "dibuja", "dibujamos", "dibujan",
  "dibuje", "dibujaste", "dibujaron",
  "dibujaba", "dibujabas", "dibujaban",
  "dibujare", "dibujaras", "dibujara", "dibujaremos", "dibujaran",
  "dibujaria", "dibujarias", "dibujariamos", "dibujarian",
  "dibujando", "dibujado", "he dibujado", "hemos dibujado", "han dibujado"
],
echar: [
  "echar", "echo", "echas", "echa", "echamos", "echan",
  "eche", "echaste", "echaron",
  "echaba", "echabas", "echaban",
  "echare", "echaras", "echara", "echaremos", "echaran",
  "echando", "echado", "he echado", "hemos echado", "han echado"
],
estafar: [
  "estafar", "estafo", "estafas", "estafa", "estafamos", "estafan",
  "estafe", "estafaste", "estafaron",
  "estafaba", "estafabas", "estafaban",
  "estafare", "estafaras", "estafara", "estafaremos", "estafaran",
  "estafaria", "estafarias", "estafariamos", "estafarian",
  "estafando", "estafado", "he estafado", "hemos estafado", "han estafado"
],
ganar: [
  "ganar", "gano", "ganas", "gana", "ganamos", "ganan",
  "gane", "ganaste", "ganaron",
  "ganaba", "ganabas", "ganaban",
  "ganare", "ganaras", "ganara", "ganaremos", "ganaran",
  "ganaria", "ganarias", "ganariamos", "ganarian",
  "ganando", "ganado", "he ganado", "hemos ganado", "han ganado"
],
hablar: [
  "hablar", "hablo", "hablas", "habla", "hablamos", "hablan",
  "hable", "hablaste", "hablaron",
  "hablaba", "hablabas", "hablaban",
  "hablare", "hablaras", "hablara", "hablaremos", "hablaran",
  "hablaria", "hablarias", "hablariamos", "hablarian",
  "hablando", "hablado", "he hablado", "hemos hablado", "han hablado"
],
jugar: [
  "jugar", "juego", "jugas", "juega", "jugamos", "juegan",
  "jugue", "jugaste", "jugaron",
  "jugaba", "jugabas", "jugaban",
  "jugare", "jugaras", "jugara", "jugaremos", "jugaran",
  "jugaria", "jugarias", "jugariamos", "jugarian",
  "jugando", "jugado", "he jugado", "hemos jugado", "han jugado"
],
llegar: [
  "llegar", "llego", "llegas", "llega", "llegamos", "llegan",
  "llegue", "llegaste", "llegaron",
  "llegaba", "llegabas", "llegaban",
  "llegare", "llegaras", "llegara", "llegaremos", "llegaran",
  "llegaria", "llegarias", "llegariamos", "llegarian",
  "llegando", "llegado", "he llegado", "hemos llegado", "han llegado"
],
negar: [
  "negar", "niego", "negas", "niega", "negamos", "niegan",
  "negue", "negaste", "negaron",
  "negaba", "negabas", "negaban",
  "negare", "negaras", "negara", "negaremos", "negaran",
  "negaria", "negarias", "negariamos", "negarian",
  "negando", "negado", "he negado", "hemos negado", "han negado"
],
negociar: [
  "negociar", "negocio", "negocias", "negocia", "negociamos", "negocian",
  "negocie", "negociaste", "negociaron",
  "negociaba", "negociabas", "negociaban",
  "negociare", "negociaras", "negociara", "negociaremos", "negociaran",
  "negociaria", "negociarias", "negociariamos", "negociarian",
  "negociando", "negociado", "he negociado", "hemos negociado", "han negociado"
],
odiar: [
  "odiar", "odio", "odias", "odia", "odiamos", "odian",
  "odie", "odiaste", "odiaron",
  "odiaba", "odiabas", "odiaban",
  "odiare", "odiaras", "odiara", "odiaremos", "odiaran",
  "odiaria", "odiarias", "odiariamos", "odiarian",
  "odiando", "odiado", "he odiado", "hemos odiado", "han odiado"
],
ofender: [
  "ofender", "ofendo", "ofendes", "ofende", "ofendemos", "ofenden",
  "ofendi", "ofendiste", "ofendio", "ofendimos", "ofendieron",
  "ofendia", "ofendias", "ofendian",
  "ofendere", "ofenderas", "ofendera", "ofenderemos", "ofenderan",
  "ofenderia", "ofenderias", "ofenderiamos", "ofenderian",
  "ofendiendo", "ofendido", "he ofendido", "hemos ofendido", "han ofendido"
],
pagar: [
  "pagar", "pago", "pagas", "paga", "pagamos", "pagan",
  "pague", "pagaste", "pagaron",
  "pagaba", "pagabas", "pagaban",
  "pagare", "pagaras", "pagara", "pagaremos", "pagaran",
  "pagaria", "pagarias", "pagariamos", "pagarian",
  "pagando", "pagado", "he pagado", "hemos pagado", "han pagado"
],
practicar: [
  "practicar", "practico", "practicas", "practica", "practicamos", "practican",
  "practique", "practicaste", "practicaron",
  "practicaba", "practicabas", "practicaban",
  "practicare", "practicaras", "practicara", "practicaremos", "practicaran",
  "practicaria", "practicarias", "practicariamos", "practicarian",
  "practicando", "practicado", "he practicado", "hemos practicado", "han practicado"
],
querer: [
  "querer", "quiero", "quieres", "quiere", "queremos", "quieren",
  "quise", "quisiste", "quiso", "quisimos", "quisieron",
  "queria", "querias", "querian",
  "querre", "querras", "querra", "querremos", "querran",
  "querria", "querrias", "querriamos", "querrian",
  "queriendo", "querido", "he querido", "hemos querido", "han querido"
],
renunciar: [
  "renunciar", "renuncio", "renuncias", "renuncia", "renunciamos", "renuncian",
  "renuncie", "renunciaste", "renunciaron",
  "renunciaba", "renunciabas", "renunciaban",
  "renunciare", "renunciaras", "renunciara", "renunciaremos", "renunciaran",
  "renunciaria", "renunciarias", "renunciariamos", "renunciarian",
  "renunciando", "renunciado", "he renunciado", "hemos renunciado", "han renunciado"
],
trabajar: [
  "trabajar", "trabajo", "trabajas", "trabaja", "trabajamos", "trabajan",
  "trabaje", "trabajaste", "trabajaron",
  "trabajaba", "trabajabas", "trabajaban",
  "trabajare", "trabajaras", "trabajara", "trabajaremos", "trabajaran",
  "trabajaria", "trabajarias", "trabajariamos", "trabajarian",
  "trabajando", "trabajado", "he trabajado", "hemos trabajado", "han trabajado"
],
vender: [
  "vender", "vendo", "vendes", "vende", "vendemos", "venden",
  "vendi", "vendiste", "vendio", "vendimos", "vendieron",
  "vendia", "vendias", "vendian",
  "vendere", "venderas", "vendera", "venderemos", "venderan",
  "venderia", "venderias", "venderiamos", "venderian",
  "vendiendo", "vendido", "he vendido", "hemos vendido", "han vendido"
],
vestir: [
  "vestir", "visto", "vestis", "viste", "vestimos", "visten",
  "vesti", "vestiste", "vistio", "vistieron",
  "vestia", "vestias", "vestian",
  "vestire", "vestiras", "vestira", "vestiremos", "vestiran",
  "vestiria", "vestirias", "vestiriamos", "vestirian",
  "vistiendo", "vestido", "he vestido", "hemos vestido", "han vestido"
],
administrar: [
  "administrar", "administro", "administras", "administra", "administramos", "administran",
  "administre", "administraste", "administraron",
  "administraba", "administrabas", "administraban",
  "administrare", "administraras", "administrara", "administraremos", "administraran",
  "administraria", "administrarias", "administrariamos", "administrarian",
  "administrando", "administrado", "he administrado", "hemos administrado", "han administrado"
],
admirar: [
  "admirar", "admiro", "admiras", "admira", "admiramos", "admiran",
  "admire", "admiraste", "admiraron",
  "admiraba", "admirabas", "admiraban",
  "admirare", "admiraras", "admirara", "admiraremos", "admiraran",
  "admiraria", "admirarias", "admirariamos", "admirarian",
  "admirando", "admirado", "he admirado", "hemos admirado", "han admirado"
],
sentir: [
  "sentir", "siento", "sentis", "siente", "sentimos", "sienten",
  "senti", "sentiste", "sintio", "sintieron",
  "sentia", "sentias", "sentian",
  "sentire", "sentiras", "sentira", "sentiremos", "sentiran",
  "sentiria", "sentirias", "sentiriamos", "sentirian",
  "sintiendo", "sentido", "he sentido", "hemos sentido", "han sentido"
],
  venir: [
    "venir", "vengo", "vienes", "viene", "venimos", "vienen",
    "vine", "viniste", "vino", "vinimos", "vinieron",
    "venia", "venias", "veniamos", "venian",
    "vendre", "vendras", "vendra", "vendremos", "vendran",
    "vendria", "vendrias", "vendriamos", "vendrian",
    "viniendo", "venido", "he venido", "hemos venido", "han venido"
  ],
  ir: [
    "ir", "voy", "vas", "va", "vamos", "van",
    "fui", "fuiste", "fue", "fuimos", "fueron",
    "iba", "ibas", "ibamos", "iban",
    "ire", "iras", "ira", "iremos", "iran",
    "iria", "irias", "iriamos", "irian",
    "yendo", "ido", "he ido", "hemos ido", "han ido"
  ],
  echar: [
    "echar", "echo", "echas", "echa", "echamos", "echan",
    "eche", "echaste", "echaron",
    "echaba", "echabas", "echabamos", "echaban",
    "echare", "echaras", "echara", "echaremos", "echaran",
    "echaria", "echarias", "echariamos", "echarian",
    "echando", "echado", "he echado", "hemos echado", "han echado"
  ],
  despedir: [
    "despedir", "despido", "despedis", "despedis", "despide", "despedimos", "despiden",
    "despedi", "despediste", "despidio", "despedimos", "despidieron",
    "despedia", "despedias", "despediamos", "despedian",
    "despedire", "despediras", "despedira", "despediremos", "despediran",
    "despediria", "despedirias", "despediriamos", "despedirian",
    "despidiendo", "despedido", "he despedido", "hemos despedido", "han despedido"
  ]
};

// ==========================================================
// ==================  Palabras fijas  =======================
// ==========================================================
const palabrasFijas = {
    // Ya existentes
    "lengua oral": "Lengua oral",
    si: "Si", "sí": "Si",
    no: "No",
    negar: "Negar",
  negacion: "Negar",
    también: "Tambien", "tambien": "Tambien",
    tampoco: "Tampoco",
    yo: "Yo",
    vos: "Vos",
    ustedes: "Ustedes",
    "el": "El o Ella",
    "ella": "El o Ella",


    "ayer": "Ayer",
    "hoy": "Hoy",
    "mañana": "Mañana",
    "año": "Año",
    "año pasado": "Año pasado",
    "futuro": "Futuro",
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
    "mediodia": "Mediodia",
    "todavía": "Todavia",
    "siempre": "Siempre",
    "rapido": "Rapido",
    "despacio": "Despacio",
    "temprano": "Temprano",
    "tarde": "Tarde",
    "hasta": "Hasta",
    "internacional": "Internacional",
    "administracion": "administracion",


    "cerca": "Cerca",
    "derecha": "Derecha",
    "izquierda": "Izquierda",
    "importante": "Importante",
    "limpio": "Limpio",


    "hola": "hola",
    "no": "No",
    "si": "Si", "sí": "Si",

  "abuelo": "Abueloabuela",
  "abuela": "Abueloabuela",
  "admiracion": "Admirar",
  "ahorro": "Ahorro",
  "america": "America",
  "antartida": "Antartida",
  "argentina": "Argentina",
  "barato": "Barato",
  "bombero": "Bomberobombera",
  "bombera": "Bomberobombera",
  "buenos aires": "Buenosaires",
  "camiseta": "Camiseta",
  "caro": "Caro",
  "catamarca": "Catamarca",
  "catolico": "Catolicocatolica",
  "catolica": "Catolicocatolica",
  "chaco": "Chaco",
  "chubut": "Chubut",
  "computadora": "Computadora",
  "confianza": "Confiar",
  "corrientes": "Corrientes",
  "cordoba": "Cordoba",
  "desconfianza": "Desconfianza",
  "deseo": "Deseo",
  "despacio": "Despacio",
  "despues": "Despues",
  "deuda": "Deuda",
  "disculpame": "Disculpame",
  "documento": "Documento",
  "edad": "Edad",
  "economia": "Economia",
  "cumpleaños": "Cumpleaños",
  "el": "ElElla",
  "ella": "ElElla",
  "empleado": "Empleadoempleada",
  "empleada": "Empleadoempleada",
  "enamorado": "Enamorado",
  "enfermero": "Enfermeroenfermera",
  "enfermera": "Enfermeroenfermera",
  "enseguida": "Enseguida",
  "entre rios": "Entrerios",
  "esposo": "Esposoesposa",
  "esposa": "Esposoesposa",
  "europa": "Europa",
  "extranjero": "Extranjeroextranjera",
  "extranjera": "Extranjeroextranjera",
  "feriado": "Feriadofiesta",
  "fiesta": "Feriadofiesta",
  "formosa": "Formosa",
  "futbol": "Futbol",
  "ganancia": "Ganancia",
  "gratis": "Gratis",
  "hasta": "Hasta",
  "hermano": "Hermanohermana",
  "hermana": "Hermanohermana",
  "hijo": "Hijohija",
  "hija": "Hijohija",
  "jefe": "Jefejefa",
  "jefa": "Jefejefa",
  "jamas": "Jamas",
  "jujuy": "Jujuy",
  "la pampa": "Lapampa",
  "la rioja": "Larioja",
  "limpio": "Limpio",
  "madrastra": "Madrastramadrastras",
  "madrastras": "Madrastramadrastras",
  "malvinas": "Malvinas",
  "mama": "Mamamadre",
  "madre": "Mamamadre",
  "mendoza": "Mendoza",
  "misiones": "Misiones",
  "medico": "Medicodoctor",
  "doctor": "Medicodoctor",
  "musica": "Musica",
  "nacional": "Nacional",
  "negocio": "Negocio",
  "neuquen": "Neuquen",
  "nieto": "Nietonieta",
  "nieta": "Nietonieta",
  "novio": "Novionovia",
  "novia": "Novionovia",
  "odio": "Odio",
  "ofendido": "Ofendido",
  "ofensa": "Ofensa",
  "padrastro": "Padrastropadrastros",
  "padrastros": "Padrastropadrastros",
  "papa": "Papapadrepadres",
  "padre": "Papapadrepadres",
  "padres": "Papapadrepadres",
  "pareja": "Pareja",
  "patagonia": "Patagonia",
  "persona": "Persona",
  "personalidad": "Personalidad",
  "personas": "Personasgente",
  "gente": "Personasgente",
  "policia": "Policia",
  "politica": "Politica",
  "presidente": "Presidente",
  "primo": "Primoprima",
  "prima": "Primoprima",
  "profesional": "Profesionalprofesion",
  "profesion": "Profesionalprofesion",
  "provincia": "Provincia",
  "pulover": "Pulover",
  "remera": "Remera",
  "representante": "Representante",
  "rio negro": "Rionegro",
  "ropa": "Ropa",
  "ruido": "Ruido",
  "rapido": "Rapido",
  "salta": "Salta",
  "san juan": "San Juan",
  "san luis": "San Luis",
  "santa cruz": "Santa Cruz",
  "santa fe": "Santa Fe",
  "santiago del estero": "santiagodelestero",
  "semana": "Semana",
  "sentimiento": "Sentir",
  "separado": "Separadoseparada",
  "separada": "Separadoseparada",
  "señora": "Señora",
  "siempre": "Siempre",
  "sobrino": "Sobrinosobrina",
  "sobrina": "Sobrinosobrina",
  "sobrinos": "Sobrinossobrinas",
  "sobrinas": "Sobrinossobrinas",
  "soltero": "Solterosoltera",
  "soltera": "Solterosoltera",
  "sueldo": "Sueldo",
  "temprano": "Temprano",
  "tiempo": "Tiempo",
  "tierra del fuego": "Tierradelfuego",
  "tio": "Tiotia",
  "tia": "Tiotia",
  "todavia": "Todavia",
  "trabajo": "Trabajo",
  "tucuman": "Tucuman",
  "viudo": "Viudoviuda",
  "viuda": "Viudoviuda",
  "zapato": "Zapato",
  "zapatilla": "Zapatilla",
  "jesus": "Jesus",
  "jesucristo": "Jesus",

  "amargo": "Amargo",
  "importante": "Importante",
  "especial": "Especial",
  "interesante": "Interesante",
  "interes": "Interesante",
  "importancia": "Importancia",
  "malos": "Malosmia", 
  "malas": "Malosmia",
  "mal": "Malosmia",


  "buenas": "Buenobuena",
  "bueno": "Buenobuena",
  "buena": "Buenobuena",


  "ellos": "Ellosellas",
  "ellas": "Ellosellas",
  "nosotros": "Nosotrosnosotras",
  "nosotras": "Nosotrosnosotras",


  "1": "Uno", "uno": "Uno",
  "2": "Dos", "dos": "Dos",
  "3": "Tres", "tres": "Tres", 
  "4": "Cuatro", "cuatro": "Cuatro",
  "5": "Cinco", "cinco": "Cinco",
  "6": "Seis", "seis": "Seis",
  "7": "Siete", "siete": "Siete",
  "8": "Ocho", "ocho": "Ocho",
  "9": "Nueve", "nueve": "Nueve",
  "10": "Diez", "diez": "Diez"
  

};

// ==========================================================
// =========  Procesamiento secuencial =========
// ==========================================================
function procesarTextoSecuencial(text) {
    const palabras = text.split(" ");
    const videosAReproducir = [];


    for (let i = 0; i < palabras.length; i++) {
        let palabra = palabras[i].trim();

        // 👉 Frases
        const dosPalabras = (palabras[i] + " " + (palabras[i + 1] || "")).trim();
        const tresPalabras = (palabras[i] + " " + (palabras[i + 1] || "") + " " + (palabras[i + 2] || "")).trim();

        // === Frases ===
        if (tresPalabras === "como te llamas" || tresPalabras === "cómo te llamas") {
            videosAReproducir.push("Palabras/comotellamas.mp4");
            i += 2;
            continue;
        }
        if (dosPalabras === "como estas" || dosPalabras === "cómo estás") {
            videosAReproducir.push("Palabras/comoestas.mp4");
            i += 1;
            continue;
        }
        if (tresPalabras === "me llamo luana") {
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

        // === Provincias argentinas ===
        if (dosPalabras === "buenos aires") {
            videosAReproducir.push("Palabras/Buenosaires.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "entre rios") {
            videosAReproducir.push("Palabras/Entrerios.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "la pampa") {
            videosAReproducir.push("Palabras/Lapampa.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "la rioja") {
            videosAReproducir.push("Palabras/Larioja.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "rio negro") {
            videosAReproducir.push("Palabras/Rionegro.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "san juan") {
            videosAReproducir.push("Palabras/SanJuan.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "san luis") {
            videosAReproducir.push("Palabras/SanLuis.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "santa cruz") {
            videosAReproducir.push("Palabras/SantaCruz.mp4");
            i += 1;
            continue;
        }
        if (dosPalabras === "santa fe") {
            videosAReproducir.push("Palabras/SantaFe.mp4");
            i += 1;
            continue;
        }
        if (tresPalabras === "santiago del estero") {
            videosAReproducir.push("Palabras/SantiagoDelEstero.mp4");
            i += 2;
            continue;
        }
        if (tresPalabras === "tierra del fuego") {
            videosAReproducir.push("Palabras/Tierradelfuego.mp4");
            i += 2;
            continue;
        }

        // === Letras ===
        const letras = ["a","b","c","d","e","f","g","h","i","j","k","l","ll","m","n","ñ","o","p","q","r","s","t","u","v","w","x","y","z","ch"];
        if (letras.includes(palabra)) {
            videosAReproducir.push(`Palabras/letra${palabra.toUpperCase()}.mp4`);
            continue;
        }

        // === Verbos ===
        for (let verbo in conjugaciones) {
            if (conjugaciones[verbo].includes(palabra)) {
                const nombreArchivo = (verbo === "contar" || verbo === "narrar")
                    ? "Contar o Narrar"
                    : verbo.charAt(0).toUpperCase() + verbo.slice(1);
                videosAReproducir.push(`Palabras/${nombreArchivo}.mp4`);
                break;
            }
        }

        // === Palabras fijas ===
        for (let fija in palabrasFijas) {
            if (palabra === fija) {
                videosAReproducir.push(`Palabras/${palabrasFijas[fija]}.mp4`);
                break;
            }
        }
    }

    reproducirSecuencialmente(videosAReproducir);
}
// ==========================================================
// ==============  Reproducción secuencial  =================
// ==========================================================

// Velocidad global
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
    videoSeña.muted = true; // 🔇
    videoSeña.style.display = "block";

    // ✅ 
    videoSeña.playbackRate = currentSpeed;

    videoSeña.onended = () => {
        setTimeout(() => {
            reproducirSecuencialmente(lista);
        }, 100); 
    };
    videoSeña.play();
}

// ==========================================================
// =====================  Extras UI  ========================
// ==========================================================

const speedControl = document.getElementById("speedControl");
const speedValue = document.getElementById("speedValue");

if (speedValue && speedControl) {
  speedValue.textContent = parseFloat(speedControl.value) + "x";
}

speedControl.addEventListener("input", () => {
  currentSpeed = parseFloat(speedControl.value);   
  videoSeña.playbackRate = currentSpeed;           
  speedValue.textContent = currentSpeed + "x";
});

// 🎤
function activarMicrofono() {
  boton.classList.add("mic-active");
}
function desactivarMicrofono() {
  boton.classList.remove("mic-active");
}

// ✨
function mostrarTextoReconocido(textoReconocido) {
  texto.textContent = textoReconocido;
  texto.classList.add("glow");
  setTimeout(() => texto.classList.remove("glow"), 1000);
}

// ♿ 
const contrastToggle = document.getElementById("contrastToggle");
contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});






































































