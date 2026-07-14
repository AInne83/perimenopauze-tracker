// Lichte IndexedDB-wrapper voor de perimenopauze-tracker.
// Eén record per dag in object store "dagen", keyPath "datum" (YYYY-MM-DD).

const DB_NAAM = "perimenopauze-tracker";
const DB_VERSIE = 1;
const STORE_NAAM = "dagen";

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAAM, DB_VERSIE);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAAM)) {
        db.createObjectStore(STORE_NAAM, { keyPath: "datum" });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
  return _dbPromise;
}

function legeDag(datum) {
  return {
    datum,
    menstruatie: null,
    klachten: {},
    activiteiten: {},
    opmerking: ""
  };
}

// Vult ontbrekende velden aan op oudere dagrecords (bijv. van vóór het opmerkingenveld).
function migreerDag(dag) {
  if (dag.opmerking === undefined) dag.opmerking = "";
  if (!dag.klachten) dag.klachten = {};
  return dag;
}

async function getDag(datum) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAAM, "readonly");
    const store = tx.objectStore(STORE_NAAM);
    const req = store.get(datum);
    req.onsuccess = () => resolve(migreerDag(req.result || legeDag(datum)));
    req.onerror = () => reject(req.error);
  });
}

async function saveDag(dag) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAAM, "readwrite");
    const store = tx.objectStore(STORE_NAAM);
    store.put(dag);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAlleDagen() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAAM, "readonly");
    const store = tx.objectStore(STORE_NAAM);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result || []).map(migreerDag));
    req.onerror = () => reject(req.error);
  });
}

async function vervangAlleDagen(dagen) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAAM, "readwrite");
    const store = tx.objectStore(STORE_NAAM);
    dagen.forEach(dag => store.put(dag));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function wisAlleDagen() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAAM, "readwrite");
    tx.objectStore(STORE_NAAM).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
