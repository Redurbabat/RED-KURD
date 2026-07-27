// Hêlo — der Adler von RED-KURD. Eigenes Maskottchen als SVG, damit alle
// Varianten stilistisch zusammenpassen und in jeder Groesse scharf bleiben.
import { aktiverArtikel } from '../../core/shop/shopStore.js'

const FARBEN = {
  koerper: '#8a5a33',
  koerperDunkel: '#6d4526',
  fluegel: '#5f3c21',
  kopf: '#fdfaf2',
  kopfSchatten: '#ece2d2',
  schnabel: '#f5b82e',
  schnabelDunkel: '#d99a15',
  akzent: '#0ea5a8',
  akzentDunkel: '#087f83',
  auge: '#30343a',
  wange: '#f0a58c',
}

export const VARIANTEN = [
  'ruhig',
  'winken',
  'denken',
  'hoeren',
  'sprechen',
  'buch',
  'hantel',
  'truhe',
  'rucksack',
  'daumen',
  'traurig',
  'feiern',
]

const BESCHREIBUNG = {
  ruhig: 'Hêlo, der Adler, schaut dich freundlich an',
  winken: 'Hêlo winkt dir zu',
  denken: 'Hêlo denkt nach',
  hoeren: 'Hêlo hört mit Kopfhörern zu',
  sprechen: 'Hêlo spricht',
  buch: 'Hêlo hält ein Buch',
  hantel: 'Hêlo hält eine Hantel',
  truhe: 'Hêlo öffnet eine Schatztruhe',
  rucksack: 'Hêlo trägt einen Rucksack',
  daumen: 'Hêlo zeigt Daumen hoch',
  traurig: 'Hêlo ist ein bisschen traurig',
  feiern: 'Hêlo feiert deinen Erfolg',
}

function Augen({ variante }) {
  if (variante === 'traurig') {
    return (
      <>
        <path d="M74 68q8-6 16 0" stroke={FARBEN.auge} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M110 68q8-6 16 0" stroke={FARBEN.auge} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="82" cy="78" r="7" fill={FARBEN.auge} />
        <circle cx="118" cy="78" r="7" fill={FARBEN.auge} />
        <path d="M88 88q3 8 0 14" stroke="#7cc7ef" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    )
  }
  if (variante === 'denken') {
    return (
      <>
        <circle cx="82" cy="74" r="10" fill="#fff" stroke={FARBEN.kopfSchatten} strokeWidth="2" />
        <circle cx="118" cy="74" r="10" fill="#fff" stroke={FARBEN.kopfSchatten} strokeWidth="2" />
        <circle cx="84" cy="70" r="5" fill={FARBEN.auge} />
        <circle cx="120" cy="70" r="5" fill={FARBEN.auge} />
      </>
    )
  }
  if (variante === 'feiern') {
    return (
      <>
        <path d="M72 76q10-14 20 0" stroke={FARBEN.auge} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M108 76q10-14 20 0" stroke={FARBEN.auge} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>
    )
  }
  return (
    <>
      <circle cx="82" cy="76" r="11" fill="#fff" stroke={FARBEN.kopfSchatten} strokeWidth="2" />
      <circle cx="118" cy="76" r="11" fill="#fff" stroke={FARBEN.kopfSchatten} strokeWidth="2" />
      <circle cx="84" cy="77" r="6" fill={FARBEN.auge} />
      <circle cx="120" cy="77" r="6" fill={FARBEN.auge} />
      <circle cx="86" cy="74" r="2" fill="#fff" />
      <circle cx="122" cy="74" r="2" fill="#fff" />
    </>
  )
}

function Schnabel({ variante }) {
  if (variante === 'sprechen' || variante === 'feiern') {
    return (
      <>
        <path d="M100 88 L114 100 L100 112 L86 100 Z" fill={FARBEN.schnabel} />
        <path d="M86 100 L114 100 L100 112 Z" fill={FARBEN.schnabelDunkel} />
      </>
    )
  }
  return (
    <>
      <path d="M100 88 L113 100 L100 108 L87 100 Z" fill={FARBEN.schnabel} />
      <path d="M87 100 L113 100 L100 108 Z" fill={FARBEN.schnabelDunkel} />
    </>
  )
}

function Zubehoer({ variante, schal }) {
  return (
    <>
      {schal && (
        <g>
          <path d="M66 118q34 16 68 0v14q-34 16-68 0z" fill={FARBEN.akzent} />
          <path d="M128 130l10 34 12-6-12-30z" fill={FARBEN.akzentDunkel} />
        </g>
      )}
      {variante === 'hoeren' && (
        <g fill="none" stroke={FARBEN.akzentDunkel} strokeWidth="7" strokeLinecap="round">
          <path d="M56 76a44 44 0 0 1 88 0" />
          <rect x="44" y="72" width="18" height="30" rx="9" fill={FARBEN.akzent} stroke="none" />
          <rect x="138" y="72" width="18" height="30" rx="9" fill={FARBEN.akzent} stroke="none" />
        </g>
      )}
      {variante === 'sprechen' && (
        <g stroke={FARBEN.akzent} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M150 92q10 8 0 16" />
          <path d="M162 84q18 16 0 32" />
        </g>
      )}
      {variante === 'buch' && (
        <g>
          <rect x="62" y="146" width="76" height="46" rx="6" fill={FARBEN.akzent} />
          <rect x="70" y="152" width="60" height="34" rx="3" fill="#fdfaf2" />
          <path d="M100 152v34" stroke={FARBEN.akzentDunkel} strokeWidth="3" />
        </g>
      )}
      {variante === 'hantel' && (
        <g fill={FARBEN.akzentDunkel}>
          <rect x="52" y="158" width="96" height="10" rx="5" />
          <rect x="40" y="146" width="16" height="34" rx="5" />
          <rect x="144" y="146" width="16" height="34" rx="5" />
        </g>
      )}
      {variante === 'truhe' && (
        <g>
          <path d="M52 160h96v34H52z" fill={FARBEN.koerperDunkel} />
          <path d="M52 160q48-26 96 0z" fill="#a9702f" />
          <rect x="92" y="164" width="16" height="18" rx="3" fill={FARBEN.schnabel} />
          <circle cx="70" cy="150" r="4" fill={FARBEN.schnabel} />
          <circle cx="130" cy="146" r="5" fill={FARBEN.schnabel} />
        </g>
      )}
      {variante === 'rucksack' && (
        <g>
          <rect x="140" y="120" width="34" height="46" rx="10" fill={FARBEN.akzent} />
          <rect x="146" y="134" width="22" height="14" rx="4" fill={FARBEN.akzentDunkel} />
        </g>
      )}
      {variante === 'denken' && (
        <g fill={FARBEN.akzent} opacity="0.85">
          <circle cx="152" cy="52" r="6" />
          <circle cx="166" cy="36" r="9" />
          <circle cx="182" cy="18" r="12" />
        </g>
      )}
      {variante === 'feiern' && (
        <g>
          <rect x="30" y="24" width="8" height="8" rx="2" fill={FARBEN.schnabel} transform="rotate(20 34 28)" />
          <rect x="160" y="30" width="8" height="8" rx="2" fill="#57c84d" transform="rotate(-25 164 34)" />
          <rect x="56" y="12" width="8" height="8" rx="2" fill="#8b5cf6" transform="rotate(40 60 16)" />
          <rect x="136" y="10" width="8" height="8" rx="2" fill="#2596f3" transform="rotate(-15 140 14)" />
        </g>
      )}
    </>
  )
}

function Fluegel({ variante }) {
  const hochRechts = variante === 'winken' || variante === 'feiern' || variante === 'daumen'
  const hochLinks = variante === 'feiern'
  return (
    <>
      <path
        d={
          hochLinks
            ? 'M62 132q-32-22-30-58 22 4 34 34z'
            : 'M62 128q-30 8-34 42 22 10 40-14z'
        }
        fill={FARBEN.fluegel}
      />
      <path
        d={
          hochRechts
            ? 'M138 130q32-24 30-60-22 4-34 36z'
            : 'M138 128q30 8 34 42-22 10-40-14z'
        }
        fill={FARBEN.fluegel}
      />
      {variante === 'daumen' && (
        <circle cx="163" cy="72" r="11" fill={FARBEN.schnabel} stroke={FARBEN.schnabelDunkel} strokeWidth="3" />
      )}
    </>
  )
}

/**
 * @param {{variante?:string, groesse?:number, className?:string, dekorativ?:boolean}} props
 */
export default function HeloMascot({ variante = 'ruhig', groesse = 120, className = '', dekorativ = false }) {
  const v = VARIANTEN.includes(variante) ? variante : 'ruhig'
  const schal = !!aktiverArtikel('mascot')
  const beschreibung = BESCHREIBUNG[v]

  return (
    <svg
      className={'helo ' + className}
      width={groesse}
      height={groesse * 1.1}
      viewBox="0 0 200 220"
      role={dekorativ ? undefined : 'img'}
      aria-hidden={dekorativ ? 'true' : undefined}
      aria-label={dekorativ ? undefined : beschreibung}
      focusable="false"
    >
      {!dekorativ && <title>{beschreibung}</title>}

      {/* Fuesse */}
      <path d="M84 190v14M116 190v14" stroke={FARBEN.schnabelDunkel} strokeWidth="9" strokeLinecap="round" />
      <path d="M74 206h22M104 206h22" stroke={FARBEN.schnabel} strokeWidth="9" strokeLinecap="round" />

      <Fluegel variante={v} />

      {/* Koerper */}
      <ellipse cx="100" cy="140" rx="46" ry="52" fill={FARBEN.koerper} />
      <ellipse cx="100" cy="148" rx="30" ry="38" fill="#f6e6cf" />

      <Zubehoer variante={v} schal={schal} />

      {/* Kopf */}
      <circle cx="100" cy="74" r="46" fill={FARBEN.kopf} />
      <path d="M54 74a46 46 0 0 1 92 0z" fill={FARBEN.kopfSchatten} opacity=".45" />
      {/* Federschopf */}
      <path d="M84 32q6-18 16-6 10-12 16 6z" fill={FARBEN.kopf} />

      <Augen variante={v} />
      <Schnabel variante={v} />

      {(v === 'feiern' || v === 'daumen' || v === 'winken') && (
        <>
          <circle cx="64" cy="94" r="7" fill={FARBEN.wange} opacity=".5" />
          <circle cx="136" cy="94" r="7" fill={FARBEN.wange} opacity=".5" />
        </>
      )}
    </svg>
  )
}
