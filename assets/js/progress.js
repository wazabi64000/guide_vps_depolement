/* ==========================================================================
   progress.js — progression locale (localStorage)
   VPS Academy 2026

   La progression est une COMMODITÉ D'INTERFACE. Elle n'est ni une
   certification ni une preuve de réussite : elle vit dans le navigateur de
   l'apprenant et peut être effacée à tout moment.

   Un module n'est marqué « terminé » que par la page de cours elle-même
   (par exemple après validation d'exercices). Cliquer sur un lien ne suffit
   pas à déclarer un module terminé.
   ========================================================================== */

const STORAGE_KEY = "vpsacademy:progress:v1";

/** Détecte si localStorage est réellement utilisable (mode privé, quota, etc.). */
function detectStorage() {
  try {
    const probe = "__vps_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

let storageOk = detectStorage();
let memoryFallback = {};

export function isStorageAvailable() {
  return storageOk;
}

function readState() {
  if (!storageOk) return { ...memoryFallback };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function emit(state) {
  document.dispatchEvent(new CustomEvent("progress:change", { detail: state }));
}

function writeState(state) {
  if (storageOk) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota atteint ou stockage devenu indisponible : bascule en mémoire.
      storageOk = false;
      memoryFallback = { ...state };
    }
  } else {
    memoryFallback = { ...state };
  }
  emit(state);
}

export function getState() {
  return readState();
}

export function isCompleted(id) {
  return Boolean(readState()[id]);
}

export function markCompleted(id) {
  const state = readState();
  state[id] = true;
  writeState(state);
  return state;
}

export function markNotCompleted(id) {
  const state = readState();
  delete state[id];
  writeState(state);
  return state;
}

/** Bascule l'état d'un module ; renvoie le nouvel état (booléen). */
export function toggleCompleted(id) {
  const done = isCompleted(id);
  if (done) markNotCompleted(id);
  else markCompleted(id);
  return !done;
}

export function resetProgress() {
  writeState({});
  return {};
}

/** Nombre de modules terminés parmi la liste fournie. */
export function countCompleted(modules) {
  const state = readState();
  return modules.reduce((acc, m) => acc + (state[m.id] ? 1 : 0), 0);
}

/** Abonne une fonction aux changements de progression. Renvoie un désabonnement. */
export function onProgressChange(handler) {
  const listener = (event) => handler(event.detail);
  document.addEventListener("progress:change", listener);
  return () => document.removeEventListener("progress:change", listener);
}

/**
 * Met à jour une barre de progression.
 * @param {HTMLElement|null} bar  élément à largeur variable
 * @param {HTMLElement|null} label élément texte
 * @param {number} done
 * @param {number} total
 */
export function renderProgressBar(bar, label, done, total) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  if (bar) {
    bar.style.width = `${pct}%`;
    bar.setAttribute("aria-valuenow", String(pct));
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
  }
  if (label) {
    label.textContent = `${done} / ${total} modules terminés`;
  }
}
