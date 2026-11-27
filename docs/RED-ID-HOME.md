# Private RED ID browser pilot

Source: Redion PR #257, commit 350f0434fca8c8e0915c7d6ba0a9cf2a3afa9cfc, browser.mts copied unchanged.
In settings, explicitly enter a trusted private HTTPS home server, create
the public pairing request, approve in RED ION, claim in this app.
The server must explicitly allow this app's controlled HTTPS web origin.
No stored tokens, cookies, automatic refresh timer, or cross-app data
transfer. Component unmount or reload loses the local session; use logout
first, or revoke the app in RED ION. A server session may survive reload.
No replacement of the existing app account. Native secure storage,
browser network compatibility, full deployment and device tests are open.
