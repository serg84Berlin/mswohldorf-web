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
| 2 Konversion | **Exposé** (4 × A4, `npm run expose`) mit Download-Knöpfen auf Start, Anfrage, Fragen, Offsite, Anlass-Seiten und im Fuß · **Schnellanfrage** im Lead-Block (Exposé + Formular) auf allen Anlass-Seiten und `/offsite-hamburg/` — gleicher Server-Vertrag · **Erstantwort vorbereitet**: Erfolgsmeldung kündigt die E-Mail an, sobald der Server `erstantwort: true` meldet; danach sofort Exposé, Anruf, 3D-Rundgang · **Lead-Quelle** hinter `PUBLIC_ANFRAGE_ERWEITERT=1` (Feld `herkunft`, nichts auf dem Gerät gespeichert, Absatz im Datenschutz) | ✅ gebaut — Erstantwort und Lead-Quelle warten auf Lotse/Zoho |
| 3 Inhalte | **Ratgeber** (`/ratgeber/`, Content Collection `src/content/ratgeber/`, BlogPosting-Schema, Quellen Pflicht, Entwürfe nur in der Vorschau) mit 3 Artikeln: Offsite-Checkliste für Teams aus Berlin, Lernort an Bord (Bildungswoche), Umbau 2016/17 · **Englisch**: `/en/` (Schiff, Anlässe, Offsite from Berlin, FAQ-Auszug, Schnellanfrage) und `/en/faq/` (FAQPage-Schema), `hreflang` mit Start und Häufigen Fragen; Formular zweisprachig (`src/data/formular-texte.ts`), Werte an den Server bleiben deutsch, englische Schnellanfragen tragen für Uli den Hinweis „bitte auf Englisch antworten“ | ✅ gebaut — weitere Artikel nach Bedarf (Drehort: Angaben von Uli nötig) |
| 4 Bewegtbild | 3–5 KI-Loops aus Originalfotos (Wasser, Licht, langsame Kamerafahrt), siehe unten | offen — Kosten und Bildrechte klären |
| 5 Sichtbarkeit außerhalb der Seite | Google-Unternehmensprofil, Bing Places, Apple Business Connect, OpenStreetMap; Film Commission Hamburg (MOIN nimmt nur öffentliche Motive auf, gibt das Angebot aber an Scouts weiter — 12.11.2026) und Location-Agenturen aus dem MOIN Production Guide; HCB Venuefinder (eventlocations.com); Giggster angleichen; Wikidata später. **Textpaket, Klickpfade und Fragen an Uli: [PROFILE.md](PROFILE.md)**, Bilder `npm run profilbilder`, Profil-Links → `PROFIL_LINKS` (Schema `sameAs`). Search Console + Bing Webmaster Tools seit 05.11.2026 eingerichtet | ✅ vorbereitet — Anlegen: Sergiy/Uli, Fragen an Uli offen |

## Automatische Erstantwort — Vorschlag für Lotse/Zoho

Ziel: Die Anfrage wird sofort zum Gespräch. Die E-Mail bestätigt, liefert das Exposé und stellt drei
Fragen, auf die man einfach antwortet. Umsetzung im Lotse-Server bzw. Zoho-Workflow; danach antwortet der
Server `202 {"ok":true,"erstantwort":true}` (README, „Anfrage-Schnittstelle“).

> **Betreff:** Ihre Anfrage für die MS Wohldorf — {Anlass}{, am Datum}
>
> Guten Tag {Name},
>
> vielen Dank für Ihre Anfrage für {Anlass}{ am Datum}{ mit X Gästen}. Wir prüfen die Verfügbarkeit
> und melden uns persönlich bei Ihnen.
>
> Damit unser Angebot gleich passt, antworten Sie gern direkt auf diese E-Mail:
> 1. Von wann bis wann möchten Sie an Bord sein?
> 2. Wünschen Sie Verpflegung oder Getränke?
> 3. Brauchen Sie Technik, z. B. Bildschirm oder Musik?
>
> Alles Wichtige zum Schiff finden Sie im Exposé: https://www.mswohldorf.de/pdf/ms-wohldorf-expose.pdf
> Vorab an Bord: https://www.mswohldorf.de/#rundgang · Anreise: https://www.mswohldorf.de/#anfahrt
>
> Lieber sprechen? Rufen Sie an unter +49 40 277347 — oder nennen Sie uns zwei Zeitfenster für einen Rückruf.
>
> Viele Grüße
> Ulrich Ritter · MS Wohldorf · Finanzelot GmbH & Co. KG

Offen (Uli): Soll die Mail eine Antwortzeit zusagen („innerhalb von 24 Stunden“)? Nur, wenn sie gehalten wird.
Schnellanfragen erkennt der Server am Anfang der Nachricht („Schnellanfrage über die Website …“) oder an `art`.

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
