# Reichweite und Leads — Plan

Stand: 01.11.2026 · Ziel: Die Website bringt planbar Anfragen, auch aus Berlin, dem Umland und
anderen Großstädten. Gegenstück zu [OFFENE-ANGABEN.md](OFFENE-ANGABEN.md) (was vor dem Livegang fehlt).

## Entscheidungen (Sergiy, 01.11.2026)

| Thema | Entscheidung |
|---|---|
| Bewegtbild | **KI-Animation aus Originalfotos** — dezent, gekennzeichnet, selbst gehostet |
| Lead-Magnet | **Exposé frei** (PDF ohne E-Mail-Pflicht) **+ Schnellanfrage** mit wenigen Feldern |
| Messung | **Nur Lead-Quelle**: Herkunft wird mit der Anfrage nach Zoho geschickt, kein Tracking, kein Banner |
| Reichweite | **Eine Offsite-Seite + Ratgeber (Blog) + englische Version** — keine fast gleichen Seiten je Stadt |

## Leitplanken

1. **Nichts erfinden** (CLAUDE.md): Jede Aussage hat eine Quelle (INHALT.md). Fehlt etwas, fragen wir Uli.
2. **Keine Doorway-Seiten:** Google wertet fast gleiche Seiten je Stadt ab
   ([Spam-Richtlinien](https://developers.google.com/search/docs/essentials/spam-policies)). Städte kommen
   auf der Offsite-Seite und in Ratgeber-Artikeln mit echtem Inhalt vor (Anreise, Ablauf).
3. **Keine externen Anfragen beim Laden**, keine Cookies. Neue Datenverarbeitung nur mit Abschnitt in
   der Datenschutzerklärung.
4. **Professionell vor verspielt:** Bewegung unterstützt den Inhalt, respektiert „Bewegung reduzieren“
   und kostet die Ladezeit nichts.

## Phasen

| Phase | Inhalt | Stand |
|---|---|---|
| 1 Fundament | Häufige Fragen mit FAQPage-Schema (`/haeufige-fragen/`), `/llms.txt` für KI-Assistenten, Offsite-Seite mit animierter Anreise-Route (`/offsite-hamburg/`), Verlinkung in Kopf, Fuß und Startseite | ✅ gebaut |
| 2 Konversion | **Exposé**: druckbare Seite `/expose/` → PDF per Skript (wie `npm run poster`), Download-Knöpfe auf Start, Anlässen, Offsite · **Schnellanfrage**: Datum, Gäste, E-Mail über den bestehenden Anfrage-Vertrag · **Lead-Quelle**: Suchmaschine/Kampagne/Einstiegsseite als eigenes Feld — braucht Lotse-Server und einen Satz im Datenschutz | offen |
| 3 Inhalte | **Ratgeber** als Astro-Content-Collection mit Article-Schema, 4–6 Grundartikel (unten) · **Englisch** `/en/` für Start, Offsite, FAQ, Anfrage mit `hreflang` — Berliner Start-ups und internationale Teams | offen |
| 4 Bewegtbild | 3–5 KI-Loops aus Originalfotos (Wasser, Licht, langsame Kamerafahrt), siehe unten | offen — Kosten und Bildrechte klären |
| 5 Sichtbarkeit außerhalb der Seite | Google-Unternehmensprofil, Bing Places, Apple Business Connect; Location-Portale; Motivdatenbank der Filmförderung Hamburg Schleswig-Holstein; Wikidata-Eintrag; Google Search Console + Bing Webmaster Tools nach dem Livegang | offen — Sergiy/Uli |

## Ratgeber — erste Themen

Nur Themen, für die es belegte Fakten gibt oder die Uli liefern kann:

| Thema | Zielgruppe | Fakten aus |
|---|---|---|
| Offsite in Hamburg planen — Checkliste für Teams aus Berlin | Teamleads, Office-Management | Anreise (`src/data/anreise.ts`), Eckdaten |
| Die HADAG-Hafenfähren Typ III: ein Hamburger Schiffstyp | Geschichtsinteressierte, Presse | Presse 2019, Lebenslauf elbdampfer-hamburg.de |
| Von der Fähre zum Veranstaltungsschiff: der Umbau 2016/17 | alle | Galerie „Umbau“, Presse 2019 |
| Drehort Schiff: was Film- und Fotoproduktionen wissen sollten | Location-Scouts, Produktionen | **Uli**: Strom, Drehgenehmigung, Raumhöhe |
| Workshop an einem ungewöhnlichen Ort | HR, Beratung, Trainer | Anlass-Seite Workshop, Kundenstimmen |

Jeder Artikel: eine klare Frage im Titel, die Antwort im ersten Absatz, Quellen am Ende, Link zur Anfrage.

## KI-Animation aus Fotos — Regeln

- **Bildrechte zuerst:** Die Fotos stammen von Andrea Klick. Eine Animation ist eine Bearbeitung —
  Uli bzw. die Fotografin müssen zustimmen.
- Nur bewegen, was sich wirklich bewegt (Wasser, Licht, Wolken, leichte Kamerafahrt). Das Schiff selbst,
  Räume und Ausstattung bleiben unverändert.
- Gekennzeichnet („KI-animiert aus einem Originalfoto“), selbst gehostet (MP4/WebM, je unter ca. 1,5 MB,
  mit Standbild), stumm, nur bei erlaubter Bewegung, pausiert außerhalb des Bildschirms.

## Woran wir Erfolg messen

| Kennzahl | Wo |
|---|---|
| Anfragen pro Monat, nach Quelle und Anlass | Zoho CRM (nach Phase 2) |
| Platzierungen für „Offsite Hamburg“, „Eventlocation Schiff Hamburg“, „Workshop Location Hamburg“ | Google Search Console |
| Wird die Wohldorf in KI-Antworten genannt? (z. B. „Eventschiff in Hamburg für 30 Personen“) | monatlicher Stichprobentest in ChatGPT, Claude, Perplexity, Google AI Mode |
