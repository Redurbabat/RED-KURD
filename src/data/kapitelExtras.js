// Beispielsätze und Grammatik-Notizen für bestehende Kapitel.
// Deutsch ist die Erklärsprache: der deutsche Satz steht zuerst, Kurmancî
// darunter; jede Grammatik-Notiz erklärt eine einzige Sache in zwei, drei
// Sätzen und schließt mit einem Beispiel.
// Neue Kapitel (Welt 10) tragen ihre Sätze direkt in kurseVertiefung.js.
export const kapitelExtras = {
  begruessung: {
    saetze: [
      { de: 'Guten Morgen! Wie geht es dir?', ku: 'Sibe baş! Tu çawa yî?' },
      { de: 'Mir geht es gut, danke.', ku: 'Ez baş im, spas.' },
      { de: 'Auf Wiedersehen!', ku: 'Bi xatirê te!' },
    ],
    grammatik: {
      titel: 'Du und ihr: „tu“ und „hûn“',
      text:
        'Kurmancî unterscheidet „tu“ (du) und „hûn“ (ihr). Mit „hûn“ spricht man auch eine einzelne Person besonders höflich an. Die Frageform passt sich an: Tu çawa yî? — Hûn çawa ne?',
      beispiel: { ku: 'Hûn çawa ne?', de: 'Wie geht es Ihnen / euch?' },
    },
  },
  vorstellen: {
    saetze: [
      { de: 'Ich heiße Azad.', ku: 'Navê min Azad e.' },
      { de: 'Ich komme aus Deutschland.', ku: 'Ez ji Almanyayê me.' },
      { de: 'Ich bin Lehrerin.', ku: 'Ez mamoste me.' },
    ],
    grammatik: {
      titel: '„Ich bin …“ — im, me, e',
      text:
        'Das deutsche „bin/ist“ hängt sich in Kurmancî ans Wortende: nach einem Mitlaut „im“ (Ez Azad im), nach einem Selbstlaut „me“ (Ez mamoste me). In der dritten Person steht „e“: Ev Azad e.',
      beispiel: { ku: 'Ez mamoste me.', de: 'Ich bin Lehrer / Lehrerin.' },
    },
  },
  familie: {
    saetze: [
      { de: 'Das ist meine Mutter.', ku: 'Ev dayika min e.' },
      { de: 'Meine Familie lebt im Dorf.', ku: 'Malbata min li gund dijî.' },
      { de: 'Ich habe zwei Brüder.', ku: 'Du birayên min hene.' },
    ],
    grammatik: {
      titel: 'Mein und dein: die Ezafe',
      text:
        '„Meine Mutter“ heißt „dayika min“ — das Besitzwort steht hinter dem Nomen, verbunden mit einer Endung: weibliche Wörter nehmen „-a“ (dayika min), männliche „-ê“ (bavê min).',
      beispiel: { ku: 'bavê min · dayika min', de: 'mein Vater · meine Mutter' },
    },
  },
  zahlen: {
    saetze: [
      { de: 'Zwei Tee, bitte.', ku: 'Du çay, ji kerema xwe.' },
      { de: 'Es gibt drei Äpfel.', ku: 'Sê sêv hene.' },
    ],
    grammatik: {
      titel: 'Zahl vor dem Wort',
      text:
        'Die Zahl steht wie im Deutschen vor dem Nomen: du bira (zwei Brüder), sê sêv (drei Äpfel). „Es gibt“ drückt Kurmancî mit „heye“ (Einzahl) und „hene“ (Mehrzahl) aus.',
      beispiel: { ku: 'Sê sêv hene.', de: 'Es gibt drei Äpfel.' },
    },
  },
  essen: {
    saetze: [
      { de: 'Ich esse Brot.', ku: 'Ez nan dixwim.' },
      { de: 'Wir trinken Tee.', ku: 'Em çayê vedixwin.' },
      { de: 'Das Essen ist lecker.', ku: 'Xwarin xweş e.' },
    ],
    grammatik: {
      titel: 'Gegenwart mit „di-“',
      text:
        'Die Gegenwart baut Kurmancî mit der Vorsilbe „di-“ und einer persönlichen Endung: di + xw + im → dixwim (ich esse). Das Verb steht am Satzende: Ez nan dixwim.',
      beispiel: { ku: 'Ez nan dixwim.', de: 'Ich esse Brot.' },
    },
  },
  zeit: {
    saetze: [
      { de: 'Heute ist das Wetter schön.', ku: 'Îro hewa xweş e.' },
      { de: 'Morgen gehe ich zur Schule.', ku: 'Sibê ez diçim dibistanê.' },
      { de: 'Gestern war ich zu Hause.', ku: 'Duh ez li malê bûm.' },
    ],
    grammatik: {
      titel: 'Îro, sibê, duh — Zeit zuerst',
      text:
        'Zeitwörter wie îro (heute), sibê (morgen) und duh (gestern) stehen meist am Satzanfang. Achtung: „sibê“ heißt morgen, „sibe“ der Morgen — der Unterschied liegt im Zirkumflex.',
      beispiel: { ku: 'Îro hewa xweş e.', de: 'Heute ist das Wetter schön.' },
    },
  },
  zuhause: {
    saetze: [
      { de: 'Ich bin zu Hause.', ku: 'Ez li malê me.' },
      { de: 'Das Haus ist groß.', ku: 'Mal mezin e.' },
      { de: 'Wir wohnen in der Stadt.', ku: 'Em li bajêr dijîn.' },
    ],
    grammatik: {
      titel: 'Orte mit „li“',
      text:
        '„li“ zeigt an, wo etwas ist: li malê (zu Hause), li bajêr (in der Stadt), li gund (im Dorf). Das Wort dahinter bekommt oft eine gebeugte Endung: mal → malê.',
      beispiel: { ku: 'Ez li malê me.', de: 'Ich bin zu Hause.' },
    },
  },
  farben: {
    saetze: [
      { de: 'Die Blume ist rot.', ku: 'Gul sor e.' },
      { de: 'Ich mag die Farbe Grün.', ku: 'Ez ji rengê kesk hez dikim.' },
      { de: 'Der Schnee ist weiß.', ku: 'Berf spî ye.' },
    ],
    grammatik: {
      titel: 'Die Eigenschaft folgt dem Wort',
      text:
        'Beschreibt ein Wort ein anderes, steht es dahinter — wieder mit Ezafe: gula sor (die rote Blume), kirasê spî (das weiße Hemd). Nach Selbstlauten wird „e“ zu „ye“: Berf spî ye.',
      beispiel: { ku: 'gula sor', de: 'die rote Blume' },
    },
  },
  verben: {
    saetze: [
      { de: 'Ich lese das Buch.', ku: 'Ez pirtûkê dixwînim.' },
      { de: 'Wir gehen in die Stadt.', ku: 'Em diçin bajêr.' },
      { de: 'Sie schreibt einen Brief.', ku: 'Ew nameyekê dinivîse.' },
    ],
    grammatik: {
      titel: 'Das Verb steht am Ende',
      text:
        'Im Kurmancî steht das Verb häufig am Ende des Satzes: Ez pirtûkê dixwînim — wörtlich „Ich das Buch lese“. Die Grundform endet auf -in oder -n: xwendin (lesen), çûn (gehen), kirin (machen).',
      beispiel: { ku: 'Ez pirtûkê dixwînim.', de: 'Ich lese das Buch.' },
    },
  },
  fragen: {
    saetze: [
      { de: 'Woher kommst du?', ku: 'Tu ji ku têyî?' },
      { de: 'Was machst du?', ku: 'Tu çi dikî?' },
      { de: 'Wann kommt der Bus?', ku: 'Otobus kengî tê?' },
    ],
    grammatik: {
      titel: 'Fragewörter mitten im Satz',
      text:
        'çi (was), kî (wer), ku (wo/woher), kengî (wann), çima (warum), çawa (wie) — das Fragewort steht dort, wo die Antwort stehen würde: Tu çi dikî? Ja/Nein-Fragen erkennt man allein an der Stimme oder am vorangestellten „Ma“: Ma tu têyî?',
      beispiel: { ku: 'Tu ji ku têyî?', de: 'Woher kommst du?' },
    },
  },
  newroz: {
    saetze: [
      { de: 'Frohes Newroz!', ku: 'Newroz pîroz be!' },
      { de: 'In der Newroz-Nacht zünden wir ein Feuer an.', ku: 'Em di şeva Newrozê de agir vêdixin.' },
    ],
    grammatik: {
      titel: 'In der Nacht, im Frühling: „di … de“',
      text:
        'Zeiträume umschließt Kurmancî mit „di … de“: di şeva Newrozê de (in der Newroz-Nacht), di biharê de (im Frühling). Das Wort dazwischen bekommt die gebeugte Endung.',
      beispiel: { ku: 'di biharê de', de: 'im Frühling' },
    },
  },
  gaeste: {
    saetze: [
      { de: 'Herzlich willkommen!', ku: 'Bi xêr hatî!' },
      { de: 'Möchtest du Tee?', ku: 'Tu çayê dixwazî?' },
      { de: 'Bitte, setz dich.', ku: 'Kerem bike, rûne.' },
    ],
    grammatik: {
      titel: '„Kerem bike“ — das Bitte des Gastgebers',
      text:
        'Beim Anbieten und Hereinbitten sagt man „kerem bike“ (zu mehreren: „kerem bikin“). Es bedeutet so viel wie „bitte sehr, nur zu“. Für Bitten um etwas nutzt man dagegen „ji kerema xwe“.',
      beispiel: { ku: 'Kerem bike, çayê vexwe.', de: 'Bitte, trink Tee.' },
    },
  },
  namefragen: {
    saetze: [
      { de: 'Wie heißt du?', ku: 'Navê te çi ye?' },
      { de: 'Mein Name ist Aram, und du?', ku: 'Navê min Aram e, û tu?' },
      { de: 'Das ist mein Freund.', ku: 'Ev hevalê min e.' },
    ],
    grammatik: {
      titel: 'Nach dem Namen fragen: „Navê te çi ye?“',
      text:
        '„nav“ (Name) ist männlich und verbindet sich mit „-ê“: navê min, navê te, navê wî/wê. Die Frage lautet: Navê te çi ye? — wörtlich „Name-dein was ist?“. In der Antwort ersetzt du nur das „çi“ durch den Namen: Navê min Aram e.',
      beispiel: { ku: 'Navê wê çi ye? — Navê wê Rojîn e.', de: 'Wie heißt sie? — Ihr Name ist Rojîn.' },
    },
  },
  herkunft: {
    saetze: [
      { de: 'Woher kommst du?', ku: 'Tu ji ku derê yî?' },
      { de: 'Ich komme aus Deutschland.', ku: 'Ez ji Almanyayê me.' },
      { de: 'Ich spreche ein wenig Kurmancî.', ku: 'Ez hinekî bi kurmancî diaxivim.' },
    ],
    grammatik: {
      titel: 'Herkunft mit „ji“',
      text:
        '„ji“ bedeutet „aus / von“ und nennt die Herkunft: Ez ji Almanyayê me (Ich komme aus Deutschland). Der Ort bekommt dabei eine gebeugte Endung: Almanya → Almanyayê, Kurdistan → Kurdistanê. Nach der Herkunft fragst du mit: Tu ji ku derê yî?',
      beispiel: { ku: 'Em ji Kurdistanê ne.', de: 'Wir kommen aus Kurdistan.' },
    },
  },
  verabschieden: {
    saetze: [
      { de: 'Ich muss gehen. Tschüss!', ku: 'Divê ez herim. Bi xatirê te!' },
      { de: 'Bis morgen! Schlaf gut!', ku: 'Heta sibê! Xewa te xweş!' },
      { de: 'Gute Reise und danke für alles!', ku: 'Rêya te xweş û ji bo her tiştî spas!' },
    ],
    grammatik: {
      titel: 'Wer geht, wer bleibt: „Bi xatirê te“ und „Oxir be“',
      text:
        'Beim Abschied sagt die Person, die geht: „Bi xatirê te“ — wörtlich „mit deiner Erlaubnis“. Wer bleibt, antwortet: „Oxir be!“ (Leb wohl, gute Reise). Am Abend wünschst du zusätzlich „Şev baş“ (gute Nacht) oder „Xewa te xweş“ (schlaf gut).',
      beispiel: { ku: 'Bi xatirê te! — Oxir be!', de: 'Tschüss! (wer geht) — Leb wohl! (wer bleibt)' },
    },
  },
  verwandtschaft: {
    saetze: [
      { de: 'Meine Großmutter wohnt im Dorf.', ku: 'Dapîra min li gund dijî.' },
      { de: 'Ich habe zwei Onkel.', ku: 'Du apên min hene.' },
      { de: 'Das sind meine Verwandten.', ku: 'Ev merivên min in.' },
    ],
    grammatik: {
      titel: 'Ich habe zwei …: „Du apên min hene“',
      text:
        'Besitzt du mehrere Personen oder Dinge, sagst du es mit „hene“: Du apên min hene — wörtlich „Zwei Onkel von mir existieren“, also „Ich habe zwei Onkel“. Vor dem Besitzwort steht dabei immer die Mehrzahl-Endung „-ên“: du apên min, sê pismamên min.',
      beispiel: { ku: 'Du apên min hene.', de: 'Ich habe zwei Onkel.' },
    },
  },
  freundschaft: {
    saetze: [
      { de: 'Ich mag meine Freundin sehr.', ku: 'Ez ji hevala xwe pir hez dikim.' },
      { de: 'Der Nachbar hilft dem Gast.', ku: 'Cîran alîkariya mêvan dike.' },
      { de: 'Wir reden zusammen.', ku: 'Em bi hev re sohbet dikin.' },
    ],
    grammatik: {
      titel: 'Mögen und lieben: „ji … hez kirin“',
      text:
        '„mögen / lieben“ heißt „hez kirin“, und wen oder was du magst, steht mit „ji“ davor: Ez ji hevala xwe hez dikim (Ich mag meine Freundin). Das „ji“ gehört fest zum Verb und fällt nie weg: Ez ji te hez dikim (Ich liebe dich).',
      beispiel: { ku: 'Ez ji te hez dikim.', de: 'Ich liebe dich. / Ich mag dich.' },
    },
  },
  gefuehle: {
    saetze: [
      { de: 'Ich bin hungrig und durstig.', ku: 'Ez birçî û tî me.' },
      { de: 'Bist du müde?', ku: 'Tu westiyayî yî?' },
      { de: 'Heute bin ich glücklich.', ku: 'Îro ez kêfxweş im.' },
    ],
    grammatik: {
      titel: '„Ez birçî me“ — Zustände mit der Kopula',
      text:
        'Wo das Deutsche „Ich habe Hunger“ sagt, nutzt Kurmancî ein Zustandswort mit Kopula: Ez birçî me (ich bin hungrig), Ez tî me (ich bin durstig). Weil diese Wörter auf einen Selbstlaut enden, heißt es „me / yî / ye“: Tu westiyayî yî? (Bist du müde?)',
      beispiel: { ku: 'Ez birçî me.', de: 'Ich habe Hunger. / Ich bin hungrig.' },
    },
  },
  gespraech: {
    saetze: [
      { de: 'Kannst du es noch einmal sagen?', ku: 'Tu dikarî dîsa bibêjî?' },
      { de: 'Kannst du langsamer sprechen?', ku: 'Tu dikarî hêdîtir biaxivî?' },
      { de: 'Ich verstehe, danke.', ku: 'Ez fêm dikim, spas.' },
    ],
    grammatik: {
      titel: 'Höflich bitten: „Tu dikarî …?“',
      text:
        '„können“ heißt „karîn“: Tu dikarî (du kannst). Das zweite Verb steht am Satzende in der bi-Form mit Personalendung: Tu dikarî hêdîtir biaxivî? (Kannst du langsamer sprechen?). So bittest du höflich um etwas.',
      beispiel: { ku: 'Tu dikarî dîsa bibêjî?', de: 'Kannst du es noch einmal sagen?' },
    },
  },
  digital: {
    saetze: [
      { de: 'Ich will eine Nachricht schicken.', ku: 'Ez dixwazim peyamekê bişînim.' },
      { de: 'Ich will das Telefon aufladen.', ku: 'Ez dixwazim telefonê şarj bikim.' },
      { de: 'Ich öffne den Computer.', ku: 'Ez kompûterê vedikim.' },
    ],
    grammatik: {
      titel: 'Wollen: „Ez dixwazim … bişînim“',
      text:
        '„wollen“ heißt „xwestin“: Ez dixwazim (ich will). Das zweite Verb folgt am Satzende in der bi-Form mit Personalendung: Ez dixwazim peyamekê bişînim (Ich will eine Nachricht schicken). Bei „du“ passt sich die Endung an: Tu dixwazî peyamekê bişînî?',
      beispiel: { ku: 'Ez dixwazim peyamekê bişînim.', de: 'Ich will eine Nachricht schicken.' },
    },
  },
  sport: {
    saetze: [
      { de: 'Wir spielen Fußball.', ku: 'Em futbolê dilîzin.' },
      { de: 'Das Kind spielt mit dem Ball.', ku: 'Zarok bi topê dilîze.' },
      { de: 'Er läuft schnell.', ku: 'Ew bi lez baz dide.' },
    ],
    grammatik: {
      titel: 'Spielen: „lîstin“ und „bi topê lîstin“',
      text:
        '„lîstin“ (spielen) hat den Präsensstamm „lîz-“: Em futbolê dilîzin (Wir spielen Fußball). Womit man spielt, steht mit „bi“ davor: Zarok bi topê dilîze (Das Kind spielt mit dem Ball).',
      beispiel: { ku: 'Zarok bi topê dilîze.', de: 'Das Kind spielt mit dem Ball.' },
    },
  },
  stadt: {
    saetze: [
      { de: 'In der Stadt gibt es einen Park.', ku: 'Li bajêr parkek heye.' },
      { de: 'Im Dorf gibt es keine Apotheke.', ku: 'Li gund dermanxane tune.' },
      { de: 'Wir trinken Tee im Teehaus.', ku: 'Em li çayxaneyê çayê vedixwin.' },
    ],
    grammatik: {
      titel: 'Es gibt, es gibt nicht: „heye“ und „tune“',
      text:
        '„Heye“ sagt, dass etwas da ist: Li bajêr parkek heye — In der Stadt gibt es einen Park. Das Gegenteil ist „tune“: Li gund banke tune — Im Dorf gibt es keine Bank. Beide stehen am Satzende, ganz ohne ein eigenes „es“.',
      beispiel: { ku: 'Li vir çayxane tune.', de: 'Hier gibt es kein Teehaus.' },
    },
  },
  einkaufen: {
    saetze: [
      { de: 'Wie viel kostet das?', ku: 'Ev bi çiqasî ye?' },
      { de: 'Die Eier sind billig.', ku: 'Hêk erzan in.' },
      { de: 'Ich kaufe Gemüse im Laden.', ku: 'Ez li dikanê sewzeyan dikirim.' },
    ],
    grammatik: {
      titel: 'Nach dem Preis fragen',
      text:
        'Auf dem Markt fragst du „Ev çend e?“ oder „Ev bi çiqasî ye?“ — beides heißt „Wie viel kostet das?“. Die Antwort nennt den Preis vor der Kopula: Pênc euro ye. Ist es zu teuer, sag: Pir biha ye!',
      beispiel: { ku: 'Ev çend e? — Pênc euro ye.', de: 'Wie viel kostet das? — Es kostet fünf Euro.' },
    },
  },
  arbeit: {
    saetze: [
      { de: 'Ich arbeite als Lehrer.', ku: 'Ez wek mamoste dixebitim.' },
      { de: 'Mein Vater ist Bauer.', ku: 'Bavê min cotkar e.' },
      { de: 'Der Arzt arbeitet im Krankenhaus.', ku: 'Bijîşk li nexweşxaneyê dixebite.' },
    ],
    grammatik: {
      titel: 'Arbeiten als: „wek“',
      text:
        'Mit „wek“ (als) sagst du, als was du arbeitest: Ez wek mamoste dixebitim — Ich arbeite als Lehrer. Das Verb „xebitîn“ (arbeiten) steht wie immer am Satzende: dixebitim (ich), dixebite (er/sie).',
      beispiel: { ku: 'Ez wek aşpêj dixebitim.', de: 'Ich arbeite als Koch.' },
    },
  },
  taetigkeiten: {
    saetze: [
      { de: 'Jeden Morgen stehe ich früh auf.', ku: 'Her sibe ez zû radibim.' },
      { de: 'Jeden Tag lerne ich Kurdisch.', ku: 'Her roj ez kurdî fêr dibim.' },
      { de: 'Jeden Abend ruhe ich mich aus.', ku: 'Her êvar ez bêhna xwe vedidim.' },
    ],
    grammatik: {
      titel: 'Gewohnheiten: „her roj“, „her sibe“',
      text:
        '„her“ heißt „jede/jeder“: her roj (jeden Tag), her sibe (jeden Morgen), her êvar (jeden Abend). Die Angabe steht am Satzanfang, danach folgt der Satz in der Gegenwart: Her roj ez dixebitim — Ich arbeite jeden Tag.',
      beispiel: { ku: 'Her sibe ez zû radibim.', de: 'Jeden Morgen stehe ich früh auf.' },
    },
  },
  wohnung: {
    saetze: [
      { de: 'Die Lampe steht auf dem Tisch.', ku: 'Çira li ser maseyê ye.' },
      { de: 'Die Katze ist unter dem Stuhl.', ku: 'Pisîk li bin kursiyê ye.' },
      { de: 'Die Küche ist neben dem Wohnzimmer.', ku: 'Metbex li kêleka odeya rûniştinê ye.' },
    ],
    grammatik: {
      titel: 'Auf, unter, neben: li ser, li bin, li kêleka',
      text:
        'Mit „li ser“ (auf), „li bin“ (unter) und „li kêleka“ (neben) beschreibst du genau, wo etwas ist: Çira li ser maseyê ye — Die Lampe ist auf dem Tisch. Das Wort dahinter bekommt die gebeugte Endung: mase → maseyê, kursî → kursiyê.',
      beispiel: { ku: 'Pirtûk li ser maseyê ye.', de: 'Das Buch liegt auf dem Tisch.' },
    },
  },
  kueche: {
    saetze: [
      { de: 'Bring den Löffel!', ku: 'Kevçî bîne!' },
      { de: 'Öffne den Kühlschrank!', ku: 'Sarincê veke!' },
      { de: 'Stell den Teller auf den Tisch!', ku: 'Firaqê deyne ser maseyê!' },
    ],
    grammatik: {
      titel: 'Kurze Aufforderungen: bîne, deyne, veke',
      text:
        'Der Imperativ endet in der Einzahl auf „-e“: bîne! (bring!), deyne! (stell hin!), veke! (öffne!). Einfache Verben bekommen dazu die Vorsilbe „bi-“ (biçe! — geh!); Verben mit fester Vorsilbe wie vekirin verzichten darauf. Sprichst du mehrere Menschen an, endet er auf „-in“: bînin!, vekin! Mit „kerem bike“ davor klingt die Aufforderung gleich freundlicher.',
      beispiel: { ku: 'Sarincê veke!', de: 'Öffne den Kühlschrank!' },
    },
  },
  restaurant: {
    saetze: [
      { de: 'Ich möchte einen Tee.', ku: 'Ez çayekê dixwazim.' },
      { de: 'Das Essen ist sehr lecker!', ku: 'Xwarin pir bi tam e!' },
      { de: 'Die Rechnung, bitte.', ku: 'Hesab, ji kerema xwe.' },
    ],
    grammatik: {
      titel: 'Bestellen mit „Ez … dixwazim“',
      text:
        '„Ich möchte …“ heißt „Ez … dixwazim“ — das Gewünschte steht in der Mitte. Die Endung „-ek“ macht aus çay „ein Tee“: çayek; als Objekt bekommt sie oft noch ein „-ê“: Ez çayekê dixwazim. Für Nachschub sagst du einfach „çayek din“ — noch einen Tee.',
      beispiel: { ku: 'Ez çayekê dixwazim.', de: 'Ich möchte einen Tee.' },
    },
  },
  'zahlen-gross': {
    saetze: [
      { de: 'Mein Vater ist fünfzig Jahre alt.', ku: 'Bavê min pêncî salî ye.' },
      { de: 'In der Schule gibt es dreißig Schüler.', ku: 'Li dibistanê sî xwendekar hene.' },
      { de: 'Das Buch kostet fünfundzwanzig Euro.', ku: 'Pirtûk bîst û pênc euro ye.' },
    ],
    grammatik: {
      titel: 'Zusammengesetzte Zahlen mit „û“',
      text:
        'Ab zwanzig verbindet Kurmancî die Zahlen mit „û“ (und) — und anders als im Deutschen kommt zuerst der Zehner: bîst û yek (21, wörtlich „zwanzig und eins“), çil û pênc (45), pêncî û du (52). So baust du jede Zahl aus bîst, sî, çil, pêncî selbst zusammen.',
      beispiel: { ku: 'bîst û yek', de: 'einundzwanzig — wörtlich: zwanzig und eins' },
    },
  },
  notfall: {
    saetze: [
      { de: 'Hilfe! Ruft die Polizei!', ku: 'Alîkarî! Gazî polîs bikin!' },
      { de: 'Wo ist das Krankenhaus?', ku: 'Nexweşxane li ku derê ye?' },
      { de: 'Warte hier, das ist gefährlich!', ku: 'Li vir bisekine, ev xeternak e!' },
    ],
    grammatik: {
      titel: 'Um Hilfe rufen: „Alîkarî!“ und „Gazî … bikin“',
      text:
        'Im Notfall rufst du laut „Alîkarî!“ (Hilfe!). Um jemanden herbeizurufen, nutzt du „gazî … kirin“: Gazî polîs bikin! (Ruft die Polizei!), Gazî bijîşk bike! (Ruf einen Arzt!). Mit „-in“ am Ende sprichst du mehrere Menschen an.',
      beispiel: { ku: 'Alîkarî! Gazî polîs bikin!', de: 'Hilfe! Ruft die Polizei!' },
    },
  },
  obst: {
    saetze: [
      { de: 'Ich kaufe ein Kilo Äpfel.', ku: 'Ez kîloyek sêv dikirim.' },
      { de: 'Gib mir bitte etwas Trauben.', ku: 'Ji kerema xwe hinek tirî bide min.' },
      { de: 'Die Wassermelone ist groß und süß.', ku: 'Zebeş mezin û şîrîn e.' },
    ],
    grammatik: {
      titel: 'Mengen beim Einkaufen: kîloyek sêv, hinek tirî',
      text:
        'Die Mengenangabe steht vor der Ware: kîloyek sêv (ein Kilo Äpfel), du kîlo pirteqal (zwei Kilo Orangen). Für unbestimmte Mengen nimmst du „hinek“ (etwas, ein paar): hinek tirî (etwas Trauben).',
      beispiel: { ku: 'kîloyek sêv û hinek tirî', de: 'ein Kilo Äpfel und etwas Trauben' },
    },
  },
  reisen: {
    saetze: [
      { de: 'Ich fahre mit dem Bus zum Markt.', ku: 'Ez bi otobusê diçim bazarê.' },
      { de: 'Wir fliegen mit dem Flugzeug nach Deutschland.', ku: 'Em bi balafirê diçin Almanyayê.' },
      { de: 'Der Weg ist weit.', ku: 'Rê dûr e.' },
    ],
    grammatik: {
      titel: 'Mit dem Bus: „bi otobusê“',
      text:
        '„Mit“ heißt in Kurmancî „bi“. Das Verkehrsmittel danach steht in der gebeugten Form: weibliche Wörter bekommen „-ê“ — bi otobusê (mit dem Bus), bi trênê (mit dem Zug), bi balafirê (mit dem Flugzeug). So sagst du, womit du unterwegs bist.',
      beispiel: { ku: 'Ez bi trênê diçim.', de: 'Ich fahre mit dem Zug.' },
    },
  },
  verkehr: {
    saetze: [
      { de: 'Das Taxi kommt zur Haltestelle.', ku: 'Taksî tê rawestgehê.' },
      { de: 'Der Fahrer fährt zum Flughafen.', ku: 'Ajokar diçe balafirgehê.' },
      { de: 'In der Stadt gibt es viel Verkehr.', ku: 'Li bajêr gelek trafîk heye.' },
    ],
    grammatik: {
      titel: 'Er kommt, sie geht: „tê“ und „diçe“',
      text:
        'Die Verben „hatin“ (kommen) und „çûn“ (gehen) sind unregelmäßig: In der dritten Person heißt es „tê“ (er/sie/es kommt) und „diçe“ (er/sie/es geht). Taksî tê — das Taxi kommt; ajokar diçe — der Fahrer fährt los.',
      beispiel: { ku: 'Otobus tê, taksî diçe.', de: 'Der Bus kommt, das Taxi fährt weg.' },
    },
  },
  wegbeschreibung: {
    saetze: [
      { de: 'Geh geradeaus und bieg rechts ab.', ku: 'Rasterast biçe û bizivire rastê.' },
      { de: 'Die Schule ist neben dem Markt.', ku: 'Dibistan li kêleka bazarê ye.' },
      { de: 'Ich habe mich verlaufen. Wie weit ist es?', ku: 'Ez winda bûm. Çiqas dûr e?' },
    ],
    grammatik: {
      titel: 'Befehle mit „bi-“: Biçe! Bizivire!',
      text:
        'Den Befehl (Imperativ) bildet Kurmancî mit der Vorsilbe „bi-“: biçe! (geh!), bizivire! (bieg ab!). Die Richtung folgt danach in der gebeugten Form: Biçe rastê! Bizivire çepê!',
      beispiel: { ku: 'Bizivire çepê!', de: 'Bieg links ab!' },
    },
  },
  hotel: {
    saetze: [
      { de: 'Haben Sie ein freies Zimmer?', ku: 'Odeyeke vala heye?' },
      { de: 'Ich bleibe eine Nacht.', ku: 'Ez şevekê dimînim.' },
      { de: 'Der Schlüssel ist im Zimmer.', ku: 'Mifte di odeyê de ye.' },
    ],
    grammatik: {
      titel: 'Ein Zimmer, eine Nacht: „-ek“',
      text:
        'Das deutsche „ein/eine“ hängt Kurmancî als Endung ans Wort: şev → şevek (eine Nacht), ode → odeyek (ein Zimmer) — nach einem Selbstlaut verbindet ein „y“. Folgt ein Adjektiv, kommt noch ein „-e“ dazu: odeyeke vala — ein freies Zimmer.',
      beispiel: { ku: 'odeyek · şevek', de: 'ein Zimmer · eine Nacht' },
    },
  },
  orientierung: {
    saetze: [
      { de: 'Wo ist der Markt?', ku: 'Bazar li ku ye?' },
      { de: 'Er ist hier, ganz nah.', ku: 'Ew li vir e, gelek nêzîk e.' },
      { de: 'Die Schule ist dort — sie ist weit.', ku: 'Dibistan li wir e — dûr e.' },
    ],
    grammatik: {
      titel: 'Wo? — „li ku ye?“',
      text:
        '„Wo ist …?“ fragst du mit „… li ku ye?“: Bazar li ku ye? Die Antwort nutzt dasselbe Muster mit li vir (hier) oder li wir (dort): Ew li vir e — es ist hier.',
      beispiel: { ku: 'Otêl li ku ye? — Li wir e.', de: 'Wo ist das Hotel? — Es ist dort.' },
    },
  },
  natur: {
    saetze: [
      { de: 'Der Berg ist sehr hoch.', ku: 'Çiya gelek bilind e.' },
      { de: 'Heute ist die Sonne sehr schön.', ku: 'Îro roj gelek xweş e.' },
      { de: 'Der Wind ist sehr kalt.', ku: 'Ba pir sar e.' },
    ],
    grammatik: {
      titel: 'Sehr: „gelek“ und „pir“',
      text:
        'Mit „gelek“ oder „pir“ verstärkst du eine Eigenschaft — beide heißen „sehr“ und stehen vor dem Adjektiv: gelek xweş (sehr schön), pir sar (sehr kalt). Vor einem Nomen bedeutet „gelek“ dagegen „viele“: gelek stêrk — viele Sterne.',
      beispiel: { ku: 'Çiya gelek bilind e.', de: 'Der Berg ist sehr hoch.' },
    },
  },
  tiere: {
    saetze: [
      { de: 'Der Hirte sieht die Schafe.', ku: 'Şivan miyan dibîne.' },
      { de: 'Ich sehe zwei Ziegen.', ku: 'Ez du bizinan dibînim.' },
      { de: 'Die Katze frisst den Fisch.', ku: 'Pisîk masî dixwe.' },
    ],
    grammatik: {
      titel: 'Mehrzahl im Satz: „-an“',
      text:
        'Steht die Mehrzahl als Objekt im Satz, bekommt sie die Endung „-an“: Ez miyan dibînim — ich sehe die Schafe. Als Objekt taucht sie auch nach Zahlen auf: Ez du bizinan dibînim (ich sehe zwei Ziegen); allein heißt „zwei Ziegen“ dagegen „du bizin“. Nach einem Selbstlaut verbindet ein „y“: mî → miyan.',
      beispiel: { ku: 'Şivan miyan dibîne.', de: 'Der Hirte sieht die Schafe.' },
    },
  },
  koerper: {
    saetze: [
      { de: 'Mein Kopf tut weh.', ku: 'Serê min diêşe.' },
      { de: 'Mein Zahn tut auch weh.', ku: 'Diranê min jî diêşe.' },
      { de: 'Meine Augen sind grün.', ku: 'Çavên min kesk in.' },
    ],
    grammatik: {
      titel: 'Weh tun: „diêşe“',
      text:
        'Schmerz drückst du mit dem Verb „êşîn“ aus: Der Körperteil ist das Subjekt, dahinter steht „min“ — Serê min diêşe heißt wörtlich „mein Kopf schmerzt“. Das Muster passt für jeden Körperteil: Destê min diêşe, diranê min diêşe.',
      beispiel: { ku: 'Serê min diêşe.', de: 'Mein Kopf tut weh.' },
    },
  },
  gesundheit: {
    saetze: [
      { de: 'Ich bin krank, ich habe Fieber.', ku: 'Ez nexweş im, taya min heye.' },
      { de: 'Ich muss zum Arzt gehen.', ku: 'Divê ez biçim cem bijîşk.' },
      { de: 'Du musst Medizin nehmen. Gute Besserung!', ku: 'Divê tu derman bixwî. Derbasbûyî be!' },
    ],
    grammatik: {
      titel: 'Müssen mit „divê“',
      text:
        '„Divê“ heißt „man muss / es ist nötig“ und steht am Satzanfang. Das Verb danach bekommt die Vorsilbe „bi-“ statt „di-“: Divê ez biçim (ich muss gehen), Divê tu derman bixwî (du musst Medizin nehmen).',
      beispiel: { ku: 'Divê ez biçim cem bijîşk.', de: 'Ich muss zum Arzt gehen.' },
    },
  },
  gemuese: {
    saetze: [
      { de: 'Ich mag Tomaten.', ku: 'Ez ji firingiyan hez dikim.' },
      { de: 'Am liebsten mag ich Gurken.', ku: 'Ez herî pir ji xiyaran hez dikim.' },
      { de: 'Wir kaufen Kartoffeln auf dem Markt.', ku: 'Em li bazarê kartolan dikirin.' },
    ],
    grammatik: {
      titel: 'Am liebsten: „herî pir“',
      text:
        'Mögen sagst du mit „ji … hez kirin“: Ez ji xiyaran hez dikim — ich mag Gurken. Für „am liebsten / am meisten“ setzt du „herî pir“ davor: Ez herî pir ji firingiyan hez dikim.',
      beispiel: { ku: 'Ez herî pir ji firingiyan hez dikim.', de: 'Am liebsten mag ich Tomaten.' },
    },
  },
  musik: {
    saetze: [
      { de: 'Azad spielt Tembûr.', ku: 'Azad li tembûrê dixe.' },
      { de: 'Wir tanzen auf der Hochzeit.', ku: 'Em li dawetê direqisin.' },
      { de: 'Das Lied ist sehr schön.', ku: 'Stran gelek xweş e.' },
    ],
    grammatik: {
      titel: 'Ein Instrument spielen: „li … dixe“',
      text:
        'Ein Instrument „schlägt“ man im Kurmancî: li tembûrê dixe — er/sie spielt Tembûr, wörtlich „schlägt auf die Tembûr“. Das Instrument steht mit „li“ und gebeugter Endung vor dem Verb: Ez li daholê dixim (ich spiele Trommel).',
      beispiel: { ku: 'Azad li tembûrê dixe.', de: 'Azad spielt Tembûr.' },
    },
  },
  dengbej: {
    saetze: [
      { de: 'Der Dengbêj sang eine Kilam.', ku: 'Dengbêj kilamek got.' },
      { de: 'Viele Zuhörer kamen.', ku: 'Gelek guhdar hatin.' },
      { de: 'Die Melodie war sehr schön.', ku: 'Awaz gelek xweş bû.' },
    ],
    grammatik: {
      titel: 'Erzählen in der Vergangenheit: got, çû, hat',
      text:
        'Die einfache Vergangenheit bildet Kurmancî ohne die Vorsilbe „di-“, direkt aus dem Vergangenheitsstamm: got (sagte/sang), çû (ging), hat (kam). Die Person hängt hinten dran: ez çûm, tu çûyî, ew çû — so erzählen auch die Dengbêj ihre Kilams.',
      beispiel: { ku: 'Dengbêj kilamek got.', de: 'Der Dengbêj sang eine Kilam.' },
    },
  },
  redewendungen: {
    saetze: [
      { de: 'Nach und nach lerne ich Kurdisch.', ku: 'Ez hêdî hêdî kurdî hîn dibim.' },
      { de: 'Ich danke dir von Herzen.', ku: 'Ez ji dil spasiya te dikim.' },
      { de: 'So ist das Leben.', ku: 'Jiyan wisa ye.' },
    ],
    grammatik: {
      titel: 'Wörtlich und gemeint',
      text:
        'Redewendungen sagen mehr, als ihre Wörter zeigen: „Dest destê dişo“ heißt wörtlich „Die Hand wäscht die Hand“, gemeint ist gegenseitige Hilfe. Lies eine Redewendung deshalb zweimal — erst Wort für Wort, dann nach dem Bild dahinter.',
      beispiel: { ku: 'Dilop bi dilop, gol çêdibe.', de: 'Tropfen für Tropfen entsteht ein See — Geduld zahlt sich aus.' },
    },
  },
  geschichten: {
    saetze: [
      { de: 'Es war einmal ein König.', ku: 'Carekê padîşahek hebû.' },
      { de: 'Der Dengbêj erzählt eine Geschichte.', ku: 'Dengbêj çîrokekê vedibêje.' },
      { de: 'Das Ende der Geschichte ist schön.', ku: 'Dawiya çîrokê xweş e.' },
    ],
    grammatik: {
      titel: '„Carekê … hebû“ — es war einmal',
      text:
        'Märchen beginnen mit „Hebû tune bû“ oder „Carekê … hebû“: Carekê padîşahek hebû — Es war einmal ein König. „hebû“ ist die Vergangenheit von „heye“ (es gibt); in der Mehrzahl heißt es „hebûn“.',
      beispiel: { ku: 'Carekê padîşahek hebû.', de: 'Es war einmal ein König.' },
    },
  },
  schule: {
    saetze: [
      { de: 'Ich lerne Kurdisch.', ku: 'Ez kurdî hîn dibim.' },
      { de: 'Der Lehrer stellt eine Frage.', ku: 'Mamoste pirsekê dike.' },
      { de: 'Die Studentin studiert an der Universität.', ku: 'Xwendekar li zanîngehê dixwîne.' },
    ],
    grammatik: {
      titel: 'Lernen oder lesen: hîn bûn und xwendin',
      text:
        '„hîn bûn“ heißt lernen im Sinn von „sich etwas aneignen“: Ez kurdî hîn dibim (ich lerne Kurdisch). „xwendin“ heißt lesen — und zugleich studieren, zur Schule gehen: Ez pirtûkê dixwînim, Ew li zanîngehê dixwîne.',
      beispiel: { ku: 'Ez kurdî hîn dibim.', de: 'Ich lerne Kurdisch.' },
    },
  },
  saetze: {
    saetze: [
      { de: 'Guten Tag! Wie heißt du?', ku: 'Roj baş! Navê te çi ye?' },
      { de: 'Ich möchte Kurdisch lernen.', ku: 'Ez dixwazim kurdî hîn bibim.' },
      { de: 'Vielen Dank! — Gern geschehen.', ku: 'Gelek spas! — Ser çavan.' },
    ],
    grammatik: {
      titel: 'Wünsche mit „Ez dixwazim“ + bi-Form',
      text:
        'Nach „Ez dixwazim“ (ich möchte) steht das zweite Verb in der bi-Form: Statt „di-“ tritt „bi-“ vor den Verbstamm, die Personalendung bleibt — bixwim, biçim, hîn bibim. Ez dixwazim biçim Kurdistanê — Ich möchte nach Kurdistan gehen.',
      beispiel: { ku: 'Ez dixwazim kurdî hîn bibim.', de: 'Ich möchte Kurdisch lernen.' },
    },
  },
  wochentage: {
    saetze: [
      { de: 'Am Montag gehe ich zur Schule.', ku: 'Roja duşemê ez diçim dibistanê.' },
      { de: 'Am Freitag haben wir ein Treffen.', ku: 'Roja înê hevdîtina me heye.' },
      { de: 'Am Wochenende bin ich zu Hause.', ku: 'Dawiya hefteyê ez li malê me.' },
    ],
    grammatik: {
      titel: 'Am Montag: „roja duşemê“',
      text:
        'Für „am Montag“ sagt Kurmancî „roja duşemê“ — wörtlich „der Tag des Montags“: roj bekommt die Ezafe „-a“, der Wochentag die gebeugte Endung „-ê“. So gehen alle Tage: roja înê (am Freitag), roja şemiyê (am Samstag).',
      beispiel: { ku: 'Roja duşemê ez diçim dibistanê.', de: 'Am Montag gehe ich zur Schule.' },
    },
  },
  wetter: {
    saetze: [
      { de: 'Wie ist das Wetter heute?', ku: 'Îro hewa çawa ye?' },
      { de: 'Es regnet. Ich nehme den Regenschirm.', ku: 'Baran dibare. Ez sîwanê digirim.' },
      { de: 'Die Wolken sind schwarz, ein Sturm kommt.', ku: 'Ewr reş in, bahoz tê.' },
    ],
    grammatik: {
      titel: '„Hewa çawa ye?“ — nach dem Wetter fragen',
      text:
        'Nach dem Wetter fragst du mit „Hewa çawa ye?“ (Wie ist das Wetter?). Die Antwort ist kurz: Hewa germ e (es ist heiß), Hewa sar e (es ist kalt), Hewa xweş e (es ist schön). Nach „çawa“ steht „ye“, weil das Wort auf einen Selbstlaut endet.',
      beispiel: { ku: 'Hewa çawa ye? — Hewa germ e.', de: 'Wie ist das Wetter? — Es ist warm.' },
    },
  },
  kleidung: {
    saetze: [
      { de: 'Ich ziehe mein Hemd an.', ku: 'Ez kirasê xwe li xwe dikim.' },
      { de: 'Die Schuhe sind neu.', ku: 'Sol nû ne.' },
      { de: 'Das Kleid ist sehr schön.', ku: 'Fîstan gelek xweş e.' },
    ],
    grammatik: {
      titel: 'Anziehen: „li xwe kirin“',
      text:
        '„Anziehen“ heißt wörtlich „an sich machen“: li xwe kirin. Das Kleidungsstück steht davor: Ez kirasê xwe li xwe dikim (Ich ziehe mein Hemd an). Mit „xwe“ (sich / eigen) zeigst du, dass es um den eigenen Körper geht.',
      beispiel: { ku: 'Ez kirasê xwe li xwe dikim.', de: 'Ich ziehe mein Hemd an.' },
    },
  },
}
