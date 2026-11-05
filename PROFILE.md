# Profile und Portale — Textpaket (Reichweite Phase 5)

Stand: 05.11.2026 · Plan: [REICHWEITE.md](REICHWEITE.md) Phase 5 · Bilder: `npm run profilbilder` → `dist-profilbilder/`

Ziel: Die MS Wohldorf erscheint in Google Maps, Bing, Apple Karten und bei den Hamburger Location-Suchen,
und zwar überall mit **denselben** Angaben. Für Suchmaschinen und KI-Assistenten ist die Gleichheit von Name,
Ort, Telefon und Website ein Vertrauenssignal. Alle Texte hier stammen nur aus belegten Angaben
(`src/config.ts`, `src/data/*`, Quellen in [INHALT.md](INHALT.md)). Fehlt eine Angabe, steht hier **„Uli fragen“**.

## 0. Reihenfolge

| # | Was | Wer | Dauer |
|---|---|---|---|
| 1 | Fragen an Uli klären (Abschnitt 11) — vor allem: Gibt es schon einen Google-Eintrag? | Sergiy → Uli | 1 Mail |
| 2 | Google-Unternehmensprofil anlegen oder übernehmen, bestätigen | Uli (Inhaber), Sergiy (Manager) | 30 Min. + Bestätigung |
| 3 | Bing Places: Import aus Google | Sergiy | 5 Min. + 7–12 Tage |
| 4 | Apple Business Connect | Uli bzw. Sergiy | 20 Min. + Bestätigung |
| 5 | OpenStreetMap-Punkt | Sergiy | 10 Min. |
| 6 | Film Commission Hamburg (MOIN) und HCB Venuefinder | Sergiy | je 1 Mail bzw. 30 Min. |
| 7 | Giggster-Eintrag an die Website angleichen | Uli | 10 Min. |
| 8 | Links in `src/config.ts` → `PROFIL_LINKS` eintragen (Abschnitt 10) | Claude/Sergiy | 5 Min. |

## 1. Stammdaten — überall gleich

| Feld | Wert | Quelle |
|---|---|---|
| Name | **MS Wohldorf** — ohne Zusatz wie „Eventschiff Hamburg“ (Google verbietet Zusätze im Namen) | `SEITE.name` |
| Ort | **Anleger Finkenriek**, auf der Süderelbe in Finkenriek (Hamburg-Wilhelmsburg) | `LIEGEPLATZ` |
| Adresse | Finkenrieker Hauptdeich 14, 21109 Hamburg — **Uli fragen**: Das ist die „dichteste Adresse für ein Navi“ der alten Seite, keine Adresse des Liegeplatzes | `LIEGEPLATZ.navi` |
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

**Lang (721 Zeichen, Google erlaubt 750; die ersten 250 Zeichen sind ohne „Mehr“ sichtbar):**

> Die MS Wohldorf ist eine ehemalige HADAG-Hafenfähre von 1959, 2016 zum Büro- und Veranstaltungsschiff umgebaut. Heute ist sie Veranstaltungsort für bis zu 35 Gäste am Anleger Finkenriek auf der Süderelbe in Hamburg-Wilhelmsburg. Gebucht wird sie für Firmenevents, Workshops und Seminare, Film- und Fotoproduktionen, Lesungen, Ausstellungen und private Feiern im kleineren Kreis. An Bord: ein großer Veranstaltungsbereich und ein verglaster Besprechungsraum auf dem Hauptdeck, das Büro mit Kombüse auf dem Oberdeck, eine Küche mit Geräten und eine Zentralheizung. Das Schiff fährt nicht mehr aus eigener Kraft – Veranstaltungen finden am Liegeplatz statt. Parkplätze gibt es vor der Tür, der Zugang ist nicht barrierefrei.

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

**Vorher:** Auf https://www.google.com/maps nach „MS Wohldorf“ suchen. Gibt es einen Eintrag, auch einen alten
am Sandtorhafen, wird er **übernommen** und umgezogen, nicht neu angelegt (Google: ein Profil pro Unternehmen;
Doppelte werden zusammengelegt oder gesperrt). Im Eintrag: **Inhaberschaft beanspruchen** bzw.
**Dieses Unternehmen verwalten**.

**Wem es gehört:** Inhaber wird das Google-Konto von Finanzelot (Uli), Sergiy wird **Manager**
(Profil → **Menü ⋮** → **Unternehmensprofil-Einstellungen** → **Personen und Zugriff** → **Hinzufügen**).
So bleibt das Profil beim Kunden, auch wenn sich die Zusammenarbeit ändert.

**Neu anlegen** (nur wenn es keinen Eintrag gibt):

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
| Merkmale | Rollstuhlgerechter Eingang: **Nein**. Weitere (WLAN, Parkplätze kostenlos?) erst nach Antwort von Uli |
| Fotos | Logo `02-logo-720.png`, Titelbild `01-titelbild-16x9.jpg`, dazu `03`–`12`. `13` nur mit Hinweis auf 2017 |
| Updates | „Erster Beitrag“ aus Abschnitt 2 |

**Bestätigung:** Google schlägt die Methode selbst vor (Telefon/SMS, E-Mail, Live-Video, Postkarte). Beim
**Video** muss jemand während eines Termins am Liegeplatz sein und zeigen: die Umgebung (Straßenschild, Zufahrt),
den Namen am Schiff (Schriftzug „Wohldorf“ am Bug — siehe `04-aussen-schriftzug-bug.jpg`), die Räume an Bord
und dass man berechtigt ist (z. B. die Tür mit dem Schlüssel öffnen). Weil das Profil keine Öffnungszeiten hat,
für den Videotermin eine Zeit wählen, in der jemand an Bord ist.

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

## 7. Film Commission Hamburg (MOIN Location Guide)

Der Location Guide der MOIN Filmförderung zeigt Motive in Hamburg und Schleswig-Holstein mit Kontakt zu den
Eigentümern. Ein Formular zum Eintragen gibt es auf der Seite nicht (geprüft 05.11.2026) — deshalb per Mail an
die Film Commission Hamburg (Kontakte: https://moin-filmfoerderung.de/en/film-commission/location-guide):

> **Betreff:** Motiv für den Location Guide: MS Wohldorf, ehemalige HADAG-Hafenfähre (1959), Süderelbe
>
> Guten Tag Frau Luetkens,
>
> wir möchten die MS Wohldorf als Motiv für den Location Guide vorschlagen: eine HADAG-Hafenfähre von 1959,
> 2016 zum Büro- und Veranstaltungsschiff umgebaut, heute am Anleger Finkenriek auf der Süderelbe
> (Hamburg-Wilhelmsburg). Das Schiff war bereits Drehort, u. a. für die NDR-Serie „Die Pfefferkörner“
> (Staffel 19, Folge 246). Innen: Vintage-Interieur mit Teakholztüren, Eichendielen, Steuerrad und Kombüse;
> außen: Ponton, Gangway und Süderelbe. Das Schiff fährt nicht mehr — gedreht wird am Liegeplatz.
>
> Fotos und 3D-Rundgang: https://www.mswohldorf.de/anlaesse/film-und-foto/ · Exposé:
> https://www.mswohldorf.de/pdf/ms-wohldorf-expose.pdf
>
> Was benötigen Sie für die Aufnahme (Fotos, Angaben, Formular)?
>
> Viele Grüße · Ulrich Ritter · MS Wohldorf · Finanzelot GmbH & Co. KG · +49 40 277347

Absender am besten Uli (Eigentümer). Fragen der Film Commission zu Strom, Drehgenehmigung oder Raumhöhe an
Bord: **Uli fragen** — die Website nennt bisher nur die Raumhöhe von ca. 1,90 m (Presse 2019).

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
| bis zu 30 Personen; an einer Stelle 5 | bis zu 35 Gäste (alte Website) | **Uli fragen**, dann überall gleich |
| 157,94 m² | 165 m² Nutzfläche (boote, Mai 2019) | **Uli fragen** |
| WLAN, 20 Parkplätze, Make-up-Bereich, Konferenzraum, PA-System, Monitor, HiFi | nicht auf der Website | wenn Uli bestätigt: auch auf die Website (z. B. Häufige Fragen) |
| eigener DJ erlaubt | „keine Techno- und Disco-Partys“ (Presse 2019) | **Uli fragen**, was heute gilt |
| Kategorien „Industriegebäude“, „Konzertort“ | — | auf „Veranstaltungsraum“ beschränken |

Beschreibung bei Giggster: Text „Englisch“ aus Abschnitt 2, Link zur Website ergänzen, falls erlaubt.

## 10. Danach: Profile mit der Website verknüpfen

Sobald ein Profil öffentlich ist, seinen Link in `src/config.ts` → `PROFIL_LINKS` eintragen (Google-Maps-Link
aus **Teilen** → **Link kopieren**, Apple-Link aus Apple Karten, OpenStreetMap-Link des Punkts, MOIN- und
Venuefinder-Seite). Die Website nennt sie dann im Schema als `sameAs` — so erkennen Suchmaschinen und
KI-Assistenten, dass alle Einträge dasselbe Schiff meinen. Giggster erst, wenn die Angaben übereinstimmen.

**Wikidata** (später, optional): ein Datenobjekt für das Schiff mit belegten Aussagen (ist ein(e) Fähre bzw.
Schiff; Dienstbeginn 1959; Länge 30 m; maximale Kapazität 35; Betreiber Finanzelot GmbH & Co. KG; Staat
Deutschland; Koordinaten; offizielle Website) und Belegen (Lebenslauf auf elbdampfer-hamburg.de, boote 05/2019).
Wikidata erwartet neutrale, belegte Angaben; Werbung wird gelöscht. Erst angehen, wenn 2–9 erledigt sind.

## 11. Fragen an Uli (Mail-Entwurf)

> **Betreff:** MS Wohldorf — Einträge bei Google, Apple und Co.
>
> Hallo Uli,
>
> die Website ist live. Als Nächstes tragen wir die Wohldorf bei Google Maps, Bing und Apple Karten ein. Dafür
> brauche ich kurz deine Antworten:
>
> 1. Gibt es bei Google Maps schon einen Eintrag „MS Wohldorf“ (evtl. noch am Sandtorhafen)? Wenn ja: Wer hat
>    Zugriff darauf?
> 2. Das Profil sollte dem Google-Konto von Finanzelot gehören, ich verwalte es als Manager. Einverstanden?
>    Welches Google-Konto nehmen wir?
> 3. Adresse für die Karten: Passt „Finkenrieker Hauptdeich 14, 21109 Hamburg“ für den Liegeplatz, oder gibt es
>    eine eigene Adresse? (In OpenStreetMap heißt die Stelle „Hafen Holstenkaten, Finkenrieker Deichweg“.)
> 4. Google bestätigt neue Einträge oft per Live-Video vor Ort. Wer könnte das am Schiff machen?
> 5. Dürfen wir die Fotos von Andrea Klick auch bei Google, Apple und in Location-Portalen verwenden?
> 6. Dein Giggster-Eintrag nennt 30 Personen und 157,94 m², die Website 35 Gäste und 165 m². Was stimmt?
>    Und gilt: WLAN, 20 Parkplätze, PA-Anlage, eigener DJ erlaubt? Dann nehme ich das auch auf die Website.
> 7. Telefonnummer im Profil: +49 40 277347 — richtig?
> 8. Einverstanden, dass wir die Wohldorf der Film Commission Hamburg und dem Hamburg Convention Bureau
>    (kostenloser Eintrag) melden?
>
> Viele Grüße
> Sergiy

## Quellen

- Google, Richtlinien für Unternehmensprofile (Name, Adresse, Öffnungszeiten, Kategorien): https://support.google.com/business/answer/3038177?hl=de
- Google, Kategorien auswählen: https://support.google.com/business/answer/7249669?hl=de
- Google, Unternehmen bestätigen (auch per Video): https://support.google.com/business/answer/7107242?hl=de
- Bing Places, neue Version mit Google-Import (Okt. 2025): https://blogs.bing.com/search/October-2025/Introducing-the-New-Bing-Places-for-Business-Built-for-Business-Owners,-Powered-by-Research
- Apple Business Connect: https://businessconnect.apple.com
- MOIN Location Guide und Kontakte: https://moin-filmfoerderung.de/en/film-commission/location-guide
- HCB Venuefinder auf Basis von eventlocations.com: https://www.eventlocations.com/de/blog/eventlocationscom-stellt-white-label-version-fur-das-hamburg-convention-bureau-zur-verfugung
- eventlocations.com, kostenloser Basic-Eintrag: https://www.eventlocations.com/de/faq/host/12/59
- Giggster-Eintrag der Wohldorf: https://giggster.com/de/listing/step-aboard-history-1959-elbe-ferry-wohldorf
- OpenStreetMap, Veranstaltungsort: https://wiki.openstreetmap.org/wiki/Tag:amenity%3Devents_venue
