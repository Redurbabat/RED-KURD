// Zusätzliche Sprachkurse. Deutsch bleibt die Ausgangssprache; jeder Kurs
// besitzt eigene A1-Inhalte, eine passende Systemstimme und echte Lernfotos.

const FOTOS = {
  begruessung: {
    src: '/bilder/lernwelt/landschaft.jpg',
    alt: 'Akrê mit Häusern und Bergen in Kurdistan',
    quelle: 'landschaft',
  },
  menschen: {
    src: '/bilder/lernwelt/schule.jpg',
    alt: 'Echtes Klassenzimmer als Ort gemeinsamer Begegnungen',
    quelle: 'schule',
  },
  essen: {
    src: '/bilder/lernwelt/obst.jpg',
    alt: 'Verschiedene frische Früchte auf einem Tablett',
    quelle: 'obst',
  },
  zuhause: {
    src: '/bilder/lernwelt/haus.jpg',
    alt: 'Modernes Wohnhaus in Deutschland',
    quelle: 'haus',
  },
  unterwegs: {
    src: '/bilder/lernwelt/zug.jpg',
    alt: 'Personenzug an einem Bahnsteig',
    quelle: 'zug',
  },
  alltag: {
    src: '/bilder/lernwelt/kueche.jpg',
    alt: 'Echte Aufnahme einer eingerichteten Küche',
    quelle: 'kueche',
  },
}

const KAPITEL_META = [
  {
    id: 'begruessung',
    name: 'Hallo & Höflichkeit',
    ziel: 'Begrüßen, danken und sich verabschieden',
    symbol: '👋',
  },
  {
    id: 'menschen',
    name: 'Menschen & Familie',
    ziel: 'Über Menschen und Beziehungen sprechen',
    symbol: '🧑‍🤝‍🧑',
  },
  {
    id: 'essen',
    name: 'Essen & Trinken',
    ziel: 'Lebensmittel benennen und etwas bestellen',
    symbol: '🍎',
  },
  {
    id: 'zuhause',
    name: 'Haus & Wohnen',
    ziel: 'Zimmer, Möbel und dein Zuhause beschreiben',
    symbol: '🏠',
  },
  {
    id: 'unterwegs',
    name: 'Unterwegs',
    ziel: 'Nach dem Weg fragen und mit dem Zug fahren',
    symbol: '🚆',
  },
  {
    id: 'alltag',
    name: 'Dein Alltag',
    ziel: 'Über Zeit, Schule, Arbeit und Freizeit sprechen',
    symbol: '☀️',
  },
]

const DEUTSCH = {
  begruessung: ['Hallo', 'Guten Morgen', 'Guten Abend', 'Auf Wiedersehen', 'Bitte', 'Danke', 'Ja', 'Nein'],
  menschen: ['ich', 'du', 'Mann', 'Frau', 'Kind', 'Freund', 'Familie', 'Name'],
  essen: ['Brot', 'Wasser', 'Tee', 'Kaffee', 'Apfel', 'Gemüse', 'Frühstück', 'Restaurant'],
  zuhause: ['Haus', 'Zimmer', 'Küche', 'Badezimmer', 'Tür', 'Fenster', 'Tisch', 'Stuhl'],
  unterwegs: ['Straße', 'Zug', 'Bahnhof', 'Fahrkarte', 'links', 'rechts', 'wo?', 'Hilfe'],
  alltag: ['heute', 'morgen', 'Arbeit', 'Schule', 'Zeit', 'Musik', 'Sport', 'müde'],
}

const EMOJIS = {
  begruessung: ['👋', '🌅', '🌆', '🙋', '🤲', '💛', '✅', '❌'],
  menschen: ['🙋', '👉', '👨', '👩', '🧒', '🤝', '👪', '🏷️'],
  essen: ['🍞', '💧', '🫖', '☕', '🍎', '🥕', '🥣', '🍽️'],
  zuhause: ['🏠', '🛏️', '🍳', '🛁', '🚪', '🪟', '🪑', '🪑'],
  unterwegs: ['🛣️', '🚆', '🚉', '🎫', '⬅️', '➡️', '❓', '🆘'],
  alltag: ['📅', '🌄', '💼', '🏫', '🕐', '🎵', '⚽', '😴'],
}

const INHALTE = {
  englisch: {
    begruessung: ['hello', 'good morning', 'good evening', 'goodbye', 'please', 'thank you', 'yes', 'no'],
    menschen: ['I', 'you', 'man', 'woman', 'child', 'friend', 'family', 'name'],
    essen: ['bread', 'water', 'tea', 'coffee', 'apple', 'vegetables', 'breakfast', 'restaurant'],
    zuhause: ['house', 'room', 'kitchen', 'bathroom', 'door', 'window', 'table', 'chair'],
    unterwegs: ['street', 'train', 'station', 'ticket', 'left', 'right', 'where?', 'help'],
    alltag: ['today', 'tomorrow', 'work', 'school', 'time', 'music', 'sport', 'tired'],
  },
  franzoesisch: {
    begruessung: ['salut', 'bonjour', 'bonsoir', 'au revoir', "s'il vous plaît", 'merci', 'oui', 'non'],
    menschen: ['je', 'tu', 'homme', 'femme', 'enfant', 'ami', 'famille', 'nom'],
    essen: ['pain', 'eau', 'thé', 'café', 'pomme', 'légumes', 'petit-déjeuner', 'restaurant'],
    zuhause: ['maison', 'chambre', 'cuisine', 'salle de bains', 'porte', 'fenêtre', 'table', 'chaise'],
    unterwegs: ['rue', 'train', 'gare', 'billet', 'gauche', 'droite', 'où ?', "à l'aide"],
    alltag: ["aujourd'hui", 'demain', 'travail', 'école', 'temps', 'musique', 'sport', 'fatigué'],
  },
  tuerkisch: {
    begruessung: ['merhaba', 'günaydın', 'iyi akşamlar', 'hoşça kal', 'lütfen', 'teşekkürler', 'evet', 'hayır'],
    menschen: ['ben', 'sen', 'erkek', 'kadın', 'çocuk', 'arkadaş', 'aile', 'isim'],
    essen: ['ekmek', 'su', 'çay', 'kahve', 'elma', 'sebze', 'kahvaltı', 'restoran'],
    zuhause: ['ev', 'oda', 'mutfak', 'banyo', 'kapı', 'pencere', 'masa', 'sandalye'],
    unterwegs: ['sokak', 'tren', 'istasyon', 'bilet', 'sol', 'sağ', 'nerede?', 'yardım'],
    alltag: ['bugün', 'yarın', 'iş', 'okul', 'zaman', 'müzik', 'spor', 'yorgun'],
  },
  spanisch: {
    begruessung: ['hola', 'buenos días', 'buenas tardes', 'adiós', 'por favor', 'gracias', 'sí', 'no'],
    menschen: ['yo', 'tú', 'hombre', 'mujer', 'niño', 'amigo', 'familia', 'nombre'],
    essen: ['pan', 'agua', 'té', 'café', 'manzana', 'verduras', 'desayuno', 'restaurante'],
    zuhause: ['casa', 'habitación', 'cocina', 'baño', 'puerta', 'ventana', 'mesa', 'silla'],
    unterwegs: ['calle', 'tren', 'estación', 'billete', 'izquierda', 'derecha', '¿dónde?', 'ayuda'],
    alltag: ['hoy', 'mañana', 'trabajo', 'escuela', 'tiempo', 'música', 'deporte', 'cansado'],
  },
}

const KURS_META = [
  {
    id: 'englisch',
    name: 'Englisch',
    eigenname: 'English',
    flagge: '🇬🇧',
    locale: 'en-GB',
    farbe: '#20a8f0',
    beschreibung: 'Englisch für Alltag, Reisen und Gespräche',
  },
  {
    id: 'franzoesisch',
    name: 'Französisch',
    eigenname: 'Français',
    flagge: '🇫🇷',
    locale: 'fr-FR',
    farbe: '#8b5cf6',
    beschreibung: 'Französisch Schritt für Schritt sprechen',
  },
  {
    id: 'tuerkisch',
    name: 'Türkisch',
    eigenname: 'Türkçe',
    flagge: '🇹🇷',
    locale: 'tr-TR',
    farbe: '#ff5f69',
    beschreibung: 'Türkisch für Familie, Alltag und Reisen',
  },
  {
    id: 'spanisch',
    name: 'Spanisch',
    eigenname: 'Español',
    flagge: '🇪🇸',
    locale: 'es-ES',
    farbe: '#ffb020',
    beschreibung: 'Spanisch mit kurzen, hörbaren Lektionen',
  },
]

function baueKapitel(kursId) {
  return KAPITEL_META.map((meta) => ({
    ...meta,
    foto: FOTOS[meta.id],
    woerter: DEUTSCH[meta.id].map((de, index) => ({
      de,
      ziel: INHALTE[kursId][meta.id][index],
      bild: EMOJIS[meta.id][index],
    })),
  }))
}

export const SPRACHKURSE = KURS_META.map((kurs) => ({
  ...kurs,
  kapitel: baueKapitel(kurs.id),
  woerter: KAPITEL_META.length * 8,
  lektionen: KAPITEL_META.length * 3,
}))

export function holeSprachkurs(id) {
  return SPRACHKURSE.find((kurs) => kurs.id === id) || null
}

export function holeSprachkapitel(kursId, kapitelId) {
  return holeSprachkurs(kursId)?.kapitel.find((kapitel) => kapitel.id === kapitelId) || null
}

export const FOTOQUELLEN = Object.values(FOTOS).map((foto) => foto.quelle)
