# Offene Angaben

Was auf der Seite noch fehlt (`<Platzhalter>` bzw. die `offen`-Listen der Anlässe) und was vor
dem Livegang geklärt sein muss. Aktuelle Liste aus dem Quelltext: `npm run offen` (Pflicht
zuerst). **Livegang-Blocker** sind mit ⛔ markiert.

Zwei Arten (Einzelheiten: README, „Platzhalter und Livegang-Sperre"):

- **Rechtlich — `pflicht`** (Abschnitt A): In der Vorschau (`PUBLIC_VORSCHAU=1`) als Kasten
  „Angabe folgt · Pflicht — bitte von Uli ergänzen: …". Im Produktions-Build **bricht der Build
  ab** und nennt Seite und Text — ebenso, solange `ENTWURF_HINWEIS_ANZEIGEN = true` ist. So kann
  keine rechtliche Lücke unbemerkt live gehen. Geklärt → Text korrigieren, Platzhalter löschen.
- **Inhaltlich** (Abschnitte B–D): In der Vorschau als gestrichelter Kasten „Angabe folgt — bitte
  von Uli ergänzen: …". Im Produktions-Build steht dort neutraler Text („auf Anfrage", „Details
  dazu stimmen wir gern persönlich mit Ihnen ab — fragen Sie einfach an."); die `offen`-Liste
  eines Anlasses wird zu einem Satz aus `offenKurz` („… stimmen wir individuell mit Ihnen ab —
  sprechen Sie uns an."). **Die Seite kann also live gehen, bevor diese Angaben da sind.**

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

## A. Rechtliches ⛔ — sperrt den Produktions-Build

Jeder Punkt hier steht als `<Platzhalter pflicht>` im Quelltext (bzw. Nr. 2 als Schalter
`ENTWURF_HINWEIS_ANZEIGEN`). Solange einer übrig ist, scheitert der Produktions-Build. Bis dahin
läuft Production auf Netlify mit `PUBLIC_VORSCHAU=1` (README, „Bis zum Livegang").

Stand 04.11.2026: **noch 1 offen** (Nr. 2). Alles andere ist geklärt — Angaben von Sergiy
(Betreiber von Website und Anfrage-Server, DSGVO-Berater), von Uli (Mail vom 04.11.2026) bzw. aus dem
Impressum von finanzelot.de.

| Nr. | Was | Stand | Wo |
|---|---|---|---|
| 1a | Vertretung (Komplementärin) | ✅ Finanzelot Verwaltungs GmbH, Amtsgericht Hamburg, HRB 154872, Geschäftsführer Ulrich Ritter (wie finanzelot.de/impressum) | `src/config.ts` (`BETREIBER.komplementaerin`) |
| 1b | USt-IdNr. | ✅ `DE326098307` (wie finanzelot.de, VIES gültig am 01.11.2026). Die Nummer der alten Seite (`DE3223275031`) war ungültig. | `src/config.ts` |
| 1c | Haftungstext (Inhalte, Links) | ✅ entfällt — Uli: Impressum wie finanzelot.de, dort gibt es keinen Haftungs- und Urheberrechtstext (Mail vom 04.11.2026) | `src/pages/impressum.astro` |
| 2 ⛔ | **Datenschutz-Entwurf freigeben**, dann `ENTWURF_HINWEIS_ANZEIGEN = false` (sonst bricht der Produktions-Build ab; mit `false` entfällt auch „(Entwurf)" beim Stand). Vorher prüfen: Netlify-DPA abgeschlossen? Speicherdauer der Netlify-Protokolle (steht jetzt als Kriterium, nicht als Frist; genaue Frist: „Data Retention and Deletion Summary" im Netlify Trust Center, auf Anfrage)? Matterport-Absatz (Art. 49 DSGVO, siehe Nr. 8)? | offen — Freigabe durch Sergiy | `src/config.ts` |
| 3 | Datenschutzbeauftragter; Kontakt für Datenschutzanfragen | ✅ nicht benannt, nicht verpflichtet (§ 38 BDSG; von Uli bestätigt am 04.11.2026); Verantwortlicher ist die KG, Kontakt `info@finanzelot.de` | `src/pages/datenschutz.astro` |
| 4 | Netlify: Rechtsgrundlage USA, Speicherdauer | ✅ DPF-zertifiziert ([Netlify Privacy, Abschnitt 13](https://www.netlify.com/privacy/)) → Art. 45 DSGVO, ergänzend SCC; Speicherdauer als Kriterium (Netlify veröffentlicht keine Frist) | dito |
| 5 | Hosting des Anfrage-Servers (Merlin) | ✅ IONOS SE, Montabaur; Rechenzentrum in Deutschland (IONOS Cloud Berlin) | dito |
| 6 | Zoho CRM | ✅ Zoho EU, Zoho Corporation B.V., Beneluxlaan 4B, 3527 HT Utrecht (betreibt die EU-Rechenzentren); AV-Vertrag besteht | dito |
| 7 | Löschfrist | ✅ Anfragen ohne Buchung: spätestens 30 Tage nach dem letzten Kontakt | dito |
| 8 | Matterport: Rechtsgrundlage USA | ✅ kein DPF-Nachweis gefunden (Matterport gehört seit 2025 zur CoStar Group) → ausdrückliche Einwilligung per Klick (Art. 49 Abs. 1 lit. a DSGVO), Risiko-Hinweis in der Datenschutzerklärung **und** vor dem Klick (`ZweiKlick`, Prop `zusatz`). Ist CoStar/Matterport auf der [DPF-Liste](https://www.dataprivacyframework.gov/list), auf Art. 45 umstellen. | `src/pages/datenschutz.astro`, `src/pages/index.astro` |
| 9 | Bildrechte (NDR-Standbild, Presse-Ausschnitte, Video-Standbilder) | ✅ bestätigt: schon auf der alten Seite mit Abstimmung der Rechteinhaber | `src/pages/impressum.astro` (Bildnachweis) |
| 9a | AV-Verträge | ✅ Finanzelot ↔ Sergiy (Betrieb Website und Anfrage-Server) und Sergiy ↔ IONOS bestehen | — |

## B. Angaben für Anlässe — ✅ entschieden: „auf Anfrage“

Uli (Mail vom 04.11.2026): „Zu Buchungen alles auf Anfrage. Es sei denn wir machen irgendwann eine
extra Seite dafür auf.“ Die Punkte unten stehen deshalb in `src/data/anlaesse.ts` als `aufAnfrage`;
jede Anlass-Seite zeigt EINEN Satz („… stimmen wir individuell mit Ihnen ab — sprechen Sie uns an.“),
in Vorschau und Produktion gleich. Kommt später eine Buchungsseite, wandern die Angaben dorthin.

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

## C. Bitte bestätigen (aus Presse 2019 übernommen, nicht von der alten Website selbst) — kein Blocker

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

## D. Geschichte — kein Blocker

Fehlt eine Angabe zu einer Station, kann sie als `offen: '…'` in `src/data/geschichte.ts`
stehen: in der Vorschau als Kasten auf /geschichte/, in Produktion fällt sie weg.

| Nr. | Was | Wo |
|---|---|---|
| 25 | Jahr des Basislagers für Boris Herrmann (Malizia Ocean Festival) — die alte Seite nennt keins | `src/data/geschichte.ts` |
| 26 | Ende des Linienbetriebs: boote (2019) sagt „bis Anfang der 1970er-Jahre", Umbauen + Modernisieren „23 Jahre lang im Einsatz" — die Seite nennt deshalb kein Jahr | dito |

## E. Technik vor dem Livegang

| Nr. | Was |
|---|---|
| 27 ⛔ | `PUBLIC_ANFRAGE_URL` ist in Netlify gesetzt (`https://finanzelot-lotse.de/api/oeffentlich/anfrage`). **Offen:** Der Server erlaubt CORS bisher nur für `https://mswohldorf.netlify.app` — Test am 01.11.2026: Preflight von `https://www.mswohldorf.de` liefert 204 ohne `Access-Control-Allow-Origin`. Vor der DNS-Umstellung im Anfrage-Server (Repo „Lotse“) `https://www.mswohldorf.de` freigeben. |
| 28 ⛔ | DNS von mswohldorf.de auf Netlify umstellen (README „Livegang"). Domain und DNS liegen bei **IONOS** (Nameserver `ui-dns`). Auf der Domain läuft **Zoho-Mail** (MX `mx*.zoho.eu`, SPF `include:one.zoho.eu include:_spf-eu.ionos.com`) — deshalb bei IONOS bleiben und nur den A-Record und `www` ändern, **nicht** die Nameserver zu Netlify umziehen. Klären: Ist die Domain Teil des gekündigten Vertrags (Webspace endet im Dezember 2026)? Dann vorher herauslösen, sonst sind Website und Mail weg. Befund 01.11.2026: Der alte Webspace liegt bei Webspace-Verkauf (IP 37.218.254.109, RIPE „WEBSPACEVERKAUF“), mswohldorf.de hat aber dieselben IONOS-Nameserver wie finanzelot-lotse.de (ns1033/1057/1076/1085) — spricht dafür, dass die Domain in Sergiys IONOS-Konto liegt. Im IONOS-Konto prüfen. |
| 29 | Altes Favicon behalten oder das neue? (alt: `public/alt/`) |
| 30 | Optional: Anreise mit Bus/Bahn ergänzen |
