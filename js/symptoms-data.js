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
      "Angstig",
      "Paniekaanvallen",
      "Gevoel van onheil",
      "Gespannen of nerveus gevoel",
      "Besluiteloosheid",
      "Onrust",
      "Onzeker",
      "Depressief",
      "Futloos",
      "Ongeïnteresseerd",
      "Geïrriteerd",
      "Opvliegend",
      "Onverdraagzaam",
      "Gevoel van overweldiging",
      "Overprikkeld",
      "Huilerig",
      "Overemotioneel",
      "Je terugtrekken",
      "Meer tijd alleen willen",
      "Nors / grumpy",
      "Ongeduldig",
      "Snel boos of agressief",
      "Stemmingswisselingen",
      "Verlies van libido / zin in seks",
      "Verlies van zelfvertrouwen"
    ]
  },
  {
    key: "lichamelijk",
    titel: "Lichamelijke klachten",
    klachten: [
      "Blaasproblemen",
      "Urineweginfectie",
      "Brandend maagzuur",
      "Droge huid",
      "Jeuk",
      "Acne",
      "Droge ogen",
      "Eetbuien",
      "Opgeblazen gevoel",
      "Darmklachten",
      "Gewichtstoename (buik)",
      "Haarverlies / dunner wordend haar",
      "Hoofdpijn",
      "Migraine",
      "Pijnlijke borsten",
      "Pijn tijdens seks",
      "Rusteloze benen",
      "Frozen shoulder",
      "Rotator cuff-blessure",
      "Slaapproblemen",
      "Moeheid",
      "Uitputting",
      "Stemproblemen",
      "Hielspoor",
      "Stijfheid",
      "Spierpijn",
      "Pijnlijke gewrichten",
      "Toegenomen schimmelinfecties",
      "Toegenomen bacteriële infecties",
      "Vaginale droogte",
      "Branderigheid (vaginaal)",
      "Verminderd gevoel clitoris",
      "Opvliegers",
      "Nachtelijk zweten",
      "Tintelingen in huid/lichaam",
      "Doof gevoel in huid/lichaam",
      "Verminderd gevoel in handen en/of voeten"
    ]
  },
  {
    key: "andere",
    titel: "Andere symptomen",
    klachten: [
      "Duizeligheid",
      "Zwakte",
      "Kortademigheid",
      "Flauwvallen",
      "Hartkloppingen",
      "Tinnitus",
      "Nieuwe / verergering van allergie(ën)",
      "Nieuwe / verergering van auto-immuunziekte",
      "Verhoogde bloeddruk",
      "Verhoogd cholesterol"
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
