# CADRAGE — VPS Academy 2026

> **Statut :** cadrage **validé**. Les décisions bloquantes ont été tranchées par l'humain et consolidées au **Prompt 3**.
> **Date de rédaction :** 2026-10-17 (Prompt 1). **Dernière mise à jour :** 2026-10-17 (Prompt 3 — statut et décisions).
> **Portée :** ce document ne contient aucune page de cours, aucun contenu pédagogique, aucune configuration de production.
>
> ⚠️ **Ce document est un document d'historique.** Il conserve les hypothèses et les options telles qu'elles ont été formulées. Le **référentiel technique à jour** est `docs/ARCHITECTURE.md`. En cas d'écart entre les deux, `ARCHITECTURE.md` fait foi.

---

## Journal des décisions (mise à jour Prompt 3)

> Les décisions ci-dessous ont été **validées par l'humain au Prompt 3**. Elles ne sont donc plus « en attente ». L'historique de leur formulation initiale est conservé plus bas (sections 0, 2.3, 10.1) et **explicitement marqué comme historique**.

| Réf. | Question initiale (Prompt 1) | Décision validée (Prompt 3) |
| --- | --- | --- |
| **D0** | 12 pages ou 60 pages ? | **12 pages de cours** + `index.html` (hors compte) |
| **D1** | Dossier des pages | **`cours/`** (la mention `pages/` du Prompt 2 §3 est caduque) |
| **D2** | MariaDB natif ou Oracle MySQL ? | **MariaDB native Debian 13** |
| **D3** | Exposition de phpMyAdmin | **Local uniquement + tunnel SSH** (aucune exposition publique) |
| **D4** | Restriction SSH des comptes de déploiement | **Shell interactif conservé**, restrictions par **permissions** et accès |
| **D5** | Frameworks applicatifs | **React + Express**, **PHP natif + PDO**, **FastAPI + Uvicorn** |
| **D6** | Privilèges SQL de migration | **Utilisateurs de migration distincts** des utilisateurs d'exécution |
| **D7** | Fonctions du site | Socle retenu et implémenté (voir `ARCHITECTURE.md` et `index.html`) |
| **D8** | Client ACME | **Certbot** (Let's Encrypt) |
| **D9** | Rétention des versions | **5 dernières versions réussies** par application |
| **D10** | Supervision initiale | **systemd + journald + logrotate + outils Linux natifs** (aucune plateforme lourde) |
| **D11** | IPv6 | **Pris en compte** (pare-feu et interfaces vérifiés en IPv4 **et** IPv6) |

Ces décisions sont **détaillées et opérationnalisées** dans `docs/ARCHITECTURE.md`.

### Journal des décisions — mise à jour Prompt 5

| Réf. | Décision Prompt 5 |
| --- | --- |
| **D12** | **Orientation pédagogique :** le module 01 (et les suivants) devient un **guide court et opérationnel** de débutant. Format par étape : **Objectif → Action → Commande → Vérification → En cas d'erreur**. Maximum **5 phrases d'explication** par étape, hors commandes, résultats attendus et avertissements obligatoires. Réduction de la théorie, suppression des répétitions et de l'histoire des technologies. |
| **D13** | **Deux parcours, une seule architecture cible.** Le module 01 traite **A — VPS OVHcloud** et **B — serveur à domicile**, séparés explicitement. Les deux mènent à la **même pile** (Nginx, React + Express, PHP + PDO, FastAPI + Uvicorn, MariaDB, phpMyAdmin réservé à l'administration, comptes de déploiement séparés, sauvegardes et retour arrière). |
| **D14** | **Le self-hosting reste dans le module 01** : il **ne crée pas** de treizième page. La contrainte « 12 pages + `index.html` » (D0) est **maintenue**. |
| **D15** | **Aucune équivalence de disponibilité** n'est affirmée entre un VPS et un serveur à domicile. Le parcours B est présenté avec ses dépendances réelles (alimentation, connexion, matériel). |
| **D16** | **Règles d'exposition (parcours B) :** trois options seulement (réseau local · VPN · publication web après vérification). **Interdiction de publier** MariaDB, phpMyAdmin et les ports internes des applications. `22` non exposé sans mesures adaptées. En cas de **CGNAT**, la redirection de port IPv4 peut être impossible : alternatives (IPv6 filtré, VPN avec point d'entrée joignable, tunnel sortant) — **aucune publication n'est garantie**. |
| **D17** | **Intitulés des 12 modules alignés** sur la structure cible. Identifiants, chemins de fichiers et mots-clés de recherche **inchangés** (seul le module 01 change de chemin : `preparation-vps` → `preparer-environnement`). |

Ces décisions sont **opérationnalisées** dans `docs/ARCHITECTURE.md` (§ 1.4) et dans la page
`cours/module-01-preparation.html`.

---

## 0. Note de cadrage critique — divergence entre les deux énoncés de mission

Une divergence majeure existe entre deux énoncés reçus, et elle conditionne **tout** le reste du projet. Elle doit être tranchée humainement avant toute production.

| Point | « Prompt maître » (VPS Academy complet) | « Prompt 1 » (présent cadrage) |
| --- | --- | --- |
| Volume | 60 pages, 13 phases (0 → 12) | **12 pages** + `index.html` (interdit : 13ᵉ page) |
| Applications | React + Express + MySQL uniquement | **3 applications** : React+Express, **PHP**, **Python** |
| Base de données | MySQL | MySQL/MariaDB partagée, 3 bases |
| Modules | 13 phases thématiques (durcissement, DNS, HTTPS, Git, CI/CD, sauvegardes, supervision, audit…) | 12 modules qui recouvrent la même matière mais en 12 pages |
| Isolation | permissions Unix + systemd | + **3 comptes SSH de déploiement** (`deploy-react`, `deploy-php`, `deploy-python`) |

**Décision requise (D0) :** le présent cadrage suit **Prompt 1** (12 pages, 3 applications), car c'est l'énoncé le plus récent et le plus précis sur le périmètre du site pédagogique. Si le « Prompt maître » reste la référence, le découpage et le nombre de pages changent radicalement. **Ne pas produire de pages avant arbitrage.**

> ✅ **RÉSOLU (Prompt 3) — conservé comme historique.** L'arbitrage a été rendu : **12 pages de cours + `index.html`** (le « Prompt maître » à 60 pages est écarté). La suite de cette section décrit la situation **au moment du cadrage (Prompt 1)** et n'est plus une consigne active.

---

## 1. Périmètre fonctionnel

### 1.1 Ce que l'apprenant saura faire (résultat mesurable)

À l'issue des 12 modules, l'apprenant débutant saura :

1. Se connecter à un VPS Debian 13 et administrer le système de base (utilisateurs, permissions, APT).
2. Sécuriser l'accès : comptes nominatifs, sudo, clés SSH, désactivation du root SSH, pare-feu.
3. Rattacher des domaines/sous-domaines et diagnostiquer le DNS.
4. Installer et configurer la pile partagée : Nginx, base de données, phpMyAdmin, runtimes.
5. Déployer **trois applications indépendantes** (React+Express, PHP, Python) isolées par comptes, répertoires, services et bases.
6. Publier en HTTPS avec certificats renouvelés automatiquement.
7. Industrialiser : Git, CI/CD, déploiements par versions, rollback.
8. Sauvegarder, restaurer, superviser et diagnostiquer les incidents.

### 1.2 Périmètre du livrable logiciel

- **Site pédagogique statique** en HTML5 / CSS3 / JavaScript **vanilla** (ES modules), **sans backend**, **sans React**.
- **`index.html`** : page d'accueil / tableau de bord.
- **Exactement 12 pages de cours** numérotées. Aucune 13ᵉ.
- Fonctions envisagées (à confirmer — voir § 10, décision D7) : navigation entre modules, sommaire par page, recherche, blocs de commandes copiables, exercices, solutions masquées, progression locale, responsive, accessibilité clavier, documentation des sources.

### 1.3 Hors périmètre

- Aucun conteneur Docker dans le parcours principal (mentionné seulement en comparaison, cf. contrainte du prompt maître).
- Aucun framework applicatif imposé pour les trois applications (décision D5).
- Aucun hébergement réel, aucune connexion au VPS, aucune commande exécutée sur une infrastructure réelle pendant la conception.
- Aucun secret, mot de passe ou clé privée dans le dépôt.

---

## 2. Hypothèses et contraintes matérielles

### 2.1 Infrastructure de référence (VPS-1 OVHcloud)

| Élément | Valeur retenue | Statut de vérification |
| --- | --- | --- |
| Hébergeur | OVHcloud | Exemple, à confirmer dans la doc OVHcloud au moment de la rédaction |
| Offre | VPS-1 | **À vérifier** : CPU/RAM/disque exacts, options de snapshot, sauvegarde auto |
| vCPU | 2 vCores | À vérifier |
| RAM | 4 Go | À vérifier |
| Disque | 40 Go SSD NVMe | À vérifier |
| Réseau | IP publique + IPv6 selon offre | À vérifier |

> Règle appliquée : les caractéristiques exactes de l'offre **ne sont pas présentées comme certaines** et seront revérifiées module 1 avant rédaction.

### 2.2 Système — faits vérifiés (source : debian.org, consulté le 2026-10-17)

- **Debian 13 « trixie »** est la **version stable actuelle**. Version initiale 13.0 le **2025-08-09** ; dernière point release **13.7 le 2026-09-12**.
- Fin de support sécurité : **2028-08-09** ; fin du LTS : **2030-06-30**.
- Paquets notables livrés par trixie : **PHP 8.4**, **Python 3.13**, **Nginx 1.26**, **OpenSSH 10.0p1**, **systemd 257**, **APT 3.0**, noyau **6.12 LTS**, **MariaDB 11.8**, PostgreSQL 17.

### 2.3 Contrainte majeure : « MySQL » sur Debian 13

⚠️ **Point de vigilance décisif (décision D2).** Debian 13 fournit **MariaDB 11.8** dans les dépôts officiels ; **Oracle MySQL n'est pas le paquet par défaut** et `repo.mysql.com/apt/debian` ne proposait pas de distribution `trixie` à la sortie de Debian 13. Deux options :

- **Option A (recommandée pédagogiquement)** : utiliser **MariaDB** (paquet Debian natif, `sudo apt install mariadb-server`). phpMyAdmin et les clients MySQL fonctionnent de façon compatible. Simplifie l'installation, colle au dépôt Debian, reste transférable.
- **Option B** : installer **Oracle MySQL** via le dépôt APT MySQL (support `trixie` à revérifier). Plus fidèle au vocabulaire « MySQL » mais ajoute une source tierce et un risque de compatibilité.

> Le cours dira explicitement lequel est utilisé et pourquoi. Le mot « MySQL » dans le discours sera nuancé (« MySQL/MariaDB »). **Décision humaine requise.**

> ✅ **RÉSOLU (Prompt 3) — décision D2.** **MariaDB native Debian 13** est retenue (Option A). La section ci-dessus conserve l'analyse qui a conduit à cette décision.

---

## 3. Schéma d'architecture des trois applications

```
                          INTERNET
                             │  :80 / :443
                             ▼
                 ┌───────────────────────┐
                 │   PARE-FEU (nftables)  │   ← seuls 80, 443, SSH(politique) ouverts
                 └───────────┬───────────┘
                             ▼
                 ┌───────────────────────┐
                 │         NGINX         │   point d'entrée public unique
                 │  vhost par domaine    │   TLS Let's Encrypt
                 └───┬────────┬──────┬───┘
        app-react.fr │ app-php.fr│  app-python.fr
                     ▼        ▼        ▼
        ┌────────────────┐ ┌──────────┐ ┌──────────────────┐
        │ APP A React+Ex │ │ APP B PHP│ │ APP C Python     │
        │ statique +     │ │ php-fpm  │ │ venv + WSGI/ASGI │
        │ Express systemd│ │ pool déd.│ │ systemd          │
        │ 127.0.0.1:3001 │ │ socket   │ │ 127.0.0.1:8000   │
        └───────┬────────┘ └────┬─────┘ └────────┬─────────┘
                │               │                │
                └──────┬────────┴────────┬───────┘
                       ▼                 ▼
          ┌────────────────────┐  ┌────────────────────┐
          │  MariaDB/MySQL     │  │ phpMyAdmin (1 seul) │
          │  127.0.0.1:3306    │  │ accès restreint     │
          │  app_react         │  └────────────────────┘
          │  app_php           │
          │  app_python        │
          └────────────────────┘
```

**Répartition (valeurs indicatives — désormais figées dans `docs/ARCHITECTURE.md`) :**

| Application | Domaine | Exposition | Service | Port/socket | Répertoire | Compte de déploiement | Compte d'exécution |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A — React + Express | `app-react.exemple.fr` | 443 (statique) + API interne | `systemd` `app-react-api` | `127.0.0.1:3001` | `/srv/apps/react-app` | `deploy-react` | `svc-react` |
| B — PHP natif + PDO | `app-php.exemple.fr` | 443 | `php-fpm` pool `app-php` | socket `/run/php/app-php.sock` | `/srv/apps/php-app` | `deploy-php` | `svc-php` |
| C — FastAPI + Uvicorn | `app-python.exemple.fr` | 443 | `systemd` `app-python-web` | `127.0.0.1:8000` | `/srv/apps/python-app` | `deploy-python` | `svc-python` |

> ⚠️ **Correction Prompt 3 — conservée comme historique.** Le tableau initial (Prompt 1) indiquait `/srv/app-react`, `/srv/app-php`, `/srv/app-python` et une seule colonne « Compte ». Le référentiel retient désormais **`/srv/apps/<app>`** et **sépare le compte de déploiement du compte d'exécution**. C'est `docs/ARCHITECTURE.md` qui fait foi.

**Invariant :** MySQL/MariaDB, Express (`:3001`), Python (`:8000`) et phpMyAdmin **ne sont jamais exposés publiquement** par défaut.

---

## 4. Modèle des comptes SSH et des privilèges

| Compte | Rôle | Shell SSH | sudo | Répertoire de travail | Clé SSH |
| --- | --- | --- | --- | --- | --- |
| `admin` (nominatif, ex. `prenom`) | administration système | oui | **oui, contrôlé** (`sudo`) | `/home/admin` | clé publique dédiée |
| `deploy-react` | déploiement app A | **oui, interactif** ✅ (D4) | **non** | `/srv/apps/react-app` | clé **distincte** |
| `deploy-php` | déploiement app B | **oui, interactif** ✅ (D4) | **non** | `/srv/apps/php-app` | clé **distincte** |
| `deploy-python` | déploiement app C | **oui, interactif** ✅ (D4) | **non** | `/srv/apps/python-app` | clé **distincte** |
| `svc-react` | **exécution** du service app A | non (`nologin`) | **non** | `/srv/apps/react-app` | aucune |
| `svc-php` | **exécution** du pool app B | non (`nologin`) | **non** | `/srv/apps/php-app` | aucune |
| `svc-python` | **exécution** du service app C | non (`nologin`) | **non** | `/srv/apps/python-app` | aucune |
| `root` | compte système UID 0 | connexion SSH directe **désactivée** (après validation) | — | `/root` | jamais supprimé |

> ✅ **D4 résolu (Prompt 3) — conservé comme historique.** L'option « `ForceCommand` / restriction de commande » a été **écartée** au profit d'un **shell interactif conservé** avec des **permissions et accès limités**. La restriction est de nature **permissionnelle**, non prohibitive de commande : un `deploy-*` peut exécuter des commandes autorisées à son UID, mais ne peut ni lire ni modifier les données d'une autre application, ni obtenir de privilèges.

Règles structurantes :

- Chaque compte de déploiement possède **sa propre paire de clés** ; les clés privées **ne sont jamais sur le VPS ni partagées**.
- Aucun compte applicatif n'a de sudo ni d'accès root.
- Permissions par défaut cibles : répertoires applicatifs `750`, propriétaire `deploy-<app>:deploy-<app>` ; fichiers de secrets `640` (root ou groupe dédié).
- **Ordre de sécurisation SSH (impératif)** : valider l'accès clé du compte admin **dans une 2ᵉ session** → vérifier `sudo` → tester `sshd -t` → désactiver root SSH → **seulement ensuite** envisager la désactivation du mot de passe. Ne jamais fermer l'unique session administrative.

---

## 5. Modèle d'isolation et ses limites

### 5.1 Ce que l'isolation garantit réellement

- **Séparation de fichiers** : permissions Unix ; `deploy-php` ne peut pas écrire dans `/srv/app-react`.
- **Séparation de processus** : chaque service sous son propre utilisateur (systemd `User=` / pool FPM `user=`).
- **Séparation de secrets** : fichiers `.env` distincts, lecture limitée au compte d'exécution.
- **Séparation de données** : un utilisateur SQL par base, privilèges minimaux.

### 5.2 Ce que l'isolation ne garantit PAS (à dire explicitement aux apprenants)

- Trois comptes SSH **ne constituent pas** des isolations fortes : une élévation de privilèges (kernel, service `root`) peut franchir ces frontières.
- **Pas d'isolation noyau** (pas de conteneur, pas de namespace, pas de `systemd` sandbox avancé par défaut) → une compromission `root` atteint les trois applications.
- **Pas d'isolation de ressources** : une app peut saturer RAM/CPU et impacter les autres. Défenses partielles : `systemd` (`MemoryMax`, `CPUQuota`), limites FPM.
- **Réseau partagé** : tous les services partagent la même pile réseau et la même IP.

**Niveaux de protection à présenter (du plus faible au plus fort) :** comptes Unix distincts → services systemd distincts + permissions → durcissement SSH/pare-feu → (au-delà du cours) conteneurs/machines distinctes/VPS séparés. Le cours indique **le niveau réellement atteint** et ses limites.

---

## 6. Modèle MySQL (MariaDB)

| Base | Utilisateur SQL d'exécution | Utilisateur SQL de migration | Privilèges | Hôte |
| --- | --- | --- | --- | --- |
| `app_react` | `user_react` | `migrate_react` | Exécution : `SELECT, INSERT, UPDATE, DELETE` sur `app_react.*` — Migration : DDL limité à `app_react.*` | `localhost` uniquement |
| `app_php` | `user_php` | `migrate_php` | idem, sur `app_php.*` | `localhost` |
| `app_python` | `user_python` | `migrate_python` | idem, sur `app_python.*` | `localhost` |

> ✅ **D6 résolu (Prompt 3) — conservé comme historique.** La question « `user_*` porte-t-il le DDL ? » est tranchée : **non**. Les privilèges DDL sont portés par un **utilisateur de migration distinct** (`migrate_*`), utilisé uniquement pendant les déploiements appliquant des migrations. Détail complet : `docs/ARCHITECTURE.md` § 6.

Règles :

- **Aucun `GRANT ALL`**, aucun accès croisé entre bases. Des tests « accès croisé refusé » sont fournis.
- `bind-address = 127.0.0.1` ; MySQL/MariaDB **non écouté** sur l'IP publique.
- `phpMyAdmin` : instance **unique**, réservée aux admins, protégée (D3 : HTTPS + auth + restriction VPN/tunnel SSH/`allow`/`deny` Nginx ; `auth_type` cookie ; jamais exposé à `deploy-*`).
- Les mots de passe sont **générés par l'apprenant**, jamais inventés puis présentés comme des identifiants réels.

---

## 7. Routage Nginx et HTTPS

- **Un fichier `server` par domaine** dans `/etc/nginx/sites-available/` → lien vers `sites-enabled/`. Nommage : `app-react.conf`, `app-php.conf`, `app-python.conf`.
- **App A** : `root /srv/apps/react-app/current/dist` (build React) + `location /api/` → `proxy_pass http://127.0.0.1:3001`.
- **App B** : `root /srv/apps/php-app/current/public` + `location ~ \.php$` → `fastcgi_pass unix:/run/php/app-php.sock`.
- **App C** : `proxy_pass http://127.0.0.1:8000` — ✅ **D5 résolu** : serveur **Uvicorn** (ASGI), application **FastAPI**.
- **En-têtes** : `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` (rôle expliqué). Limites et gestion des 4xx/5xx.
- **Écoute réseau** : Nginx écoute sur **IPv4 et IPv6** lorsque IPv6 est disponible ; les tests de disponibilité doivent porter sur **les deux familles** (décision D11).
- **HTTPS** : Let's Encrypt via **Certbot** ✅ (**D8 résolu** : Certbot retenu ; `acme.sh` écarté). Validation **HTTP-01** par défaut (port 80 requis) ; **DNS-01** si wildcard. Redirection 80 → 301 HTTPS. Renouvellement automatique via `systemd` timer de `certbot`.

> ⚠️ **Correction Prompt 3 (chemins) — conservée comme historique.** Les chemins initiaux `/srv/app-react/dist` et `/srv/app-php/public` sont remplacés par `/srv/apps/<app>/current/...` (bascule atomique par lien `current`). Référence : `docs/ARCHITECTURE.md` § 4 et § 11.
- **Multi-domaines** : chaque vhost isolé ; diagnostics des conflits (`nginx -t`, ordre de `server_name`, `default_server`).

---

## 8. Découpage proposé des douze modules

| # | Module | Objectif | Prérequis | Résultat attendu | Dépend de |
| --- | --- | --- | --- | --- | --- |
| 1 | Préparation du VPS et premières connexions | Comprendre le VPS, vérifier l'offre, première connexion SSH, hiérarchie Linux | Aucun | Accès SSH opérationnel, système à jour identifié | — |
| 2 | Administration Linux et permissions | Utilisateurs/groupes, sudo, fichiers, permissions, umask, APT | 1 | Compte admin nominatif, conventions de droits | 1 |
| 3 | Isolation SSH, root et pare-feu | Clés, `sshd_config`, désactivation root SSH, nftables | 2 | SSH durci par clé, pare-feu 80/443/SSH | 2 |
| 4 | Réseau, DNS et domaines | IP/ports/routes, achat domaine, A/AAAA/CNAME, diagnostic | 1 | 3 sous-domaines résolvant vers le VPS | 1 |
| 5 | Installation des technologies + base de données + phpMyAdmin | Node, Nginx, PHP-FPM, Python, MariaDB/MySQL, phpMyAdmin | 2,3 | Pile partagée installée, 3 bases + 3 users SQL | 2,3 |
| 6 | Déploiement des trois applications | React build, Express systemd, PHP-FPM pool, Python venv+systemd | 4,5 | 3 apps servies en HTTP interne | 5 |
| 7 | Nginx, reverse proxy et HTTPS | vhosts, proxy, en-têtes, Certbot, renouvellement | 4,6 | 3 domaines en HTTPS, redirections OK | 6 |
| 8 | Git et workflow | dépôts, branches, environnements, secrets, `.gitignore` | 6 | Code versionné, secrets hors dépôt | 6 |
| 9 | CI/CD, automatisation et rollback | CI tests/build, déploiement GitHub Actions, versions, retour arrière | 7,8 | Pipeline test→build→deploy→health | 7,8 |
| 10 | Sauvegardes et restauration | stratégie, automatisation, rétention, restauration testée | 5,6 | Sauvegarde planifiée + restauration vérifiée | 5,6 |
| 11 | Supervision, audit et incidents | journaux, métriques, incidents, procédure + rapport | 6,7 | Protocole d'incident + audit de base | 6,7 |
| 12 | Projet final (3 applications) | Rejouer l'intégralité, durcir, documenter | 1→11 | Dossier technique de production complet | 1→11 |

Ordonnancement : **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12**. Les modules 4 (DNS) et 5 (pile) peuvent se recouvrir partiellement.

---

## 9. Structure de fichiers envisagée

```
guide_vps_depolement/
├── index.html                    # accueil / tableau de bord (HORS 12 pages)
├── assets/
│   ├── css/
│   │   ├── main.css              # jetons (couleurs, espacements, typo) + réinitialisation + base
│   │   ├── layout.css            # shell, en-tête, conteneur, grilles, responsive
│   │   └── components.css        # cartes, badges, alertes, exercices, onglets
│   ├── js/
│   │   ├── app.js                # entrée : importe les modules ci-dessous (+ boutons « copier »)
│   │   ├── navigation.js         # affichage des modules, états, précédent/suivant
│   │   ├── search.js             # recherche locale dans les métadonnées
│   │   └── progress.js           # progression locale (localStorage)
│   └── data/
│       └── modules.json          # plan des 12 modules (source de vérité nav)
├── cours/
│   ├── module-01-preparation.html
│   ├── module-02-linux-permissions.html
│   ├── module-03-ssh-root-parefeu.html
│   ├── module-04-reseau-dns.html
│   ├── module-05-stack-base-donnees.html
│   ├── module-06-deploiement-applications.html
│   ├── module-07-nginx-reverse-proxy-https.html
│   ├── module-08-git-workflow.html
│   ├── module-09-cicd-automatisation.html
│   ├── module-10-sauvegardes-restauration.html
│   ├── module-11-supervision-incidents.html
│   └── module-12-projet-final.html
├── exercices/                    # énoncés d'exercices (optionnel : inline dans les pages)
├── labs/                         # fichiers d'exemple : .env.example, unités systemd, vhosts
├── docs/
│   ├── CADRAGE.md                # CE document
│   ├── SOURCES.md                # catalogue documentaire + dates de vérification
│   ├── ARCHITECTURE.md           # architecture technique de production
│   ├── PROGRESS.md               # suivi de production des pages
│   ├── VALIDATION.md             # contrat de validation par page (§ 11)
│   └── GLOSSAIRE.md              # glossaire technique
└── README.md
```

**Conventions reprises des projets frères** (`formation-cda`, `cours-securite-web-2026`) — état **réellement implémenté (Prompt 2)** :

- ✅ ES modules dans `assets/js/`, `app.js` comme point d'entrée.
- ✅ `data-base` sur `<html>` pour résoudre les chemins (prépare les pages de `cours/`).
- ✅ `data-copy` pour copier une commande (câblé dans `app.js`).
- ⏳ `data-reveal` (solutions masquées) : **prévu pour les pages de cours**, pas encore implémenté — aucun contenu de cours n'existe.
- ✅ CSS découpé en **3 fichiers** (`main.css`, `layout.css`, `components.css`) — la découpe initiale en 5 fichiers (`reset`/`variables`/`base`) a été **fusionnée dans `main.css`**.
- ✅ Recherche locale dans les **métadonnées** (`modules.json`) : **aucun `search-index.json` généré** n'est nécessaire.
- ✅ Progression locale (`localStorage`) + réinitialisation.

> ⚠️ **Divergence Prompt 1 → Prompt 2/3 (structure) — conservée comme historique.** L'arborescence ci-dessus avait été *envisagée*. L'implémentation réelle est plus simple : 3 CSS au lieu de 5, 4 modules JS au lieu de 7, pas de `search-index.json`, pas de `assets/images/`, pas de `docs/GLOSSAIRE.md`. Les modules `code-blocks.js`, `solutions.js` et `toc.js` n'ont pas été créés (le bouton « copier » est géré dans `app.js`) et ne seront ajoutés que si un besoin réel apparaît.

---

## 10. Risques techniques et décisions restant à prendre

### 10.1 Décisions initialement en attente — **toutes résolues (Prompt 3)**

> Conservées comme **historique** de la formulation initiale. La colonne « Résolution » donne la décision effectivement prise. Détail : `docs/ARCHITECTURE.md`.

| Réf. | Décision (formulation Prompt 1) | Options envisagées | Résolution Prompt 3 |
| --- | --- | --- | --- |
| **D0** | 12 pages ou 60 pages ? | A) 12 modules / B) 60 pages / C) 12 hubs + sous-pages | ✅ **A — 12 pages + `index.html`** |
| **D2** | Moteur de base de données | A) MariaDB natif / B) Oracle MySQL via dépôt | ✅ **A — MariaDB native Debian 13** |
| **D3** | Exposition phpMyAdmin | A) tunnel SSH / B) VPN / C) `allow`/`deny` IP / D) désactivé | ✅ **A — local + tunnel SSH** |
| **D4** | Restriction SSH des comptes de déploiement | A) shell complet / B) `ForceCommand` / C) clé `command=` | ✅ **A — shell interactif conservé**, restrictions par permissions |
| **D5** | Frameworks applicatifs | Express, PHP natif ou Symfony/Laravel, Flask/FastAPI/Django | ✅ **Express nu, PHP natif + PDO, FastAPI + Uvicorn** |
| **D6** | Privilèges SQL pour migrations | A) DDL donné à `user_*` / B) user de migration séparé | ✅ **B — utilisateurs de migration distincts** |
| **D7** | Fonctions du site | confirmer la liste § 1.2 | ✅ **socle implémenté** (navigation, recherche, progression, copie) |
| **D8** | Client ACME | A) Certbot (`--nginx`) / B) `acme.sh` / C) autre | ✅ **A — Certbot** |
| **D9** | *(nouveau)* Rétention des versions | — | ✅ **5 dernières versions réussies** |
| **D10** | *(nouveau)* Supervision initiale | — | ✅ **systemd + journald + logrotate + outils natifs** |
| **D11** | *(nouveau)* IPv6 | — | ✅ **pris en compte (pare-feu et écoute)** |

### 10.2 Risques techniques identifiés

1. **Confusion MySQL/MariaDB** sur Debian 13 → risque de commandes fausses. *Mitigation :* D2 + vérification dépôts.
2. **Perte d'accès SSH** lors du durcissement → risque d'enfermement. *Mitigation :* ordre strict § 4, 2ᵉ session, console de secours OVHcloud, retour arrière documenté.
3. **Pare-feu verrouillant SSH** → *Mitigation :* règle SSH validée avant `apply`, `nft list ruleset`, rollback via console.
4. **4 Go de RAM pour 3 apps + base + phpMyAdmin** → risque d'OOM. *Mitigation :* limites systemd/FPM, swappiness, supervision, dimensionnement dans le module 11.
5. **Ports occupés / conflits de vhost** → *Mitigation :* `ss -ltnp`, `nginx -t`, conventions de ports figées.
6. **Secrets exposés** (`.env` dans Git, secrets dans le build React) → *Mitigation :* module 8/9, `.gitignore`, rappel « une variable React n'est jamais un secret ».
7. **Migration SQL destructrice couplée à un rollback** → *Mitigation :* migrations savantes, sauvegarde préalable, compatibilité N-1.
8. **Certificats expirés / renouvellement échoué** → *Mitigation :* `certbot renew --dry-run`, timer systemd, supervision.
9. **Dérive de cohérence entre 12 pages** (ports, chemins, noms) → *Mitigation :* `modules.json` comme source unique + revue transversale § 11.
10. **Sorties de terminal inventées** → *interdiction absolue*. Les sorties sont soit réelles, soit **explicitement étiquetées « exemple »**.

---

## 11. Stratégie de vérification et de validation

### 11.1 Contrat de validation par page (à appliquer avant de déclarer une page terminée)

- [ ] Le module correspond au `modules.json` (titre, numéro, ordre).
- [ ] Prérequis et objectifs mesurables présents.
- [ ] Chaque commande précise : poste local / VPS / shell SQL.
- [ ] Commandes vérifiées sur Debian 13 **ou** étiquetées « exemple non exécuté ».
- [ ] Options/arguments importants expliqués.
- [ ] Chemins, services, ports cohérents avec les autres pages (référentiel unique).
- [ ] Résultats attendus documentés ; erreurs fréquentes couvertes.
- [ ] Risques de sécurité expliqués ; opérations sensibles = préconditions + retour arrière.
- [ ] Exercice réalisable ; solution dans un bloc `data-reveal` masqué.
- [ ] Liens documentaires vérifiés (statut + date dans `SOURCES.md`).
- [ ] Lien précédent/suivant valide ; aucun lien vers une page inexistante.
- [ ] Responsive (mobile/desktop) ; navigation clavier ; contrastes AA.
- [ ] Aucune erreur console JS ; aucun placeholder à la place de contenu essentiel.

### 11.2 Validation transversale (fin de production)

Checklist des 14 points du prompt maître § 13 : ordre des 12 pages, cohérence ports/domaines/chemins/services, versions, liens internes/externes, commandes de sécurité, cohérence SQL, workflow de déploiement + rollback, scénarios d'incident, recherche/nav/progression, accessibilité + mobile, console JS, absence de secrets, documentation des tests, rapport final d'anomalies.

### 11.3 Ce qui sera réellement testé, et comment

- **Réalisable ici** : validation HTML/CSS/JS du site, absence de liens morts internes, absence de secrets (grep), cohérence du référentiel (ports, chemins) par script, rendu responsive (vérification navigateur), console JS.
- **Non réalisable ici (à étiqueter comme tel)** : exécution des commandes sur un vrai VPS Debian 13. Toute commande non exécutée sera marquée « exemple ». Aucune sortie ne sera présentée comme testée si elle ne l'est pas.

---

## 12. Prochaines étapes (état réel au 2026-10-17, après Prompt 5)

| # | Étape | Acteur | État |
| --- | --- | --- | --- |
| 1 | Trancher **D0** et les décisions **D2–D11** | Humain | ✅ **fait** (Prompt 3) |
| 2 | `docs/SOURCES.md` — catalogue documentaire + statut de vérification | Agent | ✅ **fait** (35 sources après le Prompt 5 ; 33 consultées, 1 insuffisante, 1 non vérifiée) |
| 3 | `docs/ARCHITECTURE.md` — référentiel technique unique | Agent | ✅ **fait** (consolidé Prompt 3, complété Prompt 5 § 1.4) |
| 4 | `assets/data/modules.json` + `docs/PROGRESS.md` + `docs/VALIDATION.md` | Agent | ✅ **fait** (mis à jour Prompt 5) |
| 5 | Socle : `index.html`, `assets/css/*`, `assets/js/*` testé | Agent | ✅ **fait** |
| 6 | Rédiger le **module 01** (guide court et opérationnel + parcours A/B) | Agent | ✅ **fait** (Prompt 5) — `status` = `drafted` ; **en attente de validation humaine** |
| 7 | Rédiger les modules **02 → 12** dans l'ordre, une page validée avant la suivante (contrat § 11.1) | Agent | ⛔ **non commencé** — le Prompt 5 demandait de s'arrêter après le module 01 |
| 8 | Validation transversale § 11.2 + rapport final d'anomalies | Agent | ⛔ à venir (après les 12 pages) |

**Prochaine action prévue :** après validation humaine du Prompt 5, rédiger le **module 02**
(`cours/module-02-linux-permissions.html`) puis passer son `status` à `drafted`.
Le passage à `available` (page publiée) relève du modèle d'état à 4 niveaux de `docs/PROGRESS.md`.

---

## Annexe A — État du dépôt inspecté (2026-10-17)

- Répertoire : `/home/brain/Documents/Documents/my/CDA/cda_last_courses/guide_vps_depolement`
- Contenu initial : `README.md` (1 ligne : `# guide_vps_depolement`) + `.git/`.
- Git : branche `main`, **1 commit** (`ac1fc5c Initial commit`), arbre propre, remote `origin` = `git@github.com:wazabi64000/guide_vps_depolement.git`.
- Aucun fichier supprimé ni modifié lors de cet audit.

## Annexe B — Ressources réutilisables repérées dans les projets frères

| Projet frère | Réutilisable |
| --- | --- |
| `formation-cda/` | `assets/js/{navigation,code-blocks,ui}.js`, découpage CSS, `data-base`/`data-copy`/`data-reveal` |
| `cours-securite-web-2026/` | recherche `data-search`, progression `data-progress` + `localStorage`, structure `index.html` + pages |
| `guide_monitoring/` | modèle mono-page `index.html` + `script.js` (grille + IntersectionObserver), thème supervision |
| `ARCHITECTURE.md`, `PROJECTS.md`, `RESOURCES.md` (racine) | conventions globales (pas de backend, variantes starter/solution/incident) |

## Annexe C — Sources à consulter (état au Prompt 5)

> **Mise à jour 2026-10-17 (Prompt 5).** Un troisième passage de vérification a été effectué : voir `docs/SOURCES.md`, qui contient les URL réellement testées, leurs codes de statut, leur date et leur niveau de confiance.
>
> **Bilan :** 35 sources listées — 33 consultées et exploitables (niveau A), 1 insuffisante (`systemd` manuels : HTTP **418**, blocage anti-bot) et 1 **NON VÉRIFIÉE** (`uvicorn` : aucun code de statut exploitable).
> Les 8 entrées ajoutées au Prompt 5 (`S1b`, `S5d`, `S5e`, `S22` à `S26`) ont été testées le 2026-10-17 : code `200` pour chacune, et vérification d'un extrait de contenu pour celles qui fondent une affirmation du cours.

Sources de référence : OVHcloud, Debian (doc + Handbook + notes de version + sécurité), Debian Wiki nftables, Nginx, Node.js, Express, React, PHP, Python, FastAPI, Uvicorn (**non vérifiée**), MariaDB, phpMyAdmin, Git, GitHub Actions, Certbot, OWASP Cheat Sheets, OpenSSH, systemd (**insuffisante**).
