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

## Stand (05.11.2026)

- **Live seit 05.11.2026** auf https://www.mswohldorf.de: DNS bei IONOS umgestellt (A `@` → `75.2.60.5`,
  CNAME `www` → `mswohldorf.netlify.app`; MX/SPF für Zoho unverändert), `www` ist Primary Domain,
  Let's-Encrypt-Zertifikat für `mswohldorf.de` und `www`, `PUBLIC_VORSCHAU` für Production gelöscht.
  Deploy-Previews und Branch-Deploys bleiben Vorschau (`netlify.toml`).
- Gemerged: PR #1 (neue Seite, Inhalte der alten Seite), PR #2 (Platzhalter-Arten, Livegang-Sperre),
  PR #3 (diese Datei), PR #4 (Rechtliches 10/12, Reichweite Phase 1), PR #5 (Reichweite Phase 2),
  PR #6 (Rückmeldung Uli, Ratgeber, Englisch), PR #7 (Datenschutz freigegeben, `LIVEGANG.md`),
  PR #8 (CORS-Schritt für Merlin).
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
- Anfrage-Server erlaubt CORS für `https://www.mswohldorf.de`, `https://mswohldorf.de` und
  `https://mswohldorf.netlify.app` (`ANFRAGE_HERKUNFT` auf Merlin, geprüft 05.11.2026).
- **Offen nach dem Livegang** (`LIVEGANG.md` Schritt 7–9):
  - Testanfrage über die echte Domain bis Zoho und Test-Mail an @mswohldorf.de (Sergiy).
  - Google Search Console + Bing Webmaster Tools, Sitemap einreichen.
  - Domain-Vertrag bei IONOS prüfen (läuft unabhängig vom Webspace, der im Dezember endet).
  - Lead-Quelle (`PUBLIC_ANFRAGE_ERWEITERT`) erst, wenn Merlin `art` und `herkunft` annimmt.

## Was woanders liegt

- Anfrage-Server („Merlin“, finanzelot-lotse.de, IONOS Cloud Berlin) und Buchungs-Mailtexte:
  eigenes Repo („Lotse“), nicht hier. Betreiber: Sergiy (AV-Vertrag mit Finanzelot).
- CRM: Zoho CRM (EU). Mail der Domain: Zoho Mail (EU).
