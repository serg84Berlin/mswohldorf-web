# Livegang — Schritt für Schritt

Stand: 04.11.2026. Alle rechtlichen Angaben sind geklärt, `npm run build` läuft durch.
DNS-Stand am 04.11.2026 (geprüft): `mswohldorf.de` und `www` zeigen per A-Record auf den alten Webspace
`37.218.254.109`; Nameserver IONOS (`ns10xx.ui-dns.*`); Mail über Zoho (MX `mx.zoho.eu`, `mx2`, `mx3`),
SPF `v=spf1 include:one.zoho.eu include:_spf-eu.ionos.com ~all`, TXT `zoho-verification=…`; keine AAAA- und
keine CAA-Einträge.

**Reihenfolge einhalten.** Mail-Einträge (MX, SPF/TXT, DKIM) nie anfassen.

> **Stand 05.11.2026, 19:05 Uhr: live.** Schritte 1–6 erledigt. Von außen geprüft:
> `http://` und `https://mswohldorf.de` → `https://www.mswohldorf.de` (301), Zertifikat Let's Encrypt
> (05.11.2026) für beide Namen, HSTS aktiv, kein noindex, kein Vorschau-Band, Sitemap mit `www`-Adressen,
> alte Adressen leiten um, CORS für `https://www.mswohldorf.de` ok, MX/SPF für Zoho unverändert.
> Einzelne DNS-Caches lieferten kurz noch die alte IP (TTL 1 Stunde) — erledigt sich von selbst.
> Schritt 7 (Testanfrage, Test-Mail) und Schritt 8 (Search Console, Sitemap, Bing) am 05.11.2026 von
> Sergiy erledigt. Offen: Schritt 9.

## 1. Pull Request mergen (GitHub)

Den offenen PR „Livegang: Datenschutzerklärung freigegeben …“ öffnen → **Ready for review** → **Merge pull
request** → **Confirm merge**. Netlify baut danach automatisch (noch als Vorschau).

## 2. Vorschau-Modus für Production ausschalten (Netlify)

1. app.netlify.com → Projekt **mswohldorf** → **Project configuration** → **Environment variables**.
2. Zeile **PUBLIC_VORSCHAU** aufklappen → **Options** → **Delete variable** → bestätigen.
   (Deploy-Previews und Branch-Deploys bleiben Vorschau — das steht in `netlify.toml`.)
3. **Deploys** → **Trigger deploy** → **Deploy site**.
4. Warten, bis der Deploy **Published** ist. Scheitert er mit „LIVEGANG GESPERRT“, steht im Log, was fehlt.
5. Prüfen: https://mswohldorf.netlify.app/ — kein orangefarbenes „Vorschau“-Band mehr.

## 3. Anfrage-Server für die echte Domain freigeben (Lotse/Merlin)

Kein Code — ein Schalter in der Server-Konfiguration auf Merlin (Repo `finanzelot-lotse`,
`docs/ANFRAGE-OEFFENTLICH.md` §3 und §5 Schritt 5). Kann schon **vor** der DNS-Umstellung passieren.

Per SSH auf den Merlin-Server (IONOS), dann:

```bash
cd /opt/finanzelot-lotse/deploy
nano .env.production
```

Die Zeile `ANFRAGE_HERKUNFT=…` so ändern (Komma-Liste, ohne Leerzeichen, ohne Pfad; die Netlify-Adresse
noch eine Weile stehen lassen) — speichern mit Strg+O, Enter, Strg+X:

```
ANFRAGE_HERKUNFT=https://www.mswohldorf.de,https://mswohldorf.de,https://mswohldorf.netlify.app
```

Backend neu starten und prüfen (erwartet: „ANFRAGE_HERKUNFT: 3 gueltige(r) Ursprung“):

```bash
docker compose --env-file .env.production up -d --force-recreate backend
./pruefe-golive.sh
```

Von überall prüfen — die Antwort muss `access-control-allow-origin: https://www.mswohldorf.de` enthalten:

```bash
curl -s -o /dev/null -D - -X OPTIONS -H 'Origin: https://www.mswohldorf.de' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type' https://finanzelot-lotse.de/api/oeffentlich/anfrage | grep -i access-control-allow-origin
```

Hinweis: Merlin lehnt unbekannte Felder ab (`400`, „Dieses Feld kennt das Formular nicht.“). Deshalb bleibt
`PUBLIC_ANFRAGE_ERWEITERT` (Lead-Quelle) in Netlify **aus**, bis Merlin `art` und `herkunft` kennt.

## 4. Domain in Netlify anlegen (vor der DNS-Umstellung)

1. Projekt **mswohldorf** → linke Leiste **Domain management** → **Add a domain** → **Add a domain you already own**.
2. `www.mswohldorf.de` eingeben → **Verify** → **Add domain**. Netlify legt `mswohldorf.de` automatisch mit an
   und leitet es auf `www` um. `www.mswohldorf.de` muss als **Primary domain** markiert sein (sonst: **Options**
   → **Set as primary domain**).
3. DNS-Anbieter bleibt **IONOS** (externes DNS) — **nicht** „Set up Netlify DNS“ wählen, sonst muss die
   Zoho-Mail neu eingerichtet werden.
4. Neben den Domains steht **Pending DNS verification** — anklicken zeigt die Ziele aus Schritt 5.

## 5. DNS bei IONOS umstellen

1. https://login.ionos.de → **Mein IONOS** → **Domains & SSL** → Zeile **mswohldorf.de** → **DNS**
   (bzw. „DNS-Einstellungen bearbeiten“).
2. **Hauptdomain:** Eintrag Typ **A**, Hostname **@**, Wert `37.218.254.109` → bearbeiten (Stift) →
   **Zeigt auf** `75.2.60.5` → **Speichern**.
3. **www:** Eintrag Typ **A**, Hostname **www**, Wert `37.218.254.109` → löschen (Papierkorb).
   Dann **Datensatz hinzufügen** → **CNAME** → Hostname `www` → **Zeigt auf** `mswohldorf.netlify.app`
   → **Speichern**.
4. **Nicht ändern:** MX (`mx.zoho.eu` …), TXT (SPF, `zoho-verification`), DKIM-Einträge.
5. Die Einträge haben 1 Stunde TTL — bis zu einer Stunde (selten länger) sehen manche noch die alte Seite.

## 6. HTTPS in Netlify

Sobald DNS greift, stellt Netlify das Let's-Encrypt-Zertifikat automatisch aus:
**Domain management** → **HTTPS** zeigt das Zertifikat für `www.mswohldorf.de` und `mswohldorf.de`.
Hängt es nach einer Stunde noch: dort **Verify DNS configuration** / **Provision certificate** anklicken.

## 7. Prüfen (10 Minuten)

- https://www.mswohldorf.de lädt, ohne „Vorschau“-Band, mit Schloss im Browser.
- http://mswohldorf.de und https://mswohldorf.de leiten auf https://www.mswohldorf.de um.
- Alte Adressen: https://www.mswohldorf.de/kontakt → Anfahrt; `/index.html` → Start.
- **Testanfrage** über https://www.mswohldorf.de/anfrage/ → kommt in Zoho an (und ggf. die Erstantwort).
- Eine Test-Mail an eine @mswohldorf.de-Adresse kommt weiter an (Zoho).
- Exposé-Download: https://www.mswohldorf.de/pdf/ms-wohldorf-expose.pdf

## 8. Suchmaschinen

1. https://search.google.com/search-console → **Property hinzufügen** → **Domain** → `mswohldorf.de` →
   den angezeigten **TXT-Eintrag** bei IONOS als zusätzlichen TXT-Datensatz (Hostname `@`) anlegen — den
   SPF-Eintrag dabei **nicht** ersetzen → **Bestätigen**.
2. **Sitemaps** → `https://www.mswohldorf.de/sitemap-index.xml` → **Senden**.
3. https://www.bing.com/webmasters → **Import from Google Search Console** (übernimmt Property und Sitemap).

## 9. Danach

- Alter Webspace (Webspace-Verkauf, `37.218.254.109`): läuft im Dezember aus — nichts mehr darauf angewiesen.
  Prüfen, dass die **Domain** selbst in IONOS weiterläuft (sie ist nicht Teil des Webspace-Vertrags).
- Lead-Quelle: erst wenn der Lotse-Server `art` und `herkunft` annimmt, in Netlify
  `PUBLIC_ANFRAGE_ERWEITERT = 1` setzen und neu deployen (README, „Anfrage-Schnittstelle“).
- Nach einigen Tagen stabilem Betrieb: HSTS-`preload` erwägen (README, Checkliste).
