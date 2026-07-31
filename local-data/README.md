# Lokale RED-KURD-Daten

Dieser Ordner ist die lokale Quelle für große oder veröffentlichbare Datensätze.
Sein Inhalt wird nicht in Git aufgenommen.

- `cloudflare/daten/`: öffentliche, kleine Einzeldateien. Sie können mit
  `npm run data:upload` nach Cloudflare R2 übertragen werden. Das Skript erlaubt
  höchstens 3 GiB insgesamt und höchstens 95 MiB je Datei.
- `private/`: sehr große Rohdaten, Datenbanken, Sicherungen und nicht öffentliche
  Quellen. Dieser Bereich bleibt immer lokal.

Persönliche Lernstände gehören nicht hierher. Sie bleiben im Browser der
jeweiligen Person und können dort exportiert werden.
