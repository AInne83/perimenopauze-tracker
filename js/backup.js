// JSON-backup: los van de Excel-export, bedoeld om data te bewaren en later te herstellen.
// Belangrijk vangnet tegen het opschonen van lokale opslag door iOS Safari.

const BACKUP_VERSIE = 1;

async function exporteerJsonBackup() {
  const dagen = await getAlleDagen();
  dagen.sort((a, b) => a.datum.localeCompare(b.datum));

  const inhoud = {
    versie: BACKUP_VERSIE,
    geexporteerdOp: new Date().toISOString(),
    dagen
  };

  const blob = new Blob([JSON.stringify(inhoud, null, 2)], { type: "application/json" });
  const bestandsnaam = exportBestandsnaam("json");
  const file = new File([blob], bestandsnaam, { type: blob.type });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Perimenopauze backup",
        text: "JSON-backup van al je gegevens"
      });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }

  downloadBlob(blob, bestandsnaam);
}

async function importeerJsonBackup(bestand) {
  const tekst = await bestand.text();
  let inhoud;
  try {
    inhoud = JSON.parse(tekst);
  } catch (e) {
    throw new Error("Dit bestand is geen geldig backup-bestand (ongeldige JSON).");
  }

  const dagen = Array.isArray(inhoud) ? inhoud : inhoud.dagen;
  if (!Array.isArray(dagen)) {
    throw new Error("Dit bestand bevat geen herkenbare backup-gegevens.");
  }

  const geldig = dagen.every(d => d && typeof d.datum === "string");
  if (!geldig) {
    throw new Error("Dit bestand bevat geen geldige dagrecords.");
  }

  await vervangAlleDagen(dagen);
  return dagen.length;
}
