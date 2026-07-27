// Hêlo — der Adler von RED-KURD, in kurdischer Tracht.
// Alles ist ein einziges SVG, damit jede Variante stilistisch zusammenpasst
// und in jeder Groesse scharf bleibt. Grundausstattung: Kelim-Schal um den
// Hals (rot-gold) und traditionelle Weste mit goldener Borte.
import { aktiverArtikel } from '../../core/shop/shopStore.js'

// Nur Farben aus der kurdischen Farbwelt (Tokens aus tokens.css).
const FARBEN = {
  fluegel: 'var(--adv-ink)', // dunkelstes Braun der Erdfamilie
  koerper: 'var(--adv-ink-muted)',
  weste: 'var(--rk-earth)',
  brust: 'var(--adv-parchment)',
  kopf: 'var(--rk-cream)',
  kante: 'var(--adv-parchment-edge)',
  gold: 'var(--rk-gold)',
  rot: 'var(--rk-kelim-red)',
  rotTief: 'var(--adv-granat)',
  gruen: 'var(--rk-kurd-green)',
  tuerkis: 'var(--rk-turquoise)',
  tuerkisTief: 'var(--rk-stone)',
  feuer: 'var(--adv-poppy)',
  auge: 'var(--rk-night)',
  wange: 'var(--adv-poppy)',
  traene: 'var(--adv-sky)',
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
  'wanderer',
  'tee',
  'fackel',
  'daumen',
  'traurig',
  'feiern',
]

// Alte Namen bleiben gueltig, damit vorhandene Aufrufe weiter funktionieren.
const ALIASE = {
  rucksack: 'wanderer',
}

const BESCHREIBUNG = {
  ruhig: 'Hêlo, der Adler, schaut dich freundlich an',
  winken: 'Hêlo winkt dir zu',
  denken: 'Hêlo denkt nach',
  hoeren: 'Hêlo hört mit Kopfhörern zu',
  sprechen: 'Hêlo spricht',
  buch: 'Hêlo hält ein aufgeschlagenes Buch',
  hantel: 'Hêlo hält eine Hantel und trainiert',
  truhe: 'Hêlo öffnet eine Schatztruhe',
  wanderer: 'Hêlo wandert mit Kelim-Tasche und Wanderstock',
  tee: 'Hêlo hält ein Teeglas auf einem Kupfertablett',
  fackel: 'Hêlo hält eine Newroz-Fackel hoch',
  daumen: 'Hêlo zeigt Daumen hoch',
  traurig: 'Hêlo ist ein bisschen traurig',
  feiern: 'Hêlo feiert deinen Erfolg',
}

/* ---------- Gesicht ---------- */

function Augen({ variante }) {
  if (variante === 'traurig') {
    return (
      <>
        <path d="M74 68q8-6 16 0" stroke={FARBEN.auge} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M110 68q8-6 16 0" stroke={FARBEN.auge} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="82" cy="78" r="7" fill={FARBEN.auge} />
        <circle cx="118" cy="78" r="7" fill={FARBEN.auge} />
        <path d="M88 88q3 8 0 14" stroke={FARBEN.traene} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    )
  }
  if (variante === 'denken') {
    return (
      <>
        <circle cx="82" cy="74" r="10" fill={FARBEN.kopf} stroke={FARBEN.kante} strokeWidth="2" />
        <circle cx="118" cy="74" r="10" fill={FARBEN.kopf} stroke={FARBEN.kante} strokeWidth="2" />
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
      <circle cx="82" cy="76" r="11" fill={FARBEN.kopf} stroke={FARBEN.kante} strokeWidth="2" />
      <circle cx="118" cy="76" r="11" fill={FARBEN.kopf} stroke={FARBEN.kante} strokeWidth="2" />
      <circle cx="84" cy="77" r="6" fill={FARBEN.auge} />
      <circle cx="120" cy="77" r="6" fill={FARBEN.auge} />
      <circle cx="86" cy="74" r="2" fill={FARBEN.kopf} />
      <circle cx="122" cy="74" r="2" fill={FARBEN.kopf} />
    </>
  )
}

function Schnabel({ variante }) {
  const offen = variante === 'sprechen' || variante === 'feiern'
  return (
    <>
      <path
        d={offen ? 'M100 88 L114 100 L100 112 L86 100 Z' : 'M100 88 L113 100 L100 108 L87 100 Z'}
        fill={FARBEN.gold}
      />
      <path
        d={offen ? 'M86 100 L114 100 L100 112 Z' : 'M87 100 L113 100 L100 108 Z'}
        fill={FARBEN.weste}
      />
    </>
  )
}

/* ---------- Tracht ---------- */

/** Traditionelle Weste ueber der Brust, mit goldener Borte am Rand. */
function Weste() {
  return (
    <g fill={FARBEN.weste} stroke={FARBEN.gold} strokeWidth="3" strokeLinejoin="round">
      <path d="M86 108 C80 130 78 160 80 184 L74 186 C64 178 59 160 59 138 C59 124 62 114 68 108 Z" />
      <path d="M114 108 C120 130 122 160 120 184 L126 186 C136 178 141 160 141 138 C141 124 138 114 132 108 Z" />
    </g>
  )
}

/**
 * Kurdischer Schal (şal û şapik): rot-goldenes Kelim-Band um den Hals, ein
 * Zipfel haengt herab. Der gekaufte Shop-Schal ersetzt das Muster durch Tuerkis.
 */
function Schal({ tuerkis }) {
  const band = tuerkis ? FARBEN.tuerkis : FARBEN.rot
  const zipfel = tuerkis ? FARBEN.tuerkisTief : FARBEN.rotTief
  const muster = tuerkis ? FARBEN.kopf : FARBEN.gold

  return (
    <g>
      {/* Zipfel mit Fransen */}
      <path d="M122 130 L128 176 L144 172 L136 128 Z" fill={zipfel} />
      <path d="M126 150l13-3M129 162l13-3" stroke={muster} strokeWidth="3" fill="none" />
      <g stroke={muster} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M129 176v8M134 175v8M139 174v8M144 172v8" />
      </g>
      {/* Band um den Hals */}
      <path d="M62 110q38 20 76 0v18q-38 20-76 0z" fill={band} />
      {tuerkis ? (
        <path d="M62 118q38 20 76 0" stroke={muster} strokeWidth="3" fill="none" opacity=".7" />
      ) : (
        <g fill={muster}>
          <path d="M76 120l4 5-4 5-4-5z" />
          <path d="M88 123l4 5-4 5-4-5z" />
          <path d="M100 124l4 5-4 5-4-5z" />
          <path d="M112 123l4 5-4 5-4-5z" />
          <path d="M124 120l4 5-4 5-4-5z" />
        </g>
      )}
    </g>
  )
}

/** Schultergurt der Kelim-Tasche — liegt unter dem Schal. */
function TaschenGurt() {
  return (
    <g strokeLinecap="round" fill="none">
      <path d="M78 108 L146 142" stroke={FARBEN.weste} strokeWidth="10" />
      <path d="M78 108 L146 142" stroke={FARBEN.gold} strokeWidth="2.5" opacity=".8" />
    </g>
  )
}

/* ---------- Requisiten vor dem Koerper ---------- */

function Requisiten({ variante }) {
  return (
    <>
      {variante === 'buch' && (
        <g>
          <path d="M100 146 C88 138 74 136 62 140 L62 180 C74 176 88 178 100 186 Z" fill={FARBEN.brust} stroke={FARBEN.kante} strokeWidth="2.5" />
          <path d="M100 146 C112 138 126 136 138 140 L138 180 C126 176 112 178 100 186 Z" fill={FARBEN.brust} stroke={FARBEN.kante} strokeWidth="2.5" />
          <path d="M100 146V186" stroke={FARBEN.weste} strokeWidth="4" fill="none" />
          <g stroke={FARBEN.kante} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M72 154h20M72 162h20M72 170h14M108 154h20M108 162h20M108 170h14" />
          </g>
        </g>
      )}

      {variante === 'hantel' && (
        <g>
          <rect x="54" y="158" width="92" height="10" rx="5" fill={FARBEN.fluegel} />
          <rect x="40" y="144" width="18" height="38" rx="6" fill={FARBEN.weste} stroke={FARBEN.gold} strokeWidth="3" />
          <rect x="142" y="144" width="18" height="38" rx="6" fill={FARBEN.weste} stroke={FARBEN.gold} strokeWidth="3" />
        </g>
      )}

      {variante === 'truhe' && (
        <g>
          <path d="M54 164h92v22a4 4 0 0 1-4 4H58a4 4 0 0 1-4-4z" fill={FARBEN.fluegel} />
          <path d="M54 164q46-30 92 0z" fill={FARBEN.weste} />
          <path d="M54 164h92" stroke={FARBEN.gold} strokeWidth="3" fill="none" />
          <rect x="92" y="166" width="16" height="16" rx="3" fill={FARBEN.gold} />
          <g fill={FARBEN.gold}>
            <path d="M74 148l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            <path d="M128 142l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
          </g>
        </g>
      )}

      {variante === 'wanderer' && (
        <g>
          {/* Kelim-Tasche an der Hüfte */}
          <rect x="134" y="138" width="42" height="42" rx="6" fill={FARBEN.rot} />
          <g stroke={FARBEN.gold} strokeWidth="4" fill="none">
            <path d="M134 150h42M134 168h42" />
          </g>
          <path d="M155 152l7 7-7 7-7-7z" fill={FARBEN.gruen} />
          <rect x="130" y="132" width="50" height="14" rx="4" fill={FARBEN.weste} />
          <path d="M130 146h50" stroke={FARBEN.gold} strokeWidth="2.5" fill="none" />
          <g stroke={FARBEN.gold} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M140 180v7M150 180v7M160 180v7M170 180v7" />
          </g>
          {/* Wanderstock */}
          <path d="M44 56 L54 204" stroke={FARBEN.weste} strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="44" cy="54" r="7" fill={FARBEN.weste} />
          <path d="M45 88l8 1" stroke={FARBEN.gold} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {variante === 'tee' && (
        <g>
          {/* Kupfertablett */}
          <ellipse cx="100" cy="184" rx="34" ry="9" fill={FARBEN.weste} stroke={FARBEN.gold} strokeWidth="3" />
          {/* Istikan mit schmaler Taille */}
          <path
            d="M86 142 L114 142 C112 154 106 158 106 165 C106 172 111 176 113 181 L87 181 C89 176 94 172 94 165 C94 158 88 154 86 142 Z"
            fill={FARBEN.gold}
            stroke={FARBEN.kopf}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M92 147 C93 156 98 159 98 165" stroke={FARBEN.kopf} strokeWidth="3" fill="none" opacity=".7" strokeLinecap="round" />
        </g>
      )}

      {variante === 'fackel' && (
        <g>
          <rect x="163" y="58" width="10" height="66" rx="5" fill={FARBEN.weste} />
          <rect x="157" y="52" width="22" height="11" rx="4" fill={FARBEN.gold} />
          <path
            d="M168 6c10 14 18 20 18 32 0 12-8 20-18 20s-18-8-18-20c0-8 6-13 8-20 3 7 6 9 8 11 2-9-2-16 2-23z"
            fill={FARBEN.feuer}
          />
          <path
            d="M168 26c5 7 9 11 9 17 0 7-4 11-9 11s-9-4-9-11c0-4 3-7 4-11 2 4 3 5 5 7 1-5-1-9 0-13z"
            fill={FARBEN.gold}
          />
        </g>
      )}
    </>
  )
}

/* ---------- Zubehoer ueber dem Kopf ---------- */

function KopfZubehoer({ variante }) {
  return (
    <>
      {variante === 'hoeren' && (
        <g>
          <path d="M52 86 A50 50 0 1 1 148 86" fill="none" stroke={FARBEN.weste} strokeWidth="8" strokeLinecap="round" />
          <rect x="41" y="68" width="22" height="36" rx="10" fill={FARBEN.weste} />
          <rect x="137" y="68" width="22" height="36" rx="10" fill={FARBEN.weste} />
          <rect x="46" y="76" width="12" height="20" rx="6" fill={FARBEN.gold} />
          <rect x="142" y="76" width="12" height="20" rx="6" fill={FARBEN.gold} />
        </g>
      )}

      {variante === 'sprechen' && (
        <g stroke={FARBEN.tuerkis} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M150 92q10 8 0 16" />
          <path d="M162 84q18 16 0 32" />
        </g>
      )}

      {variante === 'denken' && (
        <g fill={FARBEN.brust} stroke={FARBEN.kante} strokeWidth="2">
          <circle cx="152" cy="52" r="6" />
          <circle cx="166" cy="36" r="9" />
          <circle cx="182" cy="18" r="12" />
        </g>
      )}

      {variante === 'feiern' && (
        <g>
          <rect x="30" y="24" width="8" height="8" rx="2" fill={FARBEN.gold} transform="rotate(20 34 28)" />
          <rect x="160" y="30" width="8" height="8" rx="2" fill={FARBEN.gruen} transform="rotate(-25 164 34)" />
          <rect x="56" y="12" width="8" height="8" rx="2" fill={FARBEN.rot} transform="rotate(40 60 16)" />
          <rect x="136" y="10" width="8" height="8" rx="2" fill={FARBEN.tuerkis} transform="rotate(-15 140 14)" />
        </g>
      )}
    </>
  )
}

function Fluegel({ variante }) {
  const hochRechts =
    variante === 'winken' || variante === 'feiern' || variante === 'daumen' || variante === 'fackel'
  const hochLinks = variante === 'feiern'
  return (
    <>
      <path
        d={hochLinks ? 'M62 132q-32-22-30-58 22 4 34 34z' : 'M62 128q-30 8-34 42 22 10 40-14z'}
        fill={FARBEN.fluegel}
      />
      <path
        d={hochRechts ? 'M138 130q32-24 30-60-22 4-34 36z' : 'M138 128q30 8 34 42-22 10-40-14z'}
        fill={FARBEN.fluegel}
      />
      {variante === 'daumen' && (
        <circle cx="163" cy="72" r="11" fill={FARBEN.gold} stroke={FARBEN.fluegel} strokeWidth="3" />
      )}
    </>
  )
}

/**
 * @param {{variante?:string, groesse?:number, className?:string, dekorativ?:boolean}} props
 */
export default function HeloMascot({ variante = 'ruhig', groesse = 120, className = '', dekorativ = false }) {
  const gewuenscht = ALIASE[variante] || variante
  const v = VARIANTEN.includes(gewuenscht) ? gewuenscht : 'ruhig'
  const tuerkiserSchal = !!aktiverArtikel('mascot')
  const beschreibung = BESCHREIBUNG[v]

  return (
    <svg
      className={['helo', className].filter(Boolean).join(' ')}
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
      <path d="M84 190v14M116 190v14" stroke={FARBEN.weste} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M74 206h22M104 206h22" stroke={FARBEN.gold} strokeWidth="9" strokeLinecap="round" fill="none" />

      <Fluegel variante={v} />

      {/* Koerper */}
      <ellipse cx="100" cy="140" rx="46" ry="52" fill={FARBEN.koerper} />
      <ellipse cx="100" cy="148" rx="30" ry="38" fill={FARBEN.brust} />

      <Weste />
      {v === 'wanderer' && <TaschenGurt />}
      <Schal tuerkis={tuerkiserSchal} />
      <Requisiten variante={v} />

      {/* Kopf */}
      <circle cx="100" cy="74" r="46" fill={FARBEN.kopf} />
      <path d="M54 74a46 46 0 0 0 92 0z" fill={FARBEN.brust} opacity=".5" />
      {/* Federschopf */}
      <path d="M84 32q6-18 16-6 10-12 16 6z" fill={FARBEN.kopf} />
      <path d="M100 10l4 8-4 8-4-8z" fill={FARBEN.gold} />

      <Augen variante={v} />
      <Schnabel variante={v} />
      <KopfZubehoer variante={v} />

      {(v === 'feiern' || v === 'daumen' || v === 'winken') && (
        <>
          <circle cx="64" cy="94" r="7" fill={FARBEN.wange} opacity=".45" />
          <circle cx="136" cy="94" r="7" fill={FARBEN.wange} opacity=".45" />
        </>
      )}
    </svg>
  )
}
