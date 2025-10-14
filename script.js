// ========================
// Traductor Voz/Text → Señas
// Versión sólida y robusta
// ========================

/* HTML elements assumed present:
   - <video id="videoSeña"><source id="videoSource"></video>
   - <input id="entradaTexto">
   - <p id="texto"> (para mostrar lo que se detectó)
   - range#speedControl and span#speedValue
   - button#start (opcional) and #contrastToggle
*/

const video = document.getElementById('videoSeña');
const videoSource = document.getElementById('videoSource');
const inputTexto = document.getElementById('entradaTexto');
const texto = document.getElementById('texto');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const contrastToggle = document.getElementById('contrastToggle');
const startBtn = document.getElementById('start');

const videoPath = 'Palabras/'; // carpeta donde están los .mp4 (respetar mayúsculas)

// ----------------------- Utilidades de normalización -----------------------
function normalizar(s) {
  if (!s) return '';
  let t = String(s).toLowerCase().trim();
  // quitar tildes
  t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // eliminar signos de puntuación básicos, dejar espacios
  t = t.replace(/[¿?¡!.,:;()"']/g, '');
  // colapsar espacios
  t = t.replace(/\s+/g, ' ');
  return t;
}
function compact(s) {
  return normalizar(s).replace(/\s+/g, '');
}
// normaliza y compacta y además devuelve versión sin espacios (clave)
function keyFor(s) { return compact(s); }

// ----------------------- Listado real de archivos (tal como en tu repo) -----------------------
// PONÉ acá exactamente los nombres de archivo que subiste (los que me listaste antes).
// Si más adelante subís uno nuevo, agregalo a la lista o usa el mapeo de aliases.
const listaArchivos = [
  "A Veces","Abuelo Abuela","Administración","Administrar","Admirar O Admiración",
  "Ahorrar","Ahorro","Amar O Querer","Amor O Enamorado","América","Anteayer",
  "Antártida O Antártida Argentina","Apurar","Argentina","Ayer","Año Pasado","Año",
  "Bailar","Barato","Bebé","Bombero Bombera","Buenos Aires","Camiseta","Cantar",
  "Caro","Catamarca","Católico Católica","Cerca","Chaco","Chubut","Como Estas",
  "Como Quieras","Comoestas","Comotellamas","Comprar","Computadora","Confiar O Confianza",
  "Contar O Narrar","Corrientes","Córdoba","Deber","Decir","Derecha","Desconfiar O Desconfianza",
  "Deseo O Desear","Desnudar","Desnudarse","Despacio","Después","Desvestir","Desvestirse",
  "Deuda","Dialogar","Dibujar","Documento","Domingo","Echar O Despedir","Economía",
  "Edad O Cumpleaños","El o Ella","Emoción O Emocionarse O Emocionarse","Empleado Empleada",
  "Enfermero Enfermera","Enseguida","Entre Ríos","Esposo Esposa","Estafa","Estafar",
  "Estar","Europa","Explicar","Extranjero Extranjera","Feriado O Fiesta","Formosa","Futuro",
  "Fútbol","Ganancia","Ganar","Grabar","Gratis","Hablar","Hace Poco","Hasta","Hermano Hermana",
  "Hijo Hija","Hora","Hoy","Iglesia","Importante","Internacional","Izquierda","Jamás",
  "Jefe Jefa","Jesús Jesucristo","Jubilado Jubilada","Jueves","Jugar","Jujuy","La Pampa",
  "La Rioja","Lengua Oral","Limpio","Llegar","Lo Siento","Lunes","Madrastra Madrastras",
  "Malvinas","Mamá Madre Madres","Martes","Mañana","Mediodía","Mendoza","Mes","Minuto",
  "Misiones","Miércoles","Médico O Doctor","Música","Nacional","Negar","Negociar",
  "Negocio","Neuquén","Nieto Nieta","No","Nosotros o Nosotras","Novio Novia","Odio O Odiar",
  "Ofender O Ofendido O Ofensa","Padrastro Padrastros","Pagar","Papá Padre Padres","Pareja",
  "Pasado","Patagonia","Persona","Personalidad","Personas O Gente","Poder","Policía",
  "Política","Practicar","Presidente","Primeravez","Primo Prima","Profesional O Profesión",
  "Provincia","Pulover","Remera","Renunciar","Representante","Rio Negro","Ropa","Ruido",
  "Rápido","Sabado","Salta","San Juan","San Luis","Santa Cruz","Santa Fe","Santiago Del Estero",
  "Semana","Sentir O Sentimiento","Separado Separada","Señora","Si","Siempre","Sobrino Sobrina",
  "Sobrinos Sobrinas","Soltero Soltera","Sueldo","Tambien","Tampoco","Tarde","Temprano",
  "Tiempo","Tierra Del Fuego","Tio Tia","Todalanoche","Todavía","Todoslosdias","Trabajar",
  "Trabajo","Tucumán","Ustedes","Vender","Vestir","Viernes","Viudo Viuda","Vos","Yo",
  "Zapatilla","Zapato","hola","Letraa","Letrab","LetraC","LetraCH","LetraD","LetraE","LetraF",
  "LetraG","LetraH","LetraI","LetraJ","LetraK","LetraL","LetraLL","LetraM","LetraN","LetraO",
  "LetraP","LetraQ","LetraR","LetraS","LetraT","LetraU","LetraV","LetraW","LetraX","LetraY",
  "LetraZ","LetraÑ","llamoluana","Último"
];

// Construir mapa de búsqueda robusto: claves normalizadas (sin tilde, sin espacios) -> nombre exacto de archivo
const mapArchivos = {};
listaArchivos.forEach(name => {
  const keyNorm = normalizar(name);           // "como estas"
  const keyCompact = keyNorm.replace(/\s+/g,''); // "comoestas"
  mapArchivos[keyNorm] = name;
  mapArchivos[keyCompact] = name;
  mapArchivos[name.toLowerCase()] = name;
  // también su versión sin tildes y sin mayúsculas
  mapArchivos[normalizar(name).replace(/\s+/g,'')] = name;
});

// Añadir aliases y variantes manuales (palabras que mencionaste)
const extras = {
  'entrerios': 'Entre Ríos',
  'lapampa': 'La Pampa',
  'larioja': 'La Rioja',
  'rionegro': 'Rio Negro',
  'sanjuan': 'San Juan',
  'sanluis': 'San Luis',
  'santacruz': 'Santa Cruz',
  'santafe': 'Santa Fe',
  'santiagodelestero': 'Santiago Del Estero',
  'antartidaargentina': 'Antártida O Antártida Argentina',
  'tierradelfuego': 'Tierra Del Fuego',
  'hijohija': 'Hijo Hija',
  'bebe': 'Bebé',
  'abueloabuela': 'Abuelo Abuela',
  'hermanohermana': 'Hermano Hermana',
  'tiotia': 'Tio Tia',
  'padrastro': 'Padrastro Padrastros',
  'madrastra': 'Madrastra Madrastras',
  'esposoesposa': 'Esposo Esposa',
  'pareja': 'Pareja',
  'solterosoltera': 'Soltero Soltera',
  'separadoseparada': 'Separado Separada',
  'edad': 'Edad O Cumpleaños',
  'cumpleanos': 'Edad O Cumpleaños',
  'extranjeroextranjera': 'Extranjero Extranjera',
  'catolicocatolica': 'Católico Católica',
  'jesus': 'Jesús Jesucristo',
  'jesucristo': 'Jesús Jesucristo',
  'iglesia': 'Iglesia',
  'administrar': 'Administrar',
  'negociar': 'Negociar',
  'estafa': 'Estafa',
  'estafar': 'Estafar',
  'ahorro': 'Ahorro',
  'ahorrar': 'Ahorrar',
  'deber': 'Deber',
  'barato': 'Barato',
  'caro': 'Caro',
  'jefejefa': 'Jefe Jefa',
  'empleadoempleada': 'Empleado Empleada',
  'jubiladojubilada': 'Jubilado Jubilada',
  'sueldo': 'Sueldo',
  'echar': 'Echar O Despedir',
  'despedir': 'Echar O Despedir',
  'renunciar': 'Renunciar',
  'feriado': 'Feriado O Fiesta',
  'fiesta': 'Feriado O Fiesta',
  'bomberobombera': 'Bombero Bombera',
  'enfermeroenfermera': 'Enfermero Enfermera',
  'nacional': 'Nacional',
  'nacionalmente': 'Nacional',
  'internacional': 'Internacional',
  'internacionalmente': 'Internacional',
  'poder': 'Poder',
  'compu': 'Computadora',
  'computadora': 'Computadora',
  'jugar': 'Jugar',
  'dibujar': 'Dibujar',
  'ruido': 'Ruido',
  'cantar': 'Cantar',
  'bailar': 'Bailar',
  'persona': 'Persona',
  'personas': 'Personas O Gente',
  'gente': 'Personas O Gente',
  'personalidad': 'Personalidad',
  'amar': 'Amar O Querer',
  'querer': 'Amar O Querer',
  'sentir': 'Sentir O Sentimiento',
  'sentimiento': 'Sentir O Sentimiento',
  'odio': 'Odio O Odiar',
  'odiar': 'Odio O Odiar',
  'emocion': 'Emoción O Emocionarse O Emocionarse',
  'emocionado': 'Emoción O Emocionarse O Emocionarse',
  'emocionarse': 'Emoción O Emocionarse O Emocionarse',
  'confiar': 'Confiar O Confianza',
  'confianza': 'Confiar O Confianza',
  'desconfiar': 'Desconfiar O Desconfianza',
  'desconfianza': 'Desconfiar O Desconfianza',
  'deseo': 'Deseo O Desear',
  'desear': 'Deseo O Desear',
  'admirar': 'Admirar O Admiración',
  'admiracion': 'Admirar O Admiración',
  'ofender': 'Ofender O Ofendido O Ofensa',
  'ofensa': 'Ofender O Ofendido O Ofensa',
  'ofendido': 'Ofender O Ofendido O Ofensa',
  // letras alias
  'a': 'Letraa','b':'Letrab','c':'LetraC','ch':'LetraCH','ll':'LetraLL','ñ':'LetraÑ'
};
Object.keys(extras).forEach(k => {
  mapArchivos[k] = extras[k];
});

// ----------------------- GENERAR CONJUGACIONES (para verbos pedidos) -----------------------
function generarConjugacionesRegulares(infinitivo) {
  // regresa array de formas normalizadas
  const out = new Set();
  if (!infinitivo) return [];
  const inf = normalizar(infinitivo);
  out.add(inf);

  const raiz = inf.slice(0, -2);
  const term = inf.slice(-2);

  if (!['ar','er','ir'].includes(term)) return Array.from(out);

  // Presente
  const pres = {
    ar:['o','as','a','amos','an'],
    er:['o','es','e','emos','en'],
    ir:['o','es','e','imos','en']
  }[term];
  pres.forEach(s => out.add(raiz + s));

  // Pretérito perfecto simple (formas comunes)
  if (term === 'ar') {
    ['é','aste','ó','amos','aron'].forEach(s => out.add(raiz + s));
  } else {
    ['í','iste','ió','imos','ieron'].forEach(s => out.add(raiz + s));
  }

  // Imperfecto
  if (term === 'ar') {
    ['aba','abas','aba','ábamos','aban'].forEach(s => out.add(raiz + s));
  } else {
    ['ía','ías','ía','íamos','ían'].forEach(s => out.add(raiz + s));
  }

  // Futuro (infinitivo +)
  ['é','ás','á','emos','án'].forEach(s => out.add(inf + s));

  // Condicional (infinitivo +)
  ['ía','ías','ía','íamos','ían'].forEach(s => out.add(inf + s));

  // Gerundio / participio
  if (term === 'ar') out.add(raiz + 'ando');
  else out.add(raiz + 'iendo');
  if (term === 'ar') out.add(raiz + 'ado');
  else out.add(raiz + 'ido');

  // Compuestos con haber (he/has/ha/hemos/han)
  ['he','has','ha','hemos','han'].forEach(aux => {
    const part = (term === 'ar') ? raiz + 'ado' : raiz + 'ido';
    out.add(`${aux} ${part}`);
  });

  // devolver como normalizados (sin tildes)
  return Array.from(out).map(x => normalizar(x));
}

// Verbs to map (infinitivo filename => archivo)
const verbToFile = {
  'amar': 'Amar O Querer',
  'querer': 'Amar O Querer',
  'sentir': 'Sentir O Sentimiento',
  'odiar': 'Odio O Odiar',
  'ahorrar': 'Ahorrar',
  'cantar': 'Cantar',
  'bailar': 'Bailar',
  'hablar': 'Hablar',
  'decir': 'Decir',
  'contar': 'Contar O Narrar',
  'narrar': 'Contar O Narrar',
  'explicar': 'Explicar',
  'apurar': 'Apurar',
  'llegar': 'Llegar',
  'trabajar':'Trabajar',
  'practicar':'Practicar',
  'comprar':'Comprar',
  'vender':'Vender',
  'pagar':'Pagar',
  'grabar':'Grabar',
  'ganar':'Ganar',
  'vestir':'Vestir',
  'desvestir':'Desvestir',
  'desnudar':'Desnudar',
  'desnudarse':'Desnudarse',
  'jugar':'Jugar',
  'dibujar':'Dibujar'
};

// Construir mapa de conjugaciones normalizadas -> nombre de archivo exacto
Object.keys(verbToFile).forEach(inf => {
  const archivoDestino = verbToFile[inf];
  const formas = generarConjugacionesRegulares(inf);
  formas.forEach(f => {
    // mapArchivos utiliza clave compacta
    mapArchivos[f.replace(/\s+/g,'')] = archivoDestino;
    mapArchivos[f] = archivoDestino;
  });
  // además mapear infinitivo simple
  mapArchivos[normalizar(inf)] = archivoDestino;
  mapArchivos[inf] = archivoDestino;
});

// ----------------------- Frases prioritarias (multi-word) -----------------------
const frasesPrioritarias = [
  'como estas','como estás','comoestas','como quieres','como quieres?','me llamo luana',
  'lo siento','hace poco','a veces','toda la noche','todos los dias','todos los días',
  'primera vez','año pasado','ano pasado','como te llamas','vos cómo te llamas'
];
// normalizar keys
const frasesPriorMap = {};
frasesPrioritarias.forEach(f => {
  frasesPriorMap[compact(f)] = mapArchivos[compact(f)] || mapArchivos[normalizar(f).replace(/\s+/g,'')] || (mapArchivos[normalizar(f)] || null);
});

// ----------------------- Búsqueda de archivo para una palabra/clav e -----------------------
function buscarArchivoPorClave(raw) {
  if (!raw) return null;
  const norm = normalizar(raw);
  const comp = norm.replace(/\s+/g,'');
  // prioridad: exacto (sin espacios) -> exacto normalizado -> extras
  if (mapArchivos[comp]) return mapArchivos[comp];
  if (mapArchivos[norm]) return mapArchivos[norm];
  // si la key está compuesta por varias palabras (por ejemplo "comoestas"), devolver si existe
  return null;
}

// ----------------------- Procesar texto completo y generar secuencia de reproducción -----------------------
function procesarTextoSecuencial(text) {
  if (!text || !text.trim()) {
    video.style.display = 'none';
    return;
  }
  const original = String(text);
  const normalized = normalizar(original);
  const compacted = normalized.replace(/\s+/g,'');
  const videosAReproducir = [];

  // 1) detectar frases prioritarias por aparición (index) para respetar el orden
  // buscamos todas las frases y guardamos su index en la cadena normalizada
  const hits = [];
  Object.keys(frasesPriorMap).forEach(phraseKey => {
    const idx = compacted.indexOf(phraseKey);
    if (idx !== -1) hits.push({idx, phraseKey});
  });
  hits.sort((a,b) => a.idx - b.idx);
  const coveredPositions = new Array(compacted.length).fill(false);

  // marcar y añadir las frases encontradas en orden
  hits.forEach(h => {
    const {idx, phraseKey} = h;
    // evitar solapamientos marcados
    let overlap = false;
    for (let i = idx; i < idx + phraseKey.length; i++) {
      if (coveredPositions[i]) { overlap = true; break; }
    }
    if (overlap) return;
    // marcar
    for (let i = idx; i < idx + phraseKey.length; i++) coveredPositions[i] = true;
    const filename = frasesPriorMap[phraseKey] || mapArchivos[phraseKey] || null;
    if (filename) videosAReproducir.push(filename + '.mp4');
    else {
      // si no hay filename mapeado, intentar construir a partir de clave original
      const maybe = mapArchivos[phraseKey] || null;
      if (maybe) videosAReproducir.push(maybe + '.mp4');
    }
  });

  // 2) ahora procesar palabra por palabra en el texto normalizado (orden original)
  const palabras = normalized.split(/\s+/);
  let cursorCompact = 0; // índice en compacted para saber si palabra está cubierta por una frase
  for (let p of palabras) {
    const comp = p.replace(/\s+/g,'');
    // comprobar si esta palabra está dentro de una frase ya consumida
    const idxInCompact = compacted.indexOf(comp, cursorCompact);
    let isCovered = false;
    if (idxInCompact !== -1) {
      // si el primer caracter de la palabra está marcado como covered por frases, consideramos cubierta
      if (coveredPositions[idxInCompact]) isCovered = true;
      cursorCompact = idxInCompact + comp.length;
    }
    if (isCovered) continue;

    // buscar archivo (clave compacta y normalizada)
    const claveCompacta = comp;
    const claveNorm = p;
    let filename = buscarArchivoPorClave(claveCompacta) || buscarArchivoPorClave(claveNorm);
    if (!filename) {
      // intentar aliases (sin tilde / sin espacios)
      filename = mapArchivos[claveCompacta] || mapArchivos[claveNorm];
    }
    if (filename) {
      // si el mapa nos devuelve un nombre (ej "Comoestas" o "Como Estas"), lo guardamos con .mp4
      const exact = filename.endsWith('.mp4') ? filename : (filename + '.mp4');
      videosAReproducir.push(exact);
    } else {
      // si no está, chequeamos si es una letra (a-z, ñ, ch, ll), para reproducir LetraX
      if (/^[a-zñ]$/.test(claveCompacta)) {
        // map a LetraX en mayúscula tal como nombraste: Letraa, Letrab, etc.
        const letraLower = claveCompacta;
        const letraFile = `Letra${letraLower}.mp4`;
        videosAReproducir.push(letraFile);
      } else {
        // fallback: reproducir cada letra de la palabra
        const letras = claveCompacta.split('');
        letras.forEach(l => {
          if (/^[a-zñ]$/.test(l)) videosAReproducir.push(`Letra${l}.mp4`);
        });
      }
    }
  }

  // eliminar duplicados consecutivos
  const seq = [];
  for (let i=0;i<videosAReproducir.length;i++){
    if (i===0 || videosAReproducir[i] !== videosAReproducir[i-1]) seq.push(videosAReproducir[i]);
  }

  if (seq.length === 0) {
    texto.textContent = '❌ Palabra no encontrada';
    video.style.display = 'none';
    return;
  }

  // mostrar lo que se va a reproducir (primera palabra limpia)
  texto.textContent = original;

  // reproducir en cadena
  reproducirSecuencialmente(seq);
}

// ----------------------- Reproducción secuencial -----------------------
let currentSpeed = speedControl ? parseFloat(speedControl.value) : 0.75;
if (!isFinite(currentSpeed)) currentSpeed = 0.75;
if (speedValue) speedValue.textContent = `${currentSpeed.toFixed(2)}x`;

function reproducirSecuencialmente(lista) {
  if (!lista || lista.length === 0) {
    video.style.display = 'none';
    return;
  }
  const archivo = lista.shift(); // e.g. "Comoestas.mp4" o "Letraa.mp4"
  // asegurar ruta completa
  const ruta = (archivo.toLowerCase().startsWith('palabras/') ? archivo : (videoPath + archivo));
  videoSource.src = ruta;
  video.load();
  video.style.display = 'block';
  video.playbackRate = currentSpeed;
  // intentar play y esperar a que termine para continuar
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // ok, cuando termine -> siguiente
      video.onended = () => {
        setTimeout(() => reproducirSecuencialmente(lista), 80);
      };
    }).catch(err => {
      // error de autoplay: dejamos el video visible para que usuario haga click
      console.warn('Reproducción automática bloqueada. Pedir click manual. Error:', err);
      // aún así, encadenamos onended si el usuario hace click
      video.onended = () => {
        setTimeout(() => reproducirSecuencialmente(lista), 80);
      };
    });
  } else {
    // fallback
    video.onended = () => {
      setTimeout(() => reproducirSecuencialmente(lista), 80);
    };
  }
}

// ----------------------- Eventos UI -----------------------
if (inputTexto) {
  inputTexto.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      procesarTextoSecuencial(inputTexto.value || '');
    }
  });
}

if (startBtn) {
  // si querés linkear botón a reconocimiento de voz, lo podés hacer aquí
  startBtn.addEventListener('click', () => {
    // si no tenés reconocimiento implementado, permitimos que sea un "trigger" para reproducir lo escrito
    if (inputTexto && inputTexto.value.trim()) procesarTextoSecuencial(inputTexto.value.trim());
  });
}

if (speedControl) {
  speedControl.addEventListener('input', function() {
    currentSpeed = parseFloat(this.value) || currentSpeed;
    if (video) video.playbackRate = currentSpeed;
    if (speedValue) speedValue.textContent = `${currentSpeed.toFixed(2)}x`;
  });
}

if (contrastToggle) {
  contrastToggle.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
}

// ----------------------- Inicializaciones pequeñas -----------------------
if (video) {
  video.style.display = 'none';
  video.muted = true; // ayuda autoplay en algunos navegadores
}
