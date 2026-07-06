// Vaste lijst van klachten en activiteiten, gegroepeerd per categorie.
// Wijzig deze lijst NIET tijdens gebruik zonder rekening te houden met reeds opgeslagen data.

const MENSTRUATIE_OPTIES = [
  "Spotting",
  "Normaal",
  "Lichter dan normaal",
  "Zwaarder dan normaal"
];

const KLACHTEN_CATEGORIEEN = [
  {
    key: "mentaal",
    titel: "Mentale klachten",
    klachten: [
      "Concentratieproblemen / brain fog",
      "Vergeetachtig / verminderd geheugen"
    ]
  },
  {
    key: "emotioneel",
    titel: "Emotionele klachten",
    klachten: [
      "Angstig / paniekaanvallen / gevoel van onheil",
      "Gespannen of nerveus gevoel",
      "Besluiteloosheid / onrust / onzeker",
      "Depressief / futloos / ongeïnteresseerd",
      "Geïrriteerd / opvliegend / onverdraagzaam",
      "Gevoel van overweldiging / overprikkeld",
      "Huilerig / overemotioneel",
      "Je terugtrekken / meer tijd alleen willen",
      "Nors / grumpy / ongeduldig",
      "Snel boos of agressief",
      "Stemmingswisselingen",
      "Verlies van libido / zin in seks / zelfvertrouwen"
    ]
  },
  {
    key: "lichamelijk",
    titel: "Lichamelijke klachten",
    klachten: [
      "Blaasproblemen / urineweginfectie",
      "Brandend maagzuur",
      "Droge huid / jeuk / acne / droge ogen",
      "Eetbuien / opgeblazen gevoel / darmklachten",
      "Gewichtstoename (buik)",
      "Haarverlies / dunner wordend haar",
      "Hoofdpijn / migraine",
      "Pijnlijke borsten & pijn tijdens seks",
      "Rusteloze benen",
      "Schouderletsels (frozen shoulder / rotator cuff)",
      "Slaapproblemen / moeheid / uitputting",
      "Stemproblemen / hielspoor",
      "Stijfheid / spierpijn / pijnlijke gewrichten",
      "Toegenomen schimmel- & bacteriële infecties",
      "Vaginale droogte / branderigheid / clitoris ongevoelig",
      "Opvliegers en/of nachtelijk zweten",
      "Tintelingen of doof gevoel in huid/lichaam",
      "Verminderd gevoel in handen en/of voeten"
    ]
  },
  {
    key: "andere",
    titel: "Andere symptomen",
    klachten: [
      "Duizeligheid / zwakte / kortademigheid / flauwvallen",
      "Hartkloppingen & tinnitus",
      "Nieuwe / verergering van allergie(ën)",
      "Nieuwe / verergering van auto-immuunziekte",
      "Verhoogde bloeddruk en/of cholesterol"
    ]
  }
];

const SCORE_LABELS = {
  0: "Geen",
  1: "Licht",
  2: "Matig",
  3: "Zwaar"
};

const ACTIVITEITEN = [
  "Hardlopen",
  "Wandelen",
  "Zwemmen",
  "Krachttraining"
];

// Helper: platte lijst van alle klachten (voor export-kolommen), in vaste volgorde.
function alleKlachtenPlat() {
  const lijst = [];
  KLACHTEN_CATEGORIEEN.forEach(cat => {
    cat.klachten.forEach(naam => lijst.push(naam));
  });
  return lijst;
}
