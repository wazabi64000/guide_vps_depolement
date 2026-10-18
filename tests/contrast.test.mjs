/* Contrôle de contraste WCAG — VPS Academy 2026
 *
 * Deux contrôles complémentaires :
 *   1. Analyse de la FEUILLE DE STYLE : toutes les règles qui posent une couleur
 *      de texte ET un fond sont dérivées du CSS (aucune paire codée en dur).
 *      Cela couvre aussi les styles déclarés mais absents des pages actuelles.
 *   2. Contrôle du RENDU RÉEL : pour chaque élément porteur de texte des pages,
 *      la couleur calculée et le fond effectif (héritage + composition alpha)
 *      sont relevés dans le navigateur. C'est le contrôle des combinaisons
 *      réellement utilisées.
 *
 * Prérequis : Node ≥ 18, playwright-core + un Chromium (voir tests/README.md).
 *
 * Usage :
 *   python3 -m http.server 8099            # racine du projet, autre terminal
 *   VPS_BASE_URL=http://localhost:8099/index.html node tests/contrast.test.mjs
 *
 * Codes de sortie : 0 = tout PASS ; 1 = au moins un FAIL ; 2 = prérequis manquant.
 *
 * LIMITES DE LA MÉTHODE (à lire avant d'interpréter un PASS) :
 *   - Seuil retenu : WCAG 2.1 AA — 4,5:1 pour le texte normal, 3:1 pour le texte
 *     large (≥ 24 px, ou ≥ 18,66 px en gras). AA est le niveau visé par le projet ;
 *     le niveau AAA (7:1) n'est pas vérifié.
 *   - L'analyse de la feuille applique 4,5:1 à toutes les paires : elle ne connaît
 *     pas la taille de police héritée, elle choisit donc le seuil le plus strict.
 *   - Les éléments `.visually-hidden` (texte réservé aux lecteurs d'écran) sont
 *     exclus : ils ne sont pas visibles à l'écran.
 *   - Les fonds en dégradé ou en image ne sont pas évalués (signalés, jamais
 *     comptés comme PASS) : la feuille du projet n'en contient aucun.
 *   - Le contrôle de rendu mesure la couleur au repos : les états `:hover`,
 *     `:focus` et `:active` ne sont pas évalués, pas plus que le contraste des
 *     éléments non textuels (WCAG 1.4.11).
 */

import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS_FILES = ["assets/css/main.css", "assets/css/layout.css", "assets/css/components.css"];
const SEUIL_NORMAL = 4.5;
const SEUIL_LARGE = 3;

/* VPS_BASE_URL peut désigner index.html ou la racine : les deux formes sont acceptées. */
const BASE = (process.env.VPS_BASE_URL || "http://localhost:8099/index.html")
  .replace(/\/index\.html$/, "")
  .replace(/\/$/, "");

const results = [];
const ok = (n, c, e = "") => results.push({ n, pass: !!c, e });

/* ====================================================================== */
/* 1. Analyse de la feuille de style (aucune dépendance, aucun navigateur) */
/* ====================================================================== */

const sansCommentaires = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
const numeroLigne = (src, index) => src.slice(0, index).split("\n").length;

function accoladeFermante(src, ouvrante) {
  let profondeur = 0;
  for (let i = ouvrante; i < src.length; i++) {
    if (src[i] === "{") profondeur++;
    else if (src[i] === "}") { profondeur--; if (profondeur === 0) return i; }
  }
  return src.length;
}

/** Découpe une feuille en règles { fichier, ligne, sélecteur, media, déclarations }. */
function lireFeuille(brut, fichier) {
  const src = sansCommentaires(brut);
  const regles = [];
  const contextes = [];
  let i = 0, debut = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "{") {
      const prelude = src.slice(debut, i).trim();
      if (prelude.startsWith("@")) { contextes.push(prelude); i++; debut = i; continue; }
      let p = debut;
      while (p < i && /\s/.test(src[p])) p++;
      const fin = accoladeFermante(src, i);
      regles.push({
        fichier,
        ligne: numeroLigne(src, p),
        selecteur: prelude.replace(/\s+/g, " "),
        media: contextes.filter((a) => a.startsWith("@media")).join(" "),
        css: src.slice(i + 1, fin),
      });
      i = fin + 1;
      debut = i;
      continue;
    }
    if (c === "}") { contextes.pop(); i++; debut = i; continue; }
    i++;
  }
  return regles;
}

function lireDeclarations(texte) {
  const out = {};
  for (const morceau of texte.split(";")) {
    const sep = morceau.indexOf(":");
    if (sep < 0) continue;
    const prop = morceau.slice(0, sep).trim().toLowerCase();
    const valeur = morceau.slice(sep + 1).trim();
    if (prop && valeur) out[prop] = valeur;
  }
  return out;
}

/* --- Couleurs ---------------------------------------------------------- */

const NOMBREES = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };

function analyserCouleur(valeur) {
  if (!valeur) return null;
  const s = String(valeur).trim().toLowerCase();
  if (NOMBREES[s]) return NOMBREES[s];
  const hex = /^#([0-9a-f]{3,8})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((x) => x + x).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [n[0], n[1], n[2], a];
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(s);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    const n = parts.slice(0, 3).map((x) => (x.endsWith("%") ? Math.round(parseFloat(x) * 2.55) : Math.round(parseFloat(x))));
    const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
    if (n.some(Number.isNaN)) return null;
    return [n[0], n[1], n[2], Number.isNaN(a) ? 1 : a];
  }
  return null;
}

/** Résout récursivement `var(--jeton)` (avec valeur de repli éventuelle). */
function resoudre(valeur, jetons, profondeur = 0) {
  if (profondeur > 10) return valeur;
  return String(valeur).replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, nom, repli) => {
    const v = jetons[nom.trim()];
    if (v == null) return repli != null ? resoudre(repli, jetons, profondeur + 1) : "";
    return resoudre(v, jetons, profondeur + 1);
  });
}

const composer = (dessus, dessous) => {
  const a = dessus[3];
  return [
    dessus[0] * a + dessous[0] * (1 - a),
    dessus[1] * a + dessous[1] * (1 - a),
    dessus[2] * a + dessous[2] * (1 - a),
    1,
  ];
};

const canal = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const luminance = ([r, v, b]) => 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b);

function rapport(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  const haut = Math.max(l1, l2), bas = Math.min(l1, l2);
  return (haut + 0.05) / (bas + 0.05);
}

const enHex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/* --- Balayage de la feuille -------------------------------------------- */

const feuilles = CSS_FILES.map((f) => ({ fichier: f, regles: lireFeuille(readFileSync(path.join(ROOT, f), "utf8"), f) }));
const toutesRegles = feuilles.flatMap((f) => f.regles);
const jetons = {};
for (const r of toutesRegles) {
  if (r.selecteur.includes(":root")) Object.assign(jetons, lireDeclarations(r.css));
}

const pairesFeuille = [];
const ignoreesFeuille = [];
for (const regle of toutesRegles) {
  const decl = lireDeclarations(regle.css);
  if (!decl.color) continue;
  const fondBrut = decl["background-color"] || decl.background;
  if (!fondBrut) continue;

  const texte = analyserCouleur(resoudre(decl.color, jetons));
  const fond = analyserCouleur(resoudre(fondBrut, jetons));
  const origine = `${regle.fichier}:${regle.ligne}`;

  if (!texte || !fond) {
    ignoreesFeuille.push({ origine, selecteur: regle.selecteur, raison: "couleur ou fond non analysable", brut: fondBrut });
    continue;
  }
  if (fond[3] < 1) {
    ignoreesFeuille.push({ origine, selecteur: regle.selecteur, raison: "fond semi-transparent (dépend de la superposition réelle)", brut: fondBrut });
    continue;
  }
  const avant = texte[3] < 1 ? composer(texte, fond) : texte;
  pairesFeuille.push({
    origine,
    selecteur: regle.selecteur,
    texte: enHex(avant),
    fond: enHex(fond),
    rapport: rapport(avant, fond),
    seuil: SEUIL_NORMAL,
  });
}

for (const p of pairesFeuille) {
  ok(
    `feuille — ${p.selecteur} (${p.origine}) ${p.rapport.toFixed(2)}:1 ≥ ${p.seuil}`,
    p.rapport + 1e-9 >= p.seuil,
    `${p.texte} sur ${p.fond}`
  );
}
ok("feuille — au moins une paire de couleurs analysée", pairesFeuille.length > 0, `paires=${pairesFeuille.length}`);

/* ====================================================================== */
/* 2. Contrôle du rendu réel (navigateur)                                  */
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

const catalogue = JSON.parse(readFileSync(path.join(ROOT, "assets/data/modules.json"), "utf8")).modules;
const pagesARendre = [
  { nom: "tableau de bord", url: `${BASE}/index.html` },
  ...catalogue.filter((m) => m.status !== "planned").map((m) => ({ nom: `module ${m.id}`, url: `${BASE}/${m.file}` })),
];

/* Fonction exécutée dans la page : relève le contraste de chaque texte rendu. */
const balayageRendu = () => {
  const analyser = (s) => {
    const m = /^rgba?\(([^)]+)\)$/.exec(String(s).trim());
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean);
    const n = p.slice(0, 3).map((x) => (x.endsWith("%") ? Math.round(parseFloat(x) * 2.55) : Math.round(parseFloat(x))));
    const a = p.length > 3 ? parseFloat(p[3]) : 1;
    if (n.some(Number.isNaN)) return null;
    return [n[0], n[1], n[2], Number.isNaN(a) ? 1 : a];
  };
  const composer = (d, s) => { const a = d[3]; return [d[0] * a + s[0] * (1 - a), d[1] * a + s[1] * (1 - a), d[2] * a + s[2] * (1 - a), 1]; };
  const canal = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, v, b]) => 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b);
  const rapport = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  const chemin = (el) => {
    const cls = (el.className || "").toString().trim().split(/\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (cls ? "." + cls : "");
  };

  /* Fond effectif : on remonte les ancêtres et on compose les couches alpha. */
  const fondAscendants = (el) => {
    const pile = [];
    let n = el, image = null;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") image = image || cs.backgroundImage.slice(0, 48);
      const c = analyser(cs.backgroundColor);
      if (c && c[3] > 0) { pile.push(c); if (c[3] === 1) break; }
      n = n.parentElement;
    }
    let base = [255, 255, 255, 1];
    for (let i = pile.length - 1; i >= 0; i--) base = composer(pile[i], base);
    return { base, image, propre: pile[0] || null };
  };

  /* Élément superposé (position absolue/fixe) à fond translucide : le fond
     réel dépend de ce qui est peint DERRIÈRE, que l'ascendance ne décrit pas.
     On interroge alors la pile de rendu au point central de l'élément, après
     l'avoir amené dans la fenêtre (sinon la mesure serait impossible). */
  const fondAuPoint = (el) => {
    let r = el.getBoundingClientRect();
    const horsEcran = r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth;
    if (horsEcran) {
      const ancien = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      el.scrollIntoView({ block: "center", inline: "center" });
      document.documentElement.style.scrollBehavior = ancien;
      r = el.getBoundingClientRect();
    }
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (r.width < 1 || r.height < 1 || x < 1 || y < 1 || x > innerWidth - 1 || y > innerHeight - 1) return null;
    const pile = document.elementsFromPoint(x, y);
    let base = [255, 255, 255, 1];
    for (let i = pile.length - 1; i >= 0; i--) {
      const c = analyser(getComputedStyle(pile[i]).backgroundColor);
      if (c && c[3] > 0) base = composer(c, base);
    }
    return base;
  };

  const evalues = [];
  const violations = [];
  const ignores = [];

  for (const el of document.querySelectorAll("body *")) {
    const texte = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(" ");
    if (!texte) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (el.closest(".visually-hidden")) { ignores.push({ sel: chemin(el), raison: "texte réservé aux lecteurs d'écran" }); continue; }
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) { ignores.push({ sel: chemin(el), raison: "élément non rendu (taille nulle)" }); continue; }

    const info = fondAscendants(el);
    if (info.image) { ignores.push({ sel: chemin(el), raison: "fond en image ou dégradé — non évalué" }); continue; }

    let fond = info.base;
    const position = cs.position;
    if (info.propre && info.propre[3] < 1 && (position === "absolute" || position === "fixed")) {
      const auPoint = fondAuPoint(el);
      if (!auPoint) { ignores.push({ sel: chemin(el), raison: "fond de superposition hors écran" }); continue; }
      fond = auPoint;
    }

    const couleur = analyser(cs.color);
    if (!couleur) { ignores.push({ sel: chemin(el), raison: `couleur non analysable « ${cs.color} »` }); continue; }
    const avant = couleur[3] < 1 ? composer(couleur, fond) : couleur;

    const taille = parseFloat(cs.fontSize);
    const graisse = parseInt(cs.fontWeight, 10) || 400;
    const grand = taille >= 24 || (taille >= 18.66 && graisse >= 700);
    const seuil = grand ? 3 : 4.5;
    const valeur = rapport(avant, fond);

    const fiche = {
      sel: chemin(el),
      texte: texte.slice(0, 48),
      texte_hex: hex(avant),
      fond_hex: hex(fond),
      rapport: valeur,
      seuil,
      grand,
      taille: Math.round(taille * 10) / 10,
      graisse,
    };
    evalues.push(fiche);
    if (valeur + 1e-9 < seuil) violations.push(fiche);
  }

  return { evalues, violations, ignores };
};

let navigateur = null;
let prerequisManquant = false;
try {
  const chromium = await chargerChromium();
  navigateur = await chromium.launch(
    process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] }
      : { args: ["--no-sandbox"] }
  );
} catch (e) {
  prerequisManquant = true;
  console.error(`PRÉREQUIS MANQUANT — Chromium indisponible : ${e.message}`);
  console.error("Les contrôles de rendu n'ont PAS été exécutés (voir tests/README.md).");
}

const fichesRendu = [];
if (navigateur) {
  for (const cible of pagesARendre) {
    try {
    const ctx = await navigateur.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("pageerror", (e) => erreurs.push(String(e)));
    const reponse = await page.goto(cible.url, { waitUntil: "networkidle" });
    if (!reponse || reponse.status() !== 200) {
      ok(`rendu — ${cible.nom} chargé`, false, `status=${reponse && reponse.status()}`);
      await ctx.close();
      continue;
    }
    let releve;
    try {
      releve = await page.evaluate(balayageRendu);
    } catch (e) {
      ok(`rendu — ${cible.nom} : mesure du contraste effectivement réalisée`, false, String((e && e.message) || e));
      await ctx.close();
      continue;
    }
    ok(`rendu — ${cible.nom} chargé`, true);
    ok(`rendu — ${cible.nom} : aucune exception JS`, erreurs.length === 0, erreurs.join(" | "));
    ok(`rendu — ${cible.nom} : textes effectivement mesurés`, releve.evalues.length > 0, `mesurés=${releve.evalues.length}`);
    ok(`rendu — ${cible.nom} : aucun contraste insuffisant`, releve.violations.length === 0,
      releve.violations.map((v) => `${v.sel} « ${v.texte} » ${v.rapport.toFixed(2)}:1 < ${v.seuil} [${v.texte_hex} sur ${v.fond_hex}]`).join(" | "));
    fichesRendu.push({ nom: cible.nom, ...releve });
    await ctx.close();
    } catch (e) {
      ok(`rendu — ${cible.nom} : exécution complète sans erreur inattendue`, false, String((e && e.message) || e));
    }
  }
  await navigateur.close();
}

/* ====================================================================== */
/* Rapport                                                                */
/* ====================================================================== */

console.log("=== 1. Paires dérivées de la feuille de style ===");
console.log("seuil appliqué : 4,50:1 (WCAG 2.1 AA, texte normal — le plus strict)");
for (const p of pairesFeuille) {
  console.log(`  ${(p.rapport + 1e-9 >= p.seuil ? "PASS" : "FAIL")}  ${p.rapport.toFixed(2).padStart(5)}:1  ${p.selecteur}  [${p.texte} sur ${p.fond}]  (${p.origine})`);
}
if (ignoreesFeuille.length) {
  console.log("  Non évaluées par la feuille (couvertes par le rendu ou hors méthode) :");
  for (const i of ignoreesFeuille) console.log(`    SKIP  ${i.selecteur} (${i.origine}) — ${i.raison} : ${i.brut}`);
}

console.log("\n=== 2. Contraste du rendu réel ===");
if (!navigateur) {
  console.log("  NON EXÉCUTÉ — Chromium indisponible (voir « PRÉREQUIS MANQUANT » ci-dessus).");
} else {
  for (const f of fichesRendu) {
    const min = f.evalues.reduce((a, e) => (e.rapport < a.rapport ? e : a), f.evalues[0]);
    console.log(`  ${f.nom} : ${f.evalues.length} textes mesurés, ${f.violations.length} insuffisant(s), minimum ${min.rapport.toFixed(2)}:1 (${min.sel})`);
    for (const v of f.violations) {
      console.log(`    FAIL  ${v.rapport.toFixed(2)}:1 < ${v.seuil}  ${v.sel} (${v.taille}px/${v.graisse}) « ${v.texte} » [${v.texte_hex} sur ${v.fond_hex}]`);
    }
    if (f.ignores.length) console.log(`    ${f.ignores.length} élément(s) non évalué(s) : ${[...new Set(f.ignores.map((i) => i.raison))].join(" ; ")}`);
  }
}

let pass = 0, fail = 0;
console.log("\n=== 3. Résultats ===");
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.n}${r.e && !r.pass ? "  [" + r.e + "]" : ""}`);
  r.pass ? pass++ : fail++;
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
if (prerequisManquant) {
  console.log("Le contrôle de rendu n'a pas été exécuté : prérequis manquant.");
  process.exit(2);
}
process.exit(fail ? 1 : 0);
