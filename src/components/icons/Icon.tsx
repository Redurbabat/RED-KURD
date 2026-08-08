// Ein einheitlicher SVG-Iconsatz (Strich-Icons, 24×24, currentColor).
// Bewusst keine Emojis in der Navigation und in Bedienelementen.
import type { SVGProps } from 'react'
import { ICON_PFADE } from './iconPfade.ts'
import type { Iconname } from './iconPfade.ts'

export type { Iconname } from './iconPfade.ts'
export { ICONNAMEN } from './iconPfade.ts'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: Iconname
  groesse?: number
  strich?: number
  /**
   * Sichtbarer Name für Screenreader. Fehlt er, gilt das Icon als
   * schmückend und wird mit `aria-hidden` versteckt — dann muss der
   * umgebende Knopf einen Text oder ein `aria-label` tragen (CLAUDE.md).
   */
  titel?: string
}

/**
 * Ohne `titel` ist das Icon rein dekorativ (aria-hidden) — der Text daneben
 * zaehlt.
 */
export default function Icon({
  name,
  groesse = 24,
  strich = 2,
  className = '',
  titel,
  ...rest
}: IconProps) {
  const d = ICON_PFADE[name]
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
