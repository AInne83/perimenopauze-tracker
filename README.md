# Perimenopauze Tracker

Een lokale, installeerbare web-app (PWA) om dagelijks perimenopauze-klachten en
sportactiviteiten bij te houden op je iPhone. Alles draait volledig **client-side**:
geen server, geen account, geen cloud. Je gegevens blijven op je eigen toestel,
in de lokale IndexedDB-opslag van je browser.

## ⚠️ Belangrijk: lees dit over iOS-opslag

iOS Safari kan de lokale opslag (IndexedDB) van een website die **niet is
toegevoegd aan je beginscherm** na ongeveer **7 dagen inactiviteit automatisch
opschonen**. Dat betekent dat je bijgehouden gegevens verloren kunnen gaan als je
de app alleen als bladwijzer of open tabblad gebruikt.

Om dataverlies te voorkomen:

1. **Installeer de app op je beginscherm** (zie stappen hieronder). Bij een
   geïnstalleerde PWA behandelt iOS de opslag als veel persistenter, al is een
   garantie er nooit.
2. **Maak regelmatig een backup.** Ga naar het tabblad **Data** en tik op
   **"Exporteer backup (JSON)"**. Bewaar dit bestand ergens veilig (bijv. in de
   Bestanden-app, iCloud Drive, of mail het naar jezelf). Bij dataverlies kun je
   dit bestand weer inladen via **"Importeer backup (JSON)"**.
3. De **Excel-export** (.xlsx) is bedoeld voor analyse van je gegevens (bijv. in
   Numbers of Excel) — gebruik die **niet** als backup, want je kunt een
   .xlsx-bestand niet terug importeren in de app. Gebruik hiervoor altijd de
   JSON-backup.

## Lokaal draaien / testen

De app bestaat volledig uit statische bestanden (HTML/CSS/JS), dus je hebt geen
build-stap of Node.js nodig. Je hebt wel een lichte lokale webserver nodig, omdat
sommige browserfuncties (zoals de service worker) niet werken via een `file://`-pad.

Vanuit de projectmap, met Python 3 (meestal al aanwezig op macOS/Windows):

```bash
python3 -m http.server 8080
```

Open daarna `http://localhost:8080` in je browser.

Geen Python? Elke andere lichte static-file server werkt ook, bijvoorbeeld:

```bash
npx serve .
```

## Installeren op je iPhone (aanbevolen)

1. Open de app-URL in **Safari** op je iPhone (niet Chrome — "Zet op
   beginscherm" met volledige PWA-ondersteuning werkt alleen in Safari).
2. Tik op het **deel-icoon** (vierkant met pijl omhoog) onderin de balk.
3. Scrol naar beneden en kies **"Zet op beginscherm"**.
4. Bevestig met **"Voeg toe"**.
5. Open de app voortaan via het icoon op je beginscherm — dan draait hij in
   "standalone"-modus (zonder Safari-balken) en volledig offline na de eerste
   keer laden.

## Functionaliteit

- **Invoer** — dagelijkse registratie van menstruatiepatroon, klachten
  (mentaal, emotioneel, lichamelijk, overig) op een schaal van 0–3, en
  sportactiviteiten (hardlopen, wandelen, zwemmen, krachttraining) met een
  score 1–5 en optionele notitie. Alles wordt automatisch opgeslagen zodra je
  een keuze maakt.
- **Overzicht** — maandkalender met kleurcodering per dag (op basis van de
  zwaarste klacht die dag) en een grafiek van het verloop van een gekozen
  klacht over tijd.
- **Data** — JSON-backup maken/herstellen en export naar Excel (.xlsx).

## Technisch

- Geen frameworks, geen build-tools: vanilla HTML/CSS/JS.
- Data-opslag: IndexedDB (niet alleen localStorage) voor betrouwbaardere opslag
  van meerdere maanden aan gegevens.
- `vendor/chart.umd.min.js` (Chart.js) en `vendor/xlsx.full.min.js` (SheetJS)
  zijn lokaal gebundeld — geen CDN-afhankelijkheid, dus alles werkt ook
  volledig offline.
- `sw.js` cachet de volledige app-shell bij de eerste keer laden, zodat de app
  daarna zonder internetverbinding werkt.
- Geen medische claims of interpretatie: de app registreert alleen wat je
  invoert en helpt je dat te exporteren.

## Databeheer / privacy

Er wordt niets naar een server gestuurd — alle code draait in je eigen
browser en alle gegevens blijven in de IndexedDB-opslag van je toestel, tot je
zelf een export maakt. Verwijder je de app of wis je Safari-gegevens, dan
verdwijnen ook je klachten-gegevens, tenzij je een backup hebt bewaard.
