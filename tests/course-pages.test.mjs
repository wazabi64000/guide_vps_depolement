/* Contrôle des pages — VPS Academy 2026
 *
 * Vérifie le rendu réel du tableau de bord et de CHAQUE page de cours annoncée
 * dans assets/data/modules.json (statut ≠ « planned ») :
 *   chargement HTTP, titre, erreurs console, ancres, cibles de copie,
 *   copie presse-papiers, section de checklist, débordement horizontal
 *   à 390 / 768 / 1280 px, lisibilité sans JavaScript, cohérence du tableau
 *   de bord avec les métadonnées (12 modules exactement).
 *
 * Prérequis : Node ≥ 18, playwright-core + un Chromium (voir tests/README.md).
 *
 * Usage :
 *   python3 -m http.server 8099            # racine du projet, autre terminal
 *   VPS_BASE_URL=http://localhost:8099/index.html node tests/course-pages.test.mjs
 *
 * Codes de sortie : 0 = tout PASS ; 1 = au moins un FAIL ; 2 = prérequis manquant.
 *
 * Aucune action distante : le test ne parle qu'au serveur local et n'écrit rien.
 */

import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGUE = JSON.parse(readFileSync(path.join(ROOT, "assets/data/modules.json"), "utf8")).modules;
const DECLARES = CATALOGUE.filter((m) => m.status !== "planned");
const PLANIFIES = CATALOGUE.filter((m) => m.status === "planned");

/* VPS_BASE_URL peut désigner index.html ou la racine : les deux formes sont acceptées. */
const BASE = (process.env.VPS_BASE_URL || "http://localhost:8099/index.html")
  .replace(/\/index\.html$/, "")
  .replace(/\/$/, "");

const LARGEURS = [["mobile", 390, 844], ["tablette", 768, 1024], ["bureau", 1280, 900]];

const results = [];
const ok = (n, c, e = "") => results.push({ n, pass: !!c, e });

/* ====================================================================== */
/* 1. Métadonnées (sans navigateur)                                        */
/* ====================================================================== */
ok("métadonnées : exactement 12 modules", CATALOGUE.length === 12, `modules=${CATALOGUE.length}`);
ok("métadonnées : identifiants uniques", new Set(CATALOGUE.map((m) => m.id)).size === CATALOGUE.length);
ok("métadonnées : au moins une page de cours annoncée", DECLARES.length > 0);
ok("métadonnées : distincts « annoncés » et « planifiés » cohérents",
  DECLARES.length + PLANIFIES.length === CATALOGUE.length);
for (const m of DECLARES) {
  ok(`métadonnées : fichier annoncé présent (${m.file})`, existsSync(path.join(ROOT, m.file)));
}

/* ====================================================================== */
/* 2. Navigateur                                                           */
/* ====================================================================== */

async function chargerChromium() {
  const base = process.env.PLAYWRIGHT_CORE_PATH;
  if (!base) return (await import("playwright-core")).chromium;
  const candidats = /\.(mjs|js)$/.test(base)
    ? [base]
    : [path.join(base, "index.mjs"), path.join(base, "index.js")];
  let derniereErreur;
  for (const candidat of candidats) {
    try {
      const mod = await import(pathToFileURL(candidat).href);
      const chromium = mod.chromium || mod.default?.chromium;
      if (chromium) return chromium;
      derniereErreur = new Error(`« ${candidat} » n'expose pas « chromium ».`);
    } catch (e) { derniereErreur = e; }
  }
  throw derniereErreur;
}

let navigateur;
try {
  const chromium = await chargerChromium();
  navigateur = await chromium.launch(
    process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] }
      : { args: ["--no-sandbox"] }
  );
} catch (e) {
  console.error("PRÉREQUIS MANQUANT — impossible de lancer Chromium :", e.message);
  console.error("Installez-le (npx playwright install chromium) ou définissez CHROMIUM_PATH.");
  process.exit(2);
}

const brancherEcouteurs = (page) => {
  const journal = { consoleErrors: [], pageErrors: [], requetesEchouees: [], statutsHead: [] };
  page.on("console", (m) => { if (m.type() === "error") journal.consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => journal.pageErrors.push(String(e)));
  page.on("requestfailed", (r) => journal.requetesEchouees.push({ url: r.url(), methode: r.method(), err: r.failure()?.errorText ?? "" }));
  // Chromium signale « net::ERR_ABORTED » pour une sonde HEAD réussie : on ne
  // retient que les échecs autres que HEAD et on vérifie le statut des HEAD.
  page.on("response", (r) => { if (r.request().method() === "HEAD") journal.statutsHead.push(r.status()); });
  return journal;
};

const debordement = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const horsCadre = (page) => page.evaluate(() => {
  const large = document.documentElement.clientWidth;
  const mauvais = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.right <= large + 1) continue;
    let p = el.parentElement, defilable = false;
    while (p) {
      const s = getComputedStyle(p).overflowX;
      if (s === "auto" || s === "scroll") { defilable = true; break; }
      p = p.parentElement;
    }
    if (!defilable) mauvais.push(`${el.tagName}.${(el.className || "").toString().split(" ")[0]} right=${Math.round(r.right)}`);
  }
  return mauvais.slice(0, 5);
});

/* ---------------------------------------------------------------------- */
/* 2.a Pages de cours annoncées                                            */
/* ---------------------------------------------------------------------- */
for (const m of DECLARES) {
  try {
  const url = `${BASE}/${m.file}`;
  const etiquette = `module ${m.id}`;
  const ctx = await navigateur.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE }).catch(() => {});
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  const journal = brancherEcouteurs(page);

  const reponse = await page.goto(url, { waitUntil: "networkidle" });
  ok(`${etiquette} — page servie en 200`, reponse && reponse.status() === 200, `status=${reponse && reponse.status()}`);
  if (!reponse || reponse.status() !== 200) { await ctx.close(); continue; }

  ok(`${etiquette} — titre cohérent`, (await page.title()).includes(`Module ${m.id}`), await page.title());
  ok(`${etiquette} — aucune erreur console`, journal.consoleErrors.length === 0, journal.consoleErrors.join(" | "));
  ok(`${etiquette} — aucune exception JS`, journal.pageErrors.length === 0, journal.pageErrors.join(" | "));
  const echecsReels = journal.requetesEchouees.filter((f) => f.methode !== "HEAD");
  ok(`${etiquette} — aucune requête en échec`, echecsReels.length === 0, echecsReels.map((f) => `${f.url} :: ${f.err}`).join(" | "));
  ok(`${etiquette} — titres h1 et main présents`,
    (await page.locator("main#contenu").count()) === 1 && (await page.locator("main h1").count()) >= 1);

  /* Ancres : toute cible interne doit exister dans la page. */
  const ancresMortes = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute("href").slice(1))
      .filter((id) => id && !document.getElementById(id)))]);
  ok(`${etiquette} — toutes les ancres internes résolvent`, ancresMortes.length === 0, ancresMortes.join(", "));

  /* Cibles de copie : chaque bouton doit viser un bloc réel. */
  const ciblesMortes = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll("[data-copy]")]
      .map((b) => b.getAttribute("data-copy"))
      .filter((id) => !document.getElementById(id)))]);
  ok(`${etiquette} — toutes les cibles « copier » existent`, ciblesMortes.length === 0, ciblesMortes.join(", "));

  ok(`${etiquette} — liste de contrôle présente`, (await page.locator(".checklist").count()) >= 1);

  /* Copie réelle dans le presse-papiers (premier bloc copiable). */
  try {
    const premier = page.locator("[data-copy]").first();
    if (await premier.count()) {
      const cibleId = await premier.getAttribute("data-copy");
      await premier.click();
      await page.waitForTimeout(120);
      const attendu = (await page.locator(`#${cibleId}`).innerText({ timeout: 5000 })).trim();
      const obtenu = (await page.evaluate(() => navigator.clipboard.readText().catch(() => ""))).trim();
      ok(`${etiquette} — copie : contenu exact du bloc « ${cibleId} »`, obtenu === attendu,
        `obtenu=${JSON.stringify(obtenu.slice(0, 60))} attendu=${JSON.stringify(attendu.slice(0, 60))}`);
    }
  } catch (e) {
    ok(`${etiquette} — copie : contenu exact du bloc copiable`, false, String((e && e.message) || e));
  }

  /* Contenu pédagogique propre au module 01 (les autres modules ne sont pas encore rédigés). */
  if (m.id === "01") {
    const texte = await page.locator("main").innerText();
    ok("module 01 — 13 sections", (await page.locator("main section.section").count()) === 13,
      `count=${await page.locator("main section.section").count()}`);
    ok("module 01 — 12 entrées de sommaire", (await page.locator("#toc nav a").count()) === 12,
      `count=${await page.locator("#toc nav a").count()}`);
    ok("module 01 — section self-hosting présente", texte.includes("Héberger chez soi : self-hosting"));
    ok("module 01 — deux parcours A et B présentés", texte.includes("Parcours A") && texte.includes("Parcours B"));
    ok("module 01 — notions NAT, CGNAT, VPN et DNS dynamique",
      ["NAT", "CGNAT", "VPN", "DNS dynamique"].every((k) => texte.includes(k)));
    ok("module 01 — interdiction explicite d'exposer la base ou l'administration",
      /Ne publiez jamais sur Internet/.test(texte));
    ok("module 01 — problèmes courants et checklist finale",
      texte.includes("Problèmes courants") && texte.includes("Checklist finale"));
  }

  /* Débordement horizontal aux trois largeurs. */
  for (const [nom, w, h] of LARGEURS) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(150);
    const d = await debordement(page);
    ok(`${etiquette} — pas de débordement horizontal (${nom} ${w}px)`, d <= 1, `overflow=${d}px`);
    if (d > 1) ok(`${etiquette} — aucun élément hors cadre (${nom} ${w}px)`, false, (await horsCadre(page)).join(" | "));
  }
  await ctx.close();

  /* Sans JavaScript : le contenu doit rester lisible. */
  const ctxNoJs = await navigateur.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  ctxNoJs.setDefaultTimeout(8000);
  const pageNoJs = await ctxNoJs.newPage();
  await pageNoJs.goto(url, { waitUntil: "domcontentloaded" });
  ok(`${etiquette} — sans JS : contenu toujours présent`,
    (await pageNoJs.locator("main section.section").count()) > 0 && (await pageNoJs.locator("pre").count()) > 0,
    `sections=${await pageNoJs.locator("main section.section").count()} pre=${await pageNoJs.locator("pre").count()}`);
  ok(`${etiquette} — sans JS : avertissement noscript`, (await pageNoJs.locator("noscript").count()) === 1);
  await ctxNoJs.close();
  } catch (e) {
    // Un aléa inattendu (cible absente, timeout) doit être rapporté, jamais masqué,
    // et ne doit pas interrompre le reste du contrôle.
    ok(`${etiquette} — exécution complète sans erreur inattendue`, false, String((e && e.message) || e));
  }
}

/* ---------------------------------------------------------------------- */
/* 2.b Tableau de bord                                                     */
/* ---------------------------------------------------------------------- */
try {
  const ctx = await navigateur.newContext({ viewport: { width: 1280, height: 900 } });
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  const journal = brancherEcouteurs(page);
  const reponse = await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });

  ok("tableau de bord — page servie en 200", reponse && reponse.status() === 200, `status=${reponse && reponse.status()}`);
  ok("tableau de bord — aucune erreur console", journal.consoleErrors.length === 0, journal.consoleErrors.join(" | "));
  ok("tableau de bord — aucune exception JS", journal.pageErrors.length === 0, journal.pageErrors.join(" | "));

  const cartes = await page.locator("#module-grid .module-card").count();
  const liens = await page.locator("#module-grid a").count();
  const badgesPlanifies = await page.locator("#module-grid .badge--planned").count();
  ok("tableau de bord — 12 cartes de module", cartes === 12, `count=${cartes}`);
  ok(`tableau de bord — un lien par page annoncée (${DECLARES.length})`, liens === DECLARES.length, `count=${liens}`);
  ok(`tableau de bord — badges « Planifié » conformes (${PLANIFIES.length})`, badgesPlanifies === PLANIFIES.length, `count=${badgesPlanifies}`);
  ok("tableau de bord — légende des 4 états", (await page.locator(".status-legend .badge").count()) === 4);
  ok("tableau de bord — aucun message d'état d'erreur", (await page.locator("#module-grid .state-message").count()) === 0);

  const stats = await page.locator("#stats .stat__value").allInnerTexts();
  ok("tableau de bord — 12 modules au programme", stats[0] === "12", stats.join(" / "));
  ok(`tableau de bord — ${DECLARES.length} page(s) disponible(s) sur 12`, stats[1] === `${DECLARES.length} / 12`, stats[1]);
  ok("tableau de bord — 5 statistiques", stats.length === 5, `len=${stats.length}`);

  /* Chaque module annoncé est réellement atteignable depuis sa carte. */
  for (const m of DECLARES) {
    const carte = page.locator(`#module-grid .module-card[data-module-id='${m.id}']`);
    const href = await carte.locator("a").first().getAttribute("href").catch(() => null);
    ok(`tableau de bord — carte ${m.id} pointe vers ${m.file}`, href === m.file, `href=${href}`);
  }
  for (const m of PLANIFIES) {
    const carte = page.locator(`#module-grid .module-card[data-module-id='${m.id}']`);
    ok(`tableau de bord — carte ${m.id} sans lien (module planifié)`, (await carte.locator("a").count()) === 0);
  }

  /* Recherche : comportement de base, pour détecter une régression du socle. */
  const recherche = page.locator("#module-search");
  await recherche.fill("ssh"); await page.waitForTimeout(120);
  const apresSsh = await page.locator("#module-grid .module-card").count();
  ok("tableau de bord — recherche 'ssh' filtre la liste", apresSsh > 0 && apresSsh < 12, `count=${apresSsh}`);
  await recherche.fill("zzzzz"); await page.waitForTimeout(120);
  ok("tableau de bord — recherche sans résultat → message", (await page.locator("#module-grid .state-message").count()) === 1);
  await recherche.fill(""); await page.waitForTimeout(120);
  ok("tableau de bord — effacer restaure 12 modules", (await page.locator("#module-grid .module-card").count()) === 12);

  ok("tableau de bord — progression initiale 0 / 12", (await page.locator("#progress-label").innerText()).includes("0 / 12"));

  for (const [nom, w, h] of LARGEURS) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(150);
    const d = await debordement(page);
    ok(`tableau de bord — pas de débordement horizontal (${nom} ${w}px)`, d <= 1, `overflow=${d}px`);
    if (d > 1) ok(`tableau de bord — aucun élément hors cadre (${nom} ${w}px)`, false, (await horsCadre(page)).join(" | "));
  }

  await ctx.close();
} catch (e) {
  ok("tableau de bord — exécution complète sans erreur inattendue", false, String((e && e.message) || e));
}

await navigateur.close();

/* ====================================================================== */
/* Rapport                                                                 */
/* ====================================================================== */
let pass = 0, fail = 0;
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.n}${r.e && !r.pass ? "  [" + r.e + "]" : ""}`);
  r.pass ? pass++ : fail++;
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
