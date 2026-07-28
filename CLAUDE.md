# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Wat dit is

Lifestyle Tracker: een lokale, installeerbare PWA (iOS-focused) om dagelijks je
algehele lifestyle bij te houden — dagelijkse check-in (gevoel, slaap, stress),
menstruatie, (perimenopauze-)klachten en sportactiviteiten. Volledig client-side —
geen server, geen account, geen build-stap. Vanilla HTML/CSS/JS, data in IndexedDB.
UI-tekst, code comments en variabele/functienamen zijn in het Nederlands; blijf
consistent met die taal wanneer je nieuwe UI-strings of comments toevoegt.

Intern (IndexedDB-databasenaam `DB_NAAM` in `db.js`, en de mapnaam
`perimenopauze-tracker`) is de oorspronkelijke, perimenopauze-specifieke naam
bewust blijven staan — wijzigen zou bestaande lokale data onbereikbaar maken
onder een nieuwe databasenaam. Alleen de gebruikersgerichte branding (titel,
app-naam, README) is generieker gemaakt.

## Development commands

No build step, no package manager, no test suite exists. To run locally, serve the
directory with any static file server (service workers require `http://`, not `file://`):

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`. There is no lint/build/test command to run —
changes are tested by reloading in the browser.

### Service worker cache-busting

`sw.js` precaches the entire app shell (`APP_SHELL` array) for offline use. **Any
change to a cached file requires bumping `CACHE_NAAM` in `sw.js`** (e.g.
`lifestyle-tracker-v1` → `v2`), otherwise installed/iOS clients will keep
serving stale cached files indefinitely — Safari won't detect the new service
worker without a change to `sw.js` itself. If you add a new file to the app,
also add it to the `APP_SHELL` array.

## Architecture

### Script load order matters

Scripts are loaded via plain `<script>` tags in `index.html` (no modules, no
bundler), in this order, and each file depends on globals defined by the ones
before it:

```
symptoms-data.js → db.js → entry-view.js → history-view.js → export-xlsx.js → backup.js → app.js
```

All functions/constants are plain globals (no namespacing). When adding a new
file, insert it in this list at the right dependency point, in both
`index.html` and `sw.js`'s `APP_SHELL`.

### Data model

One IndexedDB record per calendar day, store `dagen` (db.js), keyed by `datum`
(`YYYY-MM-DD` string):

```js
{
  datum,
  gevoel: 1-5|null,
  slaapuren: 5-9 (step 0.5)|null,
  slaapkwaliteit: 1-5|null,
  stress: 1-5|null,
  menstruatie: { actief: boolean|null, patroon: string|null },
  klachten: {naam: 0-3},
  activiteiten: {naam: {gedaan, score, notitie}},
  opmerking: string
}
```

- `klachten` (complaints) only stores keys with a score > 0 — a score of 0 deletes
  the key rather than storing 0 (see `bouwKlachtRij` in entry-view.js).
- The canonical list of complaints/activities lives in `symptoms-data.js`
  (`KLACHTEN_CATEGORIEEN`, `ACTIVITEITEN`, `MENSTRUATIE_OPTIES`). This is
  explicitly commented as: **do not change this list without accounting for
  already-stored data** — renaming/removing an entry orphans historical scores
  that were keyed by name (not by id).
- The four daily check-in fields (`gevoel`, `slaapuren`, `slaapkwaliteit`,
  `stress`) are described once in `LIFESTYLE_METRICS` (symptoms-data.js) —
  label, min/max/step and a getter — and consumed by both the input UI
  (entry-view.js's `bouwSchaalRij`/`bouwSlaapuurRij`) and the Overzicht chart
  (history-view.js's `tekenGrafiek`). Add new check-in fields there, not by
  hardcoding scales in multiple files.
- `menstruatie` is two-step: `actief` (true/false/null = unanswered) gates
  whether `patroon` (one of `MENSTRUATIE_OPTIES`) is asked/shown at all;
  picking "Nee" or toggling `actief` off always clears `patroon`.
- `migreerDag()` in db.js backfills fields missing on older records (e.g. an old
  record without `opmerking`, or a pre-rebrand record where `menstruatie` was
  still a plain string/null instead of the `{actief, patroon}` object). When
  adding a new field to the day record, add a migration line here rather than
  assuming the field always exists.

### The three views

`app.js` toggles `.view` sections (`#view-invoer`, `#view-overzicht`,
`#view-data`) via `schakelNaarView()`, driven by the bottom nav. Each view's
content is rendered on demand (not statically in HTML):

- **Invoer** (entry-view.js) — today/selected day's form: a daily check-in
  section (gevoel/slaapuren/slaapkwaliteit/stress) first, then two-step
  menstruation buttons (ja/nee, then pattern), collapsible complaint
  categories with 0–3 score buttons, activities with a 1–5 score + note, and
  a notes textarea. Every interaction immediately calls `bewaarHuidigeDag()`
  → `saveDag()` — there is no explicit save button, and no debounce (text
  inputs and the sleep slider save on `change`, buttons save on `click`).
- **Overzicht** (history-view.js) — month calendar colored by each day's worst
  complaint severity (`ernstVanDag`, complaints only — not the check-in
  metrics), plus a Chart.js line graph of a single selected metric (one of
  `LIFESTYLE_METRICS` or a complaint, grouped via `<optgroup>` in the select)
  over the last 90 entries with matching data.
- **Data** (rendered inline in `app.js`'s `renderDataView()`) — JSON backup
  export/import (backup.js) and Excel export (export-xlsx.js), plus a
  "wipe all data" danger action guarded by `confirm()` and by whether a
  backup/export has ever been made.

### Backup vs. Excel export — do not conflate

`backup.js` (JSON) is the only round-trippable format (`vervangAlleDagen()` on
import) and is the data-loss safety net referenced throughout the README/UI —
iOS Safari may clear IndexedDB for non-installed PWAs after ~7 days of
inactivity. `export-xlsx.js` (.xlsx via bundled SheetJS) is for analysis only
and is explicitly **not** importable back into the app. Don't blur this
distinction in UI copy or code — users are repeatedly warned in-app to use JSON
for backups, not Excel.

### No CDN dependencies

`vendor/chart.umd.min.js` (Chart.js) and `vendor/xlsx.full.min.js` (SheetJS) are
vendored locally so the app works fully offline. Don't switch these to CDN
`<script src>` tags.

### No medical claims

Per the README: the app only records what the user enters and helps export it —
it does not interpret or diagnose. Keep new UI copy consistent with that (no
medical advice/interpretation of symptom scores).
