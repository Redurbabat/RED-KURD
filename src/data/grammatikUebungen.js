// GENERIERT aus dem Workflow „grammatik-fragen“, danach sprachlich geprüft.
// Kontrollfragen zu den Grammatik-Notizen: je Kapitel zwei Fragen,
// vier Optionen, genau eine richtig; erklaerung begründet auf Deutsch.
export const grammatikUebungen = {
  begruessung: [
    {
      frage: 'Wie fragst du eine einzelne Person besonders höflich (mit „hûn“), wie es ihr geht?',
      optionen: ['Hûn çawa yî?', 'Hûn çawa ne?', 'Tu çawa ne?', 'Hûn çawa ye?'],
      richtig: 1,
      erklaerung: 'Nach „hûn“ passt sich die Frageform an und die Kopula lautet „ne“: Hûn çawa ne?',
    },
    {
      frage: 'Welcher Satz ist richtig, wenn du einen Freund mit „tu“ fragst, wie es ihm geht?',
      optionen: ['Tu çawa ne?', 'Hûn çawa yî?', 'Tu çawa yî?', 'Tu çawa me?'],
      richtig: 2,
      erklaerung: 'Zu „tu“ (du) gehört die Kopula „yî“, deshalb heißt es „Tu çawa yî?“.',
    },
  ],
  vorstellen: [
    {
      frage: 'Welche Form vervollständigt den Satz: Ez mamoste …?',
      optionen: ['im', 'me', 'e', 'ye'],
      richtig: 1,
      erklaerung: 'Nach einem Selbstlaut wie am Ende von „mamoste“ lautet die Kopula der ersten Person „me“: Ez mamoste me.',
    },
    {
      frage: 'Welcher Satz ist richtig: „Ich bin Azad“?',
      optionen: ['Ez Azad im.', 'Ez Azad me.', 'Ez Azad e.', 'Ez Azad in.'],
      richtig: 0,
      erklaerung: 'Nach einem Mitlaut wie dem „d“ in „Azad“ heißt die Kopula der ersten Person „im“: Ez Azad im.',
    },
  ],
  familie: [
    {
      frage: 'Wie heißt „mein Vater“ auf Kurmancî?',
      optionen: ['bava min', 'bav min', 'bavê min', 'min bav'],
      richtig: 2,
      erklaerung: '„bav“ ist männlich und nimmt die Ezafe „-ê“, das Besitzwort steht dahinter: bavê min.',
    },
    {
      frage: 'Wie heißt „meine Mutter“ auf Kurmancî?',
      optionen: ['dayika min', 'dayikê min', 'dayik min', 'min dayik'],
      richtig: 0,
      erklaerung: 'Weibliche Wörter wie „dayik“ verbinden sich mit der Ezafe „-a“: dayika min.',
    },
  ],
  zahlen: [
    {
      frage: 'Welcher Satz ist richtig: „Es gibt drei Äpfel“?',
      optionen: ['Sê sêv heye.', 'Sêv sê hene.', 'Hene sê sêv.', 'Sê sêv hene.'],
      richtig: 3,
      erklaerung: 'Bei einer Mehrzahl wie „sê sêv“ steht am Satzende die Mehrzahl-Form „hene“, nicht „heye“.',
    },
    {
      frage: 'Wie heißt „zwei Brüder“ auf Kurmancî?',
      optionen: ['bira du', 'du bira', 'dudu bira', 'birayên du'],
      richtig: 1,
      erklaerung: 'Die Zahl steht wie im Deutschen vor dem Nomen: du bira.',
    },
  ],
  essen: [
    {
      frage: 'Welche Form vervollständigt den Satz: Ez nan … (Ich esse Brot)?',
      optionen: ['dixwim', 'xwim', 'dixwe', 'bixwim'],
      richtig: 0,
      erklaerung: 'Die Gegenwart baut man mit der Vorsilbe „di-“ und der Endung der ersten Person: di + xw + im → dixwim.',
    },
    {
      frage: 'Welcher Satz ist richtig: „Wir trinken Tee“?',
      optionen: ['Em çayê vexwin.', 'Em vedixwin çayê.', 'Em çayê vedixwin.', 'Ez çayê vedixwin.'],
      richtig: 2,
      erklaerung: 'Das Verb trägt in der Gegenwart die Vorsilbe „di-“ (vedixwin) und steht am Satzende: Em çayê vedixwin.',
    },
  ],
  zeit: [
    {
      frage: 'Welcher Satz ist richtig: „Heute ist das Wetter schön“?',
      optionen: ['Îro hewa xweş ye.', 'Îro hewa xweş e.', 'Sibe hewa xweş e.', 'Îro hewa xweş in.'],
      richtig: 1,
      erklaerung: 'Das Zeitwort „îro“ (heute) steht am Satzanfang, und nach dem Mitlaut in „xweş“ folgt die Kopula „e“.',
    },
    {
      frage: 'Wie heißt „morgen“ (der Tag nach heute) auf Kurmancî?',
      optionen: ['êvar', 'duh', 'sibê', 'îro'],
      richtig: 2,
      erklaerung: '„sibê“ mit Zirkumflex bedeutet „morgen“, während „sibe“ der Morgen ist — der Unterschied liegt im Zirkumflex.',
    },
  ],
  zuhause: [
    {
      frage: 'Welcher Satz ist richtig: „Ich bin zu Hause“?',
      optionen: ['Ez li mal me.', 'Ez malê me.', 'Ez li malê im.', 'Ez li malê me.'],
      richtig: 3,
      erklaerung: 'Der Ort steht mit „li“ und gebeugter Endung (mal → malê), und nach dem Selbstlaut folgt die Kopula „me“.',
    },
    {
      frage: 'Wie sagt man „in der Stadt“ auf Kurmancî?',
      optionen: ['li bajêr', 'bi bajêr', 'ji bajêr', 'bajêr li'],
      richtig: 0,
      erklaerung: '„li“ zeigt an, wo etwas ist, und „bajar“ bekommt dahinter die gebeugte Form „bajêr“: li bajêr.',
    },
  ],
  farben: [
    {
      frage: 'Wie heißt „die rote Blume“ auf Kurmancî?',
      optionen: ['sor gula', 'gula sor', 'gul sor', 'gulê sor'],
      richtig: 1,
      erklaerung: 'Die Eigenschaft steht hinter dem Nomen und wird mit der weiblichen Ezafe „-a“ verbunden: gula sor.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Berf spî … (Der Schnee ist weiß)?',
      optionen: ['e', 'in', 'ye', 'im'],
      richtig: 2,
      erklaerung: 'Weil „spî“ auf einen Selbstlaut endet, wird die Kopula „e“ zu „ye“: Berf spî ye.',
    },
  ],
  verben: [
    {
      frage: 'Welcher Satz hat die richtige Wortstellung: „Ich lese das Buch“?',
      optionen: ['Ez dixwînim pirtûkê.', 'Ez pirtûkê dixwînim.', 'Dixwînim ez pirtûkê.', 'Dixwînim pirtûkê ez.'],
      richtig: 1,
      erklaerung: 'Im Kurmancî steht das Verb am Ende des Satzes: Ez pirtûkê dixwînim — wörtlich „Ich das Buch lese“.',
    },
    {
      frage: 'Wie lautet die Grundform des Verbs „lesen“?',
      optionen: ['dixwînim', 'xwende', 'xwendî', 'xwendin'],
      richtig: 3,
      erklaerung: 'Die Grundform endet auf „-in“ oder „-n“, deshalb heißt „lesen“ xwendin.',
    },
  ],
  fragen: [
    {
      frage: 'Welcher Satz ist richtig: „Was machst du?“?',
      optionen: ['Tu çi dikî?', 'Çi tu dikî?', 'Tu dikî çi?', 'Tu çi dike?'],
      richtig: 0,
      erklaerung: 'Das Fragewort „çi“ steht dort, wo die Antwort stehen würde — vor dem Verb, das mit „tu“ die Endung „-î“ trägt: Tu çi dikî?',
    },
    {
      frage: 'Welcher Satz ist eine richtige Ja/Nein-Frage: „Kommst du?“?',
      optionen: ['Çi tu têyî?', 'Ma tu têyî?', 'Kengî tu têyî?', 'Ma tu tê?'],
      richtig: 1,
      erklaerung: 'Ja/Nein-Fragen leitet die vorangestellte Partikel „Ma“ ein, und das Verb behält die Endung der zweiten Person: Ma tu têyî?',
    },
  ],
  newroz: [
    {
      frage: 'Wie sagt man „im Frühling“ auf Kurmancî?',
      optionen: ['di bihar de', 'li biharê', 'di biharê de', 'biharê de'],
      richtig: 2,
      erklaerung: 'Zeiträume umschließt Kurmancî mit „di … de“, und das Wort dazwischen bekommt die gebeugte Endung: di biharê de.',
    },
    {
      frage: 'Welcher Satz ist richtig: „In der Newroz-Nacht zünden wir ein Feuer an“?',
      optionen: ['Em di şeva Newrozê de agir vêdixin.', 'Em di şeva Newrozê agir vêdixin.', 'Em li şeva Newrozê de agir vêdixin.', 'Em şeva Newrozê de agir vêdixin.'],
      richtig: 0,
      erklaerung: 'Der Zeitraum steht vollständig zwischen den beiden Teilen „di“ und „de“: di şeva Newrozê de.',
    },
  ],
  gaeste: [
    {
      frage: 'Was sagst du beim Anbieten zu einem einzelnen Gast: „Bitte, trink Tee“?',
      optionen: ['Kerem bikin, çayê vexwe.', 'Kerem bike, çayê vexwe.', 'Kerema bike, çayê vexwe.', 'Kerem bike, çayê vexwin.'],
      richtig: 1,
      erklaerung: 'Beim Anbieten an eine einzelne Person heißt es „kerem bike“ — „ji kerema xwe“ nutzt man dagegen nur, wenn man um etwas bittet.',
    },
    {
      frage: 'Wie lautet das „Bitte sehr“ des Gastgebers, wenn er mehrere Gäste hereinbittet?',
      optionen: ['Kerem bike', 'Ji kerema xwe', 'Kerema bikin', 'Kerem bikin'],
      richtig: 3,
      erklaerung: 'Zu mehreren Personen sagt man beim Anbieten „kerem bikin“ — die Mehrzahl erkennt man an der Endung „-in“.',
    },
  ],
  jahreszeiten: [
    {
      frage: 'Wie sagt man „Es schneit“ auf Kurmancî?',
      optionen: ['Berf bare.', 'Ew berf dibare.', 'Berf dibare.', 'Berf dibarin.'],
      richtig: 2,
      erklaerung: 'Der Niederschlag selbst ist das Subjekt — ein eigenes „es“ gibt es nicht, und „barîn“ steht mit „di-“ und der Endung „-e“: Berf dibare.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Baran … (Es regnet)?',
      optionen: ['dibare', 'bare', 'dibarim', 'dibarî'],
      richtig: 0,
      erklaerung: 'In der dritten Person Gegenwart bekommt „barîn“ die Vorsilbe „di-“ und die Endung „-e“: Baran dibare.',
    },
  ],
  gebirge: [
    {
      frage: 'Wie heißt „hohe Berge“ auf Kurmancî?',
      optionen: ['çiyaya bilind', 'çiyayên bilind', 'çiyayê bilind', 'bilind çiyayên'],
      richtig: 1,
      erklaerung: 'Folgt nach einem Wort in der Mehrzahl eine Beschreibung, verbindet die Plural-Ezafe „-ên“ beides: çiyayên bilind.',
    },
    {
      frage: 'Wie heißt „meine Brüder“ auf Kurmancî?',
      optionen: ['birayê min', 'biraya min', 'birayan min', 'birayên min'],
      richtig: 3,
      erklaerung: 'In der Mehrzahl verbindet die Ezafe „-ên“ das Nomen mit dem Besitzwort: birayên min.',
    },
  ],
  hochzeit: [
    {
      frage: 'Wie gratulierst du auf Kurmancî zum Newroz-Fest?',
      optionen: ['Newroz pîroz e!', 'Newroz pîroz be!', 'Pîroz Newroz be!', 'Newroz pîroz im!'],
      richtig: 1,
      erklaerung: 'Beim Gratulieren steht die Wunschform „be“ (möge es sein) nach „pîroz“: Newroz pîroz be!',
    },
    {
      frage: 'Welcher Satz heißt richtig „Wir tanzen Govend“?',
      optionen: ['Em govendê digirin.', 'Em govendê girin.', 'Ez govendê digirin.', 'Em digirin govendê.'],
      richtig: 0,
      erklaerung: 'Den Reihentanz „greift“ man mit „govend girtin“, in der Gegenwart mit „di-“ und der Wir-Endung „-in“ am Satzende: Em govendê digirin.',
    },
  ],
  handwerk: [
    {
      frage: 'Wie heißt der „Schmied“ auf Kurmancî (gebildet aus hesin = Eisen)?',
      optionen: ['hesinvan', 'karhesin', 'hesinkar', 'hesinxane'],
      richtig: 2,
      erklaerung: 'Die Endung „-kar“ hinter der Sache bezeichnet den Menschen, der damit arbeitet: hesin → hesinkar.',
    },
    {
      frage: 'Welches Wort bezeichnet nach dem Muster „hesin → hesinkar“ den Bauern (von cot = Pflug)?',
      optionen: ['cotkar', 'cotker', 'karcot', 'cotgeh'],
      richtig: 0,
      erklaerung: 'Nach dem Muster „Sache + -kar“ entsteht die Berufsbezeichnung: cot (Pflug) → cotkar (Bauer).',
    },
  ],
  meinung: [
    {
      frage: 'Welcher Satz heißt richtig „Ich denke, dass das richtig ist“?',
      optionen: ['Ez difikirim ku ev rast e.', 'Ez difikirim ev ku rast e.', 'Ez difikirim ji ev rast e.', 'Ez difikirim ku ev rast im.'],
      richtig: 0,
      erklaerung: 'Das Wörtchen „ku“ leitet wie das deutsche „dass“ den Nebensatz ein, und zu „ev“ gehört die Kopula „e“: Ez difikirim ku ev rast e.',
    },
    {
      frage: 'Womit beginnt eine Begründung („weil …“) auf Kurmancî?',
      optionen: ['çima ku …', 'ber ji ku …', 'ku ji ber …', 'ji ber ku …'],
      richtig: 3,
      erklaerung: '„Weil“ heißt „ji ber ku“: Çima? Ji ber ku ez kurdî hîn dibim.',
    },
  ],
  alltagssaetze: [
    {
      frage: 'Welcher Satz heißt richtig „Sprich bitte langsam“?',
      optionen: ['Ji kerema xwe hêdî diaxive.', 'Kerema ji xwe hêdî biaxive.', 'Ji kerema xwe hêdî biaxive.', 'Ji kerema te hêdî biaxive.'],
      richtig: 2,
      erklaerung: 'Die feste Bitte-Formel lautet „ji kerema xwe“ (wörtlich „von deiner Güte“), danach folgt der Imperativ mit „bi-“: biaxive.',
    },
    {
      frage: 'Wie sagst du „bitte“, wenn du um etwas bittest?',
      optionen: ['kerem bike', 'ji kerema xwe', 'bi kerema te', 'ji kerem xwe'],
      richtig: 1,
      erklaerung: 'Um etwas zu bitten nutzt man „ji kerema xwe“ — „kerem bike“ sagt dagegen der Gastgeber beim Anbieten.',
    },
  ],
  namefragen: [
    {
      frage: 'Wie fragst du auf Kurmancî „Wie heißt du?“',
      optionen: ['Nava te çi ye?', 'Navê te çi e?', 'Çi navê te ye?', 'Navê te çi ye?'],
      richtig: 3,
      erklaerung: '„nav“ ist männlich und nimmt die Ezafe „-ê“, und nach „çi“ steht die Kopula „ye“: Navê te çi ye?',
    },
    {
      frage: 'Wie antwortest du richtig: „Mein Name ist Aram“?',
      optionen: ['Navê min Aram e.', 'Nava min Aram e.', 'Navê min Aram im.', 'Navê ez Aram e.'],
      richtig: 0,
      erklaerung: 'In der Antwort ersetzt der Name nur das „çi“, das Besitzwort heißt „min“ und die dritte Person nimmt „e“: Navê min Aram e.',
    },
  ],
  herkunft: [
    {
      frage: 'Welche Form vervollständigt den Satz: Ez … Almanyayê me? (Ich komme aus Deutschland)',
      optionen: ['li', 'ji', 'bi', 'di'],
      richtig: 1,
      erklaerung: 'Die Herkunft nennt man mit „ji“ (aus/von): Ez ji Almanyayê me.',
    },
    {
      frage: 'Welcher Satz heißt richtig „Wir kommen aus Kurdistan“?',
      optionen: ['Em ji Kurdistan in.', 'Em li Kurdistanê ne.', 'Em ji Kurdistanê ne.', 'Em ji Kurdistanê me.'],
      richtig: 2,
      erklaerung: 'Nach „ji“ bekommt der Ort die gebeugte Endung „-ê“ (Kurdistanê), und zu „em“ gehört die Kopula „ne“.',
    },
  ],
  verabschieden: [
    {
      frage: 'Was sagt beim Abschied die Person, die geht?',
      optionen: ['Bi xatirê te!', 'Oxir be!', 'Bi xêr hatî!', 'Kerem bike!'],
      richtig: 0,
      erklaerung: 'Wer geht, sagt „Bi xatirê te“ (wörtlich „mit deiner Erlaubnis“) — „Oxir be“ antwortet dagegen, wer bleibt.',
    },
    {
      frage: 'Wie antwortet die Person, die bleibt, auf „Bi xatirê te!“?',
      optionen: ['Bi xatirê te!', 'Pîroz be!', 'Oxir be!', 'Bi xêr hatî!'],
      richtig: 2,
      erklaerung: '„Oxir be!“ (Leb wohl, gute Reise) ist die feste Antwort der Person, die zurückbleibt.',
    },
  ],
  verwandtschaft: [
    {
      frage: 'Welcher Satz heißt richtig „Ich habe zwei Onkel“?',
      optionen: ['Du apê min hene.', 'Du apên min heye.', 'Ez du apên min hene.', 'Du apên min hene.'],
      richtig: 3,
      erklaerung: 'Besitz in der Mehrzahl sagt man mit der Ezafe „-ên“ und „hene“: Du apên min hene — wörtlich „Zwei Onkel von mir existieren“.',
    },
    {
      frage: 'Welche Endung verbindet die Mehrzahl mit dem Besitzwort: du ap… min hene?',
      optionen: ['-ê', '-ên', '-a', '-ek'],
      richtig: 1,
      erklaerung: 'Vor dem Besitzwort steht bei der Mehrzahl immer die Ezafe „-ên“: du apên min, sê pismamên min.',
    },
  ],
  freundschaft: [
    {
      frage: 'Welcher Satz heißt richtig „Ich liebe dich“?',
      optionen: ['Ez ji te hez dikim.', 'Ez te hez dikim.', 'Ez ji tu hez dikim.', 'Ez ji te hez kim.'],
      richtig: 0,
      erklaerung: 'Bei „hez kirin“ steht die geliebte Person immer mit „ji“ und in der gebeugten Form „te“, das Verb trägt „di-“: Ez ji te hez dikim.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Ez … hevala xwe pir hez dikim?',
      optionen: ['li', 'bi', 'ji', 'di'],
      richtig: 2,
      erklaerung: 'Das „ji“ gehört fest zum Verb „ji … hez kirin“ und fällt nie weg: Ez ji hevala xwe pir hez dikim.',
    },
  ],
  gefuehle: [
    {
      frage: 'Wie sagst du auf Kurmancî „Ich habe Hunger“?',
      optionen: ['Ez birçî im.', 'Ez birçî me.', 'Min birçî heye.', 'Ez birçî dikim.'],
      richtig: 1,
      erklaerung: 'Kurmancî nutzt ein Zustandswort mit Kopula, und nach dem Selbstlaut von „birçî“ lautet sie „me“: Ez birçî me.',
    },
    {
      frage: 'Welche Form vervollständigt die Frage: Tu westiyayî …? (Bist du müde?)',
      optionen: ['ye', 'me', 'î', 'yî'],
      richtig: 3,
      erklaerung: 'Nach einem Selbstlaut heißt die Kopula der zweiten Person „yî“: Tu westiyayî yî?',
    },
  ],
  gespraech: [
    {
      frage: 'Welcher Satz heißt richtig „Kannst du langsamer sprechen?“',
      optionen: ['Tu dikarî hêdîtir diaxivî?', 'Tu dikarî hêdîtir biaxive?', 'Tu dikarî hêdîtir biaxivî?', 'Tu dikarî hêdîtir axaftin?'],
      richtig: 2,
      erklaerung: 'Nach „Tu dikarî“ steht das zweite Verb in der bi-Form mit der Du-Endung „-î“: biaxivî.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Tu dikarî dîsa …? (Kannst du es noch einmal sagen?)',
      optionen: ['bibêjî', 'dibêjî', 'bibêje', 'gotin'],
      richtig: 0,
      erklaerung: 'Das zweite Verb nach „dikarî“ bekommt „bi-“ statt „di-“ und die Personalendung „-î“: Tu dikarî dîsa bibêjî?',
    },
  ],
  digital: [
    {
      frage: 'Welcher Satz heißt richtig „Ich will eine Nachricht schicken“?',
      optionen: ['Ez dixwazim peyamekê bişînim.', 'Ez dixwazim peyamekê dişînim.', 'Ez dixwazim peyamekê bişîne.', 'Ez dixwazim peyamekê şandin.'],
      richtig: 0,
      erklaerung: 'Nach „Ez dixwazim“ steht das zweite Verb am Satzende in der bi-Form mit der Ich-Endung „-im“: bişînim.',
    },
    {
      frage: 'Welche Form vervollständigt die Frage: Tu dixwazî peyamekê …? (Möchtest du eine Nachricht schicken?)',
      optionen: ['bişînim', 'bişînî', 'dişînî', 'bişîne'],
      richtig: 1,
      erklaerung: 'Bei „tu“ passt sich die Endung der bi-Form an und lautet „-î“: Tu dixwazî peyamekê bişînî?',
    },
  ],
  sport: [
    {
      frage: 'Welcher Satz heißt richtig „Wir spielen Fußball“?',
      optionen: ['Em futbolê lîzin.', 'Em futbolê dilîze.', 'Em dilîzin futbolê.', 'Em futbolê dilîzin.'],
      richtig: 3,
      erklaerung: '„lîstin“ hat den Präsensstamm „lîz-“, der mit „di-“ und der Wir-Endung „-in“ am Satzende steht: Em futbolê dilîzin.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Zarok … topê dilîze? (Das Kind spielt mit dem Ball)',
      optionen: ['bi', 'ji', 'li', 'di'],
      richtig: 0,
      erklaerung: 'Womit man spielt, steht mit „bi“ (mit) vor dem Verb: Zarok bi topê dilîze.',
    },
  ],
  stadt: [
    {
      frage: 'Welcher Satz heißt richtig „Im Dorf gibt es keine Apotheke“?',
      optionen: ['Li gund dermanxane heye.', 'Li gund dermanxane tune.', 'Li gund tune dermanxane.', 'Li gund dermanxane ne heye.'],
      richtig: 1,
      erklaerung: '„Es gibt nicht“ drückt Kurmancî mit „tune“ am Satzende aus, ganz ohne „ne“ oder ein eigenes „es“: Li gund dermanxane tune.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Li bajêr parkek …? (In der Stadt gibt es einen Park)',
      optionen: ['hene', 'ye', 'heye', 'e'],
      richtig: 2,
      erklaerung: 'Für „es gibt“ in der Einzahl steht „heye“ am Satzende: Li bajêr parkek heye.',
    },
  ],
  einkaufen: [
    {
      frage: 'Wie fragst du auf dem Markt: „Wie viel kostet das?“',
      optionen: ['Ev bi çiqasî e?', 'Ev bi çiqasî ye?', 'Çend ev e?', 'Ev bi çiqasî in?'],
      richtig: 1,
      erklaerung: 'Nach „çiqasî“, das auf einen Selbstlaut endet, lautet die Kopula „ye“, deshalb heißt es „Ev bi çiqasî ye?“.',
    },
    {
      frage: 'Wie antwortest du auf „Ev çend e?“, wenn es fünf Euro kostet?',
      optionen: ['Euro pênc e.', 'Pênc euro me.', 'Pênc euro ye.', 'Ye pênc euro.'],
      richtig: 2,
      erklaerung: 'Der Preis steht vor der Kopula, die nach dem Selbstlaut von „euro“ „ye“ lautet: Pênc euro ye.',
    },
  ],
  arbeit: [
    {
      frage: 'Wie sagst du: „Ich arbeite als Lehrer“?',
      optionen: ['Ez wek mamoste dixebitim.', 'Ez mamoste wek dixebitim.', 'Ez wek mamoste xebitim.', 'Ez wek mamoste dixebite.'],
      richtig: 0,
      erklaerung: '„wek“ (als) steht vor der Berufsbezeichnung, und das Verb trägt die Gegenwartsvorsilbe „di-“ und die Ich-Endung „-im“: dixebitim.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Bijîşk li nexweşxaneyê …? (Der Arzt arbeitet im Krankenhaus.)',
      optionen: ['dixebitim', 'dixebite', 'xebite', 'dixebitin'],
      richtig: 1,
      erklaerung: 'In der dritten Person Einzahl heißt „arbeiten“ in der Gegenwart „dixebite“ — Vorsilbe „di-“ plus Endung „-e“.',
    },
  ],
  taetigkeiten: [
    {
      frage: 'Wie sagst du: „Jeden Morgen stehe ich früh auf“?',
      optionen: ['Her sibe ez zû radibin.', 'Sibe her ez zû radibim.', 'Her sibe ez zû rabûm.', 'Her sibe ez zû radibim.'],
      richtig: 3,
      erklaerung: 'Die Zeitangabe „her sibe“ steht am Satzanfang, danach folgt die Gegenwart mit der Ich-Endung „-im“: radibim.',
    },
    {
      frage: 'Wie heißt „jeden Tag“ auf Kurmancî?',
      optionen: ['her roj', 'roj her', 'roja her', 'her rojan'],
      richtig: 0,
      erklaerung: '„her“ (jede/jeder) steht unverändert vor dem Nomen in der Einzahl: her roj.',
    },
  ],
  wohnung: [
    {
      frage: 'Wie sagst du: „Die Lampe steht auf dem Tisch“?',
      optionen: ['Çira li ser mase ye.', 'Çira li ser maseyê ye.', 'Çira li bin maseyê ye.', 'Çira ser li maseyê ye.'],
      richtig: 1,
      erklaerung: '„auf“ heißt „li ser“, und „mase“ bekommt dahinter die gebeugte Endung „-yê“: li ser maseyê.',
    },
    {
      frage: 'Welche Wendung bedeutet „unter dem Stuhl“?',
      optionen: ['li ser kursiyê', 'li kêleka kursiyê', 'bin li kursiyê', 'li bin kursiyê'],
      richtig: 3,
      erklaerung: '„unter“ heißt „li bin“ — „li ser“ bedeutet dagegen „auf“ und „li kêleka“ „neben“.',
    },
  ],
  kueche: [
    {
      frage: 'Wie forderst du eine einzelne Person auf: „Öffne den Kühlschrank!“?',
      optionen: ['Sarincê biveke!', 'Sarincê veke!', 'Sarincê vekin!', 'Sarincê vekirin!'],
      richtig: 1,
      erklaerung: '„vekirin“ hat die feste Vorsilbe „ve-“ und bildet den Imperativ Einzahl ohne „bi-“, nur mit der Endung „-e“: veke!',
    },
    {
      frage: 'Du sprichst mehrere Personen an. Wie heißt „Bringt den Löffel!“?',
      optionen: ['Kevçî bîne!', 'Kevçî bînin!', 'Kevçî anîn!', 'Kevçî bînim!'],
      richtig: 1,
      erklaerung: 'Richtet sich ein Befehl an mehrere Menschen, endet der Imperativ auf „-in“: bînin!',
    },
  ],
  restaurant: [
    {
      frage: 'Wie bestellst du: „Ich möchte einen Tee“?',
      optionen: ['Ez çayekê dixwazî.', 'Ez çayekê xwazim.', 'Ez çayekê dixwazim.', 'Ez dixwazim çayekê.'],
      richtig: 2,
      erklaerung: 'Das Gewünschte steht vor dem Verb, das mit „di-“ und der Ich-Endung „-im“ gebildet wird: Ez çayekê dixwazim.',
    },
    {
      frage: 'Wie sagst du: „noch einen Tee“?',
      optionen: ['çayek din', 'din çayek', 'çay din', 'çayê din'],
      richtig: 0,
      erklaerung: 'Die Endung „-ek“ macht aus çay „ein Tee“, und „din“ (noch ein / weiterer) steht dahinter: çayek din.',
    },
  ],
  'zahlen-gross': [
    {
      frage: 'Wie heißt „einundzwanzig“ auf Kurmancî?',
      optionen: ['yek û bîst', 'bîst û yek', 'bîst yek', 'yekbîst'],
      richtig: 1,
      erklaerung: 'Anders als im Deutschen kommt zuerst der Zehner, verbunden mit „û“: bîst û yek — wörtlich „zwanzig und eins“.',
    },
    {
      frage: 'Wie sagst du „fünfundvierzig“?',
      optionen: ['çil û pênc', 'pênc û çil', 'çil pênc', 'pêncî û çar'],
      richtig: 0,
      erklaerung: 'Zuerst steht der Zehner „çil“ (vierzig), dann folgt mit „û“ der Einer: çil û pênc.',
    },
  ],
  notfall: [
    {
      frage: 'Wie rufst du mehrere Menschen auf: „Ruft die Polizei!“?',
      optionen: ['Gazî polîs bike!', 'Gazî polîs dikin!', 'Gazî polîs bikin!', 'Gazî polîs kirin!'],
      richtig: 2,
      erklaerung: '„Herbeirufen“ heißt „gazî … kirin“, und die Imperativ-Endung „-in“ richtet sich an mehrere Personen: Gazî polîs bikin!',
    },
    {
      frage: 'Wie sagst du zu einer einzelnen Person: „Ruf einen Arzt!“?',
      optionen: ['Gazî bijîşk bike!', 'Gazî bijîşk bikin!', 'Gazî bijîşk ke!', 'Gazî bijîşk dike!'],
      richtig: 0,
      erklaerung: 'Bei einer einzelnen Person bildet „kirin“ den Imperativ mit „bi-“ und der Endung „-e“: Gazî bijîşk bike!',
    },
  ],
  obst: [
    {
      frage: 'Wie sagst du: „ein Kilo Äpfel“?',
      optionen: ['sêv kîloyek', 'kîloyek sêv', 'kîlo sêvek', 'kîloyek sêvan'],
      richtig: 1,
      erklaerung: 'Die Mengenangabe mit „-ek“ steht vor der Ware, die selbst unverändert bleibt: kîloyek sêv.',
    },
    {
      frage: 'Wie sagst du: „etwas Trauben“?',
      optionen: ['hinek tirî', 'tirî hinek', 'hinek tiriyek', 'hineke tirî'],
      richtig: 0,
      erklaerung: 'Für unbestimmte Mengen steht „hinek“ unverändert vor der Ware: hinek tirî.',
    },
  ],
  gemuese: [
    {
      frage: 'Wie sagst du: „Am liebsten mag ich Gurken“?',
      optionen: ['Ez herî pir xiyaran hez dikim.', 'Ez herî pir ji xiyaran hez dikim.', 'Ez herî pir ji xiyaran hez kim.', 'Ez herî pir ji xiyaran hez dikin.'],
      richtig: 1,
      erklaerung: 'Bei „ji … hez kirin“ fällt das „ji“ nie weg, und „herî pir“ (am liebsten) steht davor: Ez herî pir ji xiyaran hez dikim.',
    },
    {
      frage: 'Welche Partikel vervollständigt den Satz: Ez … firingiyan hez dikim?',
      optionen: ['li', 'bi', 'ji', 'wek'],
      richtig: 2,
      erklaerung: 'Das Gemochte steht bei „hez kirin“ immer mit „ji“ davor: Ez ji firingiyan hez dikim.',
    },
  ],
  reisen: [
    {
      frage: 'Wie sagst du: „Ich fahre mit dem Bus zum Markt“?',
      optionen: ['Ez bi otobusê diçim bazarê.', 'Ez bi otobus diçim bazarê.', 'Ez li otobusê diçim bazarê.', 'Ez otobusê bi diçim bazarê.'],
      richtig: 0,
      erklaerung: '„mit“ heißt „bi“, und das weibliche Verkehrsmittel bekommt die gebeugte Endung „-ê“: bi otobusê.',
    },
    {
      frage: 'Welche Partikel vervollständigt den Satz: Em … balafirê diçin Almanyayê?',
      optionen: ['li', 'ji', 'wek', 'bi'],
      richtig: 3,
      erklaerung: 'Das Verkehrsmittel steht mit „bi“ (mit): Em bi balafirê diçin Almanyayê.',
    },
  ],
  verkehr: [
    {
      frage: 'Welche Form vervollständigt den Satz: Taksî … rawestgehê? (Das Taxi kommt zur Haltestelle.)',
      optionen: ['tên', 'tê', 'dihat', 'hatin'],
      richtig: 1,
      erklaerung: '„hatin“ (kommen) ist unregelmäßig — die dritte Person Einzahl der Gegenwart heißt „tê“: Taksî tê rawestgehê.',
    },
    {
      frage: 'Wie heißt: „Der Fahrer fährt zum Flughafen“?',
      optionen: ['Ajokar diçim balafirgehê.', 'Ajokar çe balafirgehê.', 'Ajokar diçin balafirgehê.', 'Ajokar diçe balafirgehê.'],
      richtig: 3,
      erklaerung: 'In der dritten Person Einzahl heißt „gehen/fahren“ „diçe“: Ajokar diçe balafirgehê.',
    },
  ],
  wegbeschreibung: [
    {
      frage: 'Du erklärst einer einzelnen Person den Weg. Wie lautet der Befehl: „Bieg links ab!“?',
      optionen: ['Zivire çepê!', 'Bizivire çepê!', 'Bizivirin çepê!', 'Bizivire çep!'],
      richtig: 1,
      erklaerung: 'Der Imperativ bekommt die Vorsilbe „bi-“ und die Endung „-e“, und die Richtung folgt in der gebeugten Form: Bizivire çepê!',
    },
    {
      frage: 'Wie forderst du eine einzelne Person auf: „Geh geradeaus!“?',
      optionen: ['Rasterast biçe!', 'Rasterast diçe!', 'Rasterast çe!', 'Rasterast biçin!'],
      richtig: 0,
      erklaerung: 'Der Befehl entsteht mit „bi-“ plus Stamm plus „-e“ — „diçe“ wäre dagegen die Aussageform „er/sie geht“.',
    },
  ],
  hotel: [
    {
      frage: 'Wie heißt „eine Nacht“ auf Kurmancî?',
      optionen: ['şeva', 'yek şev', 'şevek', 'şevyek'],
      richtig: 2,
      erklaerung: 'Das unbestimmte „ein/eine“ hängt sich als Endung „-ek“ direkt ans Wort: şev → şevek.',
    },
    {
      frage: 'Wie sagst du: „ein freies Zimmer“?',
      optionen: ['odeyekî vala', 'odeya vala', 'vala odeyek', 'odeyeke vala'],
      richtig: 3,
      erklaerung: 'Folgt ein Adjektiv, bekommt die unbestimmte Endung noch ein „-e“: odeyeke vala.',
    },
  ],
  orientierung: [
    {
      frage: 'Wie fragst du auf Kurmancî: „Wo ist der Markt?“',
      optionen: ['Bazar li ku e?', 'Bazar li ku ye?', 'Li ku bazar e?', 'Bazar ku li ye?'],
      richtig: 1,
      erklaerung: 'Nach „ku“ steht die Kopula „ye“, weil das Wort auf einen Selbstlaut endet, und das Erfragte steht am Satzanfang: Bazar li ku ye?',
    },
    {
      frage: 'Welche Antwort auf „Otêl li ku ye?“ bedeutet „Es ist dort“?',
      optionen: ['Ew li vir e.', 'Ew li wir ye.', 'Ew li wir e.', 'Wir li ew e.'],
      richtig: 2,
      erklaerung: '„li wir“ heißt „dort“ (li vir dagegen „hier“), und nach dem Mitlaut „r“ steht die Kopula „e“: Ew li wir e.',
    },
  ],
  natur: [
    {
      frage: 'Welcher Satz ist richtig: „Der Berg ist sehr hoch“?',
      optionen: ['Çiya gelek bilind e.', 'Gelek çiya bilind e.', 'Çiya bilind gelek e.', 'Çiya gelek bilind in.'],
      richtig: 0,
      erklaerung: '„gelek“ (sehr) steht vor dem Adjektiv, und beim Einzahl-Subjekt schließt die Kopula „e“ den Satz: Çiya gelek bilind e.',
    },
    {
      frage: 'Wie sagt man „viele Sterne“ auf Kurmancî?',
      optionen: ['stêrk gelek', 'stêrkên gelek', 'stêrka gelek', 'gelek stêrk'],
      richtig: 3,
      erklaerung: 'Vor einem Nomen bedeutet „gelek“ „viele“ und steht ohne jede Endung direkt davor: gelek stêrk.',
    },
  ],
  tiere: [
    {
      frage: 'Welcher Satz ist richtig: „Der Hirte sieht die Schafe“?',
      optionen: ['Şivan mî dibîne.', 'Şivan miyan dibîne.', 'Şivan miyên dibîne.', 'Şivan dibîne miyan.'],
      richtig: 1,
      erklaerung: 'Die Mehrzahl als Objekt bekommt die Endung „-an“ (mî → miyan), und das Verb steht am Satzende: Şivan miyan dibîne.',
    },
    {
      frage: 'Wie heißt es richtig: „Ich sehe zwei Ziegen“?',
      optionen: ['Ez du bizinên dibînim.', 'Ez du bizin dibînim.', 'Ez bizinan du dibînim.', 'Ez du bizinan dibînim.'],
      richtig: 3,
      erklaerung: 'Als Objekt bekommt die Mehrzahl auch nach einer Zahl die Endung „-an“: Ez du bizinan dibînim.',
    },
  ],
  koerper: [
    {
      frage: 'Wie sagst du „Mein Kopf tut weh“ auf Kurmancî?',
      optionen: ['Serê min diêşe.', 'Ser min diêşe.', 'Serê min êşe.', 'Min serê diêşe.'],
      richtig: 0,
      erklaerung: 'Der Körperteil ist das Subjekt mit Ezafe („serê min“), und das Verb trägt die Gegenwarts-Vorsilbe „di-“: Serê min diêşe.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Diranê min jî …?',
      optionen: ['êşe', 'diêşim', 'diêşe', 'diêşin'],
      richtig: 2,
      erklaerung: '„diran“ ist ein Einzahl-Subjekt in der dritten Person, darum heißt die Gegenwartsform mit „di-“: diêşe.',
    },
  ],
  gesundheit: [
    {
      frage: 'Welcher Satz ist richtig: „Ich muss zum Arzt gehen“?',
      optionen: ['Divê ez diçim cem bijîşk.', 'Divê ez biçim cem bijîşk.', 'Divê ez çim cem bijîşk.', 'Divê ez biçe cem bijîşk.'],
      richtig: 1,
      erklaerung: 'Nach „divê“ bekommt das Verb die Vorsilbe „bi-“ statt „di-“ und die Endung der ersten Person: Divê ez biçim.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Divê tu derman …?',
      optionen: ['dixwî', 'bixwim', 'xwî', 'bixwî'],
      richtig: 3,
      erklaerung: 'Nach „divê“ steht „bi-“ statt „di-“, und bei „tu“ endet das Verb auf „-î“: Divê tu derman bixwî.',
    },
  ],
  musik: [
    {
      frage: 'Welcher Satz ist richtig: „Azad spielt Tembûr“?',
      optionen: ['Azad li tembûrê dilîze.', 'Azad tembûrê dixe.', 'Azad li tembûrê dixe.', 'Azad li tembûr dixe.'],
      richtig: 2,
      erklaerung: 'Ein Instrument spielt man mit „li … dixe“ („darauf schlagen“), und das Instrument bekommt die gebeugte Endung „-ê“: Azad li tembûrê dixe.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Ez li daholê …? (Ich spiele Trommel.)',
      optionen: ['dixim', 'dixe', 'xim', 'dilîzim'],
      richtig: 0,
      erklaerung: 'Bei „ez“ endet das Verb auf „-im“ und behält die Gegenwarts-Vorsilbe „di-“: Ez li daholê dixim.',
    },
  ],
  dengbej: [
    {
      frage: 'Welcher Satz steht richtig in der einfachen Vergangenheit: „Der Dengbêj sang eine Kilam“?',
      optionen: ['Dengbêj kilamek digot.', 'Dengbêj kilamek gotim.', 'Dengbêj got kilamek.', 'Dengbêj kilamek got.'],
      richtig: 3,
      erklaerung: 'Die einfache Vergangenheit bildet Kurmancî ohne „di-“ direkt aus dem Vergangenheitsstamm, in der dritten Person ohne Endung: got.',
    },
    {
      frage: 'Wie heißt „ich ging“ auf Kurmancî?',
      optionen: ['ez çû', 'ez çûm', 'ez çûyî', 'ez diçim'],
      richtig: 1,
      erklaerung: 'An den Vergangenheitsstamm „çû“ hängt sich die Endung der ersten Person „-m“: ez çûm.',
    },
  ],
  redewendungen: [
    {
      frage: 'Welche Redewendung bedeutet „Geduld zahlt sich aus“ — wörtlich „Tropfen für Tropfen entsteht ein See“?',
      optionen: ['Dest destê dişo.', 'Dilop bi dilop, gol çêdibe.', 'Jiyan wisa ye.', 'Bira bira ye, bazar cuda ye.'],
      richtig: 1,
      erklaerung: '„Dilop bi dilop, gol çêdibe“ heißt wörtlich „Tropfen für Tropfen entsteht ein See“ — das Bild dahinter steht für Geduld.',
    },
    {
      frage: 'Wie lautet die Redewendung „Hand wäscht Hand“ richtig?',
      optionen: ['Dest destê şo.', 'Dest dest dişo.', 'Dest destê dişo.', 'Dişo dest destê.'],
      richtig: 2,
      erklaerung: 'Das Objekt trägt die gebeugte Endung („destê“), und das Verb mit „di-“ steht am Satzende: Dest destê dişo.',
    },
  ],
  geschichten: [
    {
      frage: 'Wie beginnt das Märchen richtig: „Es war einmal ein König“?',
      optionen: ['Carekê padîşahek heye.', 'Carekê padîşahek hebû.', 'Carekê padîşahek hebe.', 'Carekê padîşahek hebûn.'],
      richtig: 1,
      erklaerung: '„hebû“ ist die Vergangenheit von „heye“, steht bei einem König in der Einzahl und am Satzende: Carekê padîşahek hebû.',
    },
    {
      frage: 'Welche Form ist die Vergangenheit von „hene“ (es gibt, Mehrzahl)?',
      optionen: ['hebûn', 'hebû', 'heye', 'hene'],
      richtig: 0,
      erklaerung: 'In der Mehrzahl heißt die Vergangenheit von „heye/hene“ „hebûn“ — „hebû“ ist die Einzahl.',
    },
  ],
  schule: [
    {
      frage: 'Welcher Satz ist richtig: „Ich lerne Kurdisch“?',
      optionen: ['Ez kurdî hîn dikim.', 'Ez kurdî hîn dibim.', 'Ez kurdî hîn bibim.', 'Ez hîn dibim kurdî.'],
      richtig: 1,
      erklaerung: '„lernen“ heißt „hîn bûn“ — in der Gegenwart „hîn dibim“ (mit „bûn“, nicht mit „kirin“), und das Verb steht am Satzende.',
    },
    {
      frage: 'Welche Form vervollständigt den Satz: Xwendekar li zanîngehê …? (Die Studentin studiert an der Universität.)',
      optionen: ['dixwînim', 'xwîne', 'dixwînin', 'dixwîne'],
      richtig: 3,
      erklaerung: '„studieren“ drückt Kurmancî mit „xwendin“ aus; in der dritten Person Einzahl heißt die Gegenwartsform „dixwîne“.',
    },
  ],
  saetze: [
    {
      frage: 'Welcher Satz ist richtig: „Ich möchte Kurdisch lernen“?',
      optionen: ['Ez dixwazim kurdî hîn dibim.', 'Ez dixwazim kurdî hîn bibim.', 'Ez dixwazim kurdî hîn bûn.', 'Ez dixwazim kurdî hîn bibe.'],
      richtig: 1,
      erklaerung: 'Nach „Ez dixwazim“ steht das zweite Verb in der bi-Form mit der Endung der ersten Person: hîn bibim.',
    },
    {
      frage: 'Wie heißt richtig: „Ich möchte nach Kurdistan gehen“?',
      optionen: ['Ez dixwazim biçim Kurdistanê.', 'Ez dixwazim diçim Kurdistanê.', 'Ez dixwazim çûn Kurdistanê.', 'Ez dixwazim biçî Kurdistanê.'],
      richtig: 0,
      erklaerung: 'Nach „dixwazim“ tritt „bi-“ statt „di-“ vor den Verbstamm, die Personalendung „-im“ bleibt: biçim.',
    },
  ],
  wochentage: [
    {
      frage: 'Wie heißt „am Montag“ auf Kurmancî?',
      optionen: ['roj duşem', 'rojê duşema', 'roja duşemê', 'duşema rojê'],
      richtig: 2,
      erklaerung: '„roj“ bekommt die Ezafe „-a“ und der Wochentag die gebeugte Endung „-ê“: roja duşemê — wörtlich „der Tag des Montags“.',
    },
    {
      frage: 'Welcher Satz ist richtig: „Am Freitag haben wir ein Treffen“?',
      optionen: ['Roja înê hevdîtina me heye.', 'Roja în hevdîtina me heye.', 'Rojê îna hevdîtina me heye.', 'Roja înê hevdîtina me hene.'],
      richtig: 0,
      erklaerung: 'Der Wochentag steht als „roja înê“ mit Ezafe „-a“ und Endung „-ê“, und bei einem Treffen (Einzahl) heißt es „heye“.',
    },
  ],
  wetter: [
    {
      frage: 'Wie fragst du richtig nach dem Wetter?',
      optionen: ['Hewa çawa e?', 'Hewa çawa ye?', 'Çawa hewa ye?', 'Hewa ye çawa?'],
      richtig: 1,
      erklaerung: 'Nach „çawa“ steht die Kopula „ye“, weil das Wort auf einen Selbstlaut endet: Hewa çawa ye?',
    },
    {
      frage: 'Welche Antwort bedeutet „Es ist warm“?',
      optionen: ['Hewa germ ye.', 'Germ hewa e.', 'Hewa e germ.', 'Hewa germ e.'],
      richtig: 3,
      erklaerung: '„germ“ endet auf einen Mitlaut, deshalb steht am Satzende die Kopula „e“: Hewa germ e.',
    },
  ],
  kleidung: [
    {
      frage: 'Welcher Satz ist richtig: „Ich ziehe mein Hemd an“?',
      optionen: ['Ez kirasê min li xwe dikim.', 'Ez kirasê xwe li xwe dikim.', 'Ez kirasê xwe dikim.', 'Ez kirasê xwe li xwe kirin.'],
      richtig: 1,
      erklaerung: '„anziehen“ heißt „li xwe kirin“, und für den eigenen Besitz steht das Rückbezugswort „xwe“ statt „min“: Ez kirasê xwe li xwe dikim.',
    },
    {
      frage: 'Wie heißt „anziehen“ (wörtlich „an sich machen“) auf Kurmancî?',
      optionen: ['xwe kirin', 'li xwe bûn', 'li xwe kirin', 'li min kirin'],
      richtig: 2,
      erklaerung: '„anziehen“ setzt sich aus „li“ und dem Rückbezugswort „xwe“ mit dem Verb „kirin“ zusammen: li xwe kirin.',
    },
  ],
}
