# CLAUDE.md — MS Wohldorf Website

**Dieses Repo ist genau ein Projekt:** die Website der MS Wohldorf (www.mswohldorf.de).
Nicht mit anderen Projekten oder Ventures vermischen. Was hier nicht steht, gehört nicht hierher.

## Worum es geht

- **Kunde:** Finanzelot GmbH & Co. KG, Hamburg. Ansprechpartner: Ulrich Ritter („Uli“).
- **Gegenstand:** MS Wohldorf, ehemalige HADAG-Hafenfähre (1959, Umbau 2016), heute Eventschiff
  für bis zu 35 Gäste am Liegeplatz auf der Süderelbe (Finkenriek, Hamburg-Wilhelmsburg).
- **Auftrag:** neue Website, ersetzt die alte Seite. Der alte Webspace endet im **Dezember 2026**,
  Livegang ist für **Anfang November 2026** geplant.

## Technik in einem Satz

Astro 7 + Tailwind 4, rein statisch, Netlify (Projekt `mswohldorf`, mswohldorf.netlify.app).
Keine Cookies, keine Analyse, keine externen Anfragen beim Seitenaufruf. Einzelheiten: `README.md`.

```bash
npm ci
npm run dev                                  # http://localhost:4321
PUBLIC_VORSCHAU=1 npx astro build --outDir dist-vorschau   # Vorschau-Build, läuft immer durch
npm run build                                # Produktion — scheitert, solange rechtliche Angaben offen sind (gewollt)
npm run check                                # astro check
npm run offen                                # alle offenen Angaben, Pflicht zuerst
npm run pruefen                              # Playwright-Prüfungen gegen dist/
npm run profilbilder                         # Bilder für Google/Apple/Portale → dist-profilbilder/
npm run suchdaten                            # Search Console lesen; `-- --index` prüft alle Seiten (braucht GSC_DIENSTKONTO_B64)
```

## Regeln für Änderungen

1. **Nichts erfinden.** Fakten nur aus `quelle/alte-seite/` (Quelle der Wahrheit), den Presse-PDFs
   oder von Uli. Fehlt etwas: `<Platzhalter>` (inhaltlich) oder `<Platzhalter pflicht>` (rechtlich),
   nie einen plausiblen Wert einsetzen. Herkunft jeder Angabe: `INHALT.md`.
2. **Inhalt steht nicht im Layout:** Angaben in `src/config.ts`, Texte in `src/data/*`.
3. **Ist ein rechtlicher Punkt geklärt:** Text korrigieren und den `pflicht`-Platzhalter löschen,
   nie in einen inhaltlichen umwandeln. Danach `OFFENE-ANGABEN.md` nachziehen.
4. **Livegang-Sperre nicht umgehen** (`integrationen/livegang-sperre.mjs`): Sie verhindert, dass
   ein Impressum oder Datenschutz mit Lücken live geht.
5. **Keine externen Anfragen beim Laden:** Drittinhalte nur per Zwei-Klick (`ZweiKlick.astro`);
   neue Ursprünge brauchen einen Eintrag in der CSP (`integrationen/sicherheits-header.mjs`).
6. Code, Dateien und Texte auf Deutsch, Kunden in der Sie-Form.
7. Vor jedem Push: `npm run check`, Vorschau-Build und – wenn Seiten betroffen sind – `npm run pruefen`.

## Stand (21.11.2026)

- **Live seit 05.11.2026** auf https://www.mswohldorf.de: DNS bei IONOS umgestellt (A `@` → `75.2.60.5`,
  CNAME `www` → `mswohldorf.netlify.app`; MX/SPF für Zoho unverändert), `www` ist Primary Domain,
  Let's-Encrypt-Zertifikat für `mswohldorf.de` und `www`, `PUBLIC_VORSCHAU` für Production gelöscht.
  Deploy-Previews und Branch-Deploys bleiben Vorschau (`netlify.toml`).
- Gemerged: PR #1 (neue Seite, Inhalte der alten Seite), PR #2 (Platzhalter-Arten, Livegang-Sperre),
  PR #3 (diese Datei), PR #4 (Rechtliches 10/12, Reichweite Phase 1), PR #5 (Reichweite Phase 2),
  PR #6 (Rückmeldung Uli, Ratgeber, Englisch), PR #7 (Datenschutz freigegeben, `LIVEGANG.md`),
  PR #8 (CORS-Schritt für Merlin), PR #9 (Live-Stand), PR #10 (Phase 5: `PROFILE.md`, Profilbilder, `PROFIL_LINKS`),
  PR #11 (Ausstattung WLAN/PA/DJ/Parkplätze), PR #12 (3D-Hero), PR #13 (Dreharbeiten nur einmal), PR #14 (35 Gäste/165 m², Video-Plan),
  PR #15 (Film Commission, Plan für Scouts), PR #16 (Domain-Umzug, Mail-Einträge), PR #17 (`npm run suchdaten`),
  PR #18 (`/sitemap.xml`).
- Rechtliches: alle Pflicht-Punkte geklärt (Sergiy; Uli per Mail 04.11.2026: Impressum wie finanzelot.de,
  kein Datenschutzbeauftragter; Preise, Catering, Technik usw. „alles auf Anfrage“). Datenschutzerklärung
  von Sergiy freigegeben (04.11.2026) — `npm run build` läuft durch. **Livegang-Anleitung: `LIVEGANG.md`.**
- Reichweite und Leads: Plan und Entscheidungen in `REICHWEITE.md`. Phase 1 gebaut: `/haeufige-fragen/`
  (FAQPage-Schema, Daten `src/data/fragen.ts`), `/llms.txt`, `/offsite-hamburg/` (Anreise `src/data/anreise.ts`).
  Phase 2 gebaut: Exposé-PDF (`npm run expose`, Vorlage `/expose/`), Lead-Block mit Schnellanfrage
  (`LeadBlock.astro`, `AnfrageFormular schnell`), Erstantwort-Hinweis (Server meldet `erstantwort: true`),
  Lead-Quelle hinter `PUBLIC_ANFRAGE_ERWEITERT=1`. Ändern sich Angaben im Exposé: `npm run expose` neu laufen lassen.
  Phase 3 gebaut: Ratgeber (`/ratgeber/`, Artikel in `src/content/ratgeber/`, Quellen Pflicht) und Englisch
  (`/en/`, `/en/faq/`, Texte `src/data/englisch.ts`). **Ändert sich ein Fakt, auch `src/data/englisch.ts`,
  die Ratgeber-Artikel und das Exposé mitziehen.**
- Ausstattung (Uli, 07.11.2026): WLAN, PA-Anlage, eigener DJ erlaubt, 20 Parkplätze — zentral in `AUSSTATTUNG`
  (`src/config.ts`), auf Häufige Fragen, Anlass-Seiten, Englisch, Exposé, llms.txt und im Schema.
- 3D-Hero (08.11.2026): Kamera schaut wie die Drohne des Fotos von schräg oben (vorher fast auf Wasserhöhe →
  Schiff wirkte „sinkend“), gemessene Wasserlinie, Spiegelung, ruhiges Elbwasser, Drohnen-Schweben; Poster neu
  (`npm run build && npm run poster && npm run build`). Einzelheiten: README „3D-Hero“.
- Anfrage-Server erlaubt CORS für `https://www.mswohldorf.de`, `https://mswohldorf.de` und
  `https://mswohldorf.netlify.app` (`ANFRAGE_HERKUNFT` auf Merlin, geprüft 05.11.2026).
- Nach dem Livegang erledigt (Sergiy, 05.11.2026): Testanfrage über die echte Domain bis Zoho,
  Test-Mail an @mswohldorf.de, Google Search Console (Domain-Property, Sitemap, Indexierung beantragt),
  Bing Webmaster Tools (Import aus der Search Console).
- **Offen** (`LIVEGANG.md` Schritt 9, `REICHWEITE.md` Phase 4–5):
  - Domains: Sergiy hat am 13.11.2026 alle Domains von Uli bei IONOS in einen Vertrag gezogen (Domain läuft damit
    unabhängig vom alten Webspace). Website danach geprüft: A, `www`, HTTPS, Formular in Ordnung. Die Mail-Einträge
    von `mswohldorf.de` waren dabei auf IONOS-Standard zurückgefallen und sind wiederhergestellt (MX Zoho, SPF,
    `zoho-verification` — geprüft 13.11.2026, 22:21 Uhr), Test-Mail an @mswohldorf.de kam an (Sergiy, 14.11.2026).
    **Noch offen:** TXT `google-site-verification` für die Search Console fehlt im DNS (geprüft 14.11.2026) — Wert
    aus der Search Console holen und bei IONOS anlegen. Soll-Werte: `LIVEGANG.md` Schritt 9.
  - Search Console per Skript: `npm run suchdaten` läuft (Dienstkonto `mswohldorf-leser`; Sergiy hat
    `GSC_DIENSTKONTO_B64` am 14.11.2026 in der Cloud-Umgebung „Default“ eingetragen). Erster Abruf 14.11.2026:
    6 Klicks, 48 Impressionen, mittlere Position 6,9; Startseite „gesendet und indexiert“; `sitemap-index.xml` ohne
    Fehler. Befunde: (1) In der Search Console war zusätzlich `/sitemap.xml` eingereicht → 404 → seitdem schreibt
    `integrationen/sitemap-xml.mjs` eine Kopie. (2) Das Dienstkonto hat „Vollständig“ statt „Eingeschränkt“ — Sergiy
    sollte es auf „Eingeschränkt“ stellen. (3) Im Index stehen noch alte Adressen `/shop/pg/…` und `/?shop/detail/…`
    (nicht von uns, vermutlich Altlast/Spam der alten Seite): liefern 404 bzw. die Startseite, fallen von selbst raus.
    Zweiter Abruf 21.11.2026 (`npm run suchdaten -- --index`): 8 Klicks, 55 Impressionen in 28 Tagen, seit dem 09.11.
    nur 0–2 Impressionen pro Tag (fast nur Suchen nach dem Namen). `/sitemap.xml` jetzt ohne Fehler (19 Adressen).
    **Erst 5 von 19 Seiten im Index** (Start, Offsite, Häufige Fragen, `/en/`, `/en/faq/`); 11 „Gefunden – zurzeit
    nicht indexiert“, 3 „Google nicht bekannt“ — darunter alle Anlass-Seiten, Galerie, Geschichte, Ratgeber.
    Technisch ist nichts im Weg (200, kein noindex, canonical richtig, von der Startseite verlinkt, robots offen):
    Google hat die Seiten noch nicht abgeholt. Hebel: Sergiy beantragt die Indexierung je Seite in der Search Console
    (URL-Prüfung, etwa 10 pro Tag); dazu Signale von außen (Google-Unternehmensprofil bestätigen, Link von
    finanzelot.de — dort gibt es bisher keinen —, Portale). Dienstkonto steht weiter auf „Vollständig“, der TXT
    `google-site-verification` fehlt weiter. Nächster Abruf: in 1–2 Wochen mit `--index`.
  - Lead-Quelle (`PUBLIC_ANFRAGE_ERWEITERT`) erst, wenn Merlin `art` und `herkunft` annimmt.
  - Google-Unternehmensprofil, Bing Places, Apple Business Connect, OpenStreetMap, MOIN, HCB Venuefinder
    (Phase 5): Textpaket, Klickpfade und Fragen an Uli in `PROFILE.md`; Bilder `npm run profilbilder`.
    Steht ein Profil, seinen Link in `PROFIL_LINKS` (`src/config.ts`) eintragen → Schema `sameAs`.
    Uli (07.11.2026): kein Maps-Eintrag, Profil gehört Finanzelot (Sergiy Manager), Navi-Adresse vorerst,
    Video-Bestätigung macht Uli, Fotos dürfen in Profile/Portale, MOIN + HCB ok. Uli (11.11.2026): **35 Gäste und
    165 m² Nutzfläche** gelten (Giggster nennt noch 30 / 157,94 m² → dort angleichen). Erster Video-Versuch bei Google
    ist gescheitert (Weg Straße → Deich → Schiff zu lang); Plan für den zweiten Versuch: `PROFILE.md` Abschnitt 3.
    Film Commission (12.11.2026): kein Eintrag im Location Guide (nur öffentliche Motive), gibt das Angebot aber an
    Scouts weiter; Location-Agenturen über deren Motivgeber-Formulare, keine Rundmail (§ 7 UWG) — `PROFILE.md` Abschnitt 7.
    Antwort an die Film Commission und Mail an Uli (Okay für Agenturen, Strom, Drehgenehmigung, Tagessatz) sind raus
    (Sergiy, 13./14.11.2026) — auf Ulis Antwort warten, dann Agenturen anmelden und Seite „Film & Foto“ ergänzen.
  - KI-Loops aus Originalfotos (Phase 4): Kosten und Bildrechte (Andrea Klick) klären.
  - Nach einigen Wochen: `https://mswohldorf.netlify.app` aus `ANFRAGE_HERKUNFT` nehmen; HSTS-`preload` erwägen.

## Was woanders liegt

- Anfrage-Server („Merlin“, finanzelot-lotse.de, IONOS Cloud Berlin) und Buchungs-Mailtexte:
  eigenes Repo („Lotse“), nicht hier. Betreiber: Sergiy (AV-Vertrag mit Finanzelot).
- CRM: Zoho CRM (EU). Mail der Domain: Zoho Mail (EU).
