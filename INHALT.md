# Inhalt — was übernommen wurde und woher

Stand: 30.10.2026 · Gegenstück: [OFFENE-ANGABEN.md](OFFENE-ANGABEN.md)

## Wichtig vorab: Die alte Seite war beim Bau nicht erreichbar

`https://www.mswohldorf.de/` (und `mswohldorf.de`) wurde von der Netzwerk-Richtlinie der
Bauumgebung blockiert (Proxy: `connect_rejected`; der Abrufdienst meldete den Host als
nicht freigegeben). Auch das Web-Archiv (`web.archive.org`) war nicht erreichbar.
**Deshalb ist von der alten Seite selbst noch nichts 1:1 übernommen** — weder HTML-Texte
noch Galerie, PDFs, `images/welle.png`, Favicons, Alt-Texte, Kundenstimmen oder das
Impressum.

Nachholen, sobald der Host erreichbar ist (oder mit einer lokalen Kopie der alten Seite):

```bash
npm run alte-seite                          # holt von https://www.mswohldorf.de/
npm run alte-seite -- --quelle=../alte-kopie  # oder aus einem Ordner
```

Das Skript (`scripts/alte-seite-holen.mjs`) legt die Galerie in `src/assets/galerie/` ab
(große Bilder statt `thumb_`-Vorschauen, Alt-/Title-Texte nach `src/data/galerie.json`),
die PDFs in `public/pdf/` (Linktexte nach `src/data/presse.json`), `welle.png` nach
`src/assets/alt/`, Favicons nach `public/alt/` und schreibt die Original-HTML samt allen
Textblöcken und einer Prüfliste der Fakten nach `quelle/alte-seite/`. Galerie, Presse und
Anlass-Seiten füllen sich danach beim nächsten `npm run build` von selbst. Am Fixture
getestet (Probelauf), gegen die echte Seite noch nicht.

## Quellen, die tatsächlich verwendet wurden

| Nr. | Quelle | Was | Wo im Projekt |
|---|---|---|---|
| Q1 | Auftrag (Fakten laut Auftraggeber von der alten Seite, **nicht gegen deren HTML geprüft**) | Ex-HADAG-Hafenfähre, Baujahr 1959; Umbau 2016; Mai 2017 in den Sandtorhafen; Basislager für Boris Herrmann; TV-Auftritte; bis zu 35 Gäste; Nutzungen TV-Produktionen, Fotoshootings, Lesungen, Ausstellungen „und mehr"; Koordinaten 53.474464814706096, 10.013551864414687; Matterport-ID `9eU3eAd8TLz`; YouTube-IDs `HvahxVqWtg0`, `2ksTeXx8_DA` (Einbettung), `ABHuBRonV4k` (Link); Betreiber Finanzelot GmbH & Co. KG; E-Mail info@finanzelot.de | `src/config.ts`, alle Texte |
| Q2 | Finanzelot-Lotse-Repo, `docs/BUCHUNG-MAILTEXTE.md` und `backend/src/services/buchung-mail.js` (dort vermerkt: „Angaben von der Website (Kontakt, von Ulrich am 30.09.2026 geliefert)") | Liegeplatz „an der Süderelbe im Naturschutzgebiet Heuckenlock in Finkenriek (Hamburg-Wilhelmsburg)"; Navi-Adresse „Finkenrieker Hauptdeich 14, 21109 Hamburg"; „Mit den Koordinaten … führt Google Maps Sie über die Privatstraße direkt zum Liegeplatz"; „Parkplätze gibt es direkt vor der Gangway"; Verweis `[Website]/kontakt#anfahrt` | `src/config.ts` (`LIEGEPLATZ`), Anfahrt, Footer, JSON-LD; Weiterleitung `/kontakt` → `/#anfahrt` in `netlify.toml` |
| Q3 | YouTube oEmbed (abgerufen 30.10.2026) | Titel und Kanäle: „MS Wohldorf 2024" (Kanal Finanzelot), „Wohldorf 2017 Einlaufen im Sandtorhafen" (Kanal ulrichritter), „Malizia Ocean Festival - Preparation for the Christening" (Team Malizia – Boris Herrmann) | `src/config.ts` (`MEDIEN`) |
| Q4 | YouTube-Vorschaubilder der **eigenen** Videos (`i.ytimg.com/vi/<ID>/maxresdefault.jpg`, 1280×720, einmalig beim Bau geladen, liegen jetzt im Projekt) | Drohnenbild der Wohldorf am Liegeplatz (Video 2024); Einlaufen im Sandtorhafen (Video 2017) | `src/assets/video/ms-wohldorf-2024.jpg`, `src/assets/video/einlaufen-sandtorhafen-2017.jpg` |
| Q5 | Aus Q4 abgeleitet: Schiff von Hand freigestellt (`scripts/schiff-freistellen.mjs`, Polygonmaske) | Schiffsebene der 3D-Bühne | `src/assets/hero/schiff-freigestellt.webp` |
| Q6 | Eigene 3D-Szene (gerendert mit `npm run poster`) | Hero-Poster quer/hoch (LCP und Rückfall) | `src/assets/hero/poster-quer.jpg`, `poster-hoch.jpg` |
| Q7 | OpenStreetMap-Kacheln (© OpenStreetMap-Mitwirkende, ODbL), 20 Kacheln Zoom 15, einmalig mit `scripts/karte-erzeugen.mjs` | Statische Anfahrtskarte (getönt, mit Marker) | `src/assets/karte/anfahrt.png` |
| Q8 | Neu gestaltet | Bildmarke/Favicon (Fähre auf Welle im Messingring), Web-Manifest | `src/components/Logo.astro`, `public/favicon.svg`, `public/*.png` |
| Q9 | Neu geschrieben (Entwurf) | Datenschutzerklärung für genau diese Website | `src/pages/datenschutz.astro` |

Die YouTube-Vorschaubilder (Q4) sind Standbilder aus Videos der Kanäle „Finanzelot" und
„ulrichritter" — also aus eigenem Material des Betreibers. Bitte trotzdem bestätigen, dass
sie als Fotos verwendet werden dürfen (OFFENE-ANGABEN.md, Nr. 21).

## Textblöcke

Alle Texte sind neu formuliert (Sie-Form) und stützen sich nur auf Q1–Q3. Nicht erfunden:
keine Preise, keine Caterer, keine Ausstattung, keine Auszeichnungen, keine Fahrten.

| Seite / Abschnitt | Inhalt | Grundlage |
|---|---|---|
| Kopf, Footer | „MS Wohldorf · Eventschiff · Hamburg"; Kurztext Footer (HADAG-Hafenfähre 1959, Umbau 2016, bis zu 35 Gäste); E-Mail; Liegeplatz-Adresse; Betreiber | Q1, Q2 |
| Start · Hero | „Ein Stück Hafengeschichte für Ihren Anlass." + Unterzeile (gebaut 1959 als HADAG-Hafenfähre, 2016 umgebaut, Bühne für Firmenevents, Workshops, Drehs, Lesungen, private Feiern, bis zu 35 Gäste) | Q1 |
| Start · Kurzvorstellung | „Ein Ort, der Gespräche in Gang bringt." + zwei Absätze + vier Eckdaten (35 Gäste; 1959/2016; Süderelbe, Parken an der Gangway; 3D-Rundgang) | Q1, Q2 |
| Start · Zahlen | 1959 Baujahr · 35 Gäste · 2016 Umbau · Jahre Schiffsgeschichte (berechnet: aktuelles Jahr − 1959) | Q1 |
| Start · Anlässe-Karten | fünf Kurztexte (Firmenevent, Workshop & Seminar, Film & Foto, Lesung & Ausstellung, Private Feier) | Q1 (Nutzungen); Karten für Firmenevent/Workshop/Private Feier = Anlass-Struktur aus dem Auftrag |
| Start · Geschichte / `/geschichte/` | sechs Stationen: 1959, 2016, Mai 2017 Sandtorhafen, Basislager Boris Herrmann, Film & TV, Heute (Liegeplatz Finkenriek) | Q1, Q2, Q3; Lücken als Platzhalter |
| Start · Galerie | zwei Standbilder (Q4) + „Foto folgt"-Kacheln | Q4 |
| Start · 3D-Rundgang | Erklärtext + Zwei-Klick-Box für Matterport | Q1 |
| Start · Stimmen | nur Platzhalter (Kundenstimmen nicht verfügbar) | — |
| Start · Film & Presse | zwei Videos (Zwei-Klick, youtube-nocookie), Malizia-Link, Presse-Liste als Platzhalter | Q1, Q3 |
| Start · Anfahrt | Beschreibung, Navi-Adresse, Koordinaten, Hinweis Privatstraße/Parken, Links Google/Apple/OSM, statische Karte, OSM nach Klick | Q1, Q2, Q7 |
| Start · Anfrage | kompaktes Formular + Mail | Auftrag |
| `/anlaesse/*` (5 Seiten) | je SEO-Titel/-Beschreibung, Einleitung, zwei Absätze, vier Vorteile, „Gut zu wissen" (Platzhalter), Eindrücke, CTA | Q1, Q2 (Parken); `src/data/anlaesse.ts` |
| `/anfrage/` | Formular, „So geht es weiter", Kontakt | Auftrag |
| `/impressum/` | Gerüst nach § 5 DDG (statt „TMG"), Firma und E-Mail; alles Weitere Platzhalter | Q1; Rest fehlt |
| `/datenschutz/` | Entwurf (Netlify, keine Cookies/Analyse, localStorage-Schalter, Formular → eigener Server → Zoho CRM EU, Zwei-Klick YouTube/Matterport/OSM, Rechte, HmbBfDI) | Auftrag, Q9 |
| `/404` | „Hier ist kein Wasser unterm Kiel." + Links | neu |

## Bild-Alt-Texte

Die Alt-Texte der alten Galerie konnten nicht übernommen werden. Neu geschrieben (nur
Sichtbares beschrieben):

- `ms-wohldorf-2024.jpg`: „Die MS Wohldorf von oben an ihrem Liegeplatz: weißer Aufbau, grünes Dach, Hamburg-Flagge am Mast, daneben Ponton und Gangway."
- `einlaufen-sandtorhafen-2017.jpg`: „Mai 2017: Die MS Wohldorf läuft in den Sandtorhafen ein — links die Elbphilharmonie, im Hintergrund die Kräne des Hafens."
- Karte: „Kartenausschnitt: Liegeplatz der MS Wohldorf an der Süderelbe in Finkenriek, Hamburg-Wilhelmsburg (Finkenrieker Hauptdeich 14, 21109 Hamburg)."

Nach `npm run alte-seite` stehen die alten Alt-Texte in `src/data/galerie.json`; dort
prüfen und bei Bedarf verbessern (leere Alt-Texte meldet das Skript mit ⚠).
