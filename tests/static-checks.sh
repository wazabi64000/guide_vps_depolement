#!/usr/bin/env bash
# Contrôles statiques — VPS Academy 2026
# Usage : bash tests/static-checks.sh   (depuis la racine du projet)
# Aucune action distante, aucune modification de fichier.
set -u

cd "$(dirname "$0")/.." || exit 1
fail=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; fail=$((fail+1)); }

echo "=== 1. JSON : validité, 12 modules, identifiants, chemins ==="
node - <<'NODE' || fail=$((fail+1))
const fs = require("fs");
let d;
try { d = JSON.parse(fs.readFileSync("assets/data/modules.json", "utf8")); }
catch (e) { console.log("FAIL  JSON invalide : " + e.message); process.exit(1); }
const checks = [
  ["JSON parse sans erreur", true],
  ["exactement 12 modules", d.modules.length === 12],
  ["identifiants uniques", new Set(d.modules.map(m => m.id)).size === d.modules.length],
  ["chemins sous cours/", d.modules.every(m => typeof m.file === "string" && m.file.startsWith("cours/"))],
  // Le statut n'est plus figé à « planned » : il doit appartenir aux 4 états
  // prévus par docs/ARCHITECTURE.md. C'est plus strict qu'une valeur unique.
  ["chaque statut appartient aux 4 états prévus",
    d.modules.every(m => ["planned", "published", "drafted", "validated"].includes(m.status))],
  ["champs requis présents", d.modules.every(m =>
    ["id","title","slug","file","description","objectives","prerequisites","deliverables","status"]
      .every(f => f in m))],
];
let bad = 0;
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); if (!ok) bad++; }
process.exit(bad ? 1 : 0);
NODE

echo
echo "=== 2. Syntaxe ESM ==="
tmp="$(mktemp -d)"
for f in assets/js/*.js; do cp "$f" "$tmp/$(basename "${f%.js}").mjs"; done
for f in "$tmp"/*.mjs; do
  if node --check "$f" >/dev/null 2>&1; then pass "syntaxe $(basename "$f")"; else fail "syntaxe $(basename "$f")"; fi
done
rm -rf "$tmp"

echo
echo "=== 3. Liens internes de index.html ==="
grep -oE '(href|src)="[^"#]+"' index.html | sed -E 's/.*="([^"]+)"/\1/' | sort -u | while read -r p; do
  case "$p" in
    http*|data:*|"#"|"") continue ;;
  esac
  if [ -e "$p" ]; then pass "lien $p"; else fail "lien mort $p"; fi
done

echo
echo "=== 4. Aucune référence aux pages de cours dans le socle ==="
if grep -rn "cours/module" index.html assets/js assets/css 2>/dev/null; then
  fail "référence à une page de cours trouvée dans le socle"
else
  pass "aucune référence à une page de cours dans le socle"
fi

echo
echo "=== 5. Absence de secrets ==="
if grep -rniE '(BEGIN [A-Z ]*PRIVATE KEY|password[[:space:]]*=|passwd[[:space:]]*=|api[_-]?key[[:space:]]*=)' index.html assets/ 2>/dev/null; then
  fail "motif de secret détecté"
else
  pass "aucun secret détecté"
fi

echo
echo "=== 6. Fichiers du socle présents ==="
for f in index.html assets/css/main.css assets/css/layout.css assets/css/components.css \
         assets/js/app.js assets/js/navigation.js assets/js/search.js assets/js/progress.js \
         assets/data/modules.json docs/SOURCES.md docs/ARCHITECTURE.md docs/CADRAGE.md \
         docs/PROGRESS.md docs/VALIDATION.md README.md; do
  if [ -f "$f" ]; then pass "présent $f"; else fail "MANQUANT $f"; fi
done

echo
echo "=== 7. Pages de cours annoncées (cours/*.html) ==="
node - <<'NODE' || fail=$((fail+1))
const fs = require("fs");
const catalog = JSON.parse(fs.readFileSync("assets/data/modules.json", "utf8")).modules;
const declared = catalog.filter((m) => m.status !== "planned");
let bad = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); if (!ok) bad++; };

check("au moins une page de cours annoncée", declared.length > 0);

// Seules les plages réservées à la documentation ou privées sont tolérées :
// on ne veut aucune adresse « réelle » inventée dans une page de cours.
const allowedIPv4 = (ip) => {
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 127 || a === 10
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0)                     // 192.0.2.0/24 — RFC 5737
    || (a === 198 && b === 51)                    // 198.51.100.0/24 — RFC 5737
    || (a === 203 && b === 0)                     // 203.0.113.0/24 — RFC 5737
    || (a === 100 && b >= 64 && b <= 127);        // 100.64.0.0/10 — RFC 6598
};

for (const m of declared) {
  if (!fs.existsSync(m.file)) { check(`page annoncée présente : ${m.file}`, false); continue; }
  check(`page annoncée présente : ${m.file}`, true);
  const html = fs.readFileSync(m.file, "utf8");

  // 1. Toute ancre interne doit exister dans la page.
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((x) => x[1]);
  const broken = [...new Set(anchors.filter((a) => !ids.has(a)))];
  check(`ancres résolues dans ${m.file}`, broken.length === 0);

  // 2. Chaque bouton « copier » doit viser un bloc existant.
  const targets = [...html.matchAll(/data-copy="([^"]+)"/g)].map((x) => x[1]);
  const preIds = new Set([...html.matchAll(/<pre id="([^"]+)"/g)].map((x) => x[1]));
  check(`cibles de copie présentes dans ${m.file}`, targets.every((t) => preIds.has(t)));

  // 3. Aucun bloc copiable ne doit exposer la base ou phpMyAdmin publiquement.
  const blocks = [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)].map((x) => x[1]);
  const exposed = blocks.filter((b) => /(0\.0\.0\.0|\[::\])/.test(b) && /(3306|8443)/.test(b));
  check(`aucun port base/administration publié dans un bloc copiable de ${m.file}`, exposed.length === 0);

  // 4. Aucune adresse IPv4 hors plages réservées ou privées.
  const ips = [...new Set([...html.matchAll(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g)].map((x) => x[0]))];
  const invented = ips.filter((ip) => !allowedIPv4(ip));
  check(`adresses IPv4 réservées ou privées uniquement dans ${m.file}`, invented.length === 0);
}
process.exit(bad ? 1 : 0);
NODE

echo
if [ "$fail" -eq 0 ]; then echo "RÉSULTAT : tout est PASS"; else echo "RÉSULTAT : $fail échec(s)"; fi
exit "$fail"
