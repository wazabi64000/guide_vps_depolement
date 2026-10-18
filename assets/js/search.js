/* ==========================================================================
   search.js — recherche dans les métadonnées des modules
   VPS Academy 2026

   Recherche locale, insensible à la casse et aux accents. Elle porte
   uniquement sur les métadonnées (titre, description, objectifs, prérequis,
   livrables, identifiant, slug) : aucun index externe n'est requis.
   ========================================================================== */

/** Normalise une chaîne : minuscules + suppression des accents. */
export function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Construit le texte interrogeable d'un module. */
export function moduleHaystack(module) {
  return normalize([
    module.id,
    module.title,
    module.slug,
    module.description,
    ...(module.objectives || []),
    ...(module.prerequisites || []),
    ...(module.deliverables || []),
  ].join(" \u0000 "));
}

/** Filtre les modules selon la requête. Requête vide → tous les modules. */
export function filterModules(modules, query) {
  const q = normalize(query).trim();
  if (!q) return modules.slice();
  const terms = q.split(/\s+/).filter(Boolean);
  return modules.filter((module) => {
    const hay = moduleHaystack(module);
    return terms.every((term) => hay.includes(term));
  });
}

/**
 * Branche la recherche sur un champ.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} statusEl
 * @param {(results: object[], query: string) => void} onResults
 * @returns {() => void} désabonnement
 */
export function initSearch(input, statusEl, onResults) {
  if (!input) return () => {};
  const handler = () => {
    const query = input.value;
    if (statusEl) {
      statusEl.textContent = query.trim()
        ? `Recherche : « ${query.trim()} »`
        : "";
    }
    onResults?.(query);
  };
  input.addEventListener("input", handler);
  input.addEventListener("search", handler); // bouton « effacer » natif
  return () => {
    input.removeEventListener("input", handler);
    input.removeEventListener("search", handler);
  };
}
