// Excel-export (.xlsx) van alle ingevoerde dagen, via lokaal gebundelde SheetJS-library.

function bouwExportKolommen() {
  const kolommen = ["Datum", "Menstruatiepatroon"];
  alleKlachtenPlat().forEach(naam => kolommen.push(naam));
  ACTIVITEITEN.forEach(naam => {
    kolommen.push(`${naam} - gedaan`);
    kolommen.push(`${naam} - score (1-5)`);
    kolommen.push(`${naam} - notitie`);
  });
  return kolommen;
}

function bouwExportRij(dag) {
  const rij = [dag.datum, dag.menstruatie || ""];
  alleKlachtenPlat().forEach(naam => {
    const score = dag.klachten ? dag.klachten[naam] : undefined;
    rij.push(score === undefined || score === null ? "" : score);
  });
  ACTIVITEITEN.forEach(naam => {
    const act = (dag.activiteiten && dag.activiteiten[naam]) || {};
    rij.push(act.gedaan ? "Ja" : "");
    rij.push(act.gedaan && act.score ? act.score : "");
    rij.push(act.notitie || "");
  });
  return rij;
}

async function genereerExcelBlob() {
  const dagen = await getAlleDagen();
  dagen.sort((a, b) => a.datum.localeCompare(b.datum));

  const kolommen = bouwExportKolommen();
  const rijen = [kolommen, ...dagen.map(bouwExportRij)];

  const sheet = XLSX.utils.aoa_to_sheet(rijen);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Dagboek");

  const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

function exportBestandsnaam(extensie) {
  const nu = new Date();
  const datumStr = toDatumString(nu);
  return `perimenopauze-export-${datumStr}.${extensie}`;
}

async function exporteerNaarExcel() {
  const blob = await genereerExcelBlob();
  const bestandsnaam = exportBestandsnaam("xlsx");
  const file = new File([blob], bestandsnaam, { type: blob.type });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Perimenopauze export",
        text: "Excel-export van klachten en activiteiten"
      });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
      // Val terug op download bij een fout met de share sheet.
    }
  }

  downloadBlob(blob, bestandsnaam);
}

function downloadBlob(blob, bestandsnaam) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = bestandsnaam;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
