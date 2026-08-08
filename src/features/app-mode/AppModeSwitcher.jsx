// Der App-Umschalter: Sprache lernen · Code lernen · AI-Sprache.
// Immer sichtbar am oberen Rand — genau ein Bereich ist aktiv.
import Icon from '../../components/icons/Icon.jsx'
import { APP_MODE_KURZ, APP_MODE_LABELS, APP_MODE_LISTE } from './appModes.js'
import './appMode.css'

const ICONS = {
  language: 'sprache',
  code: 'puzzle',
  prompting: 'sprechblase',
  electro: 'blitz',
}

/**
 * @param {{activeMode:string, onChangeMode:(mode:string)=>void,
 *          onOpenLauncher?:()=>void}} props
 */
export default function AppModeSwitcher({ activeMode, onChangeMode, onOpenLauncher }) {
  return (
    <nav className="app-umschalter" aria-label="App-Bereich wechseln">
      {onOpenLauncher && (
        <button
          type="button"
          className="app-umschalter-knopf app-umschalter-apps"
          aria-label="Zur App-Auswahl"
          onClick={onOpenLauncher}
        >
          <Icon name="pfeilLinks" groesse={18} />
          <span>Apps</span>
        </button>
      )}
      {APP_MODE_LISTE.map((mode) => {
        const aktiv = mode === activeMode
        return (
          <button
            key={mode}
            type="button"
            className={`app-umschalter-knopf bereich-${mode}${aktiv ? ' aktiv' : ''}`}
            aria-pressed={aktiv}
            aria-label={APP_MODE_LABELS[mode]}
            onClick={() => {
              if (!aktiv) onChangeMode(mode)
            }}
          >
            <Icon name={ICONS[mode]} groesse={18} />
            <span className="app-umschalter-lang">{APP_MODE_LABELS[mode]}</span>
            <span className="app-umschalter-kurz">{APP_MODE_KURZ[mode]}</span>
          </button>
        )
      })}
    </nav>
  )
}
