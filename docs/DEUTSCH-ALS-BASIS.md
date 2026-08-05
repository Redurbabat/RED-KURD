# Deutsch als Basis — Sprachregeln der Oberfläche

RED-KURD richtet sich an deutschsprachige Lernende. Deutsch ist die Sprache
der Bedienung, der Erklärungen und der Fehlermeldungen; Kurmancî (und später
weitere Sprachen) ist der Lerninhalt.

## Regeln

1. **Alle UI-Texte sind Deutsch** — Buttons, Überschriften, Hinweise,
   Fehlermeldungen, aria-Labels, Platzhalter.
2. **Wiederkehrende Texte stehen in `src/core/texts.js`** (`T.…`).
   Neue Seiten importieren `T`, statt Texte zu duplizieren — sonst laufen
   Formulierungen auseinander und eine spätere Übersetzung vergisst die
   Hälfte der App.
3. **Kurmancî-Text trägt `lang="ku"`** (Screenreader-Aussprache), arabische
   Schrift zusätzlich `dir="rtl"`. Für andere Zielsprachen liefert
   `sprachAttribute()` aus `src/core/languages/languages.js` die Attribute.
4. **Kurdische Begriffe werden erklärt**, nicht vorausgesetzt (z. B.
   „Dengbêj — kurdische Erzählsänger“).
5. **Grammatik-Notizen erklären auf Deutsch**, was für Deutschsprachige
   ungewohnt ist (Satzstellung, Ergativ, Anredeformen).
6. Anrede: **Du-Form**, freundlich und knapp. Keine Anglizismen, wo ein
   deutsches Wort genauso klar ist.

## Stand

- `texts.js` gliedert sich in `app`, `nav`, `gruss`, `stats`, `heute`,
  `kurs`, `ueben`, `entdecken`, `fortschritt`, `einstellungen`, `uebung`,
  `abenteuer`, `allgemein` plus `grussText()`.
- Automatische Prüfung fand **keine englischen UI-Strings** im Quellcode;
  `index.html` trägt `lang="de"`.
- Navigations-Labels (auch Abenteuer/Redlingo), Moduswechsel-Dialoge und die
  gemeinsamen Lade-/Fehler-/Zurück-Texte kommen inzwischen vollständig aus
  `texts.js`.
- Das Onboarding fragt auf Deutsch: Name, Vorkenntnisse, Lernziel,
  Minuten pro Tag; der Moduswechsel erklärt, dass der Lernstand gleich bleibt.

## Bekannte Besonderheiten

- **„Redmail“/„Redsword“** statt „E-Mail“/„Passwort“ auf der Anmeldeseite
  ist eine bewusste Namensentscheidung des Projekts (eigenes Konto-System).
  Wer sie ändern möchte: alle Stellen liegen in
  `src/features/auth/AuthPage.jsx` und `src/modes/modern/pages/SettingsPage.jsx` —
  empfohlen wäre dann ein Abschnitt `T.konto` in `texts.js`.
- Einige Seiten (Redlingo, Sprachkurse, Lesen, Grammatik, Kultur) haben noch
  eigene, deutsche Texte direkt im Code. Sie sind korrekt, aber noch nicht
  zentralisiert — bei Gelegenheit nach `texts.js` heben.
- Terminologie vereinheitlichen: Modern sagt „Kapitel“, Abenteuer teils
  „Einheiten“/„Stationen“ für dasselbe Konzept.

## Später: weitere Bediensprachen

`texts.js` ist bewusst die einzige Textquelle. Für eine spätere zweite
Bediensprache (z. B. Englisch oder Kurmancî selbst) genügt es, `T` gegen
eine übersetzte Struktur zu tauschen — solange sich alle Seiten an Regel 2
halten.
