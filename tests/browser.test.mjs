/* Tests navigateur — VPS Academy 2026
   Usage : python3 -m http.server 8099   (racine du projet, autre terminal)
           VPS_BASE_URL=http://localhost:8099/index.html node tests/browser.test.mjs
   Dépend de playwright-core + un Chromium. Aucune action distante.
   Résolution de playwright-core : variable PLAYWRIGHT_CORE_PATH (dossier du paquet),
   sinon résolution Node standard (npm i -D playwright-core). */

import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

async function loadChromium() {
  const base = process.env.PLAYWRIGHT_CORE_PATH;
  if (!base) return (await import("playwright-core")).chromium;
  // Chemin explicite : accepter un fichier .mjs/.js, ou un dossier de paquet.
  const candidates = /\.(mjs|js)$/.test(base)
    ? [base]
    : [path.join(base, "index.mjs"), path.join(base, "index.js")];
  let lastError;
  for (const candidate of candidates) {
    try {
      const mod = await import(pathToFileURL(candidate).href);
      const chromium = mod.chromium || mod.default?.chromium;
      if (chromium) return chromium;
      lastError = new Error(`« ${candidate} » n'expose pas « chromium ».`);
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

const chromium = await loadChromium();

const URL = process.env.VPS_BASE_URL || "http://localhost:8099/index.html";

/* Attentes DÉRIVÉES du catalogue : le test ne fige plus l'état « tout planifié ».
   Il reste strict — le nombre de liens, de badges et de pages disponibles doit
   correspondre exactement à ce que déclare assets/data/modules.json. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = JSON.parse(readFileSync(path.join(ROOT, "assets/data/modules.json"), "utf8")).modules;
const expectedPlanned = CATALOG.filter((m) => m.status === "planned").length;
const expectedAvailable = CATALOG.filter((m) => m.status !== "planned").length;

const results = [];
const ok = (n, c, e = "") => results.push({ n, pass: !!c, e });

let browser;
try {
  browser = await chromium.launch(
    process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] }
      : { args: ["--no-sandbox"] }
  );
} catch (e) {
  console.error("Impossible de lancer Chromium :", e.message);
  console.error("Installez-le (npx playwright install chromium) ou définissez CHROMIUM_PATH.");
  process.exit(2);
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [], pageErrors = [], failedReq = [], headStatuses = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => pageErrors.push(String(e)));
page.on("requestfailed", (r) => failedReq.push({ url: r.url(), method: r.method(), errorText: r.failure()?.errorText ?? "" }));
// Chromium émet « net::ERR_ABORTED » pour une sonde HEAD réussie (le corps vide
// n'est alors jamais lu) : le statut HTTP est la seule preuve d'existence fiable.
page.on("response", (r) => { if (r.request().method() === "HEAD") headStatuses.push(r.status()); });

await page.goto(URL, { waitUntil: "networkidle" });

/* 1. Chargement */
ok("titre de page", (await page.title()).includes("VPS Academy"));
ok("aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));
ok("aucune exception JS", pageErrors.length === 0, pageErrors.join(" | "));
const realFailures = failedReq.filter((f) => f.method !== "HEAD");
ok("aucune requête en échec", realFailures.length === 0, realFailures.map((f) => `${f.url} :: ${f.errorText}`).join(" | "));
ok(
  "sondes d'existence : statut HTTP < 400",
  headStatuses.length > 0 && headStatuses.every((s) => s < 400),
  `HEAD=[${headStatuses.join(", ")}]`
);

/* 2. Rendu des modules */
const gridCards = await page.locator("#module-grid .module-card").count();
const gridLinks = await page.locator("#module-grid a").count();
const plannedBadges = await page.locator("#module-grid .badge--planned").count();
ok("12 cartes de module", gridCards === 12, `count=${gridCards}`);
ok(`un lien par page disponible (${expectedAvailable})`, gridLinks === expectedAvailable, `count=${gridLinks}`);
ok(`badges « Planifié » conformes au catalogue (${expectedPlanned})`, plannedBadges === expectedPlanned, `count=${plannedBadges}`);
ok("légende des 4 états", (await page.locator(".status-legend .badge").count()) === 4);
ok("aucun message d'état d'erreur", (await page.locator("#module-grid .state-message").count()) === 0);

/* 3. Statistiques */
const stats = await page.locator("#stats .stat__value").allInnerTexts();
ok("12 modules au programme", stats[0] === "12", stats.join(" / "));
ok(`${expectedAvailable} page(s) disponible(s) sur 12`, stats[1] === `${expectedAvailable} / 12`, stats[1]);
ok("5 statistiques présentées", stats.length === 5, `len=${stats.length}`);

/* 4. Recherche */
const search = page.locator("#module-search");
await search.fill("ssh"); await page.waitForTimeout(120);
const afterSsh = await page.locator("#module-grid .module-card").count();
ok("recherche 'ssh' réduit la liste", afterSsh > 0 && afterSsh < 12, `count=${afterSsh}`);
await search.fill("zzzzz"); await page.waitForTimeout(120);
ok("recherche sans résultat → message", (await page.locator("#module-grid .state-message").count()) === 1);
await search.fill(""); await page.waitForTimeout(120);
ok("effacer la recherche restaure 12 modules", (await page.locator("#module-grid .module-card").count()) === 12);

/* 5. Progression */
ok("libellé de progression initial", (await page.locator("#progress-label").innerText()).includes("0 / 12"));
ok("bouton de réinitialisation visible", await page.locator("#progress-reset").isVisible());
await page.locator("#progress-reset").click();
ok("aucune erreur après réinitialisation", consoleErrors.length === 0, consoleErrors.join(" | "));

/* 6. Copie */
ok("bouton « copier » visible", await page.locator("[data-copy]").first().isVisible());

/* 7. Responsive */
for (const [name, w, h] of [["mobile", 375, 812], ["tablette", 768, 1024], ["bureau", 1280, 900]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`pas de débordement horizontal (${name} ${w}px)`, overflow <= 1, `overflow=${overflow}px`);
}

/* 8. Accessibilité de base */
ok("lien d'évitement présent", (await page.locator(".skip-link").count()) === 1);
ok("landmark main présent", (await page.locator("main#contenu").count()) === 1);
ok("champ de recherche étiqueté", (await page.locator("label[for='module-search']").count()) === 1);

await browser.close();

let pass = 0, fail = 0;
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.n}${r.e && !r.pass ? "  [" + r.e + "]" : ""}`);
  r.pass ? pass++ : fail++;
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
