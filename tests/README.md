# Tests — VPS Academy 2026

Ces scripts vérifient le socle du site et les pages de cours. Ils sont **hors du
site** : ils ne sont jamais chargés par les pages et n'ajoutent aucune dépendance
à l'application pédagogique.

Aucun test n'agit sur un serveur distant. Tous sont **locaux et non destructifs**.

## Codes de sortie

| Code | Signification |
| --- | --- |
| `0` | Tous les contrôles ont été exécutés et sont PASS |
| `1` | Au moins un contrôle a échoué (FAIL) |
| `2` | Un prérequis manque (Chromium indisponible) : **les contrôles concernés n'ont PAS été exécutés** |

Un code `2` n'est **jamais** un succès : il signifie « non exécuté », et aucun contrôle
non exécuté n'est compté comme PASS.

## Prérequis

- Node.js ≥ 18 (testé avec v22).
- Les tests navigateur (`browser.test.mjs`, `robustness.test.mjs`, `course-pages.test.mjs`,
  `contrast.test.mjs`) nécessitent `playwright-core` **et** un navigateur Chromium :

  ```bash
  npm i -D playwright-core
  npx playwright install chromium
  ```

- Si `playwright-core` n'est pas installé dans le projet, indiquez où il se trouve avec
  `PLAYWRIGHT_CORE_PATH` (dossier du paquet, ou fichier `index.mjs`/`index.js`), et le
  binaire Chromium avec `CHROMIUM_PATH` :

  ```bash
  PLAYWRIGHT_CORE_PATH=/chemin/vers/node_modules/playwright-core \
  CHROMIUM_PATH=/chemin/vers/chrome-linux64/chrome \
  VPS_BASE_URL=http://localhost:8099/index.html node tests/course-pages.test.mjs
  ```

  Aucune dépendance n'est ajoutée à l'application : ces variables ne concernent que les tests.

## 1. Contrôles statiques

```bash
bash tests/static-checks.sh
```

Vérifie : validité du JSON, 12 modules, identifiants uniques, chemins `cours/`,
synthaxe ESM des modules JavaScript, liens internes de `index.html`, absence de
références vers des pages de cours dans le socle, absence de secrets, présence des
fichiers attendus.

## 2. Tests unitaires (sans navigateur)

```bash
node tests/unit.test.mjs
```

Utilise un **shim DOM minimal** (`window.localStorage`, `document`, `CustomEvent`)
pour tester la logique pure : graphe d'imports ESM, recherche (accents, multi-termes),
états de module, voisins, progression locale. Ne nécessite **aucun navigateur**.

## 3. Tests navigateur

Démarrer d'abord un serveur HTTP à la racine du projet :

```bash
python3 -m http.server 8099
```

Puis, dans un autre terminal :

```bash
VPS_BASE_URL=http://localhost:8099/index.html node tests/browser.test.mjs
VPS_BASE_URL=http://localhost:8099/index.html node tests/robustness.test.mjs
```

- `browser.test.mjs` : chargement, console sans erreur, 12 modules, recherche,
  progression, copie, responsive (375/768/1280 px), accessibilité de base.
- `robustness.test.mjs` : JSON invalide, HTTP 500, identifiants en double,
  `localStorage` indisponible, page annoncée mais absente, `file://`.

## 4. Contrôle des pages de cours

```bash
VPS_BASE_URL=http://localhost:8099/index.html node tests/course-pages.test.mjs
```

Vérifie le tableau de bord et **chaque page de cours annoncée** dans
`assets/data/modules.json` (statut ≠ `planned`), sans rien coder en dur : la liste des
pages testées suit le référentiel. Par page : statut HTTP, titre, erreurs console,
exceptions JS, requêtes en échec, présence de `main` et `h1`, résolution de toutes les
ancres internes, existence de toutes les cibles `data-copy`, copie réelle dans le
presse-papiers, présence de la liste de contrôle, **absence de débordement horizontal
à 390 / 768 / 1280 px** (et aucun élément hors cadre sans conteneur défilable),
lisibilité sans JavaScript. Pour le tableau de bord : 12 cartes, un lien par page
annoncée, badges « Planifié » conformes, légende des 4 états, 5 statistiques,
recherche, progression initiale, débordement aux trois largeurs.

Les contrôles de contenu propres au module 01 (13 sections, 12 entrées de sommaire,
section self-hosting, parcours A/B, NAT/CGNAT/VPN/DNS dynamique, interdiction
d'exposer la base) ne s'appliquent qu'à lui et sont ignorés pour les autres modules.

Aucune action distante, aucune écriture : le test ne parle qu'au serveur local.

## 5. Contrôle de contraste WCAG

```bash
VPS_BASE_URL=http://localhost:8099/index.html node tests/contrast.test.mjs
```

Deux contrôles complémentaires :

1. **Analyse de la feuille de style** — toutes les règles qui posent à la fois une
   couleur de texte et un fond sont **dérivées des fichiers CSS** (aucune paire codée
   en dur). Cela couvre aussi les styles déclarés mais absents des pages actuelles.
2. **Contraste du rendu réel** — pour chaque élément porteur de texte du tableau de
   bord et de chaque page de cours annoncée, la couleur calculée et le **fond effectif**
   (héritage des ancêtres, composition des couches `alpha`) sont relevés dans le
   navigateur. C'est le contrôle des combinaisons réellement utilisées.

Seuil retenu : **WCAG 2.1 AA — 4,5:1** pour le texte normal, **3:1** pour le texte
large (≥ 24 px, ou ≥ 18,66 px en gras). Le niveau AAA n'est pas vérifié.

Limites de la méthode, à lire avant d'interpréter un PASS :

- L'analyse de la feuille applique 4,5:1 à **toutes** les paires : elle ne connaît pas
  la taille de police héritée et choisit donc le seuil le plus strict.
- Les éléments `.visually-hidden` (texte réservé aux lecteurs d'écran) sont exclus :
  ils ne sont pas visibles à l'écran.
- Les fonds en dégradé ou en image ne sont pas évalués (signalés, jamais comptés comme
  PASS) ; la feuille du projet n'en contient aucun.
- Seul l'état au repos est mesuré : les états `:hover`, `:focus` et `:active` ne sont
  pas évalués, pas plus que le contraste des éléments non textuels (WCAG 1.4.11).

## Variables d'environnement

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `VPS_BASE_URL` | `http://localhost:8099/index.html` | URL de la page testée (`/index.html` ou la racine : les deux formes sont acceptées) |
| `PLAYWRIGHT_CORE_PATH` | *(vide)* | Dossier du paquet `playwright-core`, ou son `index.mjs`/`index.js` |
| `CHROMIUM_PATH` | *(vide)* | Chemin explicite vers le binaire Chromium (sinon Playwright résout le sien) |

## Rappel

Les tests navigateur échouent si `index.html` est ouvert via `file://` : les modules
ESM et `fetch()` y sont bloqués. C'est un comportement **documenté**, pas un défaut.

## Les harnais savent échouer

Un contrôle qui ne peut pas échouer ne prouve rien. Les deux harnais ajoutés
(`course-pages.test.mjs`, `contrast.test.mjs`) ont donc été confrontés à des
dégradations volontaires, sur une **copie du projet hors dépôt** (aucun fichier du
dépôt n'a été touché) :

| Dégradation injectée dans la copie | Contrôle attendu | Résultat observé |
| --- | --- | --- |
| Jeton `--text-muted` rendu trop clair (`#b6c0cb`) | Contraste | FAIL (feuille **et** rendu), code `1` |
| Couleur d'un badge rendue insuffisante (`#7fbf9f` sur `#e3f5ea`) | Contraste | FAIL, code `1` |
| `id` d'une cible `data-copy` renommé | Pages de cours | FAIL « cible de copie morte », code `1` |
| `body { min-width: 1200px }` | Pages de cours | FAIL débordement à 390 et 768 px — **pas** à 1280 px |
| Module planifié déclaré `drafted` sans fichier | Pages de cours | FAIL sur métadonnées, statut 404, liens et statistiques du tableau de bord |

Aucun plantage : les échecs sont rapportés sous forme de lignes `FAIL` et le code de
sortie vaut `1`.
