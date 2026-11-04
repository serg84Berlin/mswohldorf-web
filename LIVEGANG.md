# Livegang — Schritt für Schritt

Stand: 04.11.2026. Alle rechtlichen Angaben sind geklärt, `npm run build` läuft durch.
DNS-Stand am 04.11.2026 (geprüft): `mswohldorf.de` und `www` zeigen per A-Record auf den alten Webspace
`37.218.254.109`; Nameserver IONOS (`ns10xx.ui-dns.*`); Mail über Zoho (MX `mx.zoho.eu`, `mx2`, `mx3`),
SPF `v=spf1 include:one.zoho.eu include:_spf-eu.ionos.com ~all`, TXT `zoho-verification=…`; keine AAAA- und
keine CAA-Einträge.

**Reihenfolge einhalten.** Mail-Einträge (MX, SPF/TXT, DKIM) nie anfassen.

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

Im Lotse-Server die erlaubten Herkünfte (CORS) um `https://www.mswohldorf.de` ergänzen
(`https://mswohldorf.netlify.app` darf bleiben). Danach prüfen — die Antwort muss
`access-control-allow-origin: https://www.mswohldorf.de` enthalten:

```bash
curl -s -o /dev/null -D - -X OPTIONS -H 'Origin: https://www.mswohldorf.de' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type' https://finanzelot-lotse.de/api/oeffentlich/anfrage | grep -i access-control-allow-origin
```

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
