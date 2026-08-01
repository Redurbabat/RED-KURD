// Beispielsätze und Grammatik-Notizen für bestehende Kapitel.
// Deutsch ist die Erklärsprache: der deutsche Satz steht zuerst, Kurmancî
// darunter; jede Grammatik-Notiz erklärt eine einzige Sache in zwei, drei
// Sätzen und schließt mit einem Beispiel.
// Neue Kapitel (Welt 10) tragen ihre Sätze direkt in kurseVertiefung.js.
export const kapitelExtras = {
  begruessung: {
    saetze: [
      { de: 'Guten Morgen! Wie geht es dir?', ku: 'Sibê baş! Tu çawa yî?' },
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
}
