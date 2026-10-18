# PROGRESS — Suivi de production de VPS Academy 2026

> Mis à jour le **2026-10-17** (Prompt 7 — rédaction des modules 02 à 12 : le parcours est complet).

## Vue d'ensemble

| Phase | Contenu | État |
| --- | --- | --- |
| Prompt 1 | Cadrage et architecture cible (`docs/CADRAGE.md`) | ✅ Terminé |
| Prompt 2 | Référentiel technique, sources, plan des modules, socle du site | ✅ Terminé |
| Prompt 3 | Consolidation du référentiel, modèle d'état à 4 niveaux, tests persistés | ✅ Terminé |
| Prompt 4 | Rédaction de la page du module 01 (`cours/module-01-preparation.html`) | ✅ Terminé — **en attente de validation humaine** |
| Prompt 5 | Réécriture du module 01 en guide court et opérationnel + parcours « serveur à domicile » | ✅ Terminé — **en attente de validation humaine** |
| Prompt 6 | Stabilisation CSS (défauts C1, C2 corrigés dans le socle) + contrôles de page et de contraste versionnés | ✅ Terminé — **en attente de validation humaine** |
| Prompt 7 | Rédaction des **modules 02 à 12** : le parcours est complet de A à Z | ✅ Terminé — **en attente de validation humaine** |

> **Les 12 pages de cours existent** et sont toutes à l'état `drafted`.
> Le tableau de bord affiche **12 liens**, **0 badge « Planifié »**, et aucun lien vers une page inexistante.
> Aucun module n'est encore passé à l'état `validated` : la validation humaine du contenu reste à faire.

## Prompt 5 — livrables

| # | Fichier | Nature | État |
| --- | --- | --- | --- |
| 1 | `cours/module-01-preparation.html` | Réécriture complète : guide court et opérationnel (Objectif → Action → Commande → Vérification → En cas d'erreur) + section « Héberger chez soi : self-hosting » avec deux parcours | ✅ Réécrit |
| 2 | `assets/data/modules.json` | Intitulés des 12 modules alignés sur la structure cible ; métadonnées du module 01 réécrites ; self-hosting intégré aux métadonnées des modules 03 et 04 | ✅ Mis à jour |
| 3 | `tests/static-checks.sh` | Assertion figée « tout est planifié » remplacée ; **nouveau groupe de contrôles sur les pages de cours** | ✅ Mis à jour |
| 4 | `tests/unit.test.mjs` | Deux fixtures figées sur l'état vide remplacées par des fixtures explicites ; un test de validité des statuts ajouté | ✅ Mis à jour |
| 5 | `tests/browser.test.mjs` | Attentes dérivées de `modules.json` ; traitement correct des sondes `HEAD` | ✅ Mis à jour |
| 6 | `docs/SOURCES.md` | Passage de vérification n° 3 ; 8 sources ajoutées (35 au total, décompte vérifié) | ✅ Mis à jour |
| — | `docs/PROGRESS.md` | Ce fichier | ✅ Mis à jour |
| — | `docs/VALIDATION.md` | Résultats re-exécutés, régressions corrigées listées une par une | ✅ Mis à jour |

> `tests/robustness.test.mjs` n'a **pas** été modifié : il passait déjà 10/10 avant et après.

## Prompt 6 — livrables

| # | Fichier | Nature | État |
| --- | --- | --- | --- |
| 1 | `assets/css/layout.css` | Correctif **C1** : `.layout > * { min-width: 0 }` (fin du débordement de 373 px mesuré) | ✅ Corrigé |
| 2 | `assets/css/components.css` | Correctif **C2** : `.checklist li` accepte le repli (`flex-wrap: wrap`) | ✅ Corrigé |
| 3 | `cours/module-01-preparation.html` | Retrait des **2** contournements `style="min-width:0"` et mise à jour de la note technique ; enveloppes `<span>` conservées (non concernées, justifiées) | ✅ Nettoyé |
| 4 | `tests/course-pages.test.mjs` | **Nouveau** — pages de cours et tableau de bord : liens, ancres, copie, débordement 390/768/1280, sans JS, cohérence des métadonnées (57 contrôles) | ✅ Ajouté |
| 5 | `tests/contrast.test.mjs` | **Nouveau** — contraste WCAG 2.1 AA : 21 paires dérivées du CSS + 653 textes rendus mesurés (30 contrôles) | ✅ Ajouté |
| 6 | `tests/README.md` | Commandes, prérequis (`PLAYWRIGHT_CORE_PATH`), codes de sortie, limites de méthode, preuve que les harnais savent échouer | ✅ Mis à jour |
| — | `docs/VALIDATION.md` | Résultats observés en § 10 ; total persisté porté de 108 à **195** | ✅ Mis à jour |
| — | `docs/PROGRESS.md` | Ce fichier | ✅ Mis à jour |

> `tests/static-checks.sh`, `tests/unit.test.mjs`, `tests/browser.test.mjs` et `tests/robustness.test.mjs`
> n'ont **pas** été modifiés au Prompt 6 : ils passaient déjà, et leurs résultats sont inchangés
> (38 / 34 / 26 / 10).

## Prompt 7 — livrables

| # | Fichier | Nature | État |
| --- | --- | --- | --- |
| 1 | `assets/js/module-page.js` | **Nouveau** — amorçage commun d'une page de module (importe `navigation.js` et `progress.js`, préfixe les chemins avec `../`, lit `../assets/data/modules.json`) | ✅ Ajouté |
| 2 | `cours/module-02-linux-permissions.html` | Module 02 — administrer Debian 13, comptes, permissions, mises à jour (5 étapes, 9 blocs copiables) | ✅ Rédigé |
| 3 | `cours/module-03-ssh-root-parefeu.html` | Module 03 — durcissement SSH, clés, `root` distant, pare-feu IPv4 **et** IPv6 (5 étapes, 12 blocs) | ✅ Rédigé |
| 4 | `cours/module-04-reseau-dns.html` | Module 04 — réseau, domaines, résolution, accès distant, NAT/CGNAT (5 étapes, 7 blocs) | ✅ Rédigé |
| 5 | `cours/module-05-stack-base-donnees.html` | Module 05 — Nginx, MariaDB, phpMyAdmin en tunnel SSH, 3 bases et 6 comptes SQL (5 étapes, 14 blocs) | ✅ Rédigé |
| 6 | `cours/module-06-deploiement-applications.html` | Module 06 — React + Express, PHP + PDO, FastAPI + Uvicorn, livraisons et lien `current` (5 étapes, 15 blocs) | ✅ Rédigé |
| 7 | `cours/module-07-nginx-reverse-proxy-https.html` | Module 07 — un hôte par domaine, reverse proxy, Certbot, redirection HTTPS, renouvellement (5 étapes, 8 blocs) | ✅ Rédigé |
| 8 | `cours/module-08-git-workflow.html` | Module 08 — dépôts, branches, environnements, exclusion des secrets, relecture (5 étapes, 8 blocs) | ✅ Rédigé |
| 9 | `cours/module-09-cicd-automatisation.html` | Module 09 — pipeline, clé de déploiement sans sudo, livraisons, migrations réversibles, retour arrière (5 étapes, 7 blocs) | ✅ Rédigé |
| 10 | `cours/module-10-sauvegardes-restauration.html` | Module 10 — quoi sauvegarder, dumps MariaDB, archives chiffrées, minuterie systemd, restauration prouvée (5 étapes, 8 blocs) | ✅ Rédigé |
| 11 | `cours/module-11-supervision-incidents.html` | Module 11 — journaux, `journalctl`, `logrotate`, signaux d'alerte, méthode de diagnostic (5 étapes, 7 blocs) | ✅ Rédigé |
| 12 | `cours/module-12-projet-final.html` | Module 12 — rejeu du parcours, audit final, incident simulé, dossier technique, évaluation et défi (5 étapes, 5 blocs) | ✅ Rédigé |
| 13 | `assets/data/modules.json` | Les 11 modules 02–12 passent de `planned` à `drafted` | ✅ Mis à jour |
| 14 | `docs/SOURCES.md` | Colonne « Modules » de `S21` complétée (`10`) : le module 10 utilise effectivement les minuteries systemd | ✅ Mis à jour |

> **Aucun fichier de socle n'a été modifié au Prompt 7.** Les suites de tests (`static-checks.sh`,
> `unit.test.mjs`, `browser.test.mjs`, `course-pages.test.mjs`, `robustness.test.mjs`,
> `contrast.test.mjs`) sont inchangées : elles étaient déjà écrites pour être **génériques** et
> s'appliquent automatiquement à toute page déclarée dans `modules.json`.

### Suppression des durées annoncées (demande du 2026-10-17)

Les **temps exemples** (« 35 min », « 60 min », …) ont été retirés du site. Ils figuraient à quatre
endroits, tous traités :

| Emplacement | Retiré |
| --- | --- |
| `assets/data/modules.json` | les **12** champs `"duration"` |
| `cours/module-01…12` (en-tête de page) | le libellé `NN min` de la légende du module — le badge « Module NN » est conservé |
| `cours/module-01-preparation.html` § 3 Prérequis | la puce « Environ **35 minutes**. », qui n'était pas un prérequis |
| `assets/js/navigation.js` | le rendu du tag de durée sur les cartes du tableau de bord |

**Effet de bord mesuré, puis corrigé.** La suppression vidait le conteneur `.module-card__meta` : vide, il
réservait encore `gap` + `margin-top`, soit **16 px de blanc** en bas de chaque carte. Mesure : hauteur de
carte **331,75 px → 315,75 px**, et **0** conteneur vide dans le DOM. Correctif d'une ligne : le conteneur
n'est ajouté que s'il porte au moins une information (les tags « contenu à venir », « introuvable » et
« terminé (local) » continuent de fonctionner — cas couvert par `robustness.test.mjs`).

**Non retiré — ce n'est pas une durée annoncée :** la notion de `TTL` (module 04), l'argument
`journalctl --since "1 hour ago"` (module 11), les ordres de grandeur de la restauration (modules 09, 10, 12).
Ce sont du contenu technique ou de la prose, pas un temps affiché sur une carte.

**Aucun autre fichier n'a été touché** : ni CSS, ni `index.html`, ni les harnais.

### Validation exécutée au Prompt 7

Les six harnais **n'ont pas été modifiés** : ils étaient déjà génériques (ils itèrent sur les pages
déclarées dans `assets/data/modules.json`) et couvrent donc automatiquement les 11 nouvelles pages.

| Harnais | Prompt 6 | Prompt 7 | Code de sortie |
| --- | --- | --- | --- |
| `bash tests/static-checks.sh` | 38 | **94** | `0` |
| `node tests/unit.test.mjs` | 34 | **34** | `0` |
| `VPS_BASE_URL=… node tests/browser.test.mjs` | 26 | **26** | `0` |
| `VPS_BASE_URL=… node tests/robustness.test.mjs` | 10 | **10** | `0` |
| `VPS_BASE_URL=… node tests/course-pages.test.mjs` | 57 | **233** | `0` |
| `VPS_BASE_URL=… node tests/contrast.test.mjs` | 30 | **74** | `0` |
| **Total persisté** | **195** | **471** | — |

**471 PASS / 0 FAIL.** L'augmentation ne vient pas de nouveaux contrôles mais du **périmètre par page** :
`static-checks` groupe 7, `course-pages` et `contrast` mesurent **chaque page déclarée**.

**Un défaut réel, trouvé par la mesure puis corrigé** — `cours/module-03-ssh-root-parefeu.html` :
**8 px de débordement horizontal à 390 px**, dus à un jeton **insécable** de 42 caractères dans un `<code>`
d'encadré (`'permitrootlogin|passwordauthentication'`). La commande a été décomposée en deux jetons
courts. Après correction, les **12 pages** mesurent **0 px** de débordement à 390 px et aucun élément non
défilable ne dépasse. Détail complet : `docs/VALIDATION.md` § 11.2.

**Audit des références de sources** : 35 sources déclarées dans `docs/SOURCES.md`, 32 citées dans les
pages, **0 référence inconnue**, 3 identifiants déclarés mais non cités (`S5b`, `S5d`, `S8b`).
Les références inventées d'un premier jet (`S5`, `S17b`) ont été retirées.

### Choix de rédaction du Prompt 7

| Choix | Décision | Raison |
| --- | --- | --- |
| Page trop longue | **Refusée.** Chaque page 02–12 fait 5 étapes, comme demandé (« léger, pas trop de texte ») | Le module 01 sert de référence de gabarit ; les nouvelles pages sont **plus courtes** que lui |
| Refonte graphique ou typographique | **Refusée** | Demande explicite du Prompt 7 : réutiliser le socle tel quel |
| Nouvelle feuille de style ou nouveau jeton de couleur | **Refusée** | Le contraste minimal mesuré est de 4,63:1 ; toute couleur nouvelle devrait repasser `contrast.test.mjs` |
| Script en ligne dupliqué dans chaque page | **Remplacé** par `assets/js/module-page.js` | 11 pages identiques auraient multiplié les points de divergence |
| Script en ligne du module 01 | **Non touché** | Il fonctionne, il est testé en l'état : aucune raison de le déplacer (règle « modifier le minimum ») |
| Références de sources inventées | **Corrigées.** Les lignes `S5` et `S17b` (inexistantes) ont été remplacées par une ligne « Manuels installés sur la machine » sans numéro | Règle de conduite : ne jamais citer une source qui n'existe pas dans `docs/SOURCES.md` |
| Redémarrage du service par le pipeline | **Présenté comme une décision, pas comme une évidence.** L'option A (référentiel actuel : aucun sudo pour `deploy-*`) et l'option B (entrée `sudoers` étroite) sont exposées avec leur coût | `docs/ARCHITECTURE.md` § Q4 exige **aucune** entrée `sudoers` pour `deploy-*`. Créer une entrée sudoers pour « simplifier » aurait contredit une décision validée et fait échouer le contrôle Q4 |


## Orientation pédagogique (décidée au Prompt 5)

Le guide vise un débutant qui n'a jamais administré de serveur. Chaque étape suit un format fixe :

```
Objectif → Action → Commande (bloc copiable) → Vérification → En cas d'erreur
```

Cinq phrases d'explication au maximum par étape, hors commandes, résultats attendus et avertissements
obligatoires. La théorie est réduite au strict nécessaire ; chaque notion est démontrée par une commande
que l'apprenant peut exécuter.

**Deux parcours, une seule architecture cible :**

| Parcours | Machine | Ce qui change |
| --- | --- | --- |
| **A — VPS OVHcloud** | Machine louée, IP publique fournie | Accès Internet immédiat, disponibilité assurée par l'hébergeur |
| **B — serveur à domicile** | PC, mini-PC ou machine virtuelle réutilisés | IP privée, NAT de la box, disponibilité dépendante du domicile |

Les deux parcours aboutissent à la **même pile** : Nginx en point d'entrée, React + Express,
PHP + PDO, FastAPI + Uvicorn, MariaDB, phpMyAdmin réservé à l'administration, comptes de déploiement
séparés et clés SSH distinctes. **Aucune équivalence de disponibilité n'est affirmée entre les deux.**

## Modèle d'état d'un module (4 niveaux)

Le tableau de bord distingue quatre états. **Un module n'est jamais « terminé » du seul fait qu'il figure dans `modules.json`.**

| État | Signification | Source de vérité |
| --- | --- | --- |
| `planned` | Planifié — aucune page | `modules.json` |
| `published` | La page **existe** réellement (vérifiée par requête `HEAD`) | `modules.json` + vérification HTTP |
| `drafted` | Le module est **rédigé** | `modules.json` |
| `validated` | Le module a passé le **contrat de validation** | `modules.json` (+ progression locale pour le badge « terminé ») |

**Garde-fou implémenté :** si un module est déclaré non-`planned` mais que son fichier est absent, le socle
n'affiche **aucun lien** et signale « page annoncée mais introuvable ». Ce cas est couvert par un test de
robustesse et par un contrôle statique.

## Plan des 12 modules

| Id | Titre | Fichier cible | État | Page existe |
| --- | --- | --- | --- | --- |
| 01 | Préparer son environnement : VPS ou serveur à domicile | `cours/module-01-preparation.html` | `drafted` | ✅ |
| 02 | Installer et administrer Debian 13 | `cours/module-02-linux-permissions.html` | `drafted` | ✅ |
| 03 | Sécuriser SSH, les comptes et le pare-feu | `cours/module-03-ssh-root-parefeu.html` | `drafted` | ✅ |
| 04 | Configurer le réseau, les domaines et l'accès distant | `cours/module-04-reseau-dns.html` | `drafted` | ✅ |
| 05 | Installer Nginx, MariaDB et phpMyAdmin | `cours/module-05-stack-base-donnees.html` | `drafted` | ✅ |
| 06 | Déployer React + Express, PHP et Python | `cours/module-06-deploiement-applications.html` | `drafted` | ✅ |
| 07 | Configurer Nginx et HTTPS | `cours/module-07-nginx-reverse-proxy-https.html` | `drafted` | ✅ |
| 08 | Organiser les dépôts Git et les versions | `cours/module-08-git-workflow.html` | `drafted` | ✅ |
| 09 | Automatiser les déploiements avec CI/CD | `cours/module-09-cicd-automatisation.html` | `drafted` | ✅ |
| 10 | Sauvegarder et restaurer | `cours/module-10-sauvegardes-restauration.html` | `drafted` | ✅ |
| 11 | Superviser et dépanner | `cours/module-11-supervision-incidents.html` | `drafted` | ✅ |
| 12 | Réaliser le déploiement final des trois applications | `cours/module-12-projet-final.html` | `drafted` | ✅ |

Bilan du tableau de bord : **12 modules / 12 pages disponibles / 12 rédigés / 0 validé / 0 terminé (local)**.

Les intitulés du tableau ci-dessus ont été alignés sur la structure cible du Prompt 5. Les identifiants,
les chemins de fichiers et les mots-clés de recherche sont inchangés.

### Volume des pages (mesuré sur le disque)

| Page | Taille | Étapes | Sections | Blocs copiables |
| --- | --- | --- | --- | --- |
| module 01 | 54 Ko | — (parcours spécifique) | 13 | 14 |
| modules 02 à 12 | 31 à 37 Ko | **5 étapes chacune** | 11 | 5 à 15 selon le module |

> Les pages 02–12 sont **plus courtes que la page du module 01** qui sert de référence : la demande
> « une page légère, pas trop de texte, pas trop de réflexion » est donc tenue, sans refonte graphique
> ni typographique.

## Points ouverts — état

| Réf. | Question | Statut |
| --- | --- | --- |
| O1 | Dossier des pages : `cours/` ou `pages/` ? | ✅ **Résolu — `cours/`** (Prompt 3 §2) |
| O2 | Nombre de livraisons conservées | ✅ **Résolu — 5 dernières versions réussies** |
| O3 | Outil de supervision | ✅ **Résolu — systemd + journald + logrotate + outils natifs** |
| O4 | Frameworks applicatifs | ✅ **Résolu — Express, PHP natif + PDO, FastAPI + Uvicorn** |
| O5 | Politique IPv6 | ✅ **Résolu — IPv4 et IPv6 pris en compte** |
| O6 | Restriction SSH des comptes de déploiement | ✅ **Résolu — shell interactif conservé, restrictions par permissions** |
| O7 | Les harnais de test restent-ils versionnés dans `tests/` ou passent-ils en local non versionné ? | ✅ **Tranché au Prompt 6, pour les contrôles concernés** — les contrôles de page et de contraste sont désormais versionnés dans `tests/` (Prompt 6 §3) ; les harnais ad hoc de `/tmp/opencode` sont supprimés. Le dépôt est la seule source de vérité des tests. |

## Défauts du socle CSS — corrigés au Prompt 6

Relevés au Prompt 5, contournés dans la page faute d'autorisation, **corrigés à la source au Prompt 6**.

| Réf. | Fichier | Défaut relevé | Correctif appliqué (Prompt 6) |
| --- | --- | --- | --- |
| C1 | `assets/css/layout.css:109` | `.layout { grid-template-columns: 1fr }` sans `min-width: 0` sur ses enfants : la piste conservait la taille `min-content` du contenu, qui débordait | `.layout > * { min-width: 0; }` |
| C2 | `assets/css/components.css:243` | `.checklist li { display: flex }` sans repli possible | `flex-wrap: wrap` ajouté à la règle existante |

**Mesures** : sans correctif, **373 px de débordement à 390 px** (premier `<li>` à 747 px de large,
`max-content`) sur la page du module 01. Après correctif : **0 px**, à 390 / 768 / 1280 px, avec une
hauteur de document et des hauteurs de puces **strictement identiques** à l'état antérieur.

Les deux contournements posés dans la page (`style="min-width:0"` sur `aside` et `main`) ont été retirés.
Les 44 enveloppes `<li><span>` **restent** : elles ne sont pas un contournement CSS en ligne et le contenu
d'une puce doit demeurer un enfant flex unique. `.layout` et `.checklist` ne sont utilisés par aucune
autre page : le correctif n'affecte ni `index.html` ni le reste du socle.

## Limites déclarées

- **Aucune commande n'a été exécutée sur un VPS réel, ni sur une box, ni sur un serveur à domicile.**
  Tout le volet « serveur » est **documenté, pas testé** — statut 🔴 dans `docs/ARCHITECTURE.md`.
- Aucun port n'a été ouvert, aucune règle de pare-feu n'a été modifiée, aucune modification n'a été
  apportée à un serveur distant.
- Les 10 contrôles d'accès (Q1–Q10) sont **spécifiés avec leur résultat attendu**, mais **non exécutés**.
- Le site doit être **servi en HTTP** : ouvert via `file://`, les modules ESM et `fetch()` sont bloqués
  par le navigateur (limite documentée et testée, `robustness.test.mjs`).
- Les tests navigateur nécessitent `playwright-core` + un Chromium (voir `tests/README.md`).
- **Limites du contrôle de contraste** (`tests/contrast.test.mjs`) : seuil WCAG 2.1 **AA** uniquement
  (4,5:1 texte normal, 3:1 texte large — le niveau AAA n'est pas vérifié) ; seuls les états au repos sont
  mesurés (`:hover`, `:focus`, `:active` non évalués) ; le texte `.visually-hidden` est exclu ; les fonds
  en dégradé ou en image ne sont pas évalués (aucun dans la feuille du projet) ; le contraste des éléments
  non textuels (WCAG 1.4.11) n'est pas couvert.
- Le minimum de contraste mesuré est de **4,63:1** (marque du site, boutons primaires) : la marge est
  faible, toute modification des jetons de couleur doit repasser `tests/contrast.test.mjs`.
- **Les versions de paquets Debian 13 ne sont pas affirmées** : le cours ne fixe aucune version de paquet
  et renvoie à la distribution.
- Sur un écran de 390 px, le tableau de dépannage du module 01 (3 colonnes) défile horizontalement à
  l'intérieur de son conteneur `.table-wrap` : c'est le comportement prévu par le socle, pas un défaut
  de mise en page. **Mesuré au Prompt 7** : les 12 pages tiennent dans la largeur (0 px de débordement à
  390, 768 et 1280 px).
- **La vérification porte sur le site, pas sur le serveur** : les pages 02–12 sont validées comme pages
  web (structure, ancres, copie, contraste, responsive, fonctionnement sans JS), **pas** comme procédures
  exécutées sur une machine Debian 13. Aucune commande du cours n'a été lancée.
- Trois comptes SSH **ne constituent pas une isolation forte** : pas d'isolation noyau, une compromission
  de `root` atteint les trois applications.
- La machine de rédaction est **Pop!_OS 22.04**, pas Debian 13. Aucune version locale n'est présentée
  comme celle du serveur.

## Prochaine action

**Le parcours est rédigé de A à Z (modules 01 à 12).** Il ne reste qu'une étape, qui n'appartient
pas à l'agent :

1. **Validation humaine du contenu** des 12 pages — c'est le seul moyen de passer un module de
   `drafted` à `validated`. Aucun module ne peut être déclaré validé par l'agent lui-même.
2. Relecture des **deux points de fond** laissés explicitement comme décisions ouvertes dans le cours :
   - le redémarrage du service après déploiement automatique (module 09, option A ou B) ;
   - l'activation de **HSTS** (module 07), à décider après vérification des trois domaines.
3. Points techniques **non vérifiés** à confirmer avant usage réel, et déjà signalés dans les pages :
   versions réelles des paquets Debian 13 (Node.js, PHP-FPM), accessibilité de `uvicorn.org`
   (source de niveau C), syntaxe systemd depuis la source officielle (source de niveau B, HTTP 418).

Aucun serveur, routeur, pare-feu ou machine réelle n'a été modifié ni interrogé pour produire les
modules 02 à 12.
