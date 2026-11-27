import { useEffect, useRef, useState } from "react";
import { createRedBrowserIdentity, RedBrowserError, type RedBrowserClient, type BrowserIdentity } from "./browser.mts";

/** Deliberately memory-only. No localStorage, cookies, IndexedDB or automatic data transfer. */
export default function RedHomeIdentity() {
  const [origin, setOrigin] = useState("");
  const [connectedOrigin, setConnectedOrigin] = useState("");
  const [request, setRequest] = useState("");
  const [identity, setIdentity] = useState<BrowserIdentity | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Nicht verbunden.");
  const client = useRef<RedBrowserClient | null>(null);
  const active = useRef(false);
  const working = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; client.current?.dispose(); client.current = null; };
  }, []);
  async function run(action: () => Promise<void>) {
    if (working.current) return;
    working.current = true; setBusy(true);
    try { await action(); }
    catch (e) {
      if (active.current) {
        if (e instanceof RedBrowserError && e.status === 401) setIdentity(null);
        setStatus(e instanceof RedBrowserError && e.status === 401
          ? "Noch nicht freigegeben oder Sitzung abgelaufen. RED ION prüfen."
          : "Anfrage fehlgeschlagen. HTTPS-Adresse, Netz, Serverfreigabe und Anmeldung prüfen.");
      }
    } finally { working.current = false; if (active.current) setBusy(false); }
  }
  function reset() {
    client.current?.dispose(); client.current = null;
    setConnectedOrigin(""); setRequest(""); setIdentity(null);
  }
  const begin = () => void run(async () => {
    if (!globalThis.isSecureContext || !globalThis.crypto?.subtle) {
      setStatus("Sicherer Browser-Kontext mit WebCrypto erforderlich."); return;
    }
    const exact = origin.trim();
    if (!client.current) {
      client.current = createRedBrowserIdentity(exact, "red-kurd");
      setConnectedOrigin(exact);
    }
    const value = await client.current.begin();
    if (!active.current) return;
    setRequest(value);
    setStatus("Öffentliche Anfrage in RED ION übernehmen, vergleichen und freigeben.");
  });
  const claim = () => void run(async () => {
    if (!client.current) return;
    const value = await client.current.claim();
    if (!active.current) return;
    setIdentity(value); setRequest(""); setStatus("RED ID verbunden. Keine App-Daten übertragen.");
  });
  const check = () => void run(async () => {
    if (!client.current) return;
    const value = await client.current.me();
    if (!active.current) return;
    setIdentity(value); setStatus("RED ID verbunden.");
  });
  const disconnect = () => void run(async () => {
    if (!client.current) return;
    try {
      await client.current.logout();
      if (active.current) setStatus("RED ID getrennt.");
    } catch {
      if (active.current) setStatus("Lokaler Zugang gelöscht. Serverzugang in RED ION widerrufen.");
    } finally { if (active.current) reset(); }
  });
  return (
    <div style={{ display: "grid", gap: 12, padding: 12, minWidth: 0 }}>
      <strong>Private RED ID</strong>
      <small>Nur dein eigener HTTPS-Home-Server. Keine automatische Übertragung. Zugang nur im Arbeitsspeicher; beim Verlassen der Seite geht er verloren. Vorher abmelden oder später in RED ION widerrufen.</small>
      <label style={{ display: "grid", gap: 4 }}>Serveradresse
        <input type="url" autoComplete="off" spellCheck={false} placeholder="https://server.example" value={origin}
          disabled={busy || Boolean(connectedOrigin)} onChange={e => setOrigin(e.target.value)}
          style={{ padding: 10, border: "1px solid currentColor", borderRadius: 8, color: "inherit", background: "transparent", minWidth: 0 }} />
      </label>
      {!request && !identity && <button type="button" disabled={busy || !origin.trim()} onClick={begin}>Kopplungsanfrage erstellen</button>}
      {request && <div style={{ display: "grid", gap: 8 }}>
        <label>Öffentliche Anfrage <textarea readOnly value={request} rows={4} style={{ width: "100%", color: "inherit", background: "transparent", overflowWrap: "anywhere" }} /></label>
        <button type="button" disabled={busy} onClick={claim}>Freigegebene Anmeldung übernehmen</button>
        <button type="button" disabled={busy} onClick={() => { reset(); setStatus("Kopplung abgebrochen. Offene Freigaben können in RED ION widerrufen werden."); }}>Abbrechen</button>
      </div>}
      {identity && <div style={{ display: "grid", gap: 8 }}>
        <span>Konto: {identity.name || identity.id}</span>
        <button type="button" disabled={busy} onClick={check}>Verbindung prüfen</button>
        <button type="button" disabled={busy} onClick={disconnect}>Abmelden</button>
      </div>}
      {connectedOrigin && !identity && !request && <button type="button" disabled={busy} onClick={disconnect}>Verbindung zurücksetzen</button>}
      <small role="status">{busy ? "Anfrage läuft …" : status}</small>
    </div>
  );
}
