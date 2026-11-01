# MS Wohldorf — Website

Neue Website für die **MS Wohldorf**, ehemalige HADAG-Hafenfähre (Baujahr 1959, Umbau 2016),
heute Eventschiff in Hamburg für bis zu 35 Gäste. Ersetzt https://www.mswohldorf.de/.

**Astro 7 + Tailwind CSS 4, rein statisch, für Netlify.** Keine Cookies, keine Analyse,
keine externen Anfragen beim Seitenaufruf — Inhalte Dritter (YouTube, Matterport,
OpenStreetMap) erst nach Klick.

> Stand: Vorschau. Inhalte der alten Seite sind übernommen (Quelle der Wahrheit:
> `quelle/alte-seite/`). Vor dem Livegang: [OFFENE-ANGABEN.md](OFFENE-ANGABEN.md) abarbeiten
> (rechtliche Prüfung von Impressum und Datenschutz, Formular-URL, DNS). Was woher stammt:
> [INHALT.md](INHALT.md). Fehlende **inhaltliche** Angaben (Preise, Technik, Catering …)
> halten den Livegang nicht auf; fehlende **rechtliche** sperren den Produktions-Build
> (siehe [Platzhalter und Livegang-Sperre](#platzhalter-und-livegang-sperre)).

## Schnellstart

Voraussetzung: **Node.js ≥ 22.23.4** (Astro 7; Netlify baut mit Node 24, siehe `netlify.toml`).

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # dist/ lokal ansehen
npm run check      # astro check (TypeScript + Astro)
```

## Umgebungsvariablen

Lokal in `.env` (Vorlage: `.env.beispiel`), auf Netlify unter *Site configuration →
Environment variables*. Beide werden **beim Bauen** eingesetzt — nach einer Änderung neu bauen.

| Variable | Bedeutung |
|---|---|
| `PUBLIC_ANFRAGE_URL` | Ziel des Anfrageformulars (`POST`, JSON, https). **Leer** = das Formular zeigt „Vorschau: Das Formular ist noch nicht verbunden …" mit Mail-Link und sendet nichts. Der Ursprung landet automatisch in der CSP (`connect-src`). Ungültige oder `http://`-Adressen brechen den Build ab. |
| `PUBLIC_VORSCHAU` | `1` = Vorschau-Build: jede Seite bekommt `<meta name="robots" content="noindex,nofollow">` und ein „Vorschau"-Band, **alle Platzhalter erscheinen als gestrichelter Kasten**, die Livegang-Sperre ist aus. Auf Netlify für Deploy-Previews und Branch-Deploys automatisch gesetzt (`netlify.toml`); für *Production* bis zum Livegang von Hand (siehe [Bis zum Livegang](#bis-zum-livegang-production-als-vorschau)). **Leer** = Produktions-Build: inhaltliche Platzhalter als neutraler Text, offene rechtliche Angaben **brechen den Build ab**. |

## Seiten

`/` (Hero, Kurzvorstellung, Zahlen, Anlässe, Geschichte, Galerie, 3D-Rundgang, Stimmen,
Film & Presse, Anfahrt, Anfrage) · `/anlaesse/firmenevent/` · `/anlaesse/workshop-seminar/` ·
`/anlaesse/film-und-foto/` · `/anlaesse/lesung-ausstellung/` · `/anlaesse/private-feier/` ·
`/geschichte/` · `/galerie/` · `/anfrage/` · `/impressum/` · `/datenschutz/` · `404`

Inhalte stehen getrennt vom Layout:

| Datei | Inhalt |
|---|---|
| `src/config.ts` | Kontakt, Liegeplatz, Fakten, Medien-IDs, Formular-Auswahl, Schalter `ENTWURF_HINWEIS_ANZEIGEN` |
| `src/data/anlaesse.ts` | die fünf Anlass-Seiten (Texte, SEO, offene Punkte) |
| `src/data/geschichte.ts` | Stationen der Zeitleiste |
| `quelle/alte-seite/` | die alte Website: HTML, alle Fotos, PDFs, Favicons (Quelle der Wahrheit, wird direkt eingebunden) |
| `src/data/galerie.json` | Foto-Katalog mit Alt-Texten (erzeugt von `npm run alte-seite`, Alt-Texte von Hand gepflegt) |
| `src/data/bilder.ts` | welches Foto wo erscheint (Start, Karussell, Anlass-Seiten, Galerie-Abschnitte) |
| `src/data/presse.json`, `public/pdf/` | Presse |
| `src/data/stimmen.ts` | Kundenstimmen (wörtlich) |

## Platzhalter und Livegang-Sperre

Was noch fehlt, steht als `<Platzhalter>` im Quelltext (`src/components/Platzhalter.astro`)
oder in den `offen`-Listen der Anlässe (`src/data/anlaesse.ts`). Es gibt zwei Arten:

| | **inhaltlich** (Standard) | **rechtlich** (`<Platzhalter pflicht>`) |
|---|---|---|
| Wofür | Preise, Technik, Catering, Bestuhlung … (OFFENE-ANGABEN.md B–D) | Impressum, Datenschutz, Bildrechte (OFFENE-ANGABEN.md A) |
| Vorschau (`PUBLIC_VORSCHAU=1`) | gestrichelter Kasten „Angabe folgt — bitte von Uli ergänzen: …" | Kasten „Angabe folgt · Pflicht — …" (orange) |
| Produktion | neutraler Text: inline „auf Anfrage", als Block „Details dazu stimmen wir gern persönlich mit Ihnen ab — fragen Sie einfach an." (mit Link auf `/anfrage/`); je Stelle anpassbar mit `ersatz="…"` (`ersatz=""` = nichts zeigen) und `anfrage="/anfrage/?anlass=…"` | **Build bricht ab** mit Seite und Text |

Die `offen`-Listen der Anlässe werden in Produktion nicht als Liste gezeigt, sondern als **ein
Satz** aus dem Feld `offenKurz`: „Preise und Pakete, Catering, Technik und Uhrzeiten stimmen
wir individuell mit Ihnen ab — sprechen Sie uns an." (Link auf die Anfrage mit Anlass).

**Livegang-Sperre** (`integrationen/livegang-sperre.mjs`, letzte Integration in
`astro.config.mjs`): Nach dem Bau durchsucht sie alle HTML-Seiten. Steht im Produktions-Build
noch ein rechtlicher Platzhalter oder der Entwurf-Hinweis der Datenschutzerklärung
(`ENTWURF_HINWEIS_ANZEIGEN = true`), endet `npm run build` mit Fehler:

```
[ERROR] [mswohldorf-livegang-sperre] LIVEGANG GESPERRT — 12 rechtliche Angabe(n) offen. …
  /datenschutz/  Entwurf-Hinweis ist an — nach der rechtlichen Prüfung in src/config.ts ENTWURF_HINWEIS_ANZEIGEN = false setzen
  /datenschutz/  benannt / nicht benannt (nicht verpflichtet) — bitte festlegen
  /impressum/    Nummer hat 10 statt 9 Ziffern — bitte prüfen (OFFENE-ANGABEN.md Nr. 1b)
  …
```

Warum Abbruch statt Warnung, auch beim Entwurf-Hinweis: Eine Warnung in einem erfolgreichen
Netlify-Build liest niemand — die Seite wäre trotzdem veröffentlicht. Ein Abbruch kostet nichts,
denn Netlify veröffentlicht einen gescheiterten Build nicht und zeigt weiter den letzten guten
Stand; wer die Seite trotzdem zeigen will, baut ausdrücklich als Vorschau (`PUBLIC_VORSCHAU=1`,
noindex + Band). Die Sperre greift erst, nachdem `dist/` vollständig geschrieben ist — so lässt
sich der Produktionsstand lokal trotzdem prüfen (`npm run pruefen`).

Ist ein rechtlicher Punkt geklärt: Text im Quelltext korrigieren und den Platzhalter löschen
(nicht in einen inhaltlichen umwandeln). `npm run offen` zeigt, was noch fehlt.

`npm run dev` zeigt die Seite wie in Produktion (neutraler Text, rechtliche Kästen sichtbar,
keine Sperre); alle Kästen lokal: `PUBLIC_VORSCHAU=1 npm run dev`.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run alte-seite` | Liest `quelle/alte-seite/` (offline) und erzeugt Foto-Katalog, Presse-Liste, `public/pdf/`, `public/alt/` und `quelle/alte-seite/texte.md`. Erkennt alle Galerien (auch `galerie//03_innen`, `thumb_`/`thumb-`). Mit `--quelle=https://…` würde es die Live-Seite spiegeln (Hosting gekündigt); `--trocken` zeigt nur an. |
| `npm run poster` | Rendert das Hero-Poster (quer/hoch) aus der 3D-Szene. Ablauf: `npm run build && npm run poster && npm run build`. Braucht Playwright + Chromium. |
| `npm run pruefen` | Alle Prüfungen (siehe unten). |
| `npm run offen` | Listet alle offenen Angaben im Quelltext — zuerst **Pflicht** (rechtliche Platzhalter und `ENTWURF_HINWEIS_ANZEIGEN = true`; sperren den Produktions-Build), dann **inhaltlich** (Platzhalter ohne `pflicht`, `offen`-Listen). |
| `node scripts/karte-erzeugen.mjs` | Erzeugt die statische Anfahrtskarte neu (OSM-Kacheln, einmalig). |
| `node scripts/schiff-freistellen.mjs <foto> <ziel.webp>` | Stellt das Schiff für die 3D-Bühne frei (Maske passt zum aktuellen Foto). |

## Prüfungen

```bash
npm run build      # Produktion → dist/ (endet mit „LIVEGANG GESPERRT", solange rechtliche Angaben offen sind — erwartet)
PUBLIC_VORSCHAU=1 PUBLIC_ANFRAGE_URL=https://anfrage.example.test/v1/anfrage npx astro build --outDir dist-test
PUBLIC_VORSCHAU=1 npx astro build --outDir dist-vorschau
npm run pruefen    # Playwright (global installiert, require('playwright')) + Chromium
```

Solange rechtliche Angaben fehlen, scheitert nur `npm run build` — mit der Liste der offenen
Stellen. `dist/` ist trotzdem vollständig (die Sperre läuft zuletzt) und wird geprüft. Die
Formular-Prüfungen (`dist-test/`) brauchen keinen Produktions-Build und laufen deshalb als Vorschau.

`tests/pruefen.mjs` liefert `dist/` wie Netlify aus (`tests/server.mjs`: Header aus
`netlify.toml` und `dist/_headers`, also mit echter CSP) und prüft u. a.: keine
Konsolenfehler, **keine externen Anfragen** (alle Requests werden abgefangen), kein
seitliches Scrollen bei 390 px, Lightbox/Karussell/Menüs per Tastatur, reduzierte Bewegung
(OS-Einstellung und Footer-Schalter), Rückfall ohne WebGL, Formular (Prüfung, Vorschau ohne
URL, 202/400/429/503/Netzfehler mit gemockter Antwort, JSON-Vertrag), axe-core (WCAG 2.2 A/AA)
auf allen Seiten in beiden Breiten, SEO-Grundlagen, Vorschau-Build, Seitengewicht,
**Platzhalter**: Vorschau zeigt gestrichelte Kästen; Produktion enthält „Angabe folgt"/„bitte von
Uli ergänzen" nur noch in rechtlichen Kästen, und jeder davon sperrt den Build; die `offen`-Listen
sind je ein Satz mit Anfrage-Link. Die **Livegang-Sperre** selbst prüft ein kleines eigenes
Astro-Projekt (`tests/livegang-sperre/`, unabhängig vom Stand der Website): Produktion nur mit
inhaltlichen Platzhaltern läuft durch und zeigt den neutralen Text, mit rechtlichem Platzhalter
oder Entwurf-Hinweis scheitert sie mit Seite und Text, als Vorschau läuft sie durch.
Ergebnisse und Screenshots: `screenshots/` (`pruefbericht.json`, dort auch `livegang`: offene
rechtliche Stellen), Ausgaben des Prüfprojekts in `test-ergebnisse/`.

## Anfrage-Schnittstelle (Vertrag mit dem Server)

```
POST <PUBLIC_ANFRAGE_URL>
Content-Type: application/json

{ "quelle": "mswohldorf", "anlass": "Firmenevent", "datum": "2027-06-12" | null,
  "ausweichdatum": "YYYY-MM-DD" | null, "gaeste": 24 | null, "name": "…", "email": "…",
  "telefon": "…" | null, "nachricht": "…", "einwilligung": true,
  "website": "" (Honigtopf-Feld), "dauerMs": 48211 (Zeit vom Laden bis Absenden) }
```

| Antwort | Anzeige |
|---|---|
| `202 {"ok":true}` | „Danke! Ihre Anfrage ist angekommen. Wir melden uns persönlich bei Ihnen." |
| `400 {"fehler":"feld","feld":"email","satz":"…"}` | `satz` direkt am Feld + Fehlerliste |
| `429 {"fehler":"zu_viele"}` | „Gerade kommen sehr viele Anfragen …" + Mail-Link |
| `503 {"fehler":"aus"}` | „Das Formular ist im Moment abgeschaltet …" + Mail-Link |
| Netzwerkfehler / anderer Status | freundliche Meldung + vorbefüllter Mail-Link |

`anlass` ist einer von: Firmenevent, Workshop/Seminar, Film & Foto, Lesung/Ausstellung,
Private Feier, Sonstiges. Der Server muss **CORS** für `https://www.mswohldorf.de` erlauben
(Preflight `OPTIONS`, Header `Content-Type`). Ohne JavaScript öffnet das Formular das
Mailprogramm (`mailto:`-Formular) — und ein Hinweis nennt die Mailadresse.

## Gestaltung

- **Farben**: Navy/Petrol dominieren (`tiefe #0a1d30`, `nacht #06121f`, `petrol #0f4c5c`),
  Messing/Sand als Akzent (`messing #c8963e`, `messing-hell #e0b872`, `sand-hell #f6efe2`),
  Off-White `schaum #faf7f0`. Kontraste (WCAG AA): Schaum auf Tiefe 15,9 : 1 · Messing-hell
  auf Tiefe 9,2 · Nebel `#b9c6d3` auf Tiefe 9,8 · Knopf (Tiefe auf Messing) 6,4 · Messing-dunkel
  `#8a6420` auf Schaum 5,0 / auf Sand-hell 4,7 · Grau `#4a5a6a` auf Schaum 6,6.
- **Schriften**: Fraunces (Display-Serif) + Inter, beide selbst gehostet über `@fontsource`
  (nur Latin-Dateien werden geladen, vorab per `preload`).
- **Motiv Welle**: animierte SVG-Wellen zwischen den Abschnitten mit Messing-Linie.
- **Bewegung**: 3D-Hero, Wort-für-Wort-Überschrift, Scroll-Reveal (IntersectionObserver),
  Zähler, Zeitleiste als Scroll-Erzählung, Karten mit 3D-Neigung und Lichtschimmer,
  magnetische Knöpfe, Bild-Hover mit SVG-Wasserfilter, 3D-Karussell in der Galerie,
  Seitenwechsel per View Transitions mit Wellen-Wischer. Keine Animationsbibliothek.
- **Alles respektiert „Bewegung reduzieren"**: `<html data-bewegung="an|aus">` wird vor dem
  ersten Zeichnen gesetzt — aus der Systemeinstellung oder dem Schalter im Footer
  (gespeichert in `localStorage`, Zugriff in `try/catch`). Bei „aus": keine Animationen,
  keine 3D-Szene (Poster statt WebGL), Zeitleiste als ruhige Liste, Galerie als Raster.

### 3D-Hero

`src/scripts/hero/szene.ts` (three.js 0.187.0): Wasser mit Gerstner-Wellen im eigenen Shader
(Fresnel, Himmelsspiegelung, Messing-Glitzern der tiefen Sonne, Dunst), Himmelskuppel,
gezeichnete Hafensilhouette, die echte Wohldorf als freigestellte Bildebene (2.5D) mit
Schaukeln, Wasserlinie und Schatten. Maus-/Neigungs-Parallaxe; beim Scrollen gleitet die
Kamera hinab und nach vorn.

- **Laden**: erst nach `load`, im Leerlauf (`requestIdleCallback`), per `import()`.
- **Nur auf fähigen Geräten**: WebGL2 vorhanden, Bewegung erlaubt, kein Datensparmodus,
  `deviceMemory` ≥ 4. Sonst bleibt das **Poster** (gleiche Komposition, mit Ken-Burns-Zoom;
  bei reduzierter Bewegung ruhig). Das Poster ist das LCP-Bild (`fetchpriority="high"`).
- **Sparsam**: Pixelverhältnis höchstens 1,5; Renderschleife pausiert außerhalb des
  Bildschirms und bei verborgenem Tab; bei Kontextverlust zurück zum Poster.
- **Gewicht**: rund 130 kB (gzip) JavaScript + 50 kB Schiffsbild, zusätzlich und nachgeladen.

## Sicherheit

- `netlify.toml`: HSTS, Referrer-Policy, Permissions-Policy (erlaubt Vollbild/Autoplay nur
  für YouTube-nocookie und Matterport), X-Content-Type-Options, X-Frame-Options,
  COOP; lange Cache-Zeiten für gehashte Dateien unter `/_astro/`.
- **Content-Security-Policy** schreibt der Build nach `dist/_headers`
  (`integrationen/sicherheits-header.mjs`): `script-src 'self'` plus Hashes der wenigen
  Inline-Skripte (automatisch berechnet), `connect-src` mit dem Ursprung von
  `PUBLIC_ANFRAGE_URL`, `frame-src` nur youtube-nocookie.com, my.matterport.com,
  www.openstreetmap.org, `frame-ancestors 'none'`. `style-src` erlaubt `'unsafe-inline'`
  (Astro setzt Stil-Attribute für CSS-Variablen).
- Weiterleitungen alter Adressen: `/index.html`, `/index.htm`, `/index.php` → `/`,
  `/images/galerie/*` → `/galerie/`, `/kontakt` → `/#anfahrt` (wird in den Buchungsmails
  verlinkt), `/impressum.html`, `/datenschutz.html`.

## Auf Netlify veröffentlichen

1. Repository bei Netlify verbinden (*Add new site → Import an existing project*).
   Build-Befehl, Ordner und Node-Version kommen aus `netlify.toml`.
2. Umgebungsvariablen setzen (`PUBLIC_ANFRAGE_URL`; `PUBLIC_VORSCHAU` siehe unten).
3. Deploy auslösen, Vorschau-URL prüfen (Band „Vorschau" erscheint nur bei Vorschau-Builds).

### Bis zum Livegang: Production als Vorschau

`netlify.toml` setzt `PUBLIC_VORSCHAU = "1"` nur für Deploy-Previews und Branch-Deploys. Der
**Production**-Kontext (mswohldorf.netlify.app) baut ohne — und scheitert deshalb an der
Livegang-Sperre, solange Impressum und Datenschutz nicht fertig sind. Netlify zeigt dann weiter
den letzten erfolgreichen Stand; neue Commits auf `main` kommen nicht an.

Damit mswohldorf.netlify.app bis dahin die aktuelle Vorschau zeigt:

1. Netlify → *Site configuration → Environment variables → Add a variable*:
   Key `PUBLIC_VORSCHAU`, Value `1`, *Scopes*: Builds; *Deploy contexts*: nur **Production**
   (bei „Different value for each deploy context" nur das Feld *Production* füllen).
2. *Deploys → Trigger deploy → Deploy site*. Ergebnis: Build läuft durch, jede Seite hat
   noindex und das Band „Vorschau", offene Angaben sind als Kästen sichtbar.
3. **Zum Livegang** (Impressum und Datenschutz fertig, `npm run offen` meldet keine Pflicht
   mehr): die Variable für Production **löschen** und neu deployen. Jetzt prüft die Sperre —
   läuft der Build durch, ist die Seite ohne noindex und ohne Band live.

## Checkliste Livegang

- [x] Inhalte der alten Seite übernommen (`quelle/alte-seite/`, INHALT.md).
- [ ] **Impressum** rechtlich geprüft (OFFENE-ANGABEN.md Nr. 1: Komplementärin, USt-IdNr., Haftungstext) und Bildrechte bestätigt (Nr. 9); die `pflicht`-Platzhalter in `src/pages/impressum.astro` gelöscht.
- [ ] **Datenschutz** rechtlich geprüft, `pflicht`-Platzhalter darin gefüllt und gelöscht, dann in `src/config.ts` `ENTWURF_HINWEIS_ANZEIGEN = false`.
- [ ] `npm run offen` meldet **0 Pflicht**. Inhaltliche Punkte (Preise, Technik, Catering …) dürfen offen bleiben — die Seite zeigt dort „auf Anfrage" bzw. „… stimmen wir individuell mit Ihnen ab".
- [ ] `npm run build` **ohne** `PUBLIC_VORSCHAU` läuft durch (keine „LIVEGANG GESPERRT"-Meldung).
- [ ] Angaben aus der Presse 2019 bestätigt (OFFENE-ANGABEN.md, Abschnitt C).
- [ ] **Formular** verbunden: `PUBLIC_ANFRAGE_URL` gesetzt, Server erlaubt CORS für `https://www.mswohldorf.de`, Testanfrage kommt in Zoho CRM an.
- [ ] Hero-Foto entschieden; bei neuem Foto `scripts/schiff-freistellen.mjs` + `npm run poster`.
- [ ] `npm run build` und `npm run pruefen` grün.
- [ ] Netlify: `PUBLIC_VORSCHAU` für **Production** gelöscht (siehe [Bis zum Livegang](#bis-zum-livegang-production-als-vorschau)), Deploy erfolgreich, kein „Vorschau"-Band auf mswohldorf.netlify.app.
- [ ] **DNS umstellen**: In Netlify *Domain management* `www.mswohldorf.de` als Primärdomain und `mswohldorf.de` hinzufügen. Beim bisherigen DNS-Anbieter: `www` als `CNAME` auf `<site>.netlify.app`, die Apex-Domain per `A`-Record auf Netlifys Load-Balancer-IP (aktuellen Wert in Netlify anzeigen lassen) — oder die Nameserver zu Netlify DNS umziehen. TTL vorher senken. Netlify stellt das TLS-Zertifikat (Let's Encrypt) automatisch aus und leitet `mswohldorf.de` → `www` um.
- [ ] Nach der Umstellung: https erzwingen (Netlify, Standard), alte Adressen testen (`/index.html`, `/kontakt`), `https://www.mswohldorf.de/sitemap-index.xml` in der Google Search Console einreichen.
- [ ] Erst nach einigen Tagen stabilen Betriebs HSTS mit `preload` erwägen.

## Aufbau

```
astro.config.mjs            Astro + Tailwind (Vite), Sitemap, CSP-Integration
netlify.toml                Build, Header, Cache, Weiterleitungen
integrationen/              Build-Integrationen: dist/_headers mit CSP, Livegang-Sperre
src/config.ts               zentrale Angaben und Schalter
src/layouts/Basis.astro     <head> (SEO, OG, JSON-LD, Fonts), Kopf, Fuß, Filter
src/components/             Hero, Welle, Zeitleiste, Galerie, Lightbox, Karussell,
                            ZweiKlick, AnfrageFormular, Platzhalter, EntwurfHinweis …
src/scripts/                kleine Module: seite, bewegung, formular, lightbox,
                            karussell, zeitleiste, zweiklick, hero/start + hero/szene
src/pages/                  Seiten (Anlass-Seiten aus src/data/anlaesse.ts)
scripts/                    Werkzeuge (alte Seite, Poster, Karte, Freistellen, Platzhalter)
tests/                      Prüfserver + Prüfungen (Playwright), Prüfprojekt livegang-sperre/
screenshots/                Ergebnisse der letzten Prüfung
```
