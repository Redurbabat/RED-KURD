// Kursbaum: 10 Themen-Lektionen Deutsch–Kurmancî (handgeprüfter Grundwortschatz)
export const kurse = [
  { id: 'begruessung', name: 'Begrüßung', symbol: '👋', woerter: [
    { de: 'Hallo', ku: 'Silav' }, { de: 'Danke', ku: 'Spas' },
    { de: 'Ja', ku: 'Erê' }, { de: 'Nein', ku: 'Na' },
    { de: 'Wie geht es dir?', ku: 'Tu çawa yî?' }, { de: 'Gut', ku: 'Baş' },
    { de: 'Auf Wiedersehen', ku: 'Bi xatirê te' }, { de: 'Bitte schön', ku: 'Kerem bike' },
    { de: 'Entschuldigung', ku: 'Bibore' }, { de: 'Willkommen', ku: 'Bi xêr hatî' },
  ]},
  { id: 'familie', name: 'Familie', symbol: '👨‍👩‍👧', woerter: [
    { de: 'Mutter', ku: 'dayik' }, { de: 'Vater', ku: 'bav' },
    { de: 'Bruder', ku: 'bira' }, { de: 'Schwester', ku: 'xwişk' },
    { de: 'Kind', ku: 'zarok' }, { de: 'Sohn / Junge', ku: 'kur' },
    { de: 'Tochter / Mädchen', ku: 'keç' }, { de: 'Frau', ku: 'jin' },
    { de: 'Mann', ku: 'mêr' }, { de: 'Freund', ku: 'heval' },
  ]},
  { id: 'zahlen', name: 'Zahlen', symbol: '🔢', woerter: [
    { de: 'eins', ku: 'yek' }, { de: 'zwei', ku: 'du' }, { de: 'drei', ku: 'sê' },
    { de: 'vier', ku: 'çar' }, { de: 'fünf', ku: 'pênc' }, { de: 'sechs', ku: 'şeş' },
    { de: 'sieben', ku: 'heft' }, { de: 'acht', ku: 'heşt' },
    { de: 'neun', ku: 'neh' }, { de: 'zehn', ku: 'deh' },
  ]},
  { id: 'essen', name: 'Essen & Trinken', symbol: '🍞', woerter: [
    { de: 'Wasser', ku: 'av' }, { de: 'Brot', ku: 'nan' }, { de: 'Tee', ku: 'çay' },
    { de: 'Milch', ku: 'şîr' }, { de: 'Käse', ku: 'penîr' }, { de: 'Fleisch', ku: 'goşt' },
    { de: 'Apfel', ku: 'sêv' }, { de: 'Reis', ku: 'birinc' },
    { de: 'Essen', ku: 'xwarin' }, { de: 'Obst', ku: 'fêkî' },
  ]},
  { id: 'koerper', name: 'Körper', symbol: '🫀', woerter: [
    { de: 'Kopf', ku: 'ser' }, { de: 'Auge', ku: 'çav' }, { de: 'Hand', ku: 'dest' },
    { de: 'Herz', ku: 'dil' }, { de: 'Mund', ku: 'dev' }, { de: 'Ohr', ku: 'guh' },
    { de: 'Nase', ku: 'poz' }, { de: 'Haar', ku: 'por' },
    { de: 'Zahn', ku: 'diran' }, { de: 'Fuß', ku: 'pê' },
  ]},
  { id: 'natur', name: 'Natur', symbol: '🌿', woerter: [
    { de: 'Sonne', ku: 'roj' }, { de: 'Mond', ku: 'heyv' }, { de: 'Stern', ku: 'stêrk' },
    { de: 'Berg', ku: 'çiya' }, { de: 'Baum', ku: 'dar' }, { de: 'Blume', ku: 'gul' },
    { de: 'Regen', ku: 'baran' }, { de: 'Schnee', ku: 'berf' },
    { de: 'Wind', ku: 'ba' }, { de: 'Feuer', ku: 'agir' },
  ]},
  { id: 'zuhause', name: 'Zuhause & Stadt', symbol: '🏠', woerter: [
    { de: 'Haus / Zuhause', ku: 'mal' }, { de: 'Tür', ku: 'derî' },
    { de: 'Fenster', ku: 'pencere' }, { de: 'Stadt', ku: 'bajar' },
    { de: 'Dorf', ku: 'gund' }, { de: 'Straße', ku: 'kolan' },
    { de: 'Schule', ku: 'dibistan' }, { de: 'Markt', ku: 'bazar' },
    { de: 'Zimmer', ku: 'ode' }, { de: 'Buch', ku: 'pirtûk' },
  ]},
  { id: 'farben', name: 'Farben & Eigenschaften', symbol: '🎨', woerter: [
    { de: 'rot', ku: 'sor' }, { de: 'weiß', ku: 'spî' }, { de: 'schwarz', ku: 'reş' },
    { de: 'grün', ku: 'kesk' }, { de: 'gelb', ku: 'zer' }, { de: 'blau', ku: 'şîn' },
    { de: 'groß', ku: 'mezin' }, { de: 'klein', ku: 'biçûk' },
    { de: 'gut', ku: 'baş' }, { de: 'neu', ku: 'nû' },
  ]},
  { id: 'zeit', name: 'Zeit', symbol: '🕐', woerter: [
    { de: 'Tag', ku: 'roj' }, { de: 'Nacht', ku: 'şev' }, { de: 'Morgen', ku: 'sibe' },
    { de: 'Abend', ku: 'êvar' }, { de: 'Jahr', ku: 'sal' }, { de: 'Monat', ku: 'meh' },
    { de: 'Woche', ku: 'hefte' }, { de: 'heute', ku: 'îro' },
    { de: 'morgen', ku: 'sibê' }, { de: 'gestern', ku: 'duh' },
  ]},
  { id: 'verben', name: 'Wichtige Verben', symbol: '⚡', woerter: [
    { de: 'gehen', ku: 'çûn' }, { de: 'kommen', ku: 'hatin' },
    { de: 'essen', ku: 'xwarin' }, { de: 'trinken', ku: 'vexwarin' },
    { de: 'sehen', ku: 'dîtin' }, { de: 'wissen', ku: 'zanîn' },
    { de: 'lesen', ku: 'xwendin' }, { de: 'schreiben', ku: 'nivîsandin' },
    { de: 'sprechen', ku: 'axaftin' }, { de: 'machen', ku: 'kirin' },
  ]},
]
