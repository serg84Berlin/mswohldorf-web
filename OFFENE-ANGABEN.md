# Offene Angaben

Was auf der Seite noch fehlt (`<Platzhalter>` bzw. die `offen`-Listen der Anlässe) und was vor
dem Livegang geklärt sein muss. Aktuelle Liste aus dem Quelltext: `npm run offen` (Pflicht
zuerst). **Livegang-Blocker** sind mit ⛔ markiert.

Zwei Arten (Einzelheiten: README, „Platzhalter und Livegang-Sperre"):

- **Rechtlich — `pflicht`** (Abschnitt A): In der Vorschau (`PUBLIC_VORSCHAU=1`) als Kasten
  „Angabe folgt · Pflicht — bitte von Uli ergänzen: …". Im Produktions-Build **bricht der Build
  ab** und nennt Seite und Text — ebenso, solange `ENTWURF_HINWEIS_ANZEIGEN = true` ist. So kann
  keine rechtliche Lücke unbemerkt live gehen. Geklärt → Text korrigieren, Platzhalter löschen.
- **Inhaltlich** (Abschnitte B–D): In der Vorschau als gestrichelter Kasten „Angabe folgt — bitte
  von Uli ergänzen: …". Im Produktions-Build steht dort neutraler Text („auf Anfrage", „Details
  dazu stimmen wir gern persönlich mit Ihnen ab — fragen Sie einfach an."); die `offen`-Liste
  eines Anlasses wird zu einem Satz aus `offenKurz` („… stimmen wir individuell mit Ihnen ab —
  sprechen Sie uns an."). **Die Seite kann also live gehen, bevor diese Angaben da sind.**

## Erledigt durch die Übernahme der alten Seite (30.10.2026)

Telefon und Telefax · Impressum (Anschrift, Register, Vertretung, Postfach, USt-ID,
Haftung, Urheberrecht, Bildnachweis „Andrea Klick") · Ansprechpartner Ulrich Ritter ·
Kundenstimmen (zwei Briefe, wörtlich) · Presse (2 PDFs + bau-welt.de) · alle Galerien
(83 Fotos, neue Alt-Texte) · Liegeplatz bestätigt („Auf der Süderelbe …", bis Sommer 2024
im Hamburger Hafen) · Zugang nicht barrierefrei · Küche mit Geräten · TV-Auftritt
(„Die Pfefferkörner", NDR) · Basislager Boris Herrmann (Malizia Ocean Festival) ·
Geschichte (DES, Typ III, Restaurantschiff, Hausboot, Kauf 2016, Umbau in Finkenwerder) ·
Fahrten: laut Presse 2019 fährt das Schiff nicht mehr aus eigener Kraft — die Seite
spricht deshalb von Veranstaltungen am Liegeplatz.

## A. Rechtliches ⛔ — sperrt den Produktions-Build

Jeder Punkt hier steht als `<Platzhalter pflicht>` im Quelltext (bzw. Nr. 2 als Schalter
`ENTWURF_HINWEIS_ANZEIGEN`). Solange einer übrig ist, scheitert der Produktions-Build. Bis dahin
läuft Production auf Netlify mit `PUBLIC_VORSCHAU=1` (README, „Bis zum Livegang").

| Nr. | Was | Wo |
|---|---|---|
| 1 ⛔ | **Impressum rechtlich prüfen.** Wörtlich übernommen, aber: (a) Die alte Seite nennt als „persönlich haftenden Gesellschafter" Ulrich Ritter. Bei einer GmbH & Co. KG ist das in der Regel die Komplementär-GmbH — dann gehören deren Firma, Sitz, Registergericht und HRB-Nummer sowie ihre Geschäftsführung ins Impressum. (b) Die USt-IdNr. `DE3223275031` hat 10 statt 9 Ziffern — bitte prüfen. EU-Prüfung (VIES) am 01.11.2026: diese Nummer und alle 9-stelligen Varianten ungültig — richtige Nummer von Uli nötig (oder Zeile streichen, falls es keine gibt). (c) Im Haftungsteil wurden die Verweise auf das aufgehobene TMG entfernt; prüfen, ob der Text so bleiben soll. | `src/config.ts` (`BETREIBER`), `src/pages/impressum.astro` — je ein `pflicht`-Platzhalter für (a), (b), (c) |
| 2 ⛔ | **Datenschutz-Entwurf rechtlich prüfen**, dann `ENTWURF_HINWEIS_ANZEIGEN = false` (sonst bricht der Produktions-Build ab; mit `false` entfällt auch „(Entwurf)" beim Stand). | `src/config.ts` |
| 3 ⛔ | Datenschutz: Datenschutzbeauftragter benannt oder nicht? Die alte Erklärung nannte als verantwortliche Stelle Ulrich Ritter persönlich (Postfach 110689) mit `ritter@finanzelot.de`; der Entwurf nennt die Finanzelot GmbH & Co. KG mit `info@finanzelot.de` — welche Adresse soll für Datenschutzanfragen gelten? (Die Adressfrage hat keinen eigenen Platzhalter; sie gehört zur Prüfung in Nr. 2.) | `src/pages/datenschutz.astro` — `pflicht`-Platzhalter |
| 4 ⛔ | Netlify: AV-Vertrag, Rechtsgrundlage USA (SCC, ggf. DPF), Speicherdauer der Server-Logs | dito — zwei `pflicht`-Platzhalter |
| 5 ⛔ | Hosting-Anbieter des eigenen Anfrage-Servers (Merlin, Deutschland) | dito — `pflicht` |
| 6 ⛔ | Zoho CRM: Vertragspartner und Sitz (EU-Rechenzentrum), AV-Vertrag | dito — `pflicht` |
| 7 ⛔ | Löschfrist für unbeantwortete/abgelehnte Anfragen | dito — `pflicht` |
| 8 ⛔ | Matterport: Rechtsgrundlage der USA-Übermittlung | dito — `pflicht` |
| 9 ⛔ | Bildrechte: NDR-Standbild („Die Pfefferkörner"), Presse-Ausschnitte und die zwei Video-Standbilder wie auf der alten Seite verwenden? | `src/data/bilder.ts`, `PresseFilm.astro`; `pflicht`-Platzhalter im Bildnachweis von `src/pages/impressum.astro` |

## B. Angaben für Anlässe (auch auf der alten Seite nicht vorhanden) — inhaltlich, kein Blocker

In Produktion zeigt jede Anlass-Seite statt der Liste einen Satz aus `offenKurz`. Ist ein Punkt
geklärt: Angabe in `absaetze`/`wissen` aufnehmen, ihn aus `offen` streichen und `offenKurz`
anpassen (sind alle geklärt, `offen: []` — dann entfällt der Satz).

| Nr. | Was | Wo |
|---|---|---|
| 10 | **Preise / Pakete** je Anlass (Firmen, Workshop-Tagespauschalen, Drehtage, Kultur, privat) | `src/data/anlaesse.ts` → `offen` |
| 11 | **Catering / Getränke**: feste Partner oder freie Wahl? (Küche mit Geräten ist an Bord.) | dito |
| 12 | **Technik**: Musik/Beschallung, Präsentationstechnik (Bildschirm/Beamer), WLAN (laut Presse 2019 „Telefon und Datenverkehr über einen mobilen Router"), Strom für Film/Licht | dito |
| 13 | **Bestuhlung / Raumaufteilung** (Reihe, U-Form, Gruppentische) | dito |
| 14 | **Uhrzeiten, Lautstärke, Saison** | dito |
| 15 | **Film & Foto**: Drehgenehmigung am Liegeplatz / Ansprechpartner | dito |
| 16 | **Kultur**: Hängemöglichkeiten, öffentliche Veranstaltungen mit Ticketverkauf? | dito |
| 17 | **Dekoration** bei privaten Feiern | dito |

## C. Bitte bestätigen (aus Presse 2019 übernommen, nicht von der alten Website selbst) — kein Blocker

Diese Angaben stehen auf der Seite, stammen aber aus den Presse-PDFs von 2019 — vor dem
Umzug auf die Süderelbe. Bitte kurz bestätigen oder korrigieren:

| Nr. | Angabe | Wo |
|---|---|---|
| 18 | Raumaufteilung: Hauptdeck mit großem Veranstaltungsbereich und kleinerem, verglastem Besprechungsraum; Oberdeck mit Büro und Kombüse | Anlass-Seiten „Gut zu wissen" |
| 19 | Zentralheizung mit gusseisernen Heizkörpern | dito |
| 20 | Raumhöhe etwa 1,90 m | Film & Foto |
| 21 | „Kleinere Feiern — keine Techno- und Disco-Partys" | Private Feier |
| 22 | Nicht mehr aus eigener Kraft fahrtüchtig → Veranstaltungen nur am Liegeplatz | Anlass-Seiten |
| 23 | 165 m² Nutzfläche (Zitat Ritter) und 607 Fahrgäste (Typ-III-Serie) | Zahlen, Steckbrief |
| 24 | Toiletten: Die Innen-Fotos zeigen WCs an Bord — darf die Seite „Toiletten an Bord" sagen? (steht bisher nicht drin) | — |

## D. Geschichte — kein Blocker

Fehlt eine Angabe zu einer Station, kann sie als `offen: '…'` in `src/data/geschichte.ts`
stehen: in der Vorschau als Kasten auf /geschichte/, in Produktion fällt sie weg.

| Nr. | Was | Wo |
|---|---|---|
| 25 | Jahr des Basislagers für Boris Herrmann (Malizia Ocean Festival) — die alte Seite nennt keins | `src/data/geschichte.ts` |
| 26 | Ende des Linienbetriebs: boote (2019) sagt „bis Anfang der 1970er-Jahre", Umbauen + Modernisieren „23 Jahre lang im Einsatz" — die Seite nennt deshalb kein Jahr | dito |

## E. Technik vor dem Livegang

| Nr. | Was |
|---|---|
| 27 ⛔ | `PUBLIC_ANFRAGE_URL` ist in Netlify gesetzt (`https://finanzelot-lotse.de/api/oeffentlich/anfrage`). **Offen:** Der Server erlaubt CORS bisher nur für `https://mswohldorf.netlify.app` — Test am 01.11.2026: Preflight von `https://www.mswohldorf.de` liefert 204 ohne `Access-Control-Allow-Origin`. Vor der DNS-Umstellung im Anfrage-Server (Repo „Lotse“) `https://www.mswohldorf.de` freigeben. |
| 28 ⛔ | DNS von mswohldorf.de auf Netlify umstellen (README „Livegang"). Domain und DNS liegen bei **IONOS** (Nameserver `ui-dns`). Auf der Domain läuft **Zoho-Mail** (MX `mx*.zoho.eu`, SPF `include:one.zoho.eu include:_spf-eu.ionos.com`) — deshalb bei IONOS bleiben und nur den A-Record und `www` ändern, **nicht** die Nameserver zu Netlify umziehen. Klären: Ist die Domain Teil des gekündigten Vertrags (Webspace endet im Dezember 2026)? Dann vorher herauslösen, sonst sind Website und Mail weg. |
| 29 | Altes Favicon behalten oder das neue? (alt: `public/alt/`) |
| 30 | Optional: Anreise mit Bus/Bahn ergänzen |
