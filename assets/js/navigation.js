/* ==========================================================================
   navigation.js — affichage des modules et navigation
   VPS Academy 2026

   Responsabilités :
   - construire les cartes de module à partir des métadonnées ;
   - distinguer QUATRE états explicites :
       planned    → planifié (aucune page) ;
       published  → la page existe ;
       drafted    → le module est rédigé ;
       validated  → le module est validé ;
   - ne créer un lien que si une page existe réellement (état non « planned »
     ET fichier confirmé présent) ; sinon afficher un état « à préparer » ;
   - fournir les voisins (précédent / suivant) pour les pages de cours.

   IMPORTANT : un module n'est JAMAIS « terminé » du seul fait qu'il figure
   dans modules.json. La complétion vient uniquement de la progression locale
   (progress.js), alimentée par la page de cours elle-même.
   ========================================================================== */

import { isCompleted } from "./progress.js";

/** Les quatre états prévus par le référentiel (docs/ARCHITECTURE.md). */
export const STATUS = {
  planned:   { key: "planned",   label: "Planifié",        className: "badge badge--planned" },
  published: { key: "published", label: "Page disponible", className: "badge badge--published" },
  drafted:   { key: "drafted",   label: "Rédigé",          className: "badge badge--drafted" },
  validated: { key: "validated", label: "Validé",          className: "badge badge--validated" },
};

export function statusOf(module) {
  return STATUS[module.status] || STATUS.planned;
}

/**
 * État lisible d'un module, sans effet de bord.
 * @param {object} module
 * @param {{missing?: Set<string>}} [opts] identifiants dont la page est absente
 */
export function moduleState(module, opts = {}) {
  const declared = statusOf(module);
  const missing = opts.missing instanceof Set && opts.missing.has(module.id);

  // Une page déclarée mais absente est ramenée à l'état « planifié ».
  const base = missing ? STATUS.planned : declared;
  const available = base.key !== "planned" && !missing; // une page est utilisable
  const completed = isCompleted(module.id);

  let badge = base;
  if (completed && available) badge = STATUS.validated;

  return {
    statusKey: missing ? "planned" : base.key,
    declaredKey: declared.key,
    missing,
    available,
    completed,
    badge,
  };
}

function badgeElement(badge) {
  const span = document.createElement("span");
  span.className = badge.className;
  span.textContent = badge.label;
  return span;
}

function textElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

/** Construit la carte d'un module. Aucun lien si aucune page n'existe. */
export function buildModuleCard(module, opts = {}) {
  const state = moduleState(module, opts);

  const article = document.createElement("article");
  article.className = "module-card" + (state.available ? "" : " module-card--planned");
  article.dataset.moduleId = module.id;
  if (state.statusKey) article.dataset.status = state.statusKey;

  // En-tête : numéro + badge d'état
  const top = document.createElement("div");
  top.className = "module-card__top";
  top.appendChild(textElement("span", "module-card__num", `Module ${module.id}`));
  top.appendChild(badgeElement(state.badge));
  article.appendChild(top);

  // Titre : lien uniquement si la page existe réellement
  const title = document.createElement("h3");
  title.className = "module-card__title";
  if (state.available && module.file) {
    const link = document.createElement("a");
    link.href = module.file;
    link.textContent = module.title;
    title.appendChild(link);
  } else {
    title.appendChild(document.createTextNode(module.title));
  }
  article.appendChild(title);

  article.appendChild(textElement("p", "module-card__desc", module.description));

  // Métadonnées
  const meta = document.createElement("div");
  meta.className = "module-card__meta";
  if (!state.available) {
    meta.appendChild(textElement("span", "tag", "contenu à venir"));
  }
  if (state.missing) {
    meta.appendChild(textElement("span", "tag", "page annoncée mais introuvable"));
  }
  if (state.completed) {
    meta.appendChild(textElement("span", "tag", "terminé (local)"));
  }
  // Le conteneur de métadonnées n'est ajouté que s'il porte au moins une information :
  // sinon sa marge supérieure réserverait 8 px de blanc en bas de chaque carte.
  if (meta.childElementCount > 0) article.appendChild(meta);

  return article;
}

/** Remplace le contenu d'un conteneur par les cartes des modules fournis. */
export function renderModules(modules, container, opts = {}) {
  if (!container) return;
  container.replaceChildren();
  if (!modules.length) {
    container.appendChild(
      textElement("p", "state-message", "Aucun module ne correspond à la recherche.")
    );
    return;
  }
  modules.forEach((module) => container.appendChild(buildModuleCard(module, opts)));
}

/**
 * Vérifie l'existence réelle des pages ANNONCÉES (statut ≠ « planned »).
 * Aucune requête n'est faite pour les modules simplement planifiés.
 * @returns {Promise<Set<string>>} identifiants dont la page est absente
 */
export async function verifyPages(modules) {
  const missing = new Set();
  const declared = modules.filter((m) => m.status && m.status !== "planned" && m.file);
  if (!declared.length) return missing;

  await Promise.all(
    declared.map(async (m) => {
      try {
        const res = await fetch(m.file, { method: "HEAD", cache: "no-cache" });
        if (!res.ok) missing.add(m.id);
      } catch {
        missing.add(m.id);
      }
    })
  );
  return missing;
}

/**
 * Renvoie les modules voisins d'un identifiant.
 * @returns {{previous: object|null, next: object|null}}
 */
export function neighbours(modules, currentId) {
  const index = modules.findIndex((m) => m.id === currentId);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? modules[index - 1] : null,
    next: index < modules.length - 1 ? modules[index + 1] : null,
  };
}

/** Applique aria-current="page" au lien d'en-tête correspondant. */
export function markCurrentPage(pageId) {
  document.querySelectorAll(".header-nav a[data-page]").forEach((link) => {
    if (link.dataset.page === pageId) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
