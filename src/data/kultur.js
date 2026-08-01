// Redewendungen & Kultur
// Die Kulturkarten tragen echte Fotos aus der Kapitel-Bibliothek — samt
// Urheber und Lizenz aus kapitelFotos.js.
import { kapitelFotos } from './kapitelFotos.js'
import { wortFotos } from './wortFotos.js'
export const redewendungen = [
  { ku: 'Dilop bi dilop, gol çêdibe.', de: 'Tropfen für Tropfen entsteht ein See.', sinn: 'Geduld führt zum Ziel — genau wie beim Sprachenlernen.' },
  { ku: 'Bira bira ye, bazar cuda ye.', de: 'Bruder ist Bruder, Geschäft ist Geschäft.', sinn: 'Familie und Geschäft trennt man.' },
  { ku: 'Agir xweş e, lê ariya wî jî heye.', de: 'Feuer ist schön, aber es hat auch Asche.', sinn: 'Alles Schöne hat seine Schattenseite.' },
  { ku: 'Dest destê dişo, dest jî rû dişo.', de: 'Hand wäscht Hand, und die Hand wäscht das Gesicht.', sinn: 'Gegenseitige Hilfe nützt allen.' },
  { ku: 'Zimanê şîrîn, maran ji qulê derdixe.', de: 'Eine süße Zunge lockt die Schlange aus ihrem Loch.', sinn: 'Freundliche Worte öffnen jede Tür.' },
  { ku: 'Yê ku zimanê xwe winda bike, xwe winda dike.', de: 'Wer seine Sprache verliert, verliert sich selbst.', sinn: 'Darum lernst du Kurmancî. ❤️' },
]

export const kultur = [
  { titel: 'Newroz 🔥', text: 'Das kurdische Neujahrsfest am 21. März — Feuer, Tanz und bunte Kleider begrüßen den Frühling. Newroz ist das wichtigste Fest der Kurden und ein Symbol für Freiheit.' },
  { titel: 'Govend 💃', text: 'Der kurdische Reihentanz: Alle fassen sich an den Händen oder kleinen Fingern und tanzen in einer Reihe — bei Hochzeiten (dawet) oft stundenlang. Der Vortänzer schwingt ein Tuch (destmal).' },
  { titel: 'Dengbêj 🎤', text: 'Die traditionellen Sänger-Erzähler der Kurden. Ohne Instrumente, nur mit der Stimme, tragen sie jahrhundertealte Geschichten, Liebeslieder und Heldenepen weiter — das lebendige Gedächtnis der Sprache.' },
  { titel: 'Çay-Kultur 🍵', text: 'Tee gehört zu jedem Besuch: stark, süß, im kleinen Glas mit schmaler Taille. „Kerem bike, çayê vexwe!" — Bitte, trink Tee! Ablehnen ist fast unmöglich.' },
]

// ===== Kulturkarten des Abenteuer-Modus =====
// Kultur ist hier erklärter Inhalt, kein Schmuck. Jede Karte erklärt zuerst
// auf Deutsch, was dahintersteckt, und gibt danach einen Ausdruck und einen
// Beispielsatz zum Mitlernen. Reihenfolge: Deutsch zuerst, Kurmancî darunter.
export const kulturkarten = [
  {
    id: 'gastfreundschaft',
    foto: kapitelFotos.gaeste,
    titel: 'Gastfreundschaft',
    icon: 'herz',
    thema: 'Alltag',
    erklaerung:
      'In vielen kurdischen Familien wird Gästen zuerst Tee angeboten, noch bevor nach dem Grund des Besuchs gefragt wird. Ablehnen gilt als unhöflich — man nimmt wenigstens ein Glas. Wer unangemeldet kommt, ist kein Störfall, sondern eine Ehre für das Haus.',
    ausdruck: { ku: 'Kerem bike', de: 'Bitte / Bitte sehr' },
    beispiel: { ku: 'Kerem bike, çayê vexwe.', de: 'Bitte, trink Tee.' },
    hinweis:
      'Zu mehreren Gästen oder besonders höflich sagt man „Kerem bikin“. Das „ç“ klingt wie „tsch“ in „Tschüss“.',
  },
  {
    id: 'cay',
    foto: kapitelFotos.redewendungen,
    titel: 'Çay — Tee zu jedem Besuch',
    icon: 'sonne',
    thema: 'Alltag',
    erklaerung:
      'Tee wird stark aufgebrüht und im kleinen Glas mit schmaler Taille serviert, dem Istikan. Der Zucker wird oft nicht eingerührt, sondern zwischen die Zähne genommen. Serviert wird auf einem Kupfertablett, und das zweite Glas ist selbstverständlich.',
    ausdruck: { ku: 'Çayê vexwe!', de: 'Trink Tee!' },
    beispiel: { ku: 'Em çayê di îstîkanan de vedixwin.', de: 'Wir trinken Tee aus kleinen Gläsern.' },
    hinweis:
      'Nach „di … de“ (in) steht das Wort in der gebeugten Form: aus „îstîkan“ wird „îstîkanan“.',
  },
  {
    id: 'newroz',
    foto: kapitelFotos.newroz,
    titel: 'Newroz — das Neujahrsfest',
    icon: 'flamme',
    thema: 'Fest',
    erklaerung:
      'Newroz ist am 21. März und begrüßt den Frühling und das neue Jahr. Auf den Hügeln werden Feuer entzündet, über die man springt, und die Menschen tragen bunte Kleider. Für viele Kurden ist Newroz zugleich ein Fest der Freiheit und des Neuanfangs.',
    ausdruck: { ku: 'Newroz pîroz be!', de: 'Frohes Newroz!' },
    beispiel: { ku: 'Em di şeva Newrozê de agir vêdixin.', de: 'In der Newroz-Nacht zünden wir ein Feuer an.' },
    hinweis:
      '„pîroz be“ heißt wörtlich „möge es gesegnet sein“ — dieselbe Formel gratuliert auch zum Geburtstag.',
  },
  {
    id: 'govend',
    foto: kapitelFotos.hochzeit,
    titel: 'Govend — der Reihentanz',
    icon: 'familie',
    thema: 'Fest',
    erklaerung:
      'Beim Govend fassen sich alle an den Händen oder an den kleinen Fingern und tanzen in einer langen Reihe. Vorne führt eine Person mit einem Tuch, dem Destmal, und gibt den Schritt vor. Auf Hochzeiten kann eine Govend Stunden dauern, und niemand tanzt allein.',
    ausdruck: { ku: 'Werin em govendê bigirin!', de: 'Kommt, lasst uns tanzen!' },
    beispiel: { ku: 'Di dawetê de her kes govendê digire.', de: 'Auf der Hochzeit tanzt jeder mit.' },
    hinweis: '„govendê girtin“ heißt wörtlich „den Reigen fassen“ — Tanzen ist hier ein Anfassen.',
  },
  {
    id: 'dengbej',
    foto: kapitelFotos.dengbej,
    titel: 'Dengbêj — die Sänger-Erzähler',
    icon: 'mikrofon',
    thema: 'Musik',
    erklaerung:
      'Ein Dengbêj singt ohne Instrumente, nur mit der Stimme, und erzählt dabei lange Geschichten von Liebe, Flucht und Helden. Weil Kurmancî über Generationen kaum geschrieben werden durfte, wurden diese Lieder zum Gedächtnis der Sprache. Bis heute lernt man alte Wörter am ehesten von einem Dengbêj.',
    ausdruck: { ku: 'Stranekê bibêje!', de: 'Sing ein Lied!' },
    beispiel: { ku: 'Dengbêj bê amûr stranan dibêje.', de: 'Der Dengbêj singt Lieder ohne Instrumente.' },
    hinweis: '„deng“ heißt Stimme und „bêj“ kommt von „sagen“ — ein Dengbêj ist ein Stimm-Sager.',
  },
  {
    id: 'kelim',
    foto: kapitelFotos.handwerk,
    titel: 'Kelim-Weberei',
    icon: 'rahmen',
    thema: 'Alltag',
    erklaerung:
      'Der Kelim ist ein flach gewebter Teppich ohne Knoten, meist von Frauen am Webstuhl gefertigt. Seine Rauten, Haken und Sterne sind keine Zufallsmuster, sondern Zeichen für Schutz, Familie und Fruchtbarkeit. Die Farben stammen traditionell aus Pflanzen: Rot aus Krapp, Gelb aus Kamille, Blau aus Indigo.',
    ausdruck: { ku: 'Kilîm', de: 'Der Kelim (Flachgewebe)' },
    beispiel: { ku: 'Dayika min kilîmekî xweşik çêdike.', de: 'Meine Mutter webt einen schönen Kelim.' },
    hinweis: 'Unbestimmtheit zeigt die Endung „-ek“: aus „kilîm“ wird „kilîmek“ — ein Kelim.',
  },
  {
    id: 'hinar',
    foto: wortFotos.hinar,
    titel: 'Granatapfel und Essen',
    icon: 'edelstein',
    thema: 'Alltag',
    erklaerung:
      'Der Granatapfel wächst in vielen Dorfgärten und steht für Fülle und einen guten Start ins Jahr. Sein eingekochter Saft würzt Salate und Bohnengerichte säuerlich-süß. Gegessen wird gemeinsam von einem großen Tablett, oft auf einem Tuch am Boden, und jeder greift aus derselben Mitte.',
    ausdruck: { ku: 'Hinar', de: 'Der Granatapfel' },
    beispiel: { ku: 'Hinar li ser sifrê ye.', de: 'Der Granatapfel liegt auf dem Esstuch.' },
    hinweis: 'Das „h“ in „hinar“ wird deutlich gehaucht wie in „Hand“, nicht verschluckt.',
  },
  {
    id: 'gund',
    foto: kapitelFotos.gebirge,
    titel: 'Leben im Bergdorf',
    icon: 'berg',
    thema: 'Alltag',
    erklaerung:
      'Viele Dörfer liegen an Hängen: Häuser aus Naturstein mit flachem Dach, dazu Terrassenfelder und eine Steinbogenbrücke über den Bach. Im Sommer ziehen Familien mit den Herden auf die Hochweiden, die Zozan. Wer baut oder erntet, bekommt Hilfe von den Nachbarn, ohne dass jemand darum bittet.',
    ausdruck: { ku: 'Gund', de: 'Das Dorf' },
    beispiel: { ku: 'Gundê me li ser çiyê ye.', de: 'Unser Dorf liegt am Berg.' },
    hinweis: '„çiya“ heißt Berg; nach „li ser“ (auf, an) wird daraus „çiyê“.',
  },
  {
    id: 'nan',
    foto: kapitelFotos.taetigkeiten,
    titel: 'Brot und Salz',
    icon: 'teilen',
    thema: 'Alltag',
    erklaerung:
      'Fladenbrot wird nicht geschnitten, sondern gebrochen und weitergereicht. „Nan û xwê“ — Brot und Salz — ist die feste Redewendung für gemeinsame Mahlzeiten und für die Verpflichtung, die daraus entsteht. Brot wegzuwerfen gilt als schwerer Fehler; altes Brot legt man lieber sichtbar auf eine Mauer.',
    ausdruck: { ku: 'Nan', de: 'Das Brot' },
    beispiel: { ku: 'Em nan û xwê parve dikin.', de: 'Wir teilen Brot und Salz.' },
    hinweis: '„nan xwarin“ heißt wörtlich „Brot essen“ und bedeutet im Alltag einfach „essen“.',
  },
  {
    id: 'nav',
    foto: kapitelFotos.namefragen,
    titel: 'Namen und Anrede',
    icon: 'profil',
    thema: 'Sprache',
    erklaerung:
      'Kurdische Vornamen sind meist gewöhnliche Wörter: Baran heißt Regen, Berfîn Schneeglöckchen, Rojîn Sonnenschein. Ältere Menschen spricht man selten mit dem bloßen Namen an, sondern mit Verwandtschaftswörtern wie Xalo (Onkel mütterlicherseits) oder Keko (großer Bruder). Das gilt auch für Fremde und drückt Respekt aus.',
    ausdruck: { ku: 'Navê te çi ye?', de: 'Wie heißt du?' },
    beispiel: { ku: 'Navê min Berfîn e.', de: 'Ich heiße Berfîn.' },
    hinweis: 'Zum Rufen gibt es eigene Formen: bei Männern auf „-o“ (Baran → Baro), bei Frauen auf „-ê“ (Gulan → Gulê).',
  },
  {
    id: 'gotin',
    titel: 'Sprichwörter',
    icon: 'sprechblase',
    thema: 'Sprache',
    erklaerung:
      'Statt lange zu erklären, zitiert man im Gespräch gern ein Sprichwort. Die Bilder kommen fast immer aus Berg, Wetter und Herde, und ein Satz ersetzt einen ganzen Ratschlag. Wer die geläufigsten kennt, versteht kurdische Gespräche deutlich schneller.',
    ausdruck: { ku: 'Gotinên pêşiyan', de: 'Sprichwörter' },
    beispiel: { ku: 'Dilop bi dilop, gol çêdibe.', de: 'Tropfen für Tropfen entsteht ein See.' },
    hinweis: '„Gotinên pêşiyan“ heißt wörtlich „Worte der Vorfahren“.',
  },
  {
    id: 'alfabe',
    foto: kapitelFotos.saetze,
    titel: 'Die kurdische Schrift',
    icon: 'sprache',
    thema: 'Sprache',
    erklaerung:
      'Kurmancî wird mit lateinischen Buchstaben geschrieben und hat 31 davon. Fünf Sonderzeichen tragen eigene Laute: ç, ê, î, ş und û. Jeder Buchstabe steht für genau einen Laut, deshalb liest man ein neues Wort meist sofort richtig.',
    ausdruck: { ku: 'Ez kurmancî hîn dibim.', de: 'Ich lerne Kurmancî.' },
    beispiel: { ku: 'Ez pirtûkê dixwînim.', de: 'Ich lese das Buch.' },
    hinweis: 'Im Kurmancî steht das Verb häufig am Ende des Satzes.',
  },
  {
    id: 'kela',
    foto: kapitelFotos.stadt,
    titel: 'Die Kela — Zitadelle auf dem Hügel',
    icon: 'schild',
    thema: 'Geschichte',
    erklaerung:
      'Eine Kela ist keine Ritterburg, sondern eine Zitadelle auf einem Siedlungshügel, der über Jahrtausende aus den Resten älterer Häuser gewachsen ist. Die bekannteste steht in Hewlêr und gilt als eine der am längsten durchgehend bewohnten Siedlungen der Welt. Unten am Hügel liegt der Basar, oben Lehm- und Steinhäuser mit Innenhöfen.',
    ausdruck: { ku: 'Kela', de: 'Die Zitadelle' },
    beispiel: { ku: 'Kela Hewlêrê pir kevn e.', de: 'Die Zitadelle von Hewlêr ist sehr alt.' },
    hinweis: 'Zwei Nomen werden mit „-a“ verbunden: „Kela Hewlêrê“ ist die Zitadelle von Hewlêr.',
  },
  {
    id: 'kawa',
    titel: 'Kawa der Schmied',
    icon: 'blitz',
    thema: 'Geschichte',
    erklaerung:
      'Die Legende hinter Newroz erzählt von Kawa, einem Schmied, dem der Tyrann Dehak die Kinder genommen hatte. Kawa erschlug ihn mit dem Schmiedehammer und entzündete auf dem Berg ein Feuer, damit alle die Befreiung sehen konnten. Deshalb brennen zu Newroz bis heute Feuer auf den Höhen.',
    ausdruck: { ku: 'Hesinkar', de: 'Der Schmied' },
    beispiel: { ku: 'Kawayê hesinkar agir pêxist.', de: 'Kawa der Schmied entzündete das Feuer.' },
    hinweis: 'Die Vergangenheit hat eigene Formen: „pêxist“ heißt „zündete an“, „pêdixe“ heißt „zündet an“.',
  },
  {
    id: 'muzik',
    foto: kapitelFotos.musik,
    titel: 'Musik und Instrumente',
    icon: 'musik',
    thema: 'Musik',
    erklaerung:
      'Zur kurdischen Musik gehören die Langhalslaute Tembûr, die Hirtenflöte Bilûr und die Rahmentrommel Def. Musik begleitet Arbeit, Hochzeit und Trauer und ist selten reine Unterhaltung. Viele Melodien haben keinen festen Autor — sie wandern von Dorf zu Dorf und verändern sich dabei.',
    ausdruck: { ku: 'Bilûr', de: 'Die Flöte' },
    beispiel: { ku: 'Şivan li çiyê bilûrê dixe.', de: 'Der Hirte spielt am Berg Flöte.' },
    hinweis: 'Ein Instrument „schlägt“ man im Kurmancî: „bilûrê dixe“ heißt wörtlich „er schlägt die Flöte“.',
  },
]
