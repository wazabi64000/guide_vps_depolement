# VALIDATION — Tests réellement exécutés

> **Dernière exécution : 2026-10-17 (Prompt 7).** Environnement : Linux, Node v22.17.0, Python 3.10.12,
> Chromium (cache Playwright) piloté par `playwright-core`. Site servi par `python3 -m http.server 8099`
> depuis la racine du projet.
>
> **Aucun test non exécuté n'est déclaré PASS.** Les contrôles impossibles sont listés en § 8.
> **Les harnais sont versionnés** dans `tests/` : la validation est reproductible.
>
> **Conformité au Prompt 5 :** aucun test n'a été rendu « vert » artificiellement. Les assertions devenues
> fausses après le Prompt 4 ont été remplacées par des assertions **plus strictes**, et chaque remplacement
> est listé nommément en § 6 avec sa version avant et après.
>
> **Prompt 6 :** les deux défauts latents du socle CSS (C1, C2) ont été corrigés **dans le CSS commun** et
> les contournements posés dans la page ont été retirés. Les contrôles de page et de contraste, jusque-là
> ad hoc, sont désormais **versionnés dans `tests/`**. Détail en § 10.
>
> **Prompt 7 :** les **modules 02 à 12** ont été rédigés ; les six harnais, inchangés, ont été **réexécutés**
> sur les 12 pages. Résultat mesuré : **471 PASS / 0 FAIL** (§ 11). Un défaut réel a été trouvé et corrigé
> dans le module 03 (§ 11.2).
>
> **Après le Prompt 7 :** les **durées annoncées** (« 35 min ») ont été retirées du site ; les six harnais
> ont été **réexécutés** sur cet état : **471 PASS / 0 FAIL** (§ 12).

## 0. Totaux annoncés : ce qui est repris, ce qui est mesuré

| Prompt | Total annoncé | Statut |
| --- | --- | --- |
| 2 | « 68 PASS » | ❌ **Incohérent** avec sa propre décomposition (12 + 38 + 23 + 7 + 4 = 84) — non repris |
| 3 | 105 contrôles / 0 échec | ⚠️ **Chiffre déclaré au Prompt 3, jamais reproductible depuis `tests/`** : il ne correspond à aucune exécution des harnais versionnés (ni 108, ni 195, ni 471). Il n'est **pas** repris. Depuis le Prompt 7, `README.md` annonce le total **mesuré** (471) et non plus ce chiffre |
| 4 | — | ⚠️ **7 régressions de test non détectées** (voir § 1) |
| 5 | **108 contrôles persistés** (38 + 34 + 26 + 10) **+ 46 hors dépôt** | ✅ **Recomptés** à partir des sorties réelles des harnais |
| 6 | **195 contrôles persistés** (38 + 34 + 26 + 10 + 57 + 30) | ✅ **Recomptés** à partir des sorties réelles des six harnais (§ 10) |
| 7 | **471 contrôles persistés** (94 + 34 + 26 + 10 + 233 + 74) | ✅ **Recomptés** à partir des sorties réelles des six harnais, sur les **12 pages** (§ 11) |

**Règle appliquée ici :** un chiffre n'est écrit que s'il a été **produit par une exécution**, ou
s'il est explicitement présenté comme un chiffre *déclaré ailleurs* et non revérifié. C'est pourquoi
le « 105 » du Prompt 3 reste attribué à `README.md` et n'est pas utilisé comme base de calcul.

## 1. Point de départ du Prompt 5 : régressions héritées du Prompt 4

Avant toute modification du Prompt 5, les quatre harnais ont été exécutés sur l'état du dépôt laissé par
le Prompt 4 (module 01 passé à `drafted`). **7 contrôles échouaient** — tous dus à des assertions figées
sur l'hypothèse « les 12 modules sont planifiés », hypothèse devenue fausse dès qu'une page existe.

| Harnais | Résultat au point de départ | Contrôles en échec |
| --- | --- | --- |
| `static-checks.sh` | 32 PASS / **1 FAIL** | `statut 'planned' partout` |
| `unit.test.mjs` | 31 PASS / **2 FAIL** | `'planned' → badge « Planifié »` (utilisait `modules[0]`) ; `verifyPages … → ensemble vide` (interrogeait le module 01) |
| `browser.test.mjs` | 21 PASS / **4 FAIL** | `aucune requête en échec` (artefact `HEAD`) ; `aucun lien factice` ; `12 badges « Planifié »` ; `0 page disponible sur 12` |
| `robustness.test.mjs` | 10 PASS / 0 FAIL | — |

Ces échecs sont **des défauts de test, pas des défauts du socle** : le socle se comportait conformément
au modèle d'état à 4 niveaux documenté. Ils ont été corrigés en rendant les assertions **dérivées du
référentiel** au lieu d'être figées.

## 2. Contrôles statiques — `bash tests/static-checks.sh`

**38 PASS / 0 FAIL** (« RÉSULTAT : tout est PASS »).

| Groupe | Contenu | Résultat |
| --- | --- | --- |
| JSON | parse sans erreur, 12 modules, identifiants uniques, chemins `cours/`, **statuts appartenant aux 4 états prévus**, 9 champs requis | ✅ PASS (6 contrôles) |
| Syntaxe | `node --check` sur les 4 modules ESM copiés en `.mjs` | ✅ PASS (4 contrôles) |
| Liens | liens internes de `index.html` résolus (CSS, JS), URI `data:` ignorées | ✅ PASS |
| Socle | aucune référence à une page de cours dans HTML/CSS/JS du socle | ✅ PASS |
| Secrets | aucun motif `password`, `PRIVATE KEY`, `api_key` | ✅ PASS |
| Présence | 15 fichiers du socle + documentation présents | ✅ PASS (15 contrôles) |
| **Pages de cours (nouveau Prompt 5)** | page annoncée présente ; **ancres internes résolues** ; **cibles de copie existantes** ; **aucun port de base ou d'administration publié dans un bloc copiable** ; **adresses IPv4 limitées aux plages réservées ou privées** | ✅ PASS (6 contrôles) |

> **Nouveauté Prompt 5.** Les pages de cours n'étaient couvertes par **aucun** contrôle statique avant ce
> prompt. Le groupe 7 comble ce trou. Le contrôle d'adresses refuse toute IPv4 hors `0/8`, `10/8`,
> `127/8`, `172.16/12`, `192.168/16`, `192.0.2/24`, `198.51.100/24`, `203.0.113/24`, `100.64/10` (RFC 5737,
> RFC 6598) : il garantit mécaniquement qu'**aucune adresse réelle n'est inventée** dans un exemple.

## 3. Tests unitaires — `node tests/unit.test.mjs`

**34 PASS / 0 FAIL** (contre 31 PASS / 2 FAIL au point de départ). Shim DOM minimal, aucun navigateur requis.

| Domaine | Cas testés | Résultat |
| --- | --- | --- |
| Graphe d'imports ESM | `app.js` tire navigation/search/progress sans erreur | ✅ |
| Métadonnées | 12 modules, identifiants uniques, chemins `cours/`, **statuts dans les 4 états prévus** | ✅ (4) |
| Recherche | `normalize` (accents) ; `ssh`→03 ; `mariadb`→05 ; `securite`→03 ; `reseau`→04 ; `deploiement`→06 ; vide→12 ; absurde→0 ; `api python`→06 | ✅ (9) |
| États | `planned`→« Planifié » ; `published`→« Page disponible » + lien autorisé ; `drafted`→« Rédigé » ; `validated`→« Validé » ; **page annoncée mais absente → non disponible et signalée** ; **`verifyPages` sur des modules planifiés → ensemble vide, aucune requête** | ✅ (7) |
| Navigation | `neighbours` : 06→05/07 ; 01 sans précédent ; 12 sans suivant | ✅ |
| Progression locale | 0 initial ; marquage ; persistance `localStorage` simulée ; `toggle` ; `reset` | ✅ |
| Cohérence référentiel | `ARCHITECTURE.md` contient les 15 identités (bases, `migrate_*`, `deploy-*`, `svc-*`) ; rétention 5 versions ; IPv6 ; supervision `journald`/`logrotate` | ✅ (4) |

**Les 9 requêtes de recherche sont inchangées et passent toujours** après l'alignement des 12 intitulés de
modules : les mots-clés ciblés (`ssh`, `mariadb`, `securite`, `reseau`, `deploiement`, `api python`)
restent portés par les titres, descriptions, objectifs ou identifiants techniques.

## 4. Tests navigateur — `node tests/browser.test.mjs`

**26 PASS / 0 FAIL** (contre 21 PASS / 4 FAIL au point de départ). Chromium headless piloté, page servie en HTTP.

| Groupe | Contrôles | Résultat |
| --- | --- | --- |
| Chargement | titre, 0 erreur console, 0 exception JS, **0 requête en échec (hors sondes `HEAD`)**, **sondes `HEAD` au statut < 400** | ✅ (5) |
| Rendu | 12 cartes ; **1 lien — autant que de pages réellement disponibles dans `modules.json`** ; **11 badges « Planifié » — autant que de modules `planned` dans `modules.json`** ; légende des 4 états ; 0 message d'erreur | ✅ (5) |
| Statistiques | `12` ; **`1 / 12` — dérivé du catalogue** ; 5 statistiques présentées | ✅ (3) |
| Recherche | `ssh` réduit ; sans résultat → message ; effacer → 12 | ✅ (3) |
| Progression | libellé `0 / 12` ; bouton de réinitialisation ; 0 erreur après réinitialisation | ✅ (3) |
| Copie | bouton « copier » visible | ✅ (1) |
| Responsive | 0 débordement horizontal à 375, 768 et 1280 px | ✅ (3) |
| Accessibilité de base | lien d'évitement, `main#contenu`, label de recherche | ✅ (3) |

### 4.1 Pourquoi les sondes `HEAD` ne sont pas des échecs réseau

Pour vérifier qu'une page de cours existe réellement, le socle émet une requête `HEAD`. Chromium
déclenche un événement `requestfailed` avec `net::ERR_ABORTED` **après** avoir reçu une réponse
`200` : le corps vide n'étant jamais lu, la requête est « annulée » du point de vue réseau.

Ce n'est donc **pas** un échec. Comportement vérifié directement :

| Requête `fetch(url, { method: "HEAD" })` | `ok` | `status` |
| --- | --- | --- |
| page existante | `true` | 200 |
| page inexistante | `false` | 404 |

Le harnais distingue désormais les deux : les échecs de méthode non-`HEAD` restent éliminatoires, et le
statut des sondes `HEAD` est **asserté explicitement**. L'affirmation est ainsi plus forte qu'avant, pas plus faible.

## 5. Tests de la page de cours (harnais ajouté au Prompt 5)

> **État au Prompt 6 :** ce harnais ad hoc a été **remplacé et versionné** sous le nom
> `tests/course-pages.test.mjs` (§ 10). La description ci-dessous est conservée comme
> historique de l'état laissé par le Prompt 5.

Le contenu livré (la page de cours) n'était couvert par aucun test navigateur. Un harnais dédié a été
écrit et exécuté. Il vit hors du dépôt, en `/tmp/opencode/course_page.mjs` : il n'est **pas** persisté
au Prompt 5, la décision « versionner ou non les harnais » étant encore ouverte (point **O7** de
`docs/PROGRESS.md`). Son intégration à `tests/` est proposée en fin de rapport et reste à valider.

**41 PASS / 0 FAIL.** Points vérifiés :

| Famille | Contrôles | Résultat |
| --- | --- | --- |
| Chargement | statut 200, titre, 0 erreur console, 0 exception, 0 requête en échec | ✅ (5) |
| Structure | 12 entrées de sommaire, 13 sections, **chaque ancre du sommaire cible une section existante** | ✅ (3) |
| Contenu | section self-hosting, parcours A et B, notions CGNAT/NAT/VPN/DNS dynamique, interdiction d'exposer la base, problèmes courants, checklist finale | ✅ (7) |
| Progression | libellé initial, activation du bouton, passage à `1 / 12`, `aria-pressed`, `aria-valuenow=8`, inversion du libellé | ✅ (6) |
| Navigation | module suivant annoncé « à venir » sans lien, aucun lien vers une page inexistante, pas de bouton précédent pour le module 01 | ✅ (3) |
| Copie | contenu exact de la commande dans le presse-papiers, retour visuel du bouton | ✅ (2) |
| Cohérence tableau de bord | progression reprise, carte 01 avec lien réel et badge cohérent, carte 02 sans lien et badge « Planifié » | ✅ (6) |
| Responsive | 0 débordement à 390, 768 et 1280 px ; aucun élément hors cadre sans conteneur défilable | ✅ (4) |
| Sans JavaScript | 13 sections, ≥ 12 blocs de commandes, avertissement `noscript` | ✅ (3) |

### 5.1 Deux défauts réels détectés et corrigés sur la page

| # | Défaut mesuré | Cause | Correctif appliqué |
| --- | --- | --- | --- |
| D1 | **222 px de débordement horizontal** à 390 px (largeur du document : 612 px au lieu de 390) | Contournement `min-width: 0` insuffisant sur ce contenu : ce sont les `<li>` de `.checklist` qui débordaient | Contenu des `<li>` enveloppé dans un `<span>` (voir C2 dans `docs/PROGRESS.md`) |
| D2 | Tableau des notions illisible à 390 px : 3 colonnes compressées à ~100 px, un mot par ligne | Tableau à 3 colonnes sur une largeur de 358 px | Tableau ramené à 2 colonnes ; l'information de la 3ᵉ colonne est conservée dans la seconde |

Après correction : **largeur du document = 390 px à 390 px de fenêtre, 0 débordement**. Le contrôle a été
répété à 320 px (0 débordement).

> **Ce que ces deux défauts ne sont pas.** Ils n'ont pas été découverts par lecture du code mais par
> **mesure** (comparaison `scrollWidth` / `clientWidth` puis identification de l'élément fautif).
> Les correctifs ont été appliqués dans la page, pas dans le CSS commun.

## 6. Assertions de test modifiées au Prompt 5 (liste exhaustive)

Aucune assertion n'a été supprimée sans remplacement plus strict. Chaque ligne indique l'état avant et après.

| Fichier | Avant | Après | Pourquoi c'est plus strict |
| --- | --- | --- | --- |
| `static-checks.sh` | `d.modules.every(m => m.status === "planned")` | `d.modules.every(m => ["planned","published","drafted","validated"].includes(m.status))` | Accepte les 4 états légitimes **et rejette toute valeur inconnue** ; l'ancienne version interdisait toute page, ce qui n'était pas l'intention |
| `unit.test.mjs` | `nav.moduleState(modules[0])` | `nav.moduleState({ id: "zz", status: "planned" })` | Teste l'état `planned` sur une donnée construite, plus sur le premier module du catalogue dont l'état évolue légitimement |
| `unit.test.mjs` | `ok("verifyPages sans module déclaré → ensemble vide", (await nav.verifyPages(modules)).size === 0)` | `ok("verifyPages n'interroge pas les modules planifiés → ensemble vide", (await nav.verifyPages(modules.filter(m => m.status === "planned"))).size === 0)` | Le nom dit maintenant ce qui est réellement vérifié : le filtre sur les modules non-`planned` |
| `unit.test.mjs` | *(nouveau)* | `ok("chaque statut appartient aux 4 états prévus", …)` | Contrôle ajouté, absent avant |
| `browser.test.mjs` | `ok("aucun lien factice dans la grille", … === 0)` | `ok(\`un lien par page disponible (${expectedAvailable})\`, … === expectedAvailable)` avec `expectedAvailable` calculé depuis `assets/data/modules.json` | Le nombre attendu n'est plus figé : **tout écart avec le référentiel échoue** |
| `browser.test.mjs` | `ok("12 badges « Planifié »", … === 12)` | `ok(\`badges « Planifié » conformes au catalogue (${expectedPlanned})\`, … === expectedPlanned)` | Idem : l'attente suit `modules.json` au lieu d'une constante |
| `browser.test.mjs` | `ok("0 page disponible sur 12", stats[1] === "0 / 12")` | `ok(\`${expectedAvailable} page(s) disponible(s) sur 12\`, stats[1] === \`${expectedAvailable} / 12\`)` | Idem |
| `browser.test.mjs` | `ok("aucune requête en échec", failedReq.length === 0)` où `failedReq` contenait **toutes** les requêtes échouées, sondes `HEAD` incluses | Filtre `f.method !== "HEAD"` **+** nouvelle assertion `sondes d'existence : statut HTTP < 400` | L'ancienne version échouait sur un artefact Chromium ; la nouvelle **vérifie réellement l'existence** via le statut HTTP, ce que l'ancienne ne faisait pas |
| `static-checks.sh` | *(aucune couverture des pages de cours)* | Groupe 7 : 6 contrôles sur `cours/*.html` | Couverture nouvelle, pas un assouplissement |

## 7. Robustesse, accessibilité et design

### 7.1 Robustesse — `node tests/robustness.test.mjs`

**10 PASS / 0 FAIL.** Fichier **non modifié** au Prompt 5.

| # | Scénario | Résultat |
| --- | --- | --- |
| R1 | `modules.json` invalide → message lisible | ✅ |
| R2 | JSON invalide → aucune exception non capturée | ✅ |
| R3 | Réponse HTTP 500 → message lisible | ✅ |
| R4 | Identifiants en double → message de validation | ✅ |
| R5 | `localStorage` indisponible → 12 modules affichés | ✅ |
| R6 | `localStorage` indisponible → mention « non persistée » | ✅ |
| R7 | `localStorage` indisponible → aucune exception | ✅ |
| R8 | Page annoncée mais fichier absent → aucun lien | ✅ |
| R9 | Page annoncée mais absente → badge ramené à « Planifié » | ✅ |
| R10 | Page annoncée mais absente → signalée « introuvable » | ✅ |

> Le scénario `file://` est exécuté en mode **informationnel** : il confirme le blocage des modules ESM.
> Ce n'est **pas un PASS** — c'est une limite documentée (§ 8).

### 7.2 Accessibilité et design

Les contrôles A1–A5 sont décrits ci-dessous. **A1 est désormais automatisé et versionné**
(`tests/contrast.test.mjs`, Prompt 6). **A2–A5 restent des vérifications par lecture ou par mesure ad hoc** :
ils ne sont pas exécutés par un script du dépôt et ne doivent pas être confondus avec un test automatisé.

| # | Contrôle | Méthode réelle au Prompt 5 | Résultat |
| --- | --- | --- | --- |
| A1 | Contrastes texte/fond ≥ 4,5:1 — **21 paires dérivées du CSS** et **653 textes réellement rendus** (173 sur le tableau de bord + 480 sur le module 01) | **`node tests/contrast.test.mjs`** — harnais **versionné au Prompt 6** ; seuil WCAG 2.1 AA : 4,5:1 (texte normal) et 3:1 (texte large ≥ 24 px ou ≥ 18,66 px gras) | ✅ PASS — plancher **4,63:1** (marque du site et boutons primaires) |
| A2 | `prefers-reduced-motion` respecté | Lecture du CSS : `main.css:146` neutralise animations et transitions et force `scroll-behavior: auto` | ✅ PASS |
| A3 | Focus visible | Lecture du CSS : `main.css:115` (`:focus-visible` + anneau) et `components.css:158` | ✅ PASS |
| A4 | Captures desktop (1280) et mobile (390, 380) réinspectées après modification | Captures Playwright réelles, après neutralisation du défilement animé | ✅ PASS (page de cours + tableau de bord) |
| A5 | Balises HTML équilibrées de la page de cours | Analyse Python (comptage des balises, pile, unicité des `id`) | ✅ PASS (0 erreur, pile vide, 0 `id` en double) |
| A6 | Navigation clavier complète de bout en bout | ⛔ Non outillée | ⛔ **NON EXÉCUTÉ** — voir § 8 |

> **Précision sur A1 (Prompt 6).** L'ancienne version listait 11 paires choisies à la main. Le contrôle
> versionné ne choisit plus aucune couleur : il **dérive les paires du CSS** (21 règles posant à la fois
> une couleur et un fond) et mesure en plus **chaque élément de texte réellement rendu** dans le
> navigateur, fond effectif inclus (héritage des ancêtres et composition des couches `alpha`). La valeur
> la plus basse est **4,63:1** — au-dessus du seuil AA de 4,5:1 pour du texte normal, donc **aucune marge
> confortable**. Toute modification future des jetons de couleur doit repasser ce contrôle.
>
> Les limites de la méthode (états `:hover`/`:focus` non évalués, texte `.visually-hidden` exclu, fonds
> en image non mesurés, AAA non vérifié) sont documentées dans `tests/README.md` § 5.

## 8. Tests NON exécutés (explicite)

| Contrôle | Raison | Méthode proposée |
| --- | --- | --- |
| Exécution sur un VPS Debian 13 réel | Interdit par le périmètre | Aux modules concernés, après validation |
| Ouverture de ports sur une box ou un VPS | Interdit par le périmètre | Jamais dans le cadre du cours |
| 10 contrôles d'accès Q1–Q10 | Interdit par le périmètre — le VPS ne doit pas être modifié | Aux modules 03, 05, 06, 07 |
| Vérification du lien `uvicorn.org` | Domaine non résolu depuis l'environnement (**2 échecs** : Prompts 2 et 3 ; non retesté au Prompt 5) | Recontrôler avec un accès réseau standard |
| Manuels `systemd` (freedesktop.org) | Réponse **HTTP 418** (blocage anti-bot) | Consulter dans un navigateur standard ; compléter par `man systemd.*` |
| Validation W3C/HTML stricte (`xmllint`, `tidy`) | Outils absents de l'environnement | Validateur W3C en ligne ou `tidy` |
| Navigation clavier exhaustive de la page de cours | Non outillée dans l'environnement | Test manuel assisté, ou harnais dédié |
| Rendu Firefox / Safari | Non exécuté (seul Chromium disponible) | Test multi-navigateurs ultérieur |
| Rendu sur écran physique (téléphone) | Aucun appareil disponible | Test manuel |
| Ouverture directe via `file://` | Les modules ESM et `fetch()` sont bloqués par le navigateur | Servir en HTTP (comportement documenté) |
| Contraste des états `:hover`, `:focus`, `:active` | Le harnais `contrast.test.mjs` mesure l'état au repos | Harnais dédié simulant le survol et le focus |
| Contraste des éléments **non textuels** (WCAG 1.4.11 : bordures, icônes, anneau de focus) | Hors du seuil textuel implémenté | Outil dédié ou vérification manuelle |
| Niveau WCAG **AAA** (7:1) | Le projet vise AA | Contrôle distinct si le niveau change |

## 9. Synthèse

### 9.1 Contrôles persistés dans `tests/` (instantané Prompt 6)

> **Ce tableau décrit l'état au Prompt 6** (une seule page de cours `drafted`). Les compteurs des harnais
> `static-checks`, `course-pages` et `contrast` **augmentent mécaniquement** à chaque page déclarée dans
> `modules.json` : ce sont des contrôles **par page**. Les chiffres à jour après rédaction des 11 pages
> restantes sont en **§ 11.1**.

| Famille | Exécutés | PASS | FAIL |
| --- | --- | --- | --- |
| Statiques (`static-checks.sh`) | 38 | 38 | 0 |
| Unitaires (`unit.test.mjs`) | 34 | 34 | 0 |
| Navigateur (`browser.test.mjs`) | 26 | 26 | 0 |
| Robustesse (`robustness.test.mjs`) | 10 | 10 | 0 |
| Pages de cours (`course-pages.test.mjs`) | 57 | 57 | 0 |
| Contraste WCAG (`contrast.test.mjs`) | 30 | 30 | 0 |
| **Sous-total persisté (Prompt 6)** | **195** | **195** | **0** |

Somme vérifiée : 38 + 34 + 26 + 10 + 57 + 30 = **195** (contre **108** au Prompt 5).

### 9.1 bis Ce qui reste hors dépôt

Au Prompt 5, 46 contrôles étaient ad hoc (41 page de cours + 5 accessibilité). Au Prompt 6, le harnais de
page est **devenu un test versionné** (`course-pages.test.mjs`, 57 contrôles) et le contraste est
désormais automatisé (`contrast.test.mjs`, 30 contrôles). Seuls **A2–A5** (§ 7.2) restent des
vérifications par lecture ou mesure ad hoc, et **A6** (navigation clavier) reste non exécuté.

### 9.2 Contrôles hors dépôt au Prompt 5 (historique)

| Famille | Exécutés | PASS | FAIL |
| --- | --- | --- | --- |
| Page de cours (`/tmp/opencode/course_page.mjs`) | 41 | 41 | 0 |
| Accessibilité et design (A1–A5, § 7.2) | 5 | 5 | 0 |
| **Sous-total hors dépôt** | **46** | **46** | **0** |

> **État au Prompt 6 :** le harnais de page est devenu `tests/course-pages.test.mjs` (57 contrôles
> persistés) et le contrôle de contraste `tests/contrast.test.mjs` (30 contrôles persistés). Le tableau
> ci-dessus décrit l'état laissé par le Prompt 5.

**Total exécuté au Prompt 5 : 108 persistés + 46 ad hoc = 154 contrôles, 154 PASS, 0 FAIL.**
**Total exécuté au Prompt 6 : 195 persistés, 195 PASS, 0 FAIL** (§ 10.4).
**Total exécuté au Prompt 7 : 471 persistés, 471 PASS, 0 FAIL** (§ 11.1).

### 9.3 Écarts réels entre l'état laissé par le Prompt 4 et l'état Prompt 5

| Harnais | Point de départ | Après corrections | Delta |
| --- | --- | --- | --- |
| `static-checks.sh` | 32 PASS / 1 FAIL | 38 PASS / 0 FAIL | **+6 contrôles** (groupe 7) et 1 régression corrigée |
| `unit.test.mjs` | 31 PASS / 2 FAIL | 34 PASS / 0 FAIL | **+3 contrôles** et 2 régressions corrigées |
| `browser.test.mjs` | 21 PASS / 4 FAIL | 26 PASS / 0 FAIL | **+5 contrôles** et 4 régressions corrigées |
| `robustness.test.mjs` | 10 PASS / 0 FAIL | 10 PASS / 0 FAIL | inchangé (fichier non touché) |
| **Total persisté** | **94 PASS / 7 FAIL** | **108 PASS / 0 FAIL** | **+14 contrôles, 7 régressions corrigées** |

> Le total persisté de départ (94) est la somme des sorties réellement observées avant modification :
> 32 + 31 + 21 + 10 = 94. Le total final est 108. Les deux sont mesurés, pas estimés.

### 9.4 Points saillants

- **108 contrôles persistés, 108 PASS, 0 FAIL** au Prompt 5, **195** au Prompt 6, **471** au Prompt 7
  (§ 11.1) ; **7 régressions** de test corrigées, sans qu'aucune assertion ait été affaiblie
  (liste exhaustive en § 6).
- 9 contrôles **non exécutés**, listés en § 8, aucun déclaré PASS.
- Aucun secret dans le dépôt, aucune dépendance ajoutée à l'application, aucun lien mort, aucun faux lien
  vers une page inexistante.
- **Couverture nouvelle :** les pages de cours n'étaient couvertes par aucun contrôle avant le Prompt 5
  (groupe 7 statique + 41 contrôles navigateur ad hoc).
- Limite principale : **le socle web et la page de cours sont testés ; le serveur ne l'est pas** — aucune
  commande n'a été exécutée sur un VPS, une box ou un serveur à domicile.

## 10. Prompt 6 — stabilisation CSS et contrôles reproductibles

### 10.1 Deux défauts latents du socle, corrigés dans le CSS commun

Au Prompt 5, faute d'autorisation, les deux défauts C1 et C2 avaient été contournés **dans la page**.
Le Prompt 6 autorise la correction à la source.

| Réf. | Fichier | Avant | Après |
| --- | --- | --- | --- |
| **C1** | `assets/css/layout.css:109` | `.layout { display: grid; grid-template-columns: 1fr }` sans `min-width: 0` sur ses enfants : la piste conservait la taille `min-content` du contenu | Ajout de `.layout > * { min-width: 0; }` (avec commentaire expliquant pourquoi) |
| **C2** | `assets/css/components.css:243` | `.checklist li { display: flex; gap: …; align-items: flex-start }` | Ajout de **`flex-wrap: wrap`** ; le reste de la règle est inchangé |

**Mesures ayant motivé ces deux lignes** (Chromium, page du module 01) :

| Configuration | Débordement à 390 px | Largeur du premier `.checklist li` |
| --- | --- | --- |
| État livré au Prompt 5 (contournements dans la page) | 0 px | 358 px |
| Contournements retirés, **aucun correctif du socle** | **373 px** | **747 px** (largeur `max-content`) |
| Correctif C1 seul | 0 px | 358 px |
| Correctif C2 seul (`flex-wrap` sans C1) | **373 px — non corrigé** | 747 px |
| C1 + C2 | 0 px | 358 px |

> **Pourquoi `flex-wrap` et pas autre chose.** `flex-wrap: wrap` **seul ne corrige pas** le débordement :
> c'est C1 qui le supprime. C2 est retenu parce qu'il est la correction demandée, qu'il ne dégrade rien,
> et qu'il rend la liste tolérante aux contenus multiples. Le contenu de chaque puce reste un **enfant
> unique** (un `<span>`), qui se replie à l'intérieur de lui-même : c'est pourquoi le rendu est identique.

### 10.2 Contournements retirés de `cours/module-01-preparation.html`

| Retiré | Justification |
| --- | --- |
| `style="min-width:0"` sur `<aside class="layout__aside">` | Devenu inutile : C1 porte désormais le correctif |
| `style="min-width:0"` sur `<div class="layout__main">` | Idem |
| Ancienne note technique décrivant le défaut comme « non corrigé » | Remplacée par une note décrivant le correctif porté par le socle |

**Ce qui n'a pas été retiré :** les 44 enveloppes `<li><span>…</span></li>`. Elles ne sont **pas** un
contournement CSS en ligne, et elles restent nécessaires au rendu actuel puisque `.checklist li` est un
conteneur flex (voir 10.1). Aucun test, aucune ancre, aucun `id` n'y fait référence.

### 10.3 Preuve de non-régression du rendu

Comparaison mesurée « avant corrections » / « après corrections » sur la page du module 01, dans le même
navigateur (l'état « avant » est reconstitué en annulant C1 et C2 et en rétablissant les deux
contournements en ligne) :

| Largeur | Hauteur du document (avant → après) | Débordement (avant → après) | Hauteurs des 44 puces |
| --- | --- | --- | --- |
| 390 px | 21 252 px → 21 252 px | 0 px → 0 px | **identiques** |
| 768 px | 14 790 px → 14 790 px | 0 px → 0 px | **identiques** |
| 1280 px | 13 961 px → 13 961 px | 0 px → 0 px | **identiques** |

Le rendu est inchangé ; seul le débordement **potentiel** (373 px mesurés sans correctif) disparaît.

### 10.4 Les six harnais, exécutés (résultats observés)

Commande préalable, dans un autre terminal : `python3 -m http.server 8099`.

| # | Commande | Résultat observé | Code de sortie |
| --- | --- | --- | --- |
| 1 | `bash tests/static-checks.sh` | `RÉSULTAT : tout est PASS` — 38 PASS / 0 FAIL | `0` |
| 2 | `node tests/unit.test.mjs` | 34 PASS / 0 FAIL | `0` |
| 3 | `VPS_BASE_URL=… node tests/browser.test.mjs` | 26 PASS / 0 FAIL | `0` |
| 4 | `VPS_BASE_URL=… node tests/robustness.test.mjs` | 10 PASS / 0 FAIL | `0` |
| 5 | `VPS_BASE_URL=… node tests/course-pages.test.mjs` | 57 PASS / 0 FAIL | `0` |
| 6 | `VPS_BASE_URL=… node tests/contrast.test.mjs` | 30 PASS / 0 FAIL | `0` |

Variables utilisées : `PLAYWRIGHT_CORE_PATH`, `CHROMIUM_PATH`, `VPS_BASE_URL` (voir `tests/README.md`).
**Total persisté : 38 + 34 + 26 + 10 + 57 + 30 = 195 contrôles, 195 PASS, 0 FAIL.**

### 10.5 Contrôle de contraste : ce qui a réellement été mesuré

| Contrôle | Volume | Résultat |
| --- | --- | --- |
| Paires dérivées du CSS (couleur **et** fond dans la même règle) | 21 paires | 21 PASS — minimum **4,63:1** |
| Paires non évaluables depuis la feuille (fond semi-transparent) | 1 (`.code-block__copy`) | Signalée SKIP, **couverte par le rendu** |
| Textes rendus mesurés — tableau de bord | 173 | 0 insuffisant, minimum 4,63:1 |
| Textes rendus mesurés — module 01 | 480 | 0 insuffisant, minimum 4,63:1 |
| Éléments volontairement exclus | 8 (2 + 6) | Texte `.visually-hidden`, éléments de taille nulle |

Le minimum de **4,63:1** correspond à la marque du site (`.brand__mark`) et aux boutons primaires
(`.btn`) : `#ffffff` sur `#1f6feb`. Marge faible — tout changement de jeton doit repasser ce contrôle.

### 10.6 Les harnais sont capables d'échouer (validation du contrôle)

Un test qui ne peut pas échouer ne prouve rien. Les deux harnais ajoutés ont été exécutés contre une
**copie du projet hors dépôt** dans laquelle des dégradations ont été injectées. Aucun fichier du dépôt
n'a été touché.

| Dégradation injectée | Harnais | Résultat observé | Code |
| --- | --- | --- | --- |
| `--text-muted` → `#b6c0cb` | `contrast.test.mjs` | FAIL sur la feuille **et** sur le rendu (jusqu'à 90 textes insuffisants) | `1` |
| `.badge--validated` → `#7fbf9f` sur `#e3f5ea` | `contrast.test.mjs` | FAIL (1,88:1) | `1` |
| `id` d'une cible `data-copy` renommé | `course-pages.test.mjs` | FAIL « cible de copie morte » + échec de la copie | `1` |
| `body { min-width: 1200px }` | `course-pages.test.mjs` | FAIL débordement à 390 px (810 px) et 768 px (432 px) ; **pas** à 1280 px | `1` |
| Module 02 déclaré `drafted` sans fichier | `course-pages.test.mjs` | FAIL sur les métadonnées, le statut 404, les liens et les statistiques du tableau de bord (45 PASS / 18 FAIL) | `1` |

Aucun de ces échecs n'a provoqué de plantage : ils sont rapportés ligne par ligne. Les harnais ont été
durcis à cette occasion (délai d'attente borné, capture des erreurs inattendues en `FAIL`).

### 10.7 Contrôles manuels du Prompt 6 (non automatisés)

| Contrôle | Méthode | Résultat observé |
| --- | --- | --- |
| Débordement horizontal 390 / 768 / 1280 px | Mesure `scrollWidth − clientWidth` + recherche de l'élément fautif | 0 px sur le module 01 **et** sur le tableau de bord |
| Erreurs console | Écoute des événements `console` et `pageerror` | 0 |
| Liens et ancres | Résolution de chaque `a[href^="#"]` dans le DOM | Toutes résolues |
| 12 modules exactement | Lecture de `assets/data/modules.json` | 12 (1 `drafted`, 11 `planned`) |
| Checklist, module 01, tableau de bord | Inspection du rendu | Conformes, aucune régression |

Ces contrôles sont **rejoués automatiquement** par `course-pages.test.mjs` (§ 10.4), mais le relevé
ci-dessus provient d'exécutions distinctes : il ne s'agit pas d'une simple relecture du test.

## 11. Prompt 7 — rédaction des modules 02 à 12 et réexécution complète

Aucun harnais n'a été modifié au Prompt 7. Les six harnais étaient **génériques** (ils itèrent sur les pages
déclarées dans `assets/data/modules.json`) : ils couvrent donc automatiquement les 11 nouvelles pages.

### 11.1 Les six harnais réexécutés, sur les 12 pages

Commande préalable, dans un autre terminal : `python3 -m http.server 8099` (racine du projet).
Variables : `PLAYWRIGHT_CORE_PATH`, `CHROMIUM_PATH`, `VPS_BASE_URL` (voir `tests/README.md`).

| # | Commande | Résultat observé | Code de sortie |
| --- | --- | --- | --- |
| 1 | `bash tests/static-checks.sh` | `RÉSULTAT : tout est PASS` — 94 lignes PASS, aucune ligne FAIL | `0` |
| 2 | `node tests/unit.test.mjs` | 34 PASS / 0 FAIL | `0` |
| 3 | `VPS_BASE_URL=… node tests/browser.test.mjs` | 26 PASS / 0 FAIL | `0` |
| 4 | `VPS_BASE_URL=… node tests/robustness.test.mjs` | 10 PASS / 0 FAIL | `0` |
| 5 | `VPS_BASE_URL=… node tests/course-pages.test.mjs` | 233 PASS / 0 FAIL | `0` |
| 6 | `VPS_BASE_URL=… node tests/contrast.test.mjs` | 74 PASS / 0 FAIL | `0` |

**Total persisté mesuré : 94 + 34 + 26 + 10 + 233 + 74 = 471 contrôles, 471 PASS, 0 FAIL.**

| Famille | Prompt 6 | Prompt 7 | Écart | Cause de l'écart |
| --- | --- | --- | --- | --- |
| Statiques | 38 | **94** | +56 | Groupe 7 : 5 contrôles **par page** × 12 pages au lieu de 1 |
| Unitaires | 34 | 34 | 0 | Aucune page impliquée |
| Navigateur | 26 | 26 | 0 | Le tableau de bord est compté une fois : les assertions suivent déjà `modules.json` |
| Robustesse | 10 | 10 | 0 | Aucune page impliquée |
| Pages de cours | 57 | **233** | +176 | Contrôles génériques **par page** : de 1 à 12 pages exercées |
| Contraste | 30 | **74** | +44 | Le rendu de **chaque** page déclarée est balayé |
| **Total** | **195** | **471** | **+276** | Aucun contrôle n'a été ajouté : c'est le **périmètre par page** qui a grandi |

> **Le tableau de bord est conforme :** les assertions « un lien par page disponible », « badges Planifié
> conformes au catalogue » et « 12 page(s) disponible(s) sur 12 » passent avec **12 modules `drafted`** —
> elles sont dérivées du référentiel, pas figées.

### 11.2 Un défaut réel trouvé par la mesure, puis corrigé (module 03)

Le premier passage a produit **232 PASS / 2 FAIL** : deux occurrences du même défaut sur
`cours/module-03-ssh-root-parefeu.html`.

| Mesure | Avant correction | Après correction |
| --- | --- | --- |
| Débordement horizontal du document à 390 px | **8 px** | **0 px** |
| Élément non défilable en débordement | `<p>` d'un `.callout--ok` — `scrollWidth` 362 px pour 322 px de contenu, soit **+40 px** | aucun |
| Cause | Jeton **insécable** de 42 caractères dans un `<code>` : `'permitrootlogin|passwordauthentication'` — un tout petit peu plus large que la colonne de texte à 390 px | — |
| Correctif | La commande longue a été **décomposée en deux jetons courts** (`permitrootlogin` et `passwordauthentication`), qui peuvent se replier | — |

**Méthode de localisation** (ce n'est pas une lecture de code) : parcours de **tous** les éléments à
390 px, relevé de ceux dont `scrollWidth − clientWidth > 1` **et** dont `overflow-x` est `visible`, en
remontant du `<p>` fautif jusqu'à `main`. Les `<pre>` et `.table-wrap` n'étaient pas coupables : ils
défilent (`overflow-x: auto`) et sont donc sans effet sur la largeur du document.

**Contrôle de non-régression après correction**, sur les 12 pages à 390 px :

| Page | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Débordement | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px | 0 px |
| Élément non défilable en débordement | aucun | aucun | aucun | aucun | aucun | aucun | aucun | aucun | aucun | aucun | aucun | aucun |

La suite `course-pages.test.mjs` repasse alors de 232/2 à **233 PASS / 0 FAIL**.

### 11.3 Audit des références de sources (exécuté)

Chaque ligne de la dernière colonne du tableau « Sources » des 12 pages a été comparée à `docs/SOURCES.md`.

| Contrôle | Résultat mesuré |
| --- | --- |
| Sources **déclarées** dans `docs/SOURCES.md` | **35** |
| Identifiants **cités** dans les pages | **32** |
| Références **inconnues** (citées mais non déclarées) | **0** |
| Identifiants déclarés **non cités** par une page | **3** (`S5b`, `S5d`, `S8b`) — présents au sources, simplement non repris dans un module |

> Les références inventées (`S5`, `S17b`) qui figuraient dans un premier jet du module 02 ont été retirées
> avant cette exécution : elles n'apparaissent plus, ni dans le relevé ci-dessus, ni dans le dépôt.

### 11.4 Ce que ces exécutions ne couvrent pas

- **Aucune commande n'a été exécutée sur un VPS.** Les 12 pages sont testées **comme pages web** (HTML, CSS,
  JS, ancres, copie, contraste, responsive) : **pas** comme procédures validées sur une machine Debian 13.
- Le rendu est mesuré dans **Chromium uniquement** (pas Firefox, pas Safari, pas d'appareil physique).
- Les contrôles de contraste ne couvrent ni `:hover`/`:focus`/`:active`, ni les éléments non textuels
  (WCAG 1.4.11), ni le niveau AAA — voir § 8.
- Les faits techniques **propres à Debian 13** (versions réelles des paquets, disponibilité des domaines des
  sources de niveau B et C) restent **non vérifiés** depuis cet environnement : ils sont signalés dans les
  pages concernées (§ 8).

## 12. Suppression des durées annoncées, puis réexécution

Demande : retirer les temps exemples (« 35 min »). Retirés aux quatre endroits où ils apparaissaient :
les 12 champs `"duration"` de `assets/data/modules.json`, le libellé `NN min` dans l'en-tête des 12 pages,
la puce « Environ 35 minutes. » des prérequis du module 01, et la ligne de rendu du tag de durée dans
`assets/js/navigation.js`.

### 12.1 Les six harnais réexécutés après suppression

| # | Commande | Résultat observé | Code de sortie |
| --- | --- | --- | --- |
| 1 | `bash tests/static-checks.sh` | `RÉSULTAT : tout est PASS` — 94 lignes PASS, aucune ligne FAIL | `0` |
| 2 | `node tests/unit.test.mjs` | 34 PASS / 0 FAIL | `0` |
| 3 | `VPS_BASE_URL=… node tests/browser.test.mjs` | 26 PASS / 0 FAIL | `0` |
| 4 | `VPS_BASE_URL=… node tests/robustness.test.mjs` | 10 PASS / 0 FAIL | `0` |
| 5 | `VPS_BASE_URL=… node tests/course-pages.test.mjs` | 233 PASS / 0 FAIL | `0` |
| 6 | `VPS_BASE_URL=… node tests/contrast.test.mjs` | 74 PASS / 0 FAIL | `0` |

**471 PASS / 0 FAIL**, identique à § 11.1 : la suppression des durées ne casse aucun contrôle. Aucun
harnais ne testait la durée (vérifié : `grep -rn "duration" tests/` ne renvoie rien avant **et** après).

### 12.2 Effet de bord mesuré sur les cartes, puis corrigé

| Mesure | Avant correctif | Après correctif |
| --- | --- | --- |
| Conteneurs `.module-card__meta` vides dans le DOM | **12 sur 12** | **0** |
| Hauteur d'une carte du tableau de bord (1280 px) | **331,75 px** | **315,75 px** |
| Cause | conteneur vide : `height: 0` mais `margin-top: 8px` **et** `gap: 8px` du conteneur parent → 16 px de blanc | — |
| Correctif | `if (meta.childElementCount > 0) article.appendChild(meta);` | — |

Le cas « page annoncée mais absente » reste couvert : le conteneur est bien présent quand il porte
« introuvable » (`robustness.test.mjs` R8–R10, PASS).

### 12.3 Ce qui n'a pas été retiré

Ni le `TTL` (module 04), ni `journalctl --since "1 hour ago"` (module 11), ni les ordres de grandeur de la
restauration (modules 09, 10, 12) : ce ne sont pas des durées annoncées mais du contenu technique ou de la
prose. Aucun fichier CSS, ni `index.html`, ni un harnais n'a été modifié pour cette demande.
