// Sonderzeichenleiste fuer Kurmancî — überall dort, wo getippt wird.
export const SONDERZEICHEN = ['ê', 'î', 'û', 'ş', 'ç'] as const

export interface SpecialCharsProps {
  einfuegen: (zeichen: string) => void
  label?: string
  className?: string
}

export default function SpecialChars({
  einfuegen,
  label = 'Kurmancî-Sonderzeichen',
  className = '',
}: SpecialCharsProps) {
  return (
    <div className={`rk-zeichen ${className}`} role="group" aria-label={label}>
      {SONDERZEICHEN.map((z) => (
        <button
          key={z}
          type="button"
          className="rk-zeichen-taste"
          onClick={() => einfuegen(z)}
          aria-label={`Zeichen ${z} einfügen`}
        >
          <span lang="ku">{z}</span>
        </button>
      ))}
    </div>
  )
}
