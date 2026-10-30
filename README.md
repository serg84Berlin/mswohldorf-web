# MS Wohldorf — Website

Neue Website für die **MS Wohldorf**, ehemalige HADAG-Hafenfähre (Baujahr 1959, Umbau 2016),
heute Eventschiff in Hamburg für bis zu 35 Gäste. Ersetzt https://www.mswohldorf.de/.

**Astro 7 + Tailwind CSS 4, rein statisch, für Netlify.** Keine Cookies, keine Analyse,
keine externen Anfragen beim Seitenaufruf — Inhalte Dritter (YouTube, Matterport,
OpenStreetMap) erst nach Klick.

> Stand: Vorschau. Inhalte der alten Seite sind übernommen (Quelle der Wahrheit:
> `quelle/alte-seite/`). Vor dem Livegang: [OFFENE-ANGABEN.md](OFFENE-ANGABEN.md) abarbeiten
> (rechtliche Prüfung von Impressum und Datenschutz, Formular-URL, DNS). Was woher stammt:
> [INHALT.md](INHALT.md).

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
| `PUBLIC_VORSCHAU` | `1` = Vorschau-Build: jede Seite bekommt `<meta name="robots" content="noindex,nofollow">` und ein „Vorschau"-Band. Auf Netlify für Deploy-Previews und Branch-Deploys automatisch gesetzt (`netlify.toml`). |

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

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run alte-seite` | Liest `quelle/alte-seite/` (offline) und erzeugt Foto-Katalog, Presse-Liste, `public/pdf/`, `public/alt/` und `quelle/alte-seite/texte.md`. Erkennt alle Galerien (auch `galerie//03_innen`, `thumb_`/`thumb-`). Mit `--quelle=https://…` würde es die Live-Seite spiegeln (Hosting gekündigt); `--trocken` zeigt nur an. |
| `npm run poster` | Rendert das Hero-Poster (quer/hoch) aus der 3D-Szene. Ablauf: `npm run build && npm run poster && npm run build`. Braucht Playwright + Chromium. |
| `npm run pruefen` | Alle Prüfungen (siehe unten). |
| `npm run offen` | Listet alle Platzhalter im Quelltext. |
| `node scripts/karte-erzeugen.mjs` | Erzeugt die statische Anfahrtskarte neu (OSM-Kacheln, einmalig). |
| `node scripts/schiff-freistellen.mjs <foto> <ziel.webp>` | Stellt das Schiff für die 3D-Bühne frei (Maske passt zum aktuellen Foto). |

## Prüfungen

```bash
npm run build
PUBLIC_ANFRAGE_URL=https://anfrage.example.test/v1/anfrage npx astro build --outDir dist-test
PUBLIC_VORSCHAU=1 npx astro build --outDir dist-vorschau
npm run pruefen    # Playwright (global installiert, require('playwright')) + Chromium
```

`tests/pruefen.mjs` liefert `dist/` wie Netlify aus (`tests/server.mjs`: Header aus
`netlify.toml` und `dist/_headers`, also mit echter CSP) und prüft u. a.: keine
Konsolenfehler, **keine externen Anfragen** (alle Requests werden abgefangen), kein
seitliches Scrollen bei 390 px, Lightbox/Karussell/Menüs per Tastatur, reduzierte Bewegung
(OS-Einstellung und Footer-Schalter), Rückfall ohne WebGL, Formular (Prüfung, Vorschau ohne
URL, 202/400/429/503/Netzfehler mit gemockter Antwort, JSON-Vertrag), axe-core (WCAG 2.2 A/AA)
auf allen Seiten in beiden Breiten, SEO-Grundlagen, Vorschau-Build, Seitengewicht.
Ergebnisse und Screenshots: `screenshots/` (`pruefbericht.json`).

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
2. Umgebungsvariablen setzen (`PUBLIC_ANFRAGE_URL`; `PUBLIC_VORSCHAU` nur für Vorschauen).
3. Deploy auslösen, Vorschau-URL prüfen (Band „Vorschau" erscheint nur bei Previews).

## Checkliste Livegang

- [x] Inhalte der alten Seite übernommen (`quelle/alte-seite/`, INHALT.md).
- [ ] **Impressum** rechtlich geprüft (OFFENE-ANGABEN.md Nr. 1: Komplementärin, USt-IdNr., Haftungstext).
- [ ] **Platzhalter** gefüllt: `npm run offen` meldet nur noch, was bewusst offen bleibt.
- [ ] Angaben aus der Presse 2019 bestätigt (OFFENE-ANGABEN.md, Abschnitt C).
- [ ] **Datenschutz** rechtlich geprüft, Platzhalter darin gefüllt, dann in `src/config.ts` `ENTWURF_HINWEIS_ANZEIGEN = false`.
- [ ] **Formular** verbunden: `PUBLIC_ANFRAGE_URL` gesetzt, Server erlaubt CORS für `https://www.mswohldorf.de`, Testanfrage kommt in Zoho CRM an.
- [ ] Hero-Foto entschieden; bei neuem Foto `scripts/schiff-freistellen.mjs` + `npm run poster`.
- [ ] `npm run build` und `npm run pruefen` grün.
- [ ] **DNS umstellen**: In Netlify *Domain management* `www.mswohldorf.de` als Primärdomain und `mswohldorf.de` hinzufügen. Beim bisherigen DNS-Anbieter: `www` als `CNAME` auf `<site>.netlify.app`, die Apex-Domain per `A`-Record auf Netlifys Load-Balancer-IP (aktuellen Wert in Netlify anzeigen lassen) — oder die Nameserver zu Netlify DNS umziehen. TTL vorher senken. Netlify stellt das TLS-Zertifikat (Let's Encrypt) automatisch aus und leitet `mswohldorf.de` → `www` um.
- [ ] Nach der Umstellung: https erzwingen (Netlify, Standard), alte Adressen testen (`/index.html`, `/kontakt`), `https://www.mswohldorf.de/sitemap-index.xml` in der Google Search Console einreichen.
- [ ] Erst nach einigen Tagen stabilen Betriebs HSTS mit `preload` erwägen.

## Aufbau

```
astro.config.mjs            Astro + Tailwind (Vite), Sitemap, CSP-Integration
netlify.toml                Build, Header, Cache, Weiterleitungen
integrationen/              Build-Integration: dist/_headers mit CSP
src/config.ts               zentrale Angaben und Schalter
src/layouts/Basis.astro     <head> (SEO, OG, JSON-LD, Fonts), Kopf, Fuß, Filter
src/components/             Hero, Welle, Zeitleiste, Galerie, Lightbox, Karussell,
                            ZweiKlick, AnfrageFormular, Platzhalter, EntwurfHinweis …
src/scripts/                kleine Module: seite, bewegung, formular, lightbox,
                            karussell, zeitleiste, zweiklick, hero/start + hero/szene
src/pages/                  Seiten (Anlass-Seiten aus src/data/anlaesse.ts)
scripts/                    Werkzeuge (alte Seite, Poster, Karte, Freistellen, Platzhalter)
tests/                      Prüfserver + Prüfungen (Playwright)
screenshots/                Ergebnisse der letzten Prüfung
```
