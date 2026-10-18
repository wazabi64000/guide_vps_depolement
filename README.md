# VPS Academy 2026

Support pédagogique statique pour apprendre à **administrer, déployer et sécuriser un serveur Debian 13** — sur un **VPS** ou **à domicile** —, héberger **trois applications indépendantes** (React + Express, PHP + PDO, Python + FastAPI) et les exploiter (Nginx, HTTPS, Git, CI/CD, sauvegardes, supervision).

> ⚠️ **Documentation de documentation.** Les adresses IP, noms de domaine, mots de passe et clés ne figurent pas dans ce dépôt : ce sont des paramètres d'environnement fournis par l'apprenant. Aucun secret ne doit être ajouté ici.

## Objectif du projet

Produire un cours en **12 modules** (plus une page d'accueil `index.html`), consultable directement dans un navigateur, **sans backend** et **sans framework frontend**.

## Structure

```text
guide_vps_depolement/
├── index.html                     # accueil / tableau de bord (hors 12 pages)
├── assets/
│   ├── css/
│   │   ├── main.css               # jetons + base
│   │   ├── layout.css             # structure de page
│   │   └── components.css         # cartes, badges, alertes, progression
│   ├── js/
│   │   ├── app.js                 # initialisation de l'interface
│   │   ├── navigation.js          # affichage des modules et navigation
│   │   ├── search.js              # recherche dans les métadonnées
│   │   └── progress.js            # progression locale (localStorage)
│   └── data/
│       └── modules.json           # plan des 12 modules (source de vérité)
├── cours/                         # 12 pages de cours (module 01 livré ; les suivants, module par module)
├── tests/                         # harnais de validation (statiques, unitaires, navigateur, robustesse)
│   ├── README.md
│   ├── static-checks.sh
│   ├── unit.test.mjs
│   ├── browser.test.mjs
│   └── robustness.test.mjs
└── docs/
    ├── CADRAGE.md                 # cadrage (historique + décisions validées)
    ├── ARCHITECTURE.md            # référentiel technique unique
    ├── SOURCES.md                 # catalogue documentaire + statuts de vérification
    ├── PROGRESS.md                # suivi de production
    └── VALIDATION.md              # tests réellement exécutés
```

## Lancement local

Les métadonnées sont chargées par `fetch()`. Le site **doit** donc être servi en **HTTP** : ouvrir `index.html` par un double-clic (`file://`) empêche le chargement de `modules.json` (et bloque les modules ESM).

```bash
# depuis la racine du projet
python3 -m http.server 8080
# puis ouvrir http://localhost:8080/
```

## État actuel du site

| Élément | État |
| --- | --- |
| `index.html` (accueil) | ✅ Fonctionnel |
| `modules.json` (12 modules) | ✅ Présent, validé |
| Navigation, recherche, progression locale | ✅ Opérationnels |
| Pages de cours (`cours/module-01…module-12`) | ✅ **Les 12 pages existent** (statut `drafted`) |
| Contenu pédagogique des modules | ✅ **Rédigé de A à Z** — **validation humaine restante** |

> Le parcours est complet : 12 modules, 12 pages. Aucun module n'est encore à l'état `validated` —
> c'est à vous de le faire après relecture (le site ne s'auto-valide pas).

## États d'un module

Le tableau de bord distingue **quatre états** et n'accorde **jamais** de lien vers une page inexistante :

| Badge | Signification |
| --- | --- |
| **Planifié** | Le module est au programme, aucune page n'existe. |
| **Page disponible** | Le fichier de la page existe réellement (vérifié par requête HTTP). |
| **Rédigé** | Le module est entièrement rédigé. |
| **Validé** | Le module a passé son contrat de validation. |

Un module déclaré « page disponible » mais dont le fichier serait absent est **automatiquement ramené à « Planifié »**, sans lien, avec la mention « page annoncée mais introuvable ». Le badge « terminé (local) » relève, lui, uniquement de la progression enregistrée dans le navigateur — jamais du simple fait qu'un module figure dans `modules.json`.

## Tests

Les harnais sont **versionnés dans `tests/`**. Tous sont locaux et non destructifs.

```bash
bash tests/static-checks.sh                        # contrôles statiques
node tests/unit.test.mjs                           # unitaires (sans navigateur)

python3 -m http.server 8099                        # dans un autre terminal
PLAYWRIGHT_CORE_PATH=… VPS_BASE_URL=http://localhost:8099/index.html \
  node tests/browser.test.mjs                      # navigateur
PLAYWRIGHT_CORE_PATH=… VPS_BASE_URL=http://localhost:8099/index.html \
  node tests/robustness.test.mjs                   # robustesse
PLAYWRIGHT_CORE_PATH=… VPS_BASE_URL=http://localhost:8099/index.html \
  node tests/course-pages.test.mjs                 # pages de cours (12 pages)
PLAYWRIGHT_CORE_PATH=… VPS_BASE_URL=http://localhost:8099/index.html \
  node tests/contrast.test.mjs                     # contraste WCAG AA
```

Détail des prérequis et des variables : `tests/README.md`. Résultats réels mesurés : `docs/VALIDATION.md` (**471 contrôles persistés, 471 PASS, 0 FAIL** au 2026-10-17 : 94 statiques + 34 unitaires + 26 navigateur + 10 robustesse + 233 pages de cours + 74 contraste).

## Limites connues

- Le site ne fonctionne **pas** en `file://` (modules ESM + `fetch`).
- La progression est **locale au navigateur** : c'est une commodité d'interface, **pas** une certification.
- Les caractéristiques exactes de l'offre VPS doivent être relevées dans la console de l'hébergeur.
- Aucune commande n'a été exécutée sur un serveur réel : les commandes des modules sont toutes présentées comme des **procédures à exécuter sur votre machine**, jamais comme des sorties réelles observées. Aucune sortie de terminal n'est inventée.
- Les comptes SSH séparés **ne constituent pas une isolation forte** (pas d'isolation noyau) : une compromission de `root` atteint les trois applications.
- IPv6 est pris en compte dans la conception, mais sa disponibilité réelle dépend de l'offre : si elle manque, la limite doit être **documentée**, jamais supposée sans risque.

## Voir aussi

- `docs/CADRAGE.md` — périmètre, historique et décisions validées.
- `docs/ARCHITECTURE.md` — paramètres techniques de référence (ports, comptes, bases, services, rétention, supervision, contrôles d'accès).
- `docs/SOURCES.md` — sources documentaires officielles et leur statut de vérification.
- `tests/README.md` — exécution des harnais de validation.
