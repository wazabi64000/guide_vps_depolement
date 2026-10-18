/* Tests unitaires — VPS Academy 2026
   Usage : node tests/unit.test.mjs
   Shim DOM minimal, aucun navigateur requis. Aucune action distante. */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS = path.join(ROOT, "assets/js");

/* --- Shim DOM minimal ------------------------------------------------------ */
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
  },
};
globalThis.document = {
  documentElement: { dataset: { base: "." } },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
};
globalThis.CustomEvent = class {
  constructor(type, opts = {}) { this.type = type; this.detail = opts.detail; }
};

const results = [];
const ok = (name, cond, extra = "") => results.push({ name, pass: Boolean(cond), extra });

/* --- 1. Graphe d'imports ESM ---------------------------------------------- */
const appUrl = pathToFileURL(path.join(JS, "app.js")).href;
try { await import(appUrl); ok("import de app.js (tire navigation/search/progress)", true); }
catch (e) { ok("import de app.js", false, String(e)); }

const nav = await import(pathToFileURL(path.join(JS, "navigation.js")).href);
const search = await import(pathToFileURL(path.join(JS, "search.js")).href);
const progress = await import(pathToFileURL(path.join(JS, "progress.js")).href);

/* --- 2. Métadonnées -------------------------------------------------------- */
const data = JSON.parse(readFileSync(path.join(ROOT, "assets/data/modules.json"), "utf8"));
const modules = data.modules;
ok("12 modules", modules.length === 12, `len=${modules.length}`);
ok("identifiants uniques", new Set(modules.map((m) => m.id)).size === 12);
ok("chemins sous cours/", modules.every((m) => m.file.startsWith("cours/")));
ok(
  "chaque statut appartient aux 4 états prévus",
  modules.every((m) => ["planned", "published", "drafted", "validated"].includes(m.status))
);

/* --- 3. Recherche ---------------------------------------------------------- */
ok("normalize supprime les accents", search.normalize("Sécurité Été") === "securite ete");
ok("recherche 'ssh' trouve le module 03", search.filterModules(modules, "ssh").some((m) => m.id === "03"));
ok("recherche 'mariadb' trouve le module 05", search.filterModules(modules, "mariadb").some((m) => m.id === "05"));
ok("accents : 'securite' → 03", search.filterModules(modules, "securite").some((m) => m.id === "03"));
ok("accents : 'reseau' → 04", search.filterModules(modules, "reseau").some((m) => m.id === "04"));
ok("accents : 'deploiement' → 06", search.filterModules(modules, "deploiement").some((m) => m.id === "06"));
ok("requête vide → 12 modules", search.filterModules(modules, "").length === 12);
ok("requête absurde → 0", search.filterModules(modules, "zzzzzz").length === 0);
ok("multi-termes 'api python' → 06", search.filterModules(modules, "api python").some((m) => m.id === "06"));

/* --- 4. États et navigation ------------------------------------------------ */
// Fixture explicite : l'état « planned » se teste sur une donnée construite,
// et non sur le premier module du catalogue dont l'état peut légitimement évoluer.
const st = nav.moduleState({ id: "zz", status: "planned" });
ok("'planned' → badge « Planifié », non disponible", st.available === false && st.badge.label === "Planifié");
ok("4 états définis", ["planned", "published", "drafted", "validated"].every((k) => nav.STATUS[k]?.label));
ok("'published' → « Page disponible » et lien autorisé", nav.moduleState({ id: "x", status: "published" }).available === true);
ok("'drafted' → « Rédigé »", nav.moduleState({ id: "x", status: "drafted" }).badge.label === "Rédigé");
ok("'validated' → « Validé »", nav.moduleState({ id: "x", status: "validated" }).badge.label === "Validé");
const miss = nav.moduleState({ id: "01", status: "published" }, { missing: new Set(["01"]) });
ok("page annoncée mais absente → non disponible et signalée", miss.available === false && miss.missing === true);
const onlyPlanned = modules.filter((m) => m.status === "planned");
ok(
  "verifyPages n'interroge pas les modules planifiés → ensemble vide",
  (await nav.verifyPages(onlyPlanned)).size === 0
);

const nb = nav.neighbours(modules, "06");
ok("voisins de 06 = 05 et 07", nb.previous?.id === "05" && nb.next?.id === "07");
ok("01 sans précédent", nav.neighbours(modules, "01").previous === null);
ok("12 sans suivant", nav.neighbours(modules, "12").next === null);

/* --- 5. Progression locale ------------------------------------------------- */
progress.resetProgress();
ok("état initial : 0 terminé", progress.countCompleted(modules) === 0);
progress.markCompleted("03");
ok("après marquage : 1 terminé", progress.countCompleted(modules) === 1);
ok("isCompleted('03')", progress.isCompleted("03") === true);
ok("persistance localStorage simulée", JSON.parse(store.get("vpsacademy:progress:v1"))["03"] === true);
ok("toggle retire l'état", progress.toggleCompleted("03") === false && progress.isCompleted("03") === false);
progress.markCompleted("01");
progress.resetProgress();
ok("reset remet à zéro", progress.countCompleted(modules) === 0);

/* --- 6. Cohérence référentiel --------------------------------------------- */
const archi = readFileSync(path.join(ROOT, "docs/ARCHITECTURE.md"), "utf8");
const ids = ["app_react", "app_php", "app_python", "user_react", "user_php", "user_python",
  "migrate_react", "migrate_php", "migrate_python", "deploy-react", "deploy-php", "deploy-python",
  "svc-react", "svc-php", "svc-python"];
ok("ARCHITECTURE.md contient les 15 identités SQL/Linux", ids.every((i) => archi.includes(i)));
ok("rétention 5 versions documentée", /5 (dernières )?versions/.test(archi));
ok("IPv6 documenté", /IPv6/.test(archi));
ok("supervision natif documentée", /journald/.test(archi) && /logrotate/.test(archi));

/* --- Rapport --------------------------------------------------------------- */
let pass = 0, fail = 0;
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.extra ? "  [" + r.extra + "]" : ""}`);
  r.pass ? pass++ : fail++;
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
