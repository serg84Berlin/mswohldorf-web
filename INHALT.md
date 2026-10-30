# Inhalt — was übernommen wurde und woher

Stand: 30.10.2026 · Gegenstück: [OFFENE-ANGABEN.md](OFFENE-ANGABEN.md)

## Quelle der Wahrheit: `quelle/alte-seite/`

Das Hosting der alten Seite ist gekündigt. Alles, was von ihr stammt, liegt im Repo:

| Pfad | Inhalt |
|---|---|
| `quelle/alte-seite/index.html` | Original-HTML von https://www.mswohldorf.de/ (eine Seite mit Modal-Dialogen) |
| `quelle/alte-seite/dateien/images/galerie/01_umbau/` | „Der Umbau 2016" — 10 Fotos (+ Vorschauen `thumb-…`) |
| `quelle/alte-seite/dateien/images/galerie/02_ueberfahrt/` | „Einzug in den Sandtorhafen in Hamburg 2017" — 14 Fotos (+ Vorschauen) |
| `quelle/alte-seite/dateien/images/galerie/03_innen/` | „Die MS Wohldorf von innen" — 32 Fotos (in der HTML auch als `galerie//03_innen`) |
| `quelle/alte-seite/dateien/images/galerie/04_aussenbereich/` | „Aussenbereich" — 18 Fotos (+ Vorschauen `thumb_…`) |
| `quelle/alte-seite/dateien/images/galerie-startseite/` | Galerie der Startseite — 9 Fotos |
| `quelle/alte-seite/dateien/images/*` | Social-Bild, NDR-Standbild, Presse-Ausschnitte und -Logos, Logos der Kundenstimmen, Seminarfoto, alte Wellengrafiken |
| `quelle/alte-seite/dateien/pdf/` | zwei Presse-PDFs |
| `quelle/alte-seite/dateien/favicon/` | alte Favicons |
| `quelle/alte-seite/texte.md` | alle Textblöcke der alten Seite in Reihenfolge + Prüfliste (erzeugt) |

`npm run alte-seite` liest diesen Ordner offline und erzeugt daraus `src/data/galerie.json`
(Katalog: Datei, Galerie, Original-Alt-Text, Größe), `src/data/presse.json`, `public/pdf/`,
`public/alt/` und `texte.md`. Die Fotos werden **nicht kopiert**, sondern direkt aus
`quelle/alte-seite/dateien/` in den Build eingebunden (`src/data/bilder.ts`). Von Hand
gepflegte Felder (Alt-Texte, Presse-Titel) bleiben bei jedem Lauf erhalten.

Zwei Tippfehler in der alten HTML löst das Skript auf: `wohldorf_innen_17jpg` →
`wohldorf_innen_17.jpg`; `wohldorf_innen_260.jpg` (fehlt auf dem Server) → das im
`<img>` verwendete `wohldorf_innen_26.jpg`.

## Weitere Quellen

| Nr. | Quelle | Was | Wo |
|---|---|---|---|
| Q1 | Auftrag | Matterport-ID, YouTube-IDs, Betreiber, Mail (alle auf der alten Seite bestätigt) | `src/config.ts` |
| Q2 | Lotsen-Repo `docs/BUCHUNG-MAILTEXTE.md` | Beschreibung „Naturschutzgebiet Heuckenlock, Finkenriek (Hamburg-Wilhelmsburg)" (die alte Seite sagt „Süderelbe" + Navi-Adresse) | `LIEGEPLATZ.beschreibung` |
| Q3 | YouTube oEmbed | Kanalnamen der Videos (Finanzelot, ulrichritter, Team Malizia) | `MEDIEN` |
| Q4 | YouTube-Vorschaubilder der eigenen Videos | Drohnenbild 2024, Einfahrt Sandtorhafen 2017 | `src/assets/video/` |
| Q5 | aus Q4 freigestellt | Schiffsebene der 3D-Bühne | `src/assets/hero/schiff-freigestellt.webp` |
| Q6 | eigene 3D-Szene | Hero-Poster | `src/assets/hero/poster-*.jpg` |
| Q7 | OpenStreetMap (ODbL) | statische Anfahrtskarte | `src/assets/karte/anfahrt.png` |
| Q8 | neu gestaltet | Bildmarke, Favicon | `Logo.astro`, `public/favicon.svg` |

**3D-Hero:** Die Schiffsebene bleibt das freigestellte Standbild aus dem Video 2024. Geprüft
wurden alle Außenfotos der alten Seite: Auf `wohldorf-schiffs-location-118` verdeckt der
Ponton den Rumpf, auf `wohldorf_ueberfahrt-hamburg_14` der Schlepper „Crusher" die halbe
Bordwand, die Umbau-Fotos zeigen das Schiff an Land und klein im Bild. Nur das
Drohnenbild zeigt die Wohldorf vollständig, mit Wasser ringsum — die Voraussetzung für
eine saubere Freistellung. Szene und Poster sind deshalb unverändert.

## Texte: was woher kommt

Alle Texte neu formuliert (Sie-Form), Fakten nur aus der alten Seite (AS), ihren
Presse-PDFs (B19 = „Alles unter einem Dach", boote, Mai 2019; UM = „Büro ahoi!",
Umbauen + Modernisieren) und den Kundenstimmen (KS). Wörtlich übernommen sind nur die
Kundenstimmen und das Impressum.

| Stelle | Inhalt | Quelle |
|---|---|---|
| Hero, Kurzvorstellung | 1959 in Dienst gestellt (AS: „1959 in Betrieb genommen"), Umbau 2016, bis zu 35 Personen, Süderelbe, Privatstraße, Parkplätze vor der Tür, Nutzungen „TV Produktion, Foto Shootings, Lesungen, Ausstellungen, Präsentationen, Brainstorming Tage, Basislager, Business-Essen", Küche mit Geräten | AS |
| Zahlen | 1959 · 35 Gäste (AS) · 165 m² Nutzfläche (B19, Zitat Ritter) · 607 Fahrgäste des Schiffstyps Typ III (B19) | AS, B19 |
| Anlass-Seiten | Nutzungen und Küche (AS); Raumaufteilung Haupt-/Oberdeck, Zentralheizung, Raumhöhe ca. 1,90 m, „nicht mehr aus eigener Kraft fahrtüchtig", „kleinere Feiern … keine Techno- und Disco-Partys" (UM/B19); Zugang nicht barrierefrei, Parkplätze (AS); Pfefferkörner (AS); Bildungswoche und Zitat Stöhr (KS) | AS, UM, B19, KS |
| Geschichte (8 Stationen) | 1959 DES, Typ III, 30 m, 607 Fahrgäste, Pendler/Touristen/Einheimische (AS, B19); Restaurantschiff „Wappen von Büsum", Hausboot Wilhelmshaven (B19); Kauf Januar 2016, Umbau in Finkenwerder bis Mai 2017 (B19); Einzug Sandtorhafen Mai 2017 (AS); Basislager Boris Herrmann (AS); Bildungswoche 2020–2023, > 500 Schüler:innen 2023 (KS); Pfefferkörner Staffel 19, Folge 246 (AS); bis Sommer 2024 im Hamburger Hafen, heute Süderelbe (AS) | AS, B19, KS |
| Steckbrief | „Linienbus ohne Räder" (UM), „eines der letzten sichtbaren Zeitzeugnisse dieses Schiffstyps" (KS), Lebenslauf-Link elbdampfer-hamburg.de (AS) | AS, UM, KS |
| Stimmen | zwei Briefe wörtlich (Dr. Rüdiger Stöhr, One Earth – One Ocean e.V.; Jürgen Becker, Wetter.Wasser.Waterkant.2023) mit Logos | KS |
| Film, TV & Presse | 2 Videos (Titel der alten Seite bzw. YouTube), Pfefferkörner mit NDR-Link und Standbild, Malizia-Link, 3 Presseberichte (2 PDFs, bau-welt.de online) mit den Ausschnitten der alten Seite | AS |
| Anfahrt | Süderelbe, Privatstraße, Parkplätze vor der Tür, Koordinaten, „dichteste Adresse für ein Navi", Zugang nicht barrierefrei | AS |
| Kontakt | Ulrich Ritter, Telefon +49 40 277347, Telefax +49 40 277387, info@finanzelot.de | AS |
| Impressum | wörtlich, mit den Änderungen unten | AS |
| Datenschutz | neuer Entwurf; Verantwortlicher mit Anschrift aus dem Impressum | AS (Impressum) |
| 3D-Rundgang | „entstand am früheren Liegeplatz im Sandtorhafen" (iframe-Titel der alten Seite: „Rundgang auf der MS Wohldorf im Hamburger Sandtorhafen") | AS |

### Änderungen am Impressum gegenüber der alten Seite

- „Angaben gemäß § 5 TMG" → „§ 5 DDG".
- Haftung für Inhalte: Verweise „gemäß § 7 Abs. 1 TMG" und „Nach §§ 8 bis 10 TMG" entfernt (TMG aufgehoben); Inhalt sonst wörtlich.
- Streitschlichtung: Satz und Link zur EU-OS-Plattform entfernt (Plattform am 20.07.2025 eingestellt); der Satz zur Verbraucherschlichtung bleibt wörtlich.
- „Handelsregister: 124152" und „HRA 124152" (beides auf der alten Seite) → einmal „HRA 124152".
- Bildnachweis: „Wohldorf: Andrea Klick" bleibt; ergänzt um Video-Standbilder, NDR-Standbild und OSM. Der zweite Eintrag der alten Seite (KI-generierte Hintergrundbilder) entfällt, weil die neue Seite diese Bilder nicht verwendet.

## Nicht übernommen (bewusst)

- Alte Datenschutzerklärung (Matomo, Sendinblue, Zoom, Kommentarfunktion, alter Hoster) — die neue Seite nutzt nichts davon; neuer Entwurf.
- Cookie-Banner, reCAPTCHA und alte Kontaktformular-Technik der alten Seite.
- Hintergrund- und Wellengrafiken der alten Seite (`welle.png`, `welle-bottom.png`) — liegen in `quelle/`, die neue Seite zeichnet ihre Wellen als SVG.
- `oeoo_img.jpg` (Seminarfoto mit Schulklasse) — Personen, darunter vermutlich Minderjährige; ohne ausdrückliche Freigabe nicht verwendet.
- Startseiten-Galerie: im Start-Teaser stehen `wohldorf01`–`06`; die drei Sanitär-Fotos `wohldorf07`–`09` nicht. Auf `/galerie/` erscheint die Startseiten-Galerie nicht, weil sie Varianten der Innen-Fotos enthält (dort stehen auch die Sanitär-Fotos).
- Alte Favicons: liegen unter `public/alt/`, die Seite verwendet das neue Favicon.

## Alt-Texte

Die alte Seite hatte je Galerie denselben Alt-Text (z. B. „MS Wohldorf von innen", teils
mit Tippfehler „Wohdorf"). Er steht weiter als `altOriginal` im Katalog. Jedes der 83 Fotos
hat einen neuen, beschreibenden Alt-Text in `src/data/galerie.json` (nur Sichtbares
beschrieben).
