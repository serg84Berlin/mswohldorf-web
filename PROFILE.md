# Profile und Portale — Textpaket (Reichweite Phase 5)

Stand: 07.11.2026 (Antworten von Uli eingearbeitet) · Plan: [REICHWEITE.md](REICHWEITE.md) Phase 5 · Bilder: `npm run profilbilder` → `dist-profilbilder/`

Ziel: Die MS Wohldorf erscheint in Google Maps, Bing, Apple Karten und bei den Hamburger Location-Suchen,
und zwar überall mit **denselben** Angaben. Für Suchmaschinen und KI-Assistenten ist die Gleichheit von Name,
Ort, Telefon und Website ein Vertrauenssignal. Alle Texte hier stammen nur aus belegten Angaben
(`src/config.ts`, `src/data/*`, Quellen in [INHALT.md](INHALT.md)). Fehlt eine Angabe, steht hier **„Uli fragen“**.

## 0. Reihenfolge

| # | Was | Wer | Dauer |
|---|---|---|---|
| 1 | ✅ Fragen an Uli geklärt (07.11.2026, Abschnitt 11) | — | — |
| 2 | Google-Unternehmensprofil anlegen oder übernehmen, bestätigen | Uli (Inhaber), Sergiy (Manager) | 30 Min. + Bestätigung |
| 3 | Bing Places: Import aus Google | Sergiy | 5 Min. + 7–12 Tage |
| 4 | Apple Business Connect | Uli bzw. Sergiy | 20 Min. + Bestätigung |
| 5 | OpenStreetMap-Punkt | Sergiy | 10 Min. |
| 6 | Film Commission: Weitergabe an Scouts annehmen; Location-Agenturen über deren Motivgeber-Formulare; HCB Venuefinder | Sergiy (Uli: Agenturen ok?) | je 10–30 Min. |
| 7 | Giggster-Eintrag an die Website angleichen | Uli | 10 Min. |
| 8 | Links in `src/config.ts` → `PROFIL_LINKS` eintragen (Abschnitt 10) | Claude/Sergiy | 5 Min. |

## 1. Stammdaten — überall gleich

| Feld | Wert | Quelle |
|---|---|---|
| Name | **MS Wohldorf** — ohne Zusatz wie „Eventschiff Hamburg“ (Google verbietet Zusätze im Namen) | `SEITE.name` |
| Ort | **Anleger Finkenriek**, auf der Süderelbe in Finkenriek (Hamburg-Wilhelmsburg) | `LIEGEPLATZ` |
| Adresse | Finkenrieker Hauptdeich 14, 21109 Hamburg — vorerst so (Uli, 07.11.2026), bei Bedarf später anpassen. Die Stecknadel entscheidet, wo die Karte das Schiff zeigt | `LIEGEPLATZ.navi` |
| Kartenpunkt | 53.474465, 10.013552 — die Stecknadel **genau auf das Schiff** setzen | `LIEGEPLATZ` |
| Telefon | +49 40 277347 | `KONTAKT` |
| E-Mail | info@finanzelot.de | `KONTAKT` |
| Website | `https://www.mswohldorf.de/` — ohne Zusätze; Anfrage-Link: `https://www.mswohldorf.de/anfrage/` | `SEITE.url` |
| Betreiber | Finanzelot GmbH & Co. KG, Moorfleeter Deich 344, 22113 Hamburg (nur wo nach dem Betreiber gefragt wird, **nicht** als Standortadresse) | `BETREIBER` |
| Kapazität | bis zu 35 Gäste | `FAKTEN.maxGaeste` |
| Barrierefrei | nein | `LIEGEPLATZ.barrierefrei` |
| Öffnungszeiten | **keine** — nur nach Vereinbarung (Google: Veranstaltungsorte und Termin-Unternehmen geben keine Öffnungszeiten an) | Uli: „alles auf Anfrage“ |

Warum keine UTM-Parameter am Website-Link: Die Lead-Quelle liest UTM-Parameter nur auf der Seite, auf der die
Anfrage abgeschickt wird (`src/scripts/formular.ts`). Wer über die Startseite kommt, verliert sie beim Weiterklicken.
Die Klickzahlen zeigen Google und Bing ohnehin in ihren Statistiken.

## 2. Texte

**Lang (692 Zeichen, Google erlaubt 750; die ersten 250 Zeichen sind ohne „Mehr“ sichtbar):**

> Die MS Wohldorf ist eine ehemalige HADAG-Hafenfähre von 1959, 2016 zum Büro- und Veranstaltungsschiff umgebaut. Heute ist sie Veranstaltungsort für bis zu 35 Gäste am Anleger Finkenriek auf der Süderelbe in Hamburg-Wilhelmsburg. Gebucht wird sie für Firmenevents, Workshops und Seminare, Film- und Fotoproduktionen, Lesungen, Ausstellungen und private Feiern. An Bord: großer Veranstaltungsbereich und verglaster Besprechungsraum auf dem Hauptdeck, Büro mit Kombüse auf dem Oberdeck, Küche mit Geräten, WLAN, PA-Anlage und Zentralheizung. Das Schiff fährt nicht mehr aus eigener Kraft – Veranstaltungen finden am Liegeplatz statt. 20 Parkplätze vor der Tür; der Zugang ist nicht barrierefrei.

**Mittel (315 Zeichen — Portale, Apple):**

> Die MS Wohldorf ist eine ehemalige HADAG-Hafenfähre von 1959, 2016 zum Büro- und Veranstaltungsschiff umgebaut. Am Anleger Finkenriek auf der Süderelbe in Hamburg-Wilhelmsburg bietet sie Platz für bis zu 35 Gäste – für Firmenevents, Workshops, Film- und Fotoproduktionen, Lesungen, Ausstellungen und private Feiern.

**Kurz (152 Zeichen — Teaser, Social, Verzeichnisse):**

> Ehemalige HADAG-Hafenfähre von 1959, heute Eventschiff für bis zu 35 Gäste auf der Süderelbe in Hamburg – für Firmenevents, Workshops, Drehs und Feiern.

**Englisch (307 Zeichen — Giggster, eventlocations.com, internationale Portale):**

> The MS Wohldorf is a 1959 HADAG harbour ferry, converted in 2016 into an office and event ship. At the Finkenriek pier on the Süderelbe river in Hamburg-Wilhelmsburg she hosts up to 35 guests – for corporate events, offsites, workshops, film and photo shoots, readings, exhibitions and private celebrations.

**Leistungen** (Google „Dienstleistungen“, Portale „Eignung“) — Titel und Text wie auf der Website (`src/data/anlaesse.ts`):

| Leistung | Beschreibung | Link |
|---|---|---|
| Firmenevent | Teamabend, Kundenempfang oder Business-Essen — mit echtem Hafenflair. | `/anlaesse/firmenevent/` |
| Workshop & Seminar | Präsentation, Brainstorming-Tag oder Workshop — neue Gedanken an einem neuen Ort. | `/anlaesse/workshop-seminar/` |
| Film & Foto | Eine Kulisse mit Geschichte — schon im Fernsehen und bei Shootings im Einsatz. | `/anlaesse/film-und-foto/` |
| Lesung & Ausstellung | Kultur mit Nähe: Worte und Bilder in besonderer Atmosphäre. | `/anlaesse/lesung-ausstellung/` |
| Private Feier | Geburtstag, Jubiläum oder Familienfest — feiern an einem Ort mit Geschichte. | `/anlaesse/private-feier/` |

**Erster Beitrag** (Google „Updates“, mit Knopf „Weitere Infos“ → `https://www.mswohldorf.de/`):

> Neue Website für die MS Wohldorf: 3D-Rundgang durch das Schiff, Exposé als PDF und Anfrage direkt online. Die ehemalige HADAG-Hafenfähre von 1959 liegt heute am Anleger Finkenriek auf der Süderelbe – für bis zu 35 Gäste.

## 3. Google-Unternehmensprofil

**Stand:** Es gibt keinen Eintrag in Google Maps (Uli, 07.11.2026) — das Profil wird neu angelegt.

**Wem es gehört:** Inhaber wird das Google-Konto von Finanzelot (Uli), Sergiy wird **Manager** (Uli, 07.11.2026).
So bleibt das Profil beim Kunden, auch wenn sich die Zusammenarbeit ändert. Ablauf:

1. Sergiy legt das Profil an (Schritte unten).
2. Sofort danach: Profil → **Menü ⋮** → **Unternehmensprofil-Einstellungen** → **Personen und Zugriff** →
   **Hinzufügen** → Google-Konto von Finanzelot → Rolle **Inhaber**. Uli nimmt die Einladung an.
3. Uli bestätigt das Profil (siehe **Bestätigung**).
4. Danach unter **Personen und Zugriff** die **Hauptinhaberschaft** auf das Finanzelot-Konto übertragen;
   Sergiy bleibt **Manager**.

**Neu anlegen:**

1. https://business.google.com/create → Name `MS Wohldorf`.
2. **Kategorie:** „Veranstalt…“ tippen und die Kategorie für Veranstaltungsorte wählen (englisch „Event venue“).
   Den genauen deutschen Namen zeigt nur die Auswahlliste — keine eigene eingeben.
3. **Möchten Sie einen Ort hinzufügen, den Kunden besuchen können?** → **Ja** → Adresse (Abschnitt 1),
   dann die Stecknadel auf das Schiff ziehen.
4. **Liefern Sie Waren aus oder bieten Sie Dienstleistungen vor Ort an?** → **Nein** (kein Servicegebiet).
5. Telefon und Website aus Abschnitt 1. → **Weiter** → Bestätigung (siehe unten).

**Danach ausfüllen** (Profil → **Unternehmensprofil bearbeiten**):

| Bereich | Eintrag |
|---|---|
| Beschreibung | Text „Lang“ aus Abschnitt 2 |
| Weitere Kategorien | sparsam, nur wenn die Auswahlliste sie genau so anbietet: eine für Tagungs-/Seminarräume, eine für Party-/Festräume. Lieber eine zu wenig als eine unpassende. |
| Öffnungszeiten | **keine** eintragen (die Option ohne Öffnungszeiten wählen) |
| Dienstleistungen | die fünf Leistungen aus Abschnitt 2 |
| Merkmale | Rollstuhlgerechter Eingang: **Nein** · WLAN: **Ja** · Parkplätze vor Ort: **Ja** (20). Ob kostenlos, ist nicht geklärt — dieses Merkmal leer lassen |
| Fotos | Logo `02-logo-720.png`, Titelbild `01-titelbild-16x9.jpg`, dazu `03`–`12`. `13` nur mit Hinweis auf 2017 |
| Updates | „Erster Beitrag“ aus Abschnitt 2 |

**Bestätigung:** Google schlägt die Methode selbst vor (Telefon/SMS, E-Mail, Live-Video, Postkarte). Eine
Video-Bestätigung macht **Uli** (07.11.2026). Beim **Video** muss jemand während eines Termins am Liegeplatz sein und zeigen: die Umgebung (Straßenschild, Zufahrt),
den Namen am Schiff (Schriftzug „Wohldorf“ am Bug — siehe `04-aussen-schriftzug-bug.jpg`), die Räume an Bord
und dass man berechtigt ist (z. B. die Tür mit dem Schlüssel öffnen). Weil das Profil keine Öffnungszeiten hat,
für den Videotermin eine Zeit wählen, in der jemand an Bord ist.

**Video, zweiter Versuch** (der erste ist gescheitert, 11.11.2026). Google verlangt laut Hilfe ein **live in der
App aufgenommenes Video ohne Schnitt, mindestens 30 Sekunden**; eine Höchstlänge nennt Google nicht (Ratgeber
empfehlen 1–2 Minuten). Zu zeigen: Standort (Straßenschild, Hausnummer, Orientierungspunkte), den **Namen auf einem
fest angebrachten Element** (er soll zum Profilnamen passen), Ausstattung und dass man das Unternehmen verwaltet
(z. B. Tür mit Schlüssel aufschließen). Der ganze Weg von der Straße bis zum Schiff muss **nicht** gefilmt werden:

1. Start oben am Deich, wo Straße/Straßenschild **und** Fluss oder Schiff in einem Schwenk zu sehen sind (5–10 s).
2. Zügig den Weg zum Anleger, Kamera nach vorn, ohne anzuhalten.
3. Schriftzug „Wohldorf“ am Bug (und ein Schild „MS Wohldorf“, falls vorhanden), Gangway, Tür mit Schlüssel öffnen.
4. Innen: Hauptdeck, Kombüse, PA-Anlage oder WLAN-Router — dann beenden und hochladen.

Ziel: 1,5–2,5 Minuten. Vorher prüfen: angemeldet mit dem Google-Konto, das Inhaber/Manager des Profils ist; Profilname
„MS Wohldorf“; bei Tageslicht; Upload über das WLAN an Bord. Klappt es wieder nicht: unter **Probleme ansehen** den
Grund lesen, ggf. eine andere angebotene Methode wählen (Live-Videoanruf mit Google, Telefon/SMS, E-Mail) oder den
Support fragen (https://support.google.com/business/gethelp). Ein fest angebrachtes Schild „MS Wohldorf“ am Zugang
zur Gangway hilft doppelt: bei Google und den Gästen beim Finden.

**Bewertungen:** Zufriedene Kunden um eine Google-Rezension bitten — den Rezensions-Link aus dem Profil
z. B. in die Dankes-Mail nach der Veranstaltung. Keine Gegenleistung anbieten — das verbietet Google.

## 4. Bing Places

1. https://www.bingplaces.com → mit Microsoft-Konto anmelden.
2. **Import from Google Business Profile** → mit dem Google-Konto anmelden, das Manager des Profils ist →
   **MS Wohldorf** auswählen → **Import**.
3. Ist das Google-Profil bestätigt, übernimmt Bing die Bestätigung meist (laut Erfahrungsberichten sichtbar
   nach etwa 7–12 Tagen).
4. Option **Synchronisieren** einschalten, dann folgen Änderungen aus Google automatisch.

Orte und Karten bei DuckDuckGo kommen aus Apple Karten — ein Grund mehr für Abschnitt 5.

## 5. Apple Business Connect (Apple Karten, Siri)

1. https://businessconnect.apple.com → mit Apple-Account anmelden (am besten der von Finanzelot).
2. **Standort hinzufügen** → nach „MS Wohldorf“ suchen. Gibt es keinen Treffer: neu anlegen mit den Stammdaten
   aus Abschnitt 1. Die Feldnamen können je nach Version abweichen.
3. Kategorie für Veranstaltungsorte wählen; Beschreibung: Text „Mittel“; Titelbild `01`, Logo `02`, Fotos `03`–`12`.
4. Öffnungszeiten leer lassen bzw. „nach Vereinbarung“, falls Apple das anbietet.
5. Bestätigung nach Apples Vorgabe (meist telefonisch oder mit Unterlagen zum Unternehmen).

## 6. OpenStreetMap

In OpenStreetMap gibt es die Wohldorf noch nicht (geprüft 05.11.2026). An der Stelle steht dort der
„Hafen Holstenkaten, Finkenrieker Deichweg“. OpenStreetMap ist die Kartengrundlage vieler Apps und Dienste.

1. https://www.openstreetmap.org → Konto anlegen → zur Stelle 53.474465, 10.013552 → **Bearbeiten**.
2. **Punkt** auf das Schiff setzen, Vorlage „Veranstaltungsort“ wählen. In der Textansicht der Merkmale:

```
amenity=events_venue
name=MS Wohldorf
website=https://www.mswohldorf.de/
phone=+49 40 277347
capacity=35
wheelchair=no
```

3. **Speichern**, Kommentar z. B. „MS Wohldorf (Veranstaltungsschiff) am Anleger Finkenriek ergänzt“.
   Nur Tatsachen eintragen, keine Werbung — so verlangt es OpenStreetMap.

## 7. Film Commission Hamburg (MOIN) und Location Scouts

**Stand 12.11.2026:** Die Film Commission Hamburg (Alexandra Luetkens) nimmt die Wohldorf **nicht** in den Location
Guide auf: Dort stehen nur öffentliche Flächen und Gebäude; private und gewerbliche Motive vermitteln Location
Scouts und Agenturen. Zwei Angebote aus ihrer Antwort:

1. Die Film Commission **gibt das Angebot an die ihr bekannten Scouts und Location Manager weiter** — annehmen
   (Antwort unten). Die Mail ging außerdem an die Kollegin für Veranstaltungen (Joelle Bavoux).
2. Der **Production Guide** der MOIN listet 36 Location Scouts und Agenturen in Hamburg und Umgebung:
   https://moin-filmfoerderung.de/film-commission/production-guide/42ea1c07-ba41-4893-8a01-d1a679fbc59e/location-scouts

**Vorgehen bei den Scouts** — zuerst die Wege, die die Agenturen selbst für Motivgeber anbieten (geprüft 12.11.2026):

| Agentur | Weg für Motivgeber |
|---|---|
| Fastforward Locationservice GmbH | Seite „Motivgeber“ auf fflocations.de („Registriere Deine Location!“) |
| MotivBuero Karin Verbeek | https://www.motivbuero.de/motivgeber |
| scout for location Pfeil GbR | Knopf „Location anbieten“ auf https://scoutforlocation.de (Formular mit Bildern) |

Weitere Agenturen aus der Liste (ohne erkennbares Formular, Kontakt über deren Kontaktseite oder telefonisch):
Himmelweit Locations, 70SEVEN, CITYBLUES Locations, eyeszeit, Metrosafari Locations, NORDSCOUT, We Love Pictures.

**Vor dem Anschreiben klären:**

- **Uli:** Einverstanden mit Agenturen? Agenturen arbeiten in der Regel gegen Provision oder eigenen Aufschlag —
  Konditionen je Agentur erfragen, nichts exklusiv zusagen. (Giggster nimmt laut eigenem Eintrag 19 % Provision.)
- **Recht:** Unaufgeforderte Werbe-E-Mails sind auch an Unternehmen nur mit Einwilligung zulässig (§ 7 Abs. 2 UWG).
  Deshalb: Formulare der Agenturen nutzen, Weitergabe durch die Film Commission annehmen, sonst vorher anrufen —
  **keine Rundmail** an alle 36 Adressen.
- **Fragen, die Scouts stellen werden** (Antworten von Uli nötig): Stromanschluss und Leistung, Drehgenehmigung
  am Liegeplatz, Tagessatz bzw. Konditionen, Parken für Technikfahrzeuge. Bekannt: Raumhöhe ca. 1,90 m (Presse 2019),
  20 Parkplätze, WLAN, PA-Anlage, Zugang nicht barrierefrei, bisher ein Dreh („Die Pfefferkörner“, NDR).

**Antwort an die Film Commission:**

> **Betreff:** Re: Motiv für den Location Guide: MS Wohldorf
>
> Guten Tag Frau Luetkens,
>
> vielen Dank für die schnelle und freundliche Rückmeldung — und für die Weiterleitung an Frau Bavoux.
>
> Ihr Angebot nehmen wir sehr gern an: Bitte geben Sie die MS Wohldorf an die Ihnen bekannten Scouts und
> Location Manager weiter. Alles Nötige steht hier:
> Fotos und 3D-Rundgang: https://www.mswohldorf.de/anlaesse/film-und-foto/
> Exposé (PDF): https://www.mswohldorf.de/pdf/ms-wohldorf-expose.pdf
> Ansprechpartner für Drehanfragen: Ulrich Ritter, Finanzelot GmbH & Co. KG, +49 40 277347, info@finanzelot.de
>
> Den Hinweis auf den Production Guide nehmen wir auf und melden uns dort bei den Agenturen.
>
> Mit freundlichen Grüßen
> Sergiy Esposito · im Auftrag der Finanzelot GmbH & Co. KG

**Text für die Formulare der Agenturen** (Beschreibungsfeld; Bilder aus `dist-profilbilder/`):

> MS Wohldorf — ehemalige HADAG-Hafenfähre von 1959, 2016 zum Büro- und Veranstaltungsschiff umgebaut. Liegeplatz:
> Anleger Finkenriek auf der Süderelbe, Hamburg-Wilhelmsburg, am Naturschutzgebiet Heuckenlock. Innen: Vintage-Interieur
> mit Teakholztüren, Eichendielen, Steuerrad, Kombüse und verglastem Besprechungsraum, Fenster rundum, Raumhöhe ca.
> 1,90 m. Außen: Ponton, Gangway, Süderelbe und grünes Ufer. Gedreht wird am Liegeplatz (das Schiff fährt nicht mehr).
> 165 m² Nutzfläche, WLAN, 20 Parkplätze am Liegeplatz, Zugang nicht barrierefrei. Bereits Drehort für „Die
> Pfefferkörner“ (NDR). 3D-Rundgang und Fotos: https://www.mswohldorf.de/anlaesse/film-und-foto/ · Kontakt: Ulrich
> Ritter, +49 40 277347, info@finanzelot.de

## 8. Hamburg Convention Bureau — Venuefinder (eventlocations.com)

Das Hamburg Convention Bureau (Hamburg Tourismus) nutzt seit 2022 eine eigene Version von eventlocations.com
als „HCB Venuefinder“. Der **Basic-Eintrag** bei eventlocations.com ist kostenlos und ohne Provision.

1. https://www.eventlocations.com/de/offer-your-venue → **Basic** (kostenlos) → Konto anlegen.
2. Texte „Mittel“ und „Englisch“, Stammdaten aus Abschnitt 1, Fotos `01`–`12`.
3. Danach kurz an partner@hamburg-convention.com: Bitte die MS Wohldorf auch im HCB Venuefinder zeigen
   (ob das automatisch geschieht, ist nicht veröffentlicht).

Weitere Location-Portale nur, wenn sie kostenlos sind oder Uli es will — jeder Eintrag muss gepflegt werden.

## 9. Giggster — vorhandenen Eintrag angleichen

Uli hat seit Oktober 2024 einen Eintrag bei Giggster („Steigen Sie ein in die Geschichte: Elbfähre Wohldorf
1959“, https://giggster.com/de/listing/step-aboard-history-1959-elbe-ferry-wohldorf, abgerufen 05.11.2026).
Er weicht von der Website ab:

| Giggster | Website (Quelle) | Was tun |
|---|---|---|
| bis zu 30 Personen; an einer Stelle 5 | bis zu 35 Gäste (alte Website) | ✅ Uli (11.11.2026): **35 Gäste** gelten → bei Giggster auf 35 ändern |
| 157,94 m² | 165 m² Nutzfläche (boote, Mai 2019) | ✅ Uli (11.11.2026): **165 m²** gelten → bei Giggster auf 165 m² ändern |
| WLAN, 20 Parkplätze, PA-System | ✅ seit 07.11.2026 auch auf der Website (Uli bestätigt) | — |
| eigener DJ erlaubt | ✅ Website angepasst (Uli, 07.11.2026); der Satz „keine Techno- und Disco-Partys“ entfällt | — |
| Make-up-Bereich, Konferenzraum, Monitor, HiFi | nicht auf der Website (nicht bestätigt) | nur bei Bedarf mit Uli klären |
| Kategorien „Industriegebäude“, „Konzertort“ | — | auf „Veranstaltungsraum“ beschränken |

Beschreibung bei Giggster: Text „Englisch“ aus Abschnitt 2, Link zur Website ergänzen, falls erlaubt.

## 10. Danach: Profile mit der Website verknüpfen

Sobald ein Profil öffentlich ist, seinen Link in `src/config.ts` → `PROFIL_LINKS` eintragen (Google-Maps-Link
aus **Teilen** → **Link kopieren**, Apple-Link aus Apple Karten, OpenStreetMap-Link des Punkts, Agentur- und
Venuefinder-Seite). Die Website nennt sie dann im Schema als `sameAs` — so erkennen Suchmaschinen und
KI-Assistenten, dass alle Einträge dasselbe Schiff meinen. Giggster erst, wenn die Angaben übereinstimmen.

**Wikidata** (später, optional): ein Datenobjekt für das Schiff mit belegten Aussagen (ist ein(e) Fähre bzw.
Schiff; Dienstbeginn 1959; Länge 30 m; maximale Kapazität 35; Betreiber Finanzelot GmbH & Co. KG; Staat
Deutschland; Koordinaten; offizielle Website) und Belegen (Lebenslauf auf elbdampfer-hamburg.de, boote 05/2019).
Wikidata erwartet neutrale, belegte Angaben; Werbung wird gelöscht. Erst angehen, wenn 2–9 erledigt sind.

## 11. Fragen an Uli — beantwortet am 07.11.2026

| # | Frage | Antwort |
|---|---|---|
| 1 | Gibt es schon einen Google-Maps-Eintrag? | Nein — neu anlegen |
| 2 | Profil gehört Finanzelot, Sergiy verwaltet als Manager? | Ja |
| 3 | Adresse Finkenrieker Hauptdeich 14, 21109 Hamburg? | Ja, vorerst; bei Bedarf später anpassen |
| 4 | Wer macht die Video-Bestätigung vor Ort? | Uli |
| 5 | Fotos von Andrea Klick in Profilen und Portalen? | Ja |
| 6 | WLAN, 20 Parkplätze, PA-Anlage, eigener DJ? | Ja — auf die Website, „professionell und qualitativ“. 35 Gäste und 165 m² gelten (Uli, 11.11.2026) |
| 7 | Telefon +49 40 277347? | Ja |
| 8 | Meldung an Film Commission Hamburg und HCB? | Ja |

## Quellen

- Google, Richtlinien für Unternehmensprofile (Name, Adresse, Öffnungszeiten, Kategorien): https://support.google.com/business/answer/3038177?hl=de
- Google, Kategorien auswählen: https://support.google.com/business/answer/7249669?hl=de
- Google, Unternehmen bestätigen (auch per Video): https://support.google.com/business/answer/7107242?hl=de
- Bing Places, neue Version mit Google-Import (Okt. 2025): https://blogs.bing.com/search/October-2025/Introducing-the-New-Bing-Places-for-Business-Built-for-Business-Owners,-Powered-by-Research
- Apple Business Connect: https://businessconnect.apple.com
- MOIN Location Guide und Kontakte: https://moin-filmfoerderung.de/en/film-commission/location-guide
- MOIN Production Guide, Location Scouts: https://moin-filmfoerderung.de/film-commission/production-guide/42ea1c07-ba41-4893-8a01-d1a679fbc59e/location-scouts
- § 7 UWG (unzumutbare Belästigungen, E-Mail-Werbung): https://www.gesetze-im-internet.de/uwg_2004/__7.html
- HCB Venuefinder auf Basis von eventlocations.com: https://www.eventlocations.com/de/blog/eventlocationscom-stellt-white-label-version-fur-das-hamburg-convention-bureau-zur-verfugung
- eventlocations.com, kostenloser Basic-Eintrag: https://www.eventlocations.com/de/faq/host/12/59
- Giggster-Eintrag der Wohldorf: https://giggster.com/de/listing/step-aboard-history-1959-elbe-ferry-wohldorf
- OpenStreetMap, Veranstaltungsort: https://wiki.openstreetmap.org/wiki/Tag:amenity%3Devents_venue
