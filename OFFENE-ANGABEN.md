# Offene Angaben

Was auf der Seite noch als gestrichelter Kasten „Angabe folgt — bitte von Uli ergänzen: …"
erscheint (`<Platzhalter>`), und was vor dem Livegang geklärt sein muss. Aktuelle Liste
aus dem Quelltext: `npm run offen`. **Livegang-Blocker** sind mit ⛔ markiert.

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

## A. Rechtliches ⛔

| Nr. | Was | Wo |
|---|---|---|
| 1 ⛔ | **Impressum rechtlich prüfen.** Wörtlich übernommen, aber: (a) Die alte Seite nennt als „persönlich haftenden Gesellschafter" Ulrich Ritter. Bei einer GmbH & Co. KG ist das in der Regel die Komplementär-GmbH — dann gehören deren Firma, Sitz, Registergericht und HRB-Nummer sowie ihre Geschäftsführung ins Impressum. (b) Die USt-IdNr. `DE3223275031` hat 10 statt 9 Ziffern — bitte prüfen. (c) Im Haftungsteil wurden die Verweise auf das aufgehobene TMG entfernt; prüfen, ob der Text so bleiben soll. | `src/config.ts` (`BETREIBER`), `src/pages/impressum.astro` |
| 2 ⛔ | **Datenschutz-Entwurf rechtlich prüfen**, dann `ENTWURF_HINWEIS_ANZEIGEN = false`. | `src/config.ts` |
| 3 | Datenschutz: Datenschutzbeauftragter benannt oder nicht? Die alte Erklärung nannte als verantwortliche Stelle Ulrich Ritter persönlich (Postfach 110689) mit `ritter@finanzelot.de`; der Entwurf nennt die Finanzelot GmbH & Co. KG mit `info@finanzelot.de` — welche Adresse soll für Datenschutzanfragen gelten? | `src/pages/datenschutz.astro` |
| 4 | Netlify: AV-Vertrag, Rechtsgrundlage USA (SCC, ggf. DPF), Speicherdauer der Server-Logs | dito |
| 5 | Hosting-Anbieter des eigenen Anfrage-Servers (Merlin, Deutschland) | dito |
| 6 | Zoho CRM: Vertragspartner und Sitz (EU-Rechenzentrum), AV-Vertrag | dito |
| 7 | Löschfrist für unbeantwortete/abgelehnte Anfragen | dito |
| 8 | Matterport: Rechtsgrundlage der USA-Übermittlung | dito |
| 9 | Bildrechte: NDR-Standbild („Die Pfefferkörner"), Presse-Ausschnitte und die zwei Video-Standbilder wie auf der alten Seite verwenden? | `src/data/bilder.ts`, `PresseFilm.astro` |

## B. Angaben für Anlässe (auch auf der alten Seite nicht vorhanden)

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

## C. Bitte bestätigen (aus Presse 2019 übernommen, nicht von der alten Website selbst)

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

## D. Geschichte

| Nr. | Was | Wo |
|---|---|---|
| 25 | Jahr des Basislagers für Boris Herrmann (Malizia Ocean Festival) — die alte Seite nennt keins | `src/data/geschichte.ts` |
| 26 | Ende des Linienbetriebs: boote (2019) sagt „bis Anfang der 1970er-Jahre", Umbauen + Modernisieren „23 Jahre lang im Einsatz" — die Seite nennt deshalb kein Jahr | dito |

## E. Technik vor dem Livegang

| Nr. | Was |
|---|---|
| 27 ⛔ | `PUBLIC_ANFRAGE_URL` in Netlify setzen (https). Der Server muss CORS für `https://www.mswohldorf.de` erlauben (Preflight `OPTIONS`, Header `Content-Type: application/json`). |
| 28 ⛔ | DNS von mswohldorf.de auf Netlify umstellen (README „Livegang"). |
| 29 | Altes Favicon behalten oder das neue? (alt: `public/alt/`) |
| 30 | Optional: Anreise mit Bus/Bahn ergänzen |
