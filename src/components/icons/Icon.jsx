// Ein einheitlicher SVG-Iconsatz (Strich-Icons, 24×24, currentColor).
// Bewusst keine Emojis in der Navigation und in Bedienelementen.

const P = {
  // --- Navigation ---
  heute: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-5.5h5V20',
  kurs: 'M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2zM17 3h3v18h-3M8 8h5M8 12h5',
  ueben: 'M4 9v6M7 6v12M17 6v12M20 9v6M7 12h10',
  entdecken: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  fortschritt: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  einstellungen:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 8a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',

  // --- Abenteuer-Navigation ---
  welt: 'M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5zM9 4v14M15 6.5v14',
  aufgaben: 'M9 5h10M9 12h10M9 19h10M4 5l1 1 2-2M4 12l1 1 2-2M4 19l1 1 2-2',
  shop: 'M4 8h16l-1 12H5zM8.5 8V6a3.5 3.5 0 1 1 7 0v2',
  profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5',

  // --- Lernen ---
  buch: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM6 17h13',
  kopfhoerer: 'M4 14v-2a8 8 0 1 1 16 0v2M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM20 13h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1z',
  mikrofon: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zM5 11v1a7 7 0 0 0 14 0v-1M12 19v3M9 22h6',
  stift: 'M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16zM14.5 5.5l4 4',
  puzzle:
    'M10 4h4v2.2a1.8 1.8 0 1 0 3.6 0V4H20v4h-2.2a1.8 1.8 0 1 0 0 3.6H20V20h-4.4v-2.2a1.8 1.8 0 1 0-3.6 0V20H4v-4.4h2.2a1.8 1.8 0 1 0 0-3.6H4V8h6z',
  wiederholen: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5',
  bild: 'M4 5h16v14H4zM4 16l4.5-4.5 3 3L15 11l5 5M9 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  lautsprecher: 'M4 9.5h3.5L12 5v14L7.5 14.5H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
  auge: 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  gehirn:
    'M9.5 4a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 0 5 9v1a2.5 2.5 0 0 0 1 2 2.5 2.5 0 0 0 1 4.5A2.5 2.5 0 0 0 9.5 20H12V4zM14.5 4A2.5 2.5 0 0 1 17 6.5 2.5 2.5 0 0 1 19 9v1a2.5 2.5 0 0 1-1 2 2.5 2.5 0 0 1-1 4.5A2.5 2.5 0 0 1 14.5 20H12',
  sprechblase: 'M4 5h16v11H9l-5 4z',
  sprache: 'M3 6h9M7.5 4v2M9.5 6c0 4-3 7.5-6.5 8.5M5 10.5c1 2 3 3.5 5.5 4.5M13 20l4-10 4 10M14.6 16.5h4.8',

  // --- Belohnung ---
  flamme: 'M12 3s5 4 5 8.5A5 5 0 0 1 7 12C7 9 9 7 9 7s.5 2 1.5 2C12 9 12 5 12 3zM12 20.5a3 3 0 0 0 3-3c0-2-3-3.5-3-3.5s-3 1.5-3 3.5a3 3 0 0 0 3 3z',
  stern: 'm12 3.5 2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17.4 6.5 20.3l1.1-6.1-4.4-4.3 6.1-.8z',
  edelstein: 'm6 3h12l3 6-9 12L3 9zM6 3l3 6M18 3l-3 6M3 9h18M9 9l3 12M15 9l-3 12',
  schluessel: 'M14.5 4a5.5 5.5 0 1 1-4.6 8.5L4 18.4V21h3v-2h2v-2h2l1.5-1.5A5.5 5.5 0 0 1 14.5 4zM16 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  truhe: 'M3 10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9H3zM3 13h18M10.5 13v3h3v-3z',
  schild: 'M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  krone: 'M4 17h16l1-9-5 3-4-6-4 6-5-3zM4 20h16',
  rahmen: 'M4 4h16v16H4zM8 8h8v8H8z',
  schal: 'M8 3h8v6a4 4 0 0 1-8 0zM9 13l-1 8M15 13l1 8',
  note: 'M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 15V4l8-1v11M12 8l8-1M20 16a3 3 0 1 0 0-6',
  berg: 'M3 19h18L14 6l-3.5 6L8.5 9zM12 19l2-4',

  // --- Zustand ---
  haken: 'm5 12.5 4.5 4.5L19 7.5',
  kreuz: 'M6 6l12 12M18 6 6 18',
  schloss: 'M6 11h12v9H6zM9 11V8a3 3 0 1 1 6 0v3',
  schlossOffen: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
  warnung: 'M12 3 22 20H2zM12 10v4M12 17v.5',
  uhr: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5.5l3.5 2',
  kalender: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  blitz: 'M13 3 5 14h6l-1 7 8-11h-6z',
  fussspur: 'M8 5c1.7 0 2.5 1.5 2.5 3.5S9.7 13 8 13s-2.5-1.5-2.5-4.5S6.3 5 8 5zM16 10c1.7 0 2.5 1.5 2.5 3.5S17.7 18 16 18s-2.5-1.5-2.5-4.5S14.3 10 16 10z',
  herz: 'M12 20s-7-4.5-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.5 12 20 12 20z',
  familie: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 15c3 0 6 1.5 6 5',
  kompass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  musik: 'M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 15V4l8-1v11M12 8l8-1M20 16a3 3 0 1 0 0-6',

  // --- Aktionen ---
  suche: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16 16l5 5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  pfeilRechts: 'M5 12h13M13 6l6 6-6 6',
  pfeilLinks: 'M19 12H6M11 6l-6 6 6 6',
  pfeilRunter: 'M12 5v13M6 12l6 6 6-6',
  pfeilHoch: 'M12 19V6M6 12l6-6 6 6',
  hoch: 'M6 15l6-6 6 6',
  runter: 'M6 9l6 6 6-6',
  play: 'M7 4.5 19 12 7 19.5z',
  pause: 'M8 5h3v14H8zM13 5h3v14h-3z',
  download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M4 19h16',
  upload: 'M12 15V4M7.5 8.5 12 4l4.5 4.5M4 19h16',
  teilen: 'M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8.2 11.2l7.6-3.9M8.2 12.8l7.6 3.9',
  glocke: 'M6 16V11a6 6 0 1 1 12 0v5l2 3H4zM10 19a2 2 0 0 0 4 0',
  sonne: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  mond: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  muell: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5',
  daumen: 'M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 5h5a2 2 0 0 1 2 2.4l-1.2 5A2 2 0 0 1 17 20H7',
}

export const ICON_NAMEN = Object.keys(P)

/**
 * @param {{name:string, groesse?:number, strich?:number, className?:string, titel?:string}} props
 * Ohne `titel` ist das Icon rein dekorativ (aria-hidden) — der Text daneben zaehlt.
 */
export default function Icon({ name, groesse = 24, strich = 2, className = '', titel, ...rest }) {
  const d = P[name]
  if (!d) return null
  const beschriftet = !!titel
  return (
    <svg
      className={'rk-icon ' + className}
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strich}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={beschriftet ? 'img' : undefined}
      aria-hidden={beschriftet ? undefined : 'true'}
      aria-label={beschriftet ? titel : undefined}
      focusable="false"
      {...rest}
    >
      {beschriftet && <title>{titel}</title>}
      <path d={d} />
    </svg>
  )
}
