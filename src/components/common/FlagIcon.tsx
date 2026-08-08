// Flaggen als eigene SVGs — scharf in jeder Größe und mit der Kurdistan-
// Flagge (rot-weiß-grün mit goldener 21-Strahlen-Sonne), die es als Emoji
// nicht gibt. Rein dekorativ: der Sprachname steht immer als Text daneben.

import type { ReactNode } from 'react'

/** Punkte der 21-Strahlen-Sonne von Roja Kurdistanê. */
function sonnenStrahlen(cx: number, cy: number, innen: number, aussen: number): string {
  const punkte = []
  const strahlen = 21
  for (let i = 0; i < strahlen; i += 1) {
    const mitte = (i * 360) / strahlen - 90
    const links = ((mitte - 360 / strahlen / 2) * Math.PI) / 180
    const spitze = (mitte * Math.PI) / 180
    punkte.push(
      `${cx + innen * Math.cos(links)},${cy + innen * Math.sin(links)}`,
      `${cx + aussen * Math.cos(spitze)},${cy + aussen * Math.sin(spitze)}`
    )
  }
  return punkte.join(' ')
}

/**
 * Die Liste ist die Quelle, nicht die Flaggentabelle: daraus entsteht der Typ,
 * und `FLAGGEN` wird daran gemessen. Fehlt dort eine Sprache oder steht eine
 * zuviel darin, meldet es der Prüfer — vorher hätte man beides einzeln pflegen
 * müssen, ohne dass ein Auseinanderlaufen aufgefallen wäre.
 */
export const FLAGGEN_SPRACHEN = [
  'kurmanci',
  'englisch',
  'franzoesisch',
  'spanisch',
  'tuerkisch',
] as const

/** Jede Flagge, die es wirklich gibt. */
export type Flaggensprache = (typeof FLAGGEN_SPRACHEN)[number]

const FLAGGEN: Readonly<Record<Flaggensprache, ReactNode>> = {
  kurmanci: (
    <>
      <rect width="24" height="16" fill="#eb2224" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
      <rect y="10.67" width="24" height="5.33" fill="#278e43" />
      <polygon points={sonnenStrahlen(12, 8, 2.4, 4.6)} fill="#febd11" />
      <circle cx="12" cy="8" r="2.55" fill="#febd11" />
    </>
  ),
  englisch: (
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 24 16 M24 0 0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0 24 16 M24 0 0 16" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#c8102e" strokeWidth="3" />
    </>
  ),
  franzoesisch: (
    <>
      <rect width="8" height="16" fill="#002395" />
      <rect x="8" width="8" height="16" fill="#fff" />
      <rect x="16" width="8" height="16" fill="#ed2939" />
    </>
  ),
  spanisch: (
    <>
      <rect width="24" height="16" fill="#aa151b" />
      <rect y="4" width="24" height="8" fill="#f1bf00" />
    </>
  ),
  tuerkisch: (
    <>
      <rect width="24" height="16" fill="#e30a17" />
      <circle cx="9.5" cy="8" r="4" fill="#fff" />
      <circle cx="10.5" cy="8" r="3.2" fill="#e30a17" />
      <polygon
        points="14.2,8 16.9,8.9 15.2,6.6 15.2,9.4 16.9,7.1"
        fill="#fff"
      />
    </>
  ),
}

export interface FlagIconProps {
  sprache: Flaggensprache
  breite?: number
  className?: string
}

export default function FlagIcon({ sprache, breite = 24, className = '' }: FlagIconProps) {
  const inhalt: ReactNode = FLAGGEN[sprache]
  // Der Typ schließt einen unbekannten Namen aus; die Prüfung bleibt für
  // Aufrufer, die noch JavaScript sind.
  if (!inhalt) return null
  return (
    <svg
      className={('rk-flagge ' + className).trim()}
      width={breite}
      height={(breite * 2) / 3}
      viewBox="0 0 24 16"
      aria-hidden="true"
      focusable="false"
    >
      {inhalt}
    </svg>
  )
}

