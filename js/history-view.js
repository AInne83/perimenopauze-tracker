// Overzicht: maandkalender met kleurcodering + grafiek per klacht.

let overzichtJaar = new Date().getFullYear();
let overzichtMaand = new Date().getMonth(); // 0-11
let overzichtChart = null;
let overzichtGeselecteerdeKlacht = null;

const MAAND_NAMEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december"
];

async function renderOverzicht() {
  const container = document.getElementById("overzicht-inhoud");
  const alleDagen = await getAlleDagen();
  const dagenMap = {};
  alleDagen.forEach(d => { dagenMap[d.datum] = d; });

  container.innerHTML = "";
  container.appendChild(bouwMaandNavigatie());
  container.appendChild(bouwKalenderGrid(dagenMap));
  container.appendChild(bouwLegenda());
  container.appendChild(bouwGrafiekSectie(alleDagen));
}

function bouwMaandNavigatie() {
  const wrap = document.createElement("div");
  wrap.className = "maand-navigatie";

  const vorige = document.createElement("button");
  vorige.className = "datum-nav";
  vorige.textContent = "‹";
  vorige.addEventListener("click", () => {
    overzichtMaand--;
    if (overzichtMaand < 0) { overzichtMaand = 11; overzichtJaar--; }
    renderOverzicht();
  });

  const label = document.createElement("span");
  label.className = "maand-label";
  label.textContent = `${MAAND_NAMEN[overzichtMaand]} ${overzichtJaar}`;

  const volgende = document.createElement("button");
  volgende.className = "datum-nav";
  volgende.textContent = "›";
  volgende.addEventListener("click", () => {
    overzichtMaand++;
    if (overzichtMaand > 11) { overzichtMaand = 0; overzichtJaar++; }
    renderOverzicht();
  });

  wrap.appendChild(vorige);
  wrap.appendChild(label);
  wrap.appendChild(volgende);
  return wrap;
}

function ernstVanDag(dag) {
  if (!dag) return -1;
  const scores = Object.values(dag.klachten || {});
  if (scores.length === 0) return 0;
  return Math.max(...scores);
}

function bouwKalenderGrid(dagenMap) {
  const wrap = document.createElement("div");
  wrap.className = "kalender";

  const weekdagen = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const koprij = document.createElement("div");
  koprij.className = "kalender-koprij";
  weekdagen.forEach(w => {
    const el = document.createElement("div");
    el.className = "kalender-weekdag";
    el.textContent = w;
    koprij.appendChild(el);
  });
  wrap.appendChild(koprij);

  const grid = document.createElement("div");
  grid.className = "kalender-grid";

  const eersteDag = new Date(overzichtJaar, overzichtMaand, 1);
  let startOffset = eersteDag.getDay() - 1; // maandag = 0
  if (startOffset < 0) startOffset = 6;

  const aantalDagen = new Date(overzichtJaar, overzichtMaand + 1, 0).getDate();
  const vandaag = toDatumString(new Date());

  for (let i = 0; i < startOffset; i++) {
    const leeg = document.createElement("div");
    leeg.className = "kalender-dag leeg";
    grid.appendChild(leeg);
  }

  for (let dagNr = 1; dagNr <= aantalDagen; dagNr++) {
    const datumStr = `${overzichtJaar}-${String(overzichtMaand + 1).padStart(2, "0")}-${String(dagNr).padStart(2, "0")}`;
    const dag = dagenMap[datumStr];
    const ernst = ernstVanDag(dag);

    const cel = document.createElement("button");
    cel.type = "button";
    cel.className = `kalender-dag ernst-${ernst === -1 ? "leeg" : ernst}`;
    if (datumStr === vandaag) cel.classList.add("vandaag");

    const nrSpan = document.createElement("span");
    nrSpan.className = "kalender-dagnr";
    nrSpan.textContent = String(dagNr);
    cel.appendChild(nrSpan);

    if (dag && dag.menstruatie) {
      const stip = document.createElement("span");
      stip.className = "kalender-stip";
      cel.appendChild(stip);
    }

    cel.addEventListener("click", () => {
      schakelNaarView("view-invoer");
      laadInvoerScherm(datumStr);
    });

    grid.appendChild(cel);
  }

  wrap.appendChild(grid);
  return wrap;
}

function bouwLegenda() {
  const wrap = document.createElement("div");
  wrap.className = "legenda";
  const items = [
    { klasse: "ernst-0", label: "Geen klachten" },
    { klasse: "ernst-1", label: "Licht" },
    { klasse: "ernst-2", label: "Matig" },
    { klasse: "ernst-3", label: "Zwaar" }
  ];
  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "legenda-item";
    el.innerHTML = `<span class="legenda-kleur ${item.klasse}"></span><span>${item.label}</span>`;
    wrap.appendChild(el);
  });
  return wrap;
}

function bouwGrafiekSectie(alleDagen) {
  const wrap = document.createElement("div");
  wrap.className = "grafiek-sectie";

  const titel = document.createElement("h2");
  titel.className = "grafiek-titel";
  titel.textContent = "Verloop per klacht";
  wrap.appendChild(titel);

  const select = document.createElement("select");
  select.className = "klacht-select";
  const alleNamen = alleKlachtenPlat();
  if (!overzichtGeselecteerdeKlacht) overzichtGeselecteerdeKlacht = alleNamen[0];
  alleNamen.forEach(naam => {
    const optie = document.createElement("option");
    optie.value = naam;
    optie.textContent = naam;
    if (naam === overzichtGeselecteerdeKlacht) optie.selected = true;
    select.appendChild(optie);
  });
  select.addEventListener("change", () => {
    overzichtGeselecteerdeKlacht = select.value;
    tekenGrafiek(alleDagen);
  });
  wrap.appendChild(select);

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "grafiek-canvas-wrap";
  const canvas = document.createElement("canvas");
  canvas.id = "grafiek-canvas";
  canvasWrap.appendChild(canvas);
  wrap.appendChild(canvasWrap);

  setTimeout(() => tekenGrafiek(alleDagen), 0);
  return wrap;
}

function tekenGrafiek(alleDagen) {
  const canvas = document.getElementById("grafiek-canvas");
  if (!canvas) return;

  const gesorteerd = alleDagen
    .filter(d => d.klachten && d.klachten[overzichtGeselecteerdeKlacht] !== undefined)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(-90);

  const labels = gesorteerd.map(d => d.datum.slice(5));
  const data = gesorteerd.map(d => d.klachten[overzichtGeselecteerdeKlacht]);

  if (overzichtChart) overzichtChart.destroy();

  overzichtChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: overzichtGeselecteerdeKlacht,
        data,
        borderColor: "#7c5cbf",
        backgroundColor: "rgba(124,92,191,0.15)",
        tension: 0.2,
        spanGaps: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 3,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  if (gesorteerd.length === 0) {
    const ctx = canvas.getContext("2d");
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#888";
    ctx.textAlign = "center";
    ctx.fillText("Nog geen gegevens voor deze klacht", canvas.width / 2, canvas.height / 2);
  }
}
