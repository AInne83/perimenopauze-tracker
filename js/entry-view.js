// Dagelijkse invoer-scherm: klachten, menstruatie en activiteiten voor een gekozen datum.

let huidigeDatum = toDatumString(new Date());
let huidigeDag = null;

function toDatumString(d) {
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

function formatteerDatumLabel(datumStr) {
  const vandaag = toDatumString(new Date());
  const gisterenDate = new Date();
  gisterenDate.setDate(gisterenDate.getDate() - 1);
  const gisteren = toDatumString(gisterenDate);

  if (datumStr === vandaag) return "Vandaag";
  if (datumStr === gisteren) return "Gisteren";

  const [j, m, d] = datumStr.split("-").map(Number);
  const datum = new Date(j, m - 1, d);
  const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const maanden = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${dagen[datum.getDay()]} ${datum.getDate()} ${maanden[datum.getMonth()]} ${datum.getFullYear()}`;
}

function toonToast(tekst) {
  const toast = document.getElementById("toast");
  toast.textContent = tekst;
  toast.classList.add("zichtbaar");
  clearTimeout(toonToast._timer);
  toonToast._timer = setTimeout(() => {
    toast.classList.remove("zichtbaar");
  }, 1200);
}

async function bewaarHuidigeDag() {
  await saveDag(huidigeDag);
  toonToast("Opgeslagen");
}

async function laadInvoerScherm(datumStr) {
  huidigeDatum = datumStr;
  huidigeDag = await getDag(datumStr);
  document.getElementById("datum-label").textContent = formatteerDatumLabel(datumStr);
  document.getElementById("datum-input").value = datumStr;
  renderInvoerInhoud();
}

function renderInvoerInhoud() {
  const container = document.getElementById("invoer-inhoud");
  container.innerHTML = "";
  container.appendChild(bouwCheckinSectie());
  container.appendChild(bouwMenstruatieSectie());
  KLACHTEN_CATEGORIEEN.forEach(cat => {
    container.appendChild(bouwKlachtenCategorie(cat));
  });
  container.appendChild(bouwActiviteitenSectie());
  container.appendChild(bouwOpmerkingSectie());
}

function bouwCheckinSectie() {
  const wrap = document.createElement("div");
  wrap.className = "sectie";

  const header = document.createElement("div");
  header.className = "sectie-header";
  header.innerHTML = `<span>Hoe gaat het vandaag?</span>`;
  wrap.appendChild(header);

  const body = document.createElement("div");
  body.className = "sectie-body";
  body.appendChild(bouwSchaalRij("gevoel"));
  body.appendChild(bouwSlaapuurRij());
  body.appendChild(bouwSchaalRij("slaapkwaliteit"));
  body.appendChild(bouwSchaalRij("stress"));
  wrap.appendChild(body);
  return wrap;
}

// Generieke 1-5-knoppenrij voor een LIFESTYLE_METRICS-veld (gevoel, slaapkwaliteit, stress).
function bouwSchaalRij(metricKey) {
  const config = LIFESTYLE_METRICS[metricKey];

  const rij = document.createElement("div");
  rij.className = "klacht-rij";

  const label = document.createElement("span");
  label.className = "klacht-label";
  label.textContent = config.label;
  rij.appendChild(label);

  const scoreWrap = document.createElement("div");
  scoreWrap.className = "score-knoppen score-knoppen-5";

  const huidigeWaarde = config.getter(huidigeDag);

  for (let waarde = config.min; waarde <= config.max; waarde += config.stap) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "score-knop";
    btn.textContent = String(waarde);
    if (huidigeWaarde === waarde) btn.classList.add("actief");
    btn.addEventListener("click", () => {
      huidigeDag[metricKey] = waarde;
      scoreWrap.querySelectorAll(".score-knop").forEach(b => b.classList.remove("actief"));
      btn.classList.add("actief");
      bewaarHuidigeDag();
    });
    scoreWrap.appendChild(btn);
  }

  rij.appendChild(scoreWrap);
  return rij;
}

function formatteerUren(waarde) {
  const getal = Number(waarde);
  const tekst = Number.isInteger(getal) ? String(getal) : String(getal).replace(".", ",");
  return `${tekst} uur`;
}

function bouwSlaapuurRij() {
  const config = LIFESTYLE_METRICS.slaapuren;

  const wrap = document.createElement("div");
  wrap.className = "slider-rij";

  const kop = document.createElement("div");
  kop.className = "slider-kop";
  const labelSpan = document.createElement("span");
  labelSpan.textContent = config.label;
  const waardeSpan = document.createElement("span");
  waardeSpan.className = "slider-waarde";
  kop.appendChild(labelSpan);
  kop.appendChild(waardeSpan);
  wrap.appendChild(kop);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "slider-veld";
  slider.min = String(config.min);
  slider.max = String(config.max);
  slider.step = String(config.stap);

  const opgeslagenWaarde = huidigeDag.slaapuren;
  const standaardWaarde = (config.min + config.max) / 2;
  slider.value = String(opgeslagenWaarde !== null && opgeslagenWaarde !== undefined ? opgeslagenWaarde : standaardWaarde);
  waardeSpan.textContent = formatteerUren(slider.value);

  slider.addEventListener("input", () => {
    waardeSpan.textContent = formatteerUren(slider.value);
  });
  slider.addEventListener("change", () => {
    huidigeDag.slaapuren = Number(slider.value);
    bewaarHuidigeDag();
  });

  wrap.appendChild(slider);
  return wrap;
}

function telIngevuld(namen, dataObj) {
  return namen.filter(naam => dataObj[naam] !== undefined && dataObj[naam] !== null && dataObj[naam] > 0).length;
}

function bouwMenstruatieSectie() {
  const wrap = document.createElement("div");
  wrap.className = "sectie";

  const header = document.createElement("div");
  header.className = "sectie-header";
  header.innerHTML = `<span>Menstruatie</span>`;
  wrap.appendChild(header);

  const body = document.createElement("div");
  body.className = "sectie-body";

  const patroonWrap = document.createElement("div");
  patroonWrap.className = "menstruatie-patroon";
  patroonWrap.style.display = huidigeDag.menstruatie.actief === true ? "block" : "none";

  const patroonLabel = document.createElement("div");
  patroonLabel.className = "activiteit-scorelabel";
  patroonLabel.textContent = "Patroon";
  patroonWrap.appendChild(patroonLabel);

  const patroonOpties = document.createElement("div");
  patroonOpties.className = "menstruatie-opties";
  MENSTRUATIE_OPTIES.forEach(optie => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menstruatie-knop";
    btn.textContent = optie;
    if (huidigeDag.menstruatie.patroon === optie) btn.classList.add("actief");
    btn.addEventListener("click", () => {
      huidigeDag.menstruatie.patroon = (huidigeDag.menstruatie.patroon === optie) ? null : optie;
      bewaarHuidigeDag();
      patroonOpties.querySelectorAll(".menstruatie-knop").forEach(b => b.classList.remove("actief"));
      if (huidigeDag.menstruatie.patroon === optie) btn.classList.add("actief");
    });
    patroonOpties.appendChild(btn);
  });
  patroonWrap.appendChild(patroonOpties);

  const jaNeeRij = document.createElement("div");
  jaNeeRij.className = "menstruatie-opties";
  [["Ja", true], ["Nee", false]].forEach(([label, waarde]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menstruatie-knop";
    btn.textContent = label;
    if (huidigeDag.menstruatie.actief === waarde) btn.classList.add("actief");
    btn.addEventListener("click", () => {
      const nieuweWaarde = (huidigeDag.menstruatie.actief === waarde) ? null : waarde;
      huidigeDag.menstruatie.actief = nieuweWaarde;
      if (nieuweWaarde !== true) huidigeDag.menstruatie.patroon = null;
      bewaarHuidigeDag();

      jaNeeRij.querySelectorAll(".menstruatie-knop").forEach(b => b.classList.remove("actief"));
      if (nieuweWaarde === waarde) btn.classList.add("actief");

      patroonWrap.style.display = nieuweWaarde === true ? "block" : "none";
      if (nieuweWaarde !== true) {
        patroonOpties.querySelectorAll(".menstruatie-knop").forEach(b => b.classList.remove("actief"));
      }
    });
    jaNeeRij.appendChild(btn);
  });

  body.appendChild(jaNeeRij);
  body.appendChild(patroonWrap);
  wrap.appendChild(body);
  return wrap;
}

function bouwKlachtenCategorie(cat) {
  const wrap = document.createElement("div");
  wrap.className = "sectie";

  const aantalIngevuld = telIngevuld(cat.klachten, huidigeDag.klachten);

  const header = document.createElement("button");
  header.type = "button";
  header.className = "sectie-header inklapbaar";
  header.innerHTML = `
    <span>${cat.titel}</span>
    <span class="sectie-badge${aantalIngevuld > 0 ? "" : " leeg"}" data-badge="${cat.key}">${aantalIngevuld > 0 ? aantalIngevuld : ""}</span>
    <span class="sectie-pijl">&#9662;</span>
  `;

  const body = document.createElement("div");
  body.className = "sectie-body";
  body.style.display = aantalIngevuld > 0 ? "block" : "none";
  if (aantalIngevuld > 0) header.classList.add("open");

  header.addEventListener("click", () => {
    const open = body.style.display !== "none";
    body.style.display = open ? "none" : "block";
    header.classList.toggle("open", !open);
  });

  cat.klachten.forEach(naam => {
    body.appendChild(bouwKlachtRij(naam, cat.key, header));
  });

  wrap.appendChild(header);
  wrap.appendChild(body);
  return wrap;
}

function bouwKlachtRij(naam, catKey, headerEl) {
  const rij = document.createElement("div");
  rij.className = "klacht-rij";

  const label = document.createElement("span");
  label.className = "klacht-label";
  label.textContent = naam;
  rij.appendChild(label);

  const scoreWrap = document.createElement("div");
  scoreWrap.className = "score-knoppen";

  const huidigeScore = huidigeDag.klachten[naam] || 0;

  [0, 1, 2, 3].forEach(score => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "score-knop score-" + score;
    btn.textContent = score === 0 ? "–" : String(score);
    if (huidigeScore === score) btn.classList.add("actief");
    btn.addEventListener("click", () => {
      if (score === 0) {
        delete huidigeDag.klachten[naam];
      } else {
        huidigeDag.klachten[naam] = score;
      }
      scoreWrap.querySelectorAll(".score-knop").forEach(b => b.classList.remove("actief"));
      btn.classList.add("actief");
      bewaarHuidigeDag();
      const badge = document.querySelector(`[data-badge="${catKey}"]`);
      if (badge) {
        const cat = KLACHTEN_CATEGORIEEN.find(c => c.key === catKey);
        const n = telIngevuld(cat.klachten, huidigeDag.klachten);
        badge.textContent = n > 0 ? n : "";
        badge.classList.toggle("leeg", n === 0);
      }
    });
    scoreWrap.appendChild(btn);
  });

  rij.appendChild(scoreWrap);
  return rij;
}

function bouwActiviteitenSectie() {
  const wrap = document.createElement("div");
  wrap.className = "sectie";

  const gedaanAantal = ACTIVITEITEN.filter(a => huidigeDag.activiteiten[a] && huidigeDag.activiteiten[a].gedaan).length;

  const header = document.createElement("button");
  header.type = "button";
  header.className = "sectie-header inklapbaar open";
  header.innerHTML = `
    <span>Sportactiviteiten</span>
    <span class="sectie-badge${gedaanAantal > 0 ? "" : " leeg"}" id="activiteit-badge">${gedaanAantal > 0 ? gedaanAantal : ""}</span>
    <span class="sectie-pijl">&#9662;</span>
  `;

  const body = document.createElement("div");
  body.className = "sectie-body";
  body.style.display = "block";

  header.addEventListener("click", () => {
    const open = body.style.display !== "none";
    body.style.display = open ? "none" : "block";
    header.classList.toggle("open", !open);
  });

  ACTIVITEITEN.forEach(naam => {
    body.appendChild(bouwActiviteitBlok(naam));
  });

  wrap.appendChild(header);
  wrap.appendChild(body);
  return wrap;
}

function bouwActiviteitBlok(naam) {
  const blok = document.createElement("div");
  blok.className = "activiteit-blok";

  if (!huidigeDag.activiteiten[naam]) {
    huidigeDag.activiteiten[naam] = { gedaan: false, score: null, notitie: "" };
  }
  const data = huidigeDag.activiteiten[naam];

  const koprij = document.createElement("label");
  koprij.className = "activiteit-koprij";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!data.gedaan;
  const naamSpan = document.createElement("span");
  naamSpan.textContent = naam;
  koprij.appendChild(checkbox);
  koprij.appendChild(naamSpan);
  blok.appendChild(koprij);

  const details = document.createElement("div");
  details.className = "activiteit-details";
  details.style.display = data.gedaan ? "flex" : "none";

  const scoreLabel = document.createElement("div");
  scoreLabel.className = "activiteit-scorelabel";
  scoreLabel.textContent = "Hoe ging het? (1 = zwaar, 5 = heel goed)";
  details.appendChild(scoreLabel);

  const scoreWrap = document.createElement("div");
  scoreWrap.className = "score-knoppen score-knoppen-5";
  [1, 2, 3, 4, 5].forEach(score => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "score-knop";
    btn.textContent = String(score);
    if (data.score === score) btn.classList.add("actief");
    btn.addEventListener("click", () => {
      data.score = score;
      scoreWrap.querySelectorAll(".score-knop").forEach(b => b.classList.remove("actief"));
      btn.classList.add("actief");
      bewaarHuidigeDag();
    });
    scoreWrap.appendChild(btn);
  });
  details.appendChild(scoreWrap);

  const notitie = document.createElement("input");
  notitie.type = "text";
  notitie.className = "activiteit-notitie";
  notitie.placeholder = "Notitie (bijv. 5 km, 30 min, 20 kg)";
  notitie.value = data.notitie || "";
  notitie.addEventListener("change", () => {
    data.notitie = notitie.value;
    bewaarHuidigeDag();
  });
  details.appendChild(notitie);

  blok.appendChild(details);

  checkbox.addEventListener("change", () => {
    data.gedaan = checkbox.checked;
    details.style.display = data.gedaan ? "flex" : "none";
    bewaarHuidigeDag();
    const badge = document.getElementById("activiteit-badge");
    if (badge) {
      const n = ACTIVITEITEN.filter(a => huidigeDag.activiteiten[a] && huidigeDag.activiteiten[a].gedaan).length;
      badge.textContent = n > 0 ? n : "";
      badge.classList.toggle("leeg", n === 0);
    }
  });

  return blok;
}

function bouwOpmerkingSectie() {
  const wrap = document.createElement("div");
  wrap.className = "sectie";

  const header = document.createElement("div");
  header.className = "sectie-header";
  header.innerHTML = `<span>Opmerkingen</span>`;
  wrap.appendChild(header);

  const body = document.createElement("div");
  body.className = "sectie-body";

  const veld = document.createElement("textarea");
  veld.className = "opmerking-veld";
  veld.placeholder = "Korte aantekeningen over deze dag...";
  veld.value = huidigeDag.opmerking || "";
  veld.addEventListener("change", () => {
    huidigeDag.opmerking = veld.value;
    bewaarHuidigeDag();
  });
  body.appendChild(veld);

  wrap.appendChild(body);
  return wrap;
}

function initInvoerNavigatie() {
  document.getElementById("dag-vorige").addEventListener("click", () => {
    verschuifDag(-1);
  });
  document.getElementById("dag-volgende").addEventListener("click", () => {
    verschuifDag(1);
  });
  document.getElementById("datum-label").addEventListener("click", () => {
    document.getElementById("datum-input").showPicker
      ? document.getElementById("datum-input").showPicker()
      : document.getElementById("datum-input").click();
  });
  document.getElementById("datum-input").addEventListener("change", (e) => {
    if (e.target.value) laadInvoerScherm(e.target.value);
  });
}

function verschuifDag(delta) {
  const [j, m, d] = huidigeDatum.split("-").map(Number);
  const datum = new Date(j, m - 1, d);
  datum.setDate(datum.getDate() + delta);
  laadInvoerScherm(toDatumString(datum));
}
