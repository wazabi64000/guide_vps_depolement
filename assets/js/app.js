/* ==========================================================================
   app.js — point d'entrée de l'interface (VPS Academy 2026)
   --------------------------------------------------------------------------
   Étapes :
     1. lire les métadonnées des modules (assets/data/modules.json) ;
     2. valider la structure (tableau, identifiants uniques) ;
     3. vérifier l'existence des pages ANNONCÉES (statut ≠ « planned ») ;
     4. rendre les cartes, les statistiques et la progression ;
     5. brancher la recherche, la copie et la réinitialisation de la progression.
   Aucune fonctionnalité n'est déclarée « opérationnelle » sans rendu réel.
   ========================================================================== */

import { renderModules, verifyPages, STATUS } from "./navigation.js";
import { initSearch, filterModules } from "./search.js";
import {
  countCompleted,
  renderProgressBar,
  resetProgress,
  onProgressChange,
  isStorageAvailable,
} from "./progress.js";

const BASE = document.documentElement.dataset.base || ".";
const DATA_URL = `${BASE}/assets/data/modules.json`;

/* --------------------------------------------------------------------------
   Chargement + validation
   -------------------------------------------------------------------------- */
async function loadModules() {
  const response = await fetch(DATA_URL, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Réponse HTTP ${response.status} pour ${DATA_URL}`);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.modules)) {
    throw new Error("Le fichier modules.json ne contient pas de tableau « modules ».");
  }
  const modules = data.modules;

  const ids = new Set();
  for (const m of modules) {
    if (!m.id || !m.title) {
      throw new Error("Un module est dépourvu d'identifiant ou de titre.");
    }
    if (ids.has(m.id)) {
      throw new Error(`Identifiant de module en double : ${m.id}`);
    }
    ids.add(m.id);
  }
  return modules;
}

/* --------------------------------------------------------------------------
   Rendu
   -------------------------------------------------------------------------- */
function renderStats(modules, container, missing) {
  if (!container) return;

  const available = modules.filter((m) => m.status && m.status !== "planned" && !missing.has(m.id)).length;
  const validated = modules.filter((m) => m.status === "validated").length;
  const drafted = modules.filter((m) => m.status === "drafted").length;
  const done = countCompleted(modules);

  const items = [
    { value: String(modules.length), label: "modules au programme" },
    { value: `${available} / ${modules.length}`, label: "pages disponibles" },
    { value: `${drafted} / ${modules.length}`, label: "modules rédigés" },
    { value: `${validated} / ${modules.length}`, label: "modules validés" },
    { value: `${done} / ${modules.length}`, label: "terminés (local)" },
  ];

  container.replaceChildren(
    ...items.map(({ value, label }) => {
      const stat = document.createElement("div");
      stat.className = "stat";
      const v = document.createElement("div");
      v.className = "stat__value";
      v.textContent = value;
      const l = document.createElement("div");
      l.className = "stat__label";
      l.textContent = label;
      stat.append(v, l);
      return stat;
    })
  );
}

function showStateMessage(container, message) {
  if (!container) return;
  const p = document.createElement("p");
  p.className = "state-message";
  p.textContent = message;
  container.replaceChildren(p);
}

function showError(message) {
  const grid = document.getElementById("module-grid");
  const detail =
    location.protocol === "file:"
      ? " Le site doit être servi en HTTP (par exemple « python3 -m http.server »), pas ouvert via file://."
      : "";
  showStateMessage(grid, `${message}${detail}`);
  const stats = document.getElementById("stats");
  if (stats) stats.replaceChildren();
}

/* --------------------------------------------------------------------------
   Boutons « copier » (blocs de commandes)
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.getAttribute("data-copy"));
      if (!target) return;
      const previous = button.textContent;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        button.textContent = "Copié";
      } catch {
        button.textContent = "Copie indisponible";
      }
      setTimeout(() => { button.textContent = previous; }, 1600);
    });
  });
}

/* --------------------------------------------------------------------------
   Initialisation
   -------------------------------------------------------------------------- */
async function init() {
  const grid = document.getElementById("module-grid");
  const statsEl = document.getElementById("stats");
  const searchInput = document.getElementById("module-search");
  const searchStatus = document.getElementById("search-status");
  const barEl = document.getElementById("progress-bar-fill");
  const labelEl = document.getElementById("progress-label");
  const resetBtn = document.getElementById("progress-reset");

  let modules = [];
  let missing = new Set();

  const refresh = (query = "") => {
    const results = filterModules(modules, query);
    renderModules(results, grid, { missing });
    renderStats(modules, statsEl, missing);
    renderProgressBar(barEl, labelEl, countCompleted(modules), modules.length);
  };

  try {
    modules = await loadModules();
  } catch (error) {
    showError(`Impossible de charger le plan des modules : ${error.message}`);
    return;
  }

  // Vérifie l'existence des pages annoncées (aucune requête si tout est « planned »).
  try {
    missing = await verifyPages(modules);
  } catch {
    missing = new Set();
  }

  refresh();
  initSearch(searchInput, searchStatus, (query) => refresh(query));
  initCopyButtons();

  onProgressChange(() => refresh(searchInput ? searchInput.value : ""));

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetProgress();
      refresh(searchInput ? searchInput.value : "");
    });
  }

  if (!isStorageAvailable() && labelEl) {
    labelEl.textContent += " (non persistée : stockage local indisponible)";
  }

  // Expose les états à des fins de test (sans effet sur l'affichage).
  window.__VPS__ = { modules, missing, statuses: Object.keys(STATUS) };
}

document.addEventListener("DOMContentLoaded", init);
