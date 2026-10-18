/* ==========================================================================
   module-page.js — initialisation commune des pages de cours
   VPS Academy 2026

   Réutilise STRICTEMENT les modules existants `navigation.js` et
   `progress.js` : même clé localStorage, même source de vérité
   (`assets/data/modules.json`). Aucun système de navigation ni de
   progression parallèle n'est introduit.

   Sans JavaScript, le contenu des pages reste entièrement lisible : ce script
   n'ajoute que des commodités (copie du presse-papiers, progression locale,
   navigation entre modules).

   Les pages de cours vivent dans `cours/` : les chemins du reste du site sont
   donc préfixés par `../` avant tout accès.
   ========================================================================== */

import { neighbours, moduleState, verifyPages } from "./navigation.js";
import {
  isCompleted, toggleCompleted, onProgressChange,
  countCompleted, renderProgressBar, isStorageAvailable,
} from "./progress.js";

const DATA_URL = "../assets/data/modules.json";

/** Initialise une page de cours. `MODULE_ID` doit être l'identifiant du catalogue. */
export function initModulePage(MODULE_ID) {
  /* --- 1. Sommaire replié sur petit écran (le contenu reste accessible) --- */
  const toc = document.getElementById("toc");
  if (toc && window.matchMedia("(max-width: 959px)").matches) {
    toc.open = false;
  }

  /* --- 2. Boutons « Copier » --------------------------------------------- */
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

  /* --- 3. Progression locale -------------------------------------------- */
  const doneBtn = document.getElementById("mark-done");
  const hint = document.getElementById("mark-done-hint");
  const barEl = document.getElementById("progress-bar-fill");
  const labelEl = document.getElementById("progress-label");

  // null tant que le plan des modules n'est pas chargé : dans ce cas on ne
  // touche pas au libellé, qui reste « chargement » ou le message d'échec.
  let modulesRef = null;

  function refreshProgressBar() {
    if (modulesRef === null) return;
    renderProgressBar(barEl, labelEl, countCompleted(modulesRef), modulesRef.length);
  }

  function renderButtonState() {
    if (!doneBtn) return;
    const done = isCompleted(MODULE_ID);
    doneBtn.textContent = done
      ? "Marquer ce module comme non terminé"
      : "Marquer ce module comme terminé";
    doneBtn.setAttribute("aria-pressed", String(done));
    doneBtn.disabled = false;
  }

  if (doneBtn && hint) {
    if (!isStorageAvailable()) {
      hint.textContent =
        "Stockage local indisponible : la progression ne sera pas conservée après fermeture du navigateur.";
    }
    renderButtonState();
    doneBtn.addEventListener("click", () => {
      toggleCompleted(MODULE_ID);
      renderButtonState();
    });
    // Le bouton ET la barre doivent suivre l'état : on s'abonne au même
    // événement que celui utilisé par le tableau de bord.
    onProgressChange(() => {
      renderButtonState();
      refreshProgressBar();
    });
  }

  /* --- 4. Navigation entre modules (source : modules.json) -------------- */
  async function initNavigation() {
    let modules = [];
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.modules)) throw new Error("structure inattendue");
      modules = data.modules;
    } catch {
      // Pas de lien dynamique : le contenu et les liens statiques restent utilisables.
      if (labelEl) labelEl.textContent = "Progression indisponible (plan des modules inaccessible)";
      return;
    }

    // Un module n'est « disponible » que si sa page existe réellement.
    // navigation.js est écrit pour la racine du site : les chemins `file`
    // des modules y sont relatifs à la racine. Depuis `cours/`, on les
    // préfixe par `../` pour que la vérification interroge la bonne URL.
    const missing = await verifyPages(
      modules.map((m) => (m.file ? { ...m, file: `../${m.file}` } : m))
    );
    const { previous, next } = neighbours(modules, MODULE_ID);

    modulesRef = modules;
    refreshProgressBar();

    const nextEl = document.getElementById("module-next");
    if (nextEl && next) {
      const state = moduleState(next, { missing });
      if (state.available) {
        nextEl.replaceChildren();
        const link = document.createElement("a");
        link.className = "btn";
        link.href = `../${next.file}`;
        link.textContent = `Module ${next.id} — ${next.title}`;
        nextEl.appendChild(link);
      } else {
        nextEl.textContent = `Module ${next.id} — ${next.title} : à venir`;
      }
    }

    if (previous) {
      const state = moduleState(previous, { missing });
      if (state.available) {
        const nav = document.querySelector('nav[aria-label="Navigation entre les modules"]');
        if (nav) {
          const link = document.createElement("a");
          link.className = "btn secondary";
          link.href = `../${previous.file}`;
          link.textContent = `← Module ${previous.id} — ${previous.title}`;
          nav.insertBefore(link, nav.firstChild);
        }
      }
    }
  }

  initNavigation();
}
