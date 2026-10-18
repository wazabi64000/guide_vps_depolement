/* Tests de robustesse — VPS Academy 2026
   Usage : python3 -m http.server 8099   (racine du projet, autre terminal)
           VPS_BASE_URL=http://localhost:8099/index.html node tests/robustness.test.mjs
   Dépend de playwright-core + un Chromium. Aucune action distante.
   Résolution de playwright-core : variable PLAYWRIGHT_CORE_PATH (dossier du paquet),
   sinon résolution Node standard (npm i -D playwright-core). */

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
  process.exit(2);
}

/* A) JSON invalide */
{
  const ctx = await browser.newContext();
  await ctx.route("**/modules.json", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: "{ pas du JSON" }));
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle" });
  const msg = await page.locator("#module-grid .state-message").first().innerText().catch(() => "");
  ok("JSON invalide → message lisible", msg.includes("Impossible de charger"), msg.slice(0, 70));
  ok("JSON invalide → pas d'exception non capturée", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

/* B) Erreur HTTP 500 */
{
  const ctx = await browser.newContext();
  await ctx.route("**/modules.json", (r) => r.fulfill({ status: 500, body: "boom" }));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const msg = await page.locator("#module-grid .state-message").first().innerText().catch(() => "");
  ok("HTTP 500 → message lisible", msg.includes("Impossible de charger"), msg.slice(0, 70));
  await ctx.close();
}

/* C) Identifiants en double */
{
  const ctx = await browser.newContext();
  const bad = JSON.stringify({ modules: [{ id: "01", title: "A" }, { id: "01", title: "B" }] });
  await ctx.route("**/modules.json", (r) => r.fulfill({ status: 200, contentType: "application/json", body: bad }));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const msg = await page.locator("#module-grid .state-message").first().innerText().catch(() => "");
  ok("identifiants en double → message de validation", msg.includes("double"), msg.slice(0, 80));
  await ctx.close();
}

/* D) localStorage indisponible */
{
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("disabled"); } });
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle" });
  const cards = await page.locator("#module-grid .module-card").count();
  const label = await page.locator("#progress-label").innerText().catch(() => "");
  ok("localStorage indisponible → modules affichés", cards === 12, `cards=${cards}`);
  ok("localStorage indisponible → mention explicite", label.includes("non persistée"), label);
  ok("localStorage indisponible → aucune exception", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

/* E) Page annoncée (published) mais absente → aucun lien, état cohérent */
{
  const ctx = await browser.newContext();
  const payload = JSON.stringify({
    modules: [
      { id: "01", title: "Module publié", status: "published", file: "cours/inexistant.html", description: "d" },
      { id: "02", title: "Module planifié", status: "planned", file: "cours/aussi-inexistant.html", description: "d" },
    ],
  });
  await ctx.route("**/modules.json", (r) => r.fulfill({ status: 200, contentType: "application/json", body: payload }));
  await ctx.route("**/cours/inexistant.html", (r) => r.fulfill({ status: 404, body: "not found" }));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const links = await page.locator("#module-grid a").count();
  const badge = await page.locator('[data-module-id="01"] .badge').innerText().catch(() => "");
  const meta = await page.locator('[data-module-id="01"] .module-card__meta').innerText().catch(() => "");
  ok("page annoncée mais absente → aucun lien", links === 0, `links=${links}`);
  ok("page annoncée mais absente → badge « Planifié »", badge.trim() === "Planifié", badge);
  ok("page annoncée mais absente → signalée (introuvable)", meta.includes("introuvable"), meta);
  await ctx.close();
}

/* F) file:// (informationnel) : modules ESM bloqués par le navigateur */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(path.join(ROOT, "index.html")).href).catch(() => {});
  await page.waitForTimeout(400);
  const cards = await page.locator("#module-grid .module-card").count();
  console.log(`INFO  file:// → cartes=${cards} (limite documentée : servir en HTTP)`);
  await ctx.close();
}

await browser.close();

let pass = 0, fail = 0;
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.n}${r.e && !r.pass ? "  [" + r.e + "]" : ""}`);
  r.pass ? pass++ : fail++;
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
