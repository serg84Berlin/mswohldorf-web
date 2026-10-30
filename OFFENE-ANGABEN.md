# Offene Angaben

Alles, was auf der Seite als gestrichelter Kasten „Angabe folgt — bitte von Uli ergänzen: …"
erscheint (Komponente `<Platzhalter>`), plus Punkte, die vor dem Livegang geklärt sein
müssen. Aktuelle Liste aus dem Quelltext: `npm run offen`.

**Livegang-Blocker** sind mit ⛔ markiert.

## A. Von der bisherigen Website übernehmen (Host war beim Bau gesperrt)

Erst `npm run alte-seite` laufen lassen (siehe INHALT.md), dann:

| Nr. | Was | Wo |
|---|---|---|
| 1 ⛔ | **Impressum vollständig**: Anschrift; Vertretung (Komplementärin, Geschäftsführung); Telefon, Fax; Registergericht/HRA (KG) und HRB (Komplementärin); USt-IdNr.; alle weiteren Pflichtangaben (z. B. Aufsichtsbehörde, Erlaubnisse, Vermittlerregister); verantwortlich nach § 18 Abs. 2 MStV; Aussage zur Verbraucherstreitbeilegung. „TMG" ist bereits durch „§ 5 DDG" ersetzt. Kein Link mehr auf die eingestellte EU-OS-Plattform. | `src/pages/impressum.astro` |
| 2 ⛔ | **Telefon (und Fax)** wie auf der alten Seite → einmal in `KONTAKT` eintragen, dann erscheint es in Footer, Anfrage, Impressum, Datenschutz und JSON-LD (`telephone`) | `src/config.ts` |
| 3 | **Kundenstimmen** wörtlich (Zitat, Name/Firma) | `src/data/stimmen.ts` |
| 4 | **Presse-PDFs** (Titel, Medium, Datum) — kommen mit `npm run alte-seite`; Titel prüfen | `src/data/presse.json`, `public/pdf/` |
| 5 | **Galerie** — kommt mit `npm run alte-seite`; Alt-Texte prüfen; je Foto passende Anlässe eintragen (`anlaesse: ["firmenevent", …]`), damit die Anlass-Seiten eigene Bilder zeigen | `src/data/galerie.json` |
| 6 | **Bestes Schiffsfoto für den Hero** auswählen. Heute: Standbild aus dem Video 2024, von Hand freigestellt. Bei einem besseren Foto neu freistellen (`scripts/schiff-freistellen.mjs`) und `npm run poster` | `src/assets/hero/` |
| 7 | **Bildnachweis** der Galerie-Fotos (Fotografin/Fotograf bzw. Rechteinhaber) | `src/pages/impressum.astro` |
| 8 | `images/welle.png` und alte Favicons: werden mit abgelegt (`src/assets/alt/`, `public/alt/`); die neue Seite nutzt eine neu gestaltete SVG-Welle und ein neues Favicon — bitte entscheiden, ob das alte Favicon bleiben soll | — |

## B. Angaben für Anlässe und Ausstattung (fehlen auch auf der alten Seite)

| Nr. | Was | Wo |
|---|---|---|
| 9 | **Preise / Pakete** je Anlass (Firmen, Workshop-Tagespauschalen, Drehtage, Kultur, privat) | `src/data/anlaesse.ts` → `offen` |
| 10 | **Catering / Getränke**: feste Partner, freie Wahl oder Selbstversorgung? | dito |
| 11 | **Ausstattung**: Technik (Bildschirm/Beamer, Musik, Licht, Ton), Strom, WLAN, Heizung, Toiletten | dito |
| 12 | **Barrierefreiheit** von Zugang (Gangway) und Schiff | dito, `Anfahrt.astro` |
| 13 | **Bestuhlung / Raumaufteilung** (Reihe, U-Form, Gruppentische) | dito |
| 14 | **Uhrzeiten, Lautstärke, Saison** | dito |
| 15 | **Film & Foto**: Drehgenehmigung am Liegeplatz, Referenzen (welche Produktionen dürfen genannt werden?) | dito, `src/data/geschichte.ts` |
| 16 | **Kultur**: Hängemöglichkeiten, öffentliche Veranstaltungen mit Ticketverkauf? | dito |
| 17 | **Dekoration** bei privaten Feiern | dito |
| 18 | **Fahrten**: Liegt das Schiff nur am Liegeplatz, oder sind Ausfahrten möglich? (Die Texte versprechen bewusst keine Fahrten.) | Texte allgemein |

## C. Geschichte und Liegeplatz

| Nr. | Was | Wo |
|---|---|---|
| 19 ⛔ | **Aktueller Liegeplatz bestätigen**: Laut Auftrag Sandtorhafen (Mai 2017); laut Navi-Hinweis der alten Seite (Lotsen-Repo) und Koordinaten: Finkenriek, Finkenrieker Hauptdeich 14, 21109 Hamburg. Die Seite zeigt Finkenriek als „heute". Seit wann? Anreise mit Bus/Bahn? | `src/config.ts` (`LIEGEPLATZ`), `src/data/geschichte.ts`, `Anfahrt.astro` |
| 20 | Werft, Indienststellung und Einsatzzeit bei der HADAG; was beim Umbau 2016 gemacht wurde; Zeitraum Basislager Boris Herrmann; TV-Produktionen mit Sender/Jahr | `src/data/geschichte.ts` |
| 21 | Freigabe: Dürfen die Standbilder aus den Videos „MS Wohldorf 2024" (Kanal Finanzelot) und „Wohldorf 2017 Einlaufen im Sandtorhafen" (Kanal ulrichritter) als Fotos verwendet werden? | `src/assets/video/` |
| 22 | Die Videos sind im Auftrag als „TV-Auftritte" bezeichnet, tragen auf YouTube aber die Titel „MS Wohldorf 2024" und „Wohldorf 2017 Einlaufen im Sandtorhafen". Die Seite verwendet die YouTube-Titel. Gibt es echte TV-Beiträge, die eingebunden werden sollen? | `src/config.ts` (`MEDIEN`) |

## D. Datenschutz (Entwurf — vor Veröffentlichung rechtlich prüfen ⛔)

| Nr. | Was | Wo |
|---|---|---|
| 23 ⛔ | Rechtliche Prüfung des Entwurfs; danach `ENTWURF_HINWEIS_ANZEIGEN = false` | `src/config.ts` |
| 24 | Anschrift/Telefon des Verantwortlichen (wie Impressum); Datenschutzbeauftragter benannt oder nicht | `src/pages/datenschutz.astro` |
| 25 | Netlify: AV-Vertrag abgeschlossen? Rechtsgrundlage USA (SCC, ggf. DPF); Speicherdauer der Server-Logs | dito |
| 26 | Hosting-Anbieter des eigenen Anfrage-Servers (Merlin, Deutschland) nennen | dito |
| 27 | Zoho CRM: Vertragspartner und Sitz (EU-Rechenzentrum), AV-Vertrag | dito |
| 28 | Löschfrist für unbeantwortete/abgelehnte Anfragen | dito |
| 29 | Matterport: Rechtsgrundlage der USA-Übermittlung prüfen | dito |

## E. Technik vor dem Livegang

| Nr. | Was |
|---|---|
| 30 ⛔ | `PUBLIC_ANFRAGE_URL` in Netlify setzen (Ziel des Anfrage-Servers, https). Der Server muss CORS für `https://www.mswohldorf.de` erlauben (Preflight `OPTIONS` mit `Content-Type: application/json`). |
| 31 | DNS von mswohldorf.de auf Netlify umstellen (siehe README „Livegang") |
