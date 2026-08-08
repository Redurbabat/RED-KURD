// Rechte Zusatzspalte am breiten Desktop: Tagesziel, Empfehlung, Wochenüberblick
// und ein Hinweis von Hêlo. Auf Handy und Tablet wird sie nicht gerendert
// (die Inhalte stehen dort im Hauptbereich).
import Card from '../common/Card.jsx'
import ProgressBar from '../common/ProgressBar.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Icon from '../icons/Icon.jsx'
import HeloMessage from '../mascot/HeloMessage.jsx'
import { navigiere } from '../../app/router.jsx'
import { tagesZiel } from '../../core/progress/progressStore.js'
import { tageszielWert } from '../../core/profile/profileStore.js'
import {
  statistik,
  wochenAktivitaet,
  schwaechsteFertigkeit,
  fertigkeiten,
  fertigkeitStufe,
  lernzeitText,
} from '../../core/progress/progressSelectors.ts'
import { aktuelleEinheit, einheitProzent } from '../../core/courses/courseRepository.ts'

const FERTIGKEIT_NAMEN = {
  erkennen: 'Erkennen',
  abrufen: 'Abrufen',
  schreiben: 'Schreiben',
  hoeren: 'Hören',
}

const FERTIGKEIT_ZIEL = {
  hoeren: '/practice/listening',
  schreiben: '/practice/writing',
  abrufen: '/practice/review',
  erkennen: '/practice/images',
}

function HeloHinweis({ s, einheit }) {
  if (s.faellig > 12) {
    return `Du hast ${s.faellig} Wiederholungen offen. Eine kurze Runde bringt dich wieder auf Kurs.`
  }
  if (s.serie === 0) {
    return 'Eine einzige Aufgabe heute startet deine Tagesserie.'
  }
  if (s.gelernt < 10) {
    return `Wir sind bei „${einheit.name}". Neue Wörter bleiben besser hängen, wenn du sie laut mitsprichst.`
  }
  return `${s.serie} Tage am Stück — genau so wächst dein Kurmancî.`
}

export default function SideColumn({ modus = 'modern' }) {
  const s = statistik()
  const ziel = tagesZiel(tageszielWert())
  const woche = wochenAktivitaet()
  const max = Math.max(1, ...woche.map((t) => t.anzahl))
  const einheit = aktuelleEinheit()
  const schwach = schwaechsteFertigkeit()
  const f = fertigkeiten()

  return (
    <div className="rk-zusatz">
      <Card titel="Tägliches Ziel" icon="stern">
        <p className="rk-zusatz-zahl">
          {ziel.erledigt} <span>/ {ziel.ziel}</span>
        </p>
        <ProgressBar
          wert={ziel.erledigt}
          max={ziel.ziel}
          label={`Tagesziel: ${ziel.erledigt} von ${ziel.ziel} Aufgaben`}
          farbe={ziel.geschafft ? 'gold' : 'green'}
        />
        <p className="gedaempft">
          {ziel.geschafft
            ? 'Geschafft! Alles Weitere ist Bonus.'
            : `Noch ${ziel.ziel - ziel.erledigt} Aufgaben bis zum Ziel.`}
        </p>
      </Card>

      <Card titel="Woche" icon="kalender">
        <ul className="rk-zusatz-woche">
          {woche.map((t) => (
            <li key={t.datum} className={t.heute ? 'heute' : undefined}>
              <span
                className="rk-zusatz-saeule"
                style={{ height: Math.max(4, Math.round((t.anzahl / max) * 56)) + 'px' }}
                aria-hidden="true"
              />
              <small>{t.tag}</small>
              <span className="nur-sr">
                {t.tag}: {t.anzahl} Aufgaben
              </span>
            </li>
          ))}
        </ul>
        <p className="gedaempft">
          <Icon name="uhr" groesse={14} /> Lernzeit gesamt: {lernzeitText(s.lernzeit)}
        </p>
      </Card>

      <Card titel="Nächster Schritt" icon="kompass">
        <p>
          <strong>{einheit.name}</strong> · {einheitProzent(einheit.id)} % geschafft
        </p>
        {schwach && (
          <p className="gedaempft">
            Schwächste Fertigkeit: {FERTIGKEIT_NAMEN[schwach]} ({f[schwach]} %,{' '}
            {fertigkeitStufe(f[schwach])})
          </p>
        )}
        <PrimaryButton
          breit
          groesse="klein"
          art={modus === 'abenteuer' ? 'gold' : 'primaer'}
          onClick={() =>
            navigiere(
              modus === 'abenteuer'
                ? `/adventure/lesson/${einheit.id}`
                : schwach
                  ? FERTIGKEIT_ZIEL[schwach]
                  : '/session'
            )
          }
        >
          {modus === 'abenteuer' ? 'Weitergehen' : schwach ? 'Gezielt üben' : 'Sitzung starten'}
        </PrimaryButton>
      </Card>

      <HeloMessage
        variante={s.faellig > 12 ? 'denken' : 'daumen'}
        text={HeloHinweis({ s, einheit })}
        groesse={64}
      />
    </div>
  )
}
