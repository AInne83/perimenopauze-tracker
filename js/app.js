// Algemene app-logica: tabnavigatie, initialisatie en het "Data"-scherm.

function schakelNaarView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("actief"));
  document.getElementById(viewId).classList.add("actief");

  document.querySelectorAll(".navtab").forEach(tab => {
    tab.classList.toggle("actief", tab.dataset.view === viewId);
  });

  if (viewId === "view-overzicht") renderOverzicht();
  if (viewId === "view-data") renderDataView();
}

function initNavigatie() {
  document.querySelectorAll(".navtab").forEach(tab => {
    tab.addEventListener("click", () => schakelNaarView(tab.dataset.view));
  });
}

function laatsteBackupTekst() {
  const iso = localStorage.getItem("laatsteBackup");
  if (!iso) return "Nog geen backup gemaakt.";
  const datum = new Date(iso);
  return `Laatste backup: ${datum.toLocaleDateString("nl-NL")} ${datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
}

function laatsteExportTekst() {
  const iso = localStorage.getItem("laatsteExport");
  if (!iso) return "Nog geen export gemaakt.";
  const datum = new Date(iso);
  return `Laatste export: ${datum.toLocaleDateString("nl-NL")} ${datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
}

function markeerExportGemaakt() {
  localStorage.setItem("laatsteExport", new Date().toISOString());
}

async function renderDataView() {
  const container = document.getElementById("data-inhoud");
  const alleDagen = await getAlleDagen();

  container.innerHTML = `
    <div class="sectie">
      <div class="sectie-header"><span>Overzicht</span></div>
      <div class="sectie-body" style="display:block">
        <p class="data-info">${alleDagen.length} dag(en) opgeslagen op dit toestel.</p>
      </div>
    </div>

    <div class="sectie">
      <div class="sectie-header"><span>Backup (aanbevolen)</span></div>
      <div class="sectie-body" style="display:block">
        <p class="data-waarschuwing">
          ⚠️ iOS Safari kan lokale opslag van deze app na ongeveer 7 dagen inactiviteit opschonen
          als de app niet is toegevoegd aan je beginscherm. Exporteer daarom regelmatig een backup
          en installeer de app op je beginscherm (zie README).
        </p>
        <p class="data-info" id="laatste-backup-info">${laatsteBackupTekst()}</p>
        <button class="knop knop-primair" id="btn-json-export">Exporteer backup (JSON)</button>
        <label class="knop knop-secundair" for="input-json-import">Importeer backup (JSON)</label>
        <input type="file" id="input-json-import" accept="application/json,.json" class="verborgen-input">
      </div>
    </div>

    <div class="sectie">
      <div class="sectie-header"><span>Excel-export</span></div>
      <div class="sectie-body" style="display:block">
        <p class="data-info">Exporteert al je gegevens als .xlsx-bestand, handig voor analyse. Dit is geen backup-bestand.</p>
        <button class="knop knop-primair" id="btn-xlsx-export">Exporteer naar Excel</button>
      </div>
    </div>

    <div class="sectie sectie-gevaar">
      <div class="sectie-header"><span>Gevarenzone</span></div>
      <div class="sectie-body" style="display:block">
        <p class="data-info">Wist alle ingevoerde dagen op dit toestel, bijvoorbeeld om opnieuw te beginnen na een export.</p>
        <p class="data-info" id="laatste-export-info">${laatsteExportTekst()}</p>
        <button class="knop knop-gevaar" id="btn-wis-data">Wis alle data</button>
      </div>
    </div>
  `;

  document.getElementById("btn-json-export").addEventListener("click", async () => {
    await exporteerJsonBackup();
    localStorage.setItem("laatsteBackup", new Date().toISOString());
    markeerExportGemaakt();
    document.getElementById("laatste-backup-info").textContent = laatsteBackupTekst();
    toonToast("Backup geëxporteerd");
  });

  document.getElementById("input-json-import").addEventListener("change", async (e) => {
    const bestand = e.target.files[0];
    if (!bestand) return;
    const bevestigd = confirm("Dit vult ontbrekende of overlappende dagen aan met de gegevens uit dit backup-bestand. Doorgaan?");
    if (!bevestigd) { e.target.value = ""; return; }
    try {
      const aantal = await importeerJsonBackup(bestand);
      toonToast(`${aantal} dag(en) geïmporteerd`);
      renderDataView();
    } catch (err) {
      alert(err.message);
    }
    e.target.value = "";
  });

  document.getElementById("btn-xlsx-export").addEventListener("click", async () => {
    await exporteerNaarExcel();
    markeerExportGemaakt();
    document.getElementById("laatste-export-info").textContent = laatsteExportTekst();
    toonToast("Excel geëxporteerd");
  });

  document.getElementById("btn-wis-data").addEventListener("click", async () => {
    const laatsteExport = localStorage.getItem("laatsteExport");

    let bevestigd;
    if (!laatsteExport) {
      bevestigd = confirm(
        "⚠️ Je hebt nog geen export gemaakt.\n\n" +
        "Als je nu alle gegevens wist, ben je al je ingevoerde dagen definitief kwijt. " +
        "Weet je zeker dat je wilt doorgaan zonder eerst te exporteren?"
      );
    } else {
      bevestigd = confirm(
        `Weet je zeker dat je alle ${alleDagen.length} ingevoerde dag(en) wilt wissen? Dit kan niet ongedaan worden gemaakt.\n\n(${laatsteExportTekst()})`
      );
    }

    if (!bevestigd) return;

    await wisAlleDagen();
    await laadInvoerScherm(huidigeDatum);
    toonToast("Alle gegevens gewist");
    renderDataView();
  });
}

function registreerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(err => {
      console.error("Service worker registratie mislukt:", err);
    });
  }
}

async function initApp() {
  initNavigatie();
  initInvoerNavigatie();
  await laadInvoerScherm(toDatumString(new Date()));
  registreerServiceWorker();
}

document.addEventListener("DOMContentLoaded", initApp);
