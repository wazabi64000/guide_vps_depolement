# ARCHITECTURE — Référentiel technique de VPS Academy 2026

> **Statut :** référentiel de référence **consolidé** pour les 12 modules. Toute valeur utilisée dans les cours doit être cohérente avec ce document.
> **Dernière mise à jour :** 2026-10-17 (Prompt 3 — consolidation des décisions).
> **Règle :** les adresses IP, noms de domaine réels, mots de passe et clés ne figurent pas ici. Ils sont des **paramètres d'environnement** fournis par l'apprenant.
> **Fichiers liés :** `assets/data/modules.json` (plan des modules) · `index.html` (tableau de bord) · `docs/CADRAGE.md` (périmètre et historique des décisions).

---

## 0. Conventions de lecture

| Symbole | Signification |
| --- | --- |
| ✅ | Décision **validée** (Prompt 3 §2) — ne pas redemander |
| 🟡 | **Hypothèse** de travail, à confirmer en conditions réelles |
| 🔴 | **Non vérifié** — aucun test n'a été exécuté sur un serveur réel |
| ⏳ | Point nécessitant une **validation future** explicite |

> **Aucune commande de ce référentiel n'a été exécutée sur un VPS réel.** Les valeurs sont des cibles d'architecture ; les tests correspondants sont décrits en § 10 et devront être exécutés dans l'environnement approprié.

---

## 1. Infrastructure

| Élément | Valeur de référence | Statut |
| --- | --- | --- |
| Fournisseur (exemple) | OVHcloud | Exemple concret, non obligatoire |
| Offre (exemple) | VPS-1 | 🟡 à vérifier dans la console de l'hébergeur |
| Système | **Debian 13 « trixie »** | ✅ stable actuel ; 13.0 le 2025-08-09, 13.7 le 2026-09-12 |
| Support | Sécurité jusqu'au 2028-08-09 ; LTS jusqu'au 2030-06-30 | ✅ (source `docs/SOURCES.md` S5) |
| vCPU | 2 vCores (indicatif) | 🟡 selon l'offre |
| RAM | 4 Go (indicatif) | 🟡 selon l'offre |
| Disque | 40 Go SSD NVMe (indicatif) | 🟡 selon l'offre |
| Adresse IP | `$VPS_IP` (variable d'environnement) | non fournie volontairement |
| IPv4 | présumée disponible | 🟡 |
| IPv6 | **selon l'offre — à vérifier** | ✅ décision : à prendre en compte (§ 2.4) |

### 1.1 Services partagés (une seule instance chacun)

SSH, Nginx, MariaDB, une instance unique de phpMyAdmin, Certbot, systemd, Git, un mécanisme de sauvegarde, et le socle de supervision natif (§ 12).

### 1.2 Limites de ressources (repères, pas des garanties)

- 4 Go de RAM pour 3 applications + MariaDB + phpMyAdmin → risque d'OOM. Garde-fous : limites systemd (`MemoryMax`, `CPUQuota`) et `pm.max_children` du pool PHP-FPM.
- **Rétention disque** : 5 versions par application (§ 11.3). Sur un disque de 40 Go, la somme « 5 versions × 3 applications » doit rester vérifiée par `df` avant chaque déploiement.
- Aucun nombre fixe d'applications hébergeables n'est garanti.

### 1.3 Hypothèses et éléments encore inconnus

- Caractéristiques exactes de l'offre, présence d'IPv6, options de sauvegarde de l'hébergeur : 🟡 à relever au module 01.
- Type de virtualisation et effet « voisin bruyant » : 🟡 non mesuré.

### 1.4 Deux parcours d'installation, une seule architecture cible

Le référentiel décrit **une** architecture cible. Elle peut être atteinte de **deux** façons, traitées
au module 01 :

| | **Parcours A — VPS** | **Parcours B — serveur à domicile** |
| --- | --- | --- |
| Machine | Machine louée chez un hébergeur | PC, mini-PC ou machine virtuelle réutilisés |
| Adressage | IP publique fournie | IP privée derrière la box ; IP publique partagée ou non |
| Accès entrant | Direct | Via NAT, avec ou sans possibilité de redirection de port |
| Alimentation et connexion | Assurées par l'hébergeur | Dépendent du domicile (coupures, redémarrages) |
| Sauvegardes | Souvent proposées par l'hébergeur | À organiser entièrement soi-même |
| Reprise après panne | Console et réinstallation côté hébergeur | Sur site, à la main |

**Règle commune aux deux parcours :** l'administration se fait **par SSH** sur une machine Debian 13 ;
les comptes, les clés, les services, les bases et les sauvegardes sont **identiques**.

**Ce qui n'est pas affirmé :** aucune **équivalence de disponibilité** entre les deux parcours. Un serveur
à domicile ne fournit pas les mêmes garanties qu'un hébergeur (électricité, connexion, matériel).

#### Règles d'exposition (Parcours B)

1. **Réseau local seulement** — le plus sûr : aucun port publié.
2. **Accès distant par VPN** — un tunnel (ex. WireGuard) ramène le serveur « comme en local ».
3. **Publication web** — seulement après avoir vérifié IP publique, NAT, règles de pare-feu, DNS et HTTPS.

**Interdictions, quel que soit le parcours :** ne jamais publier MariaDB (`3306`), phpMyAdmin, ni les ports
internes des applications (`3001`, `8000`). Ne pas exposer `22` sans mesures adaptées. Un port fermé en
IPv4 peut être ouvert en IPv6 : vérifier **les deux** familles.

**Cas CGNAT** (opérateur partageant une IP publique, RFC 6598 `100.64.0.0/10`) : la redirection de port
IPv4 peut être impossible. Alternatives : IPv6 correctement filtré, VPN avec un point d'entrée joignable,
ou tunnel sortant. **Aucune publication publique n'est garantie** depuis une connexion domestique.

> Statut : 🔴 **documenté, non testé** — aucune box, aucun serveur à domicile, aucun VPS n'a été modifié
> dans le cadre de ce travail.

---

## 2. Domaines, ports et routage

### 2.1 Domaines d'exemple

`exemple.fr` est un **domaine fictif de documentation** (RFC 2606/6761). Ne jamais l'utiliser en production.

| Domaine d'exemple | Application | Rôle |
| --- | --- | --- |
| `app-react.exemple.fr` | A — React + Express | Front statique React + API Express (`/api/`) |
| `app-php.exemple.fr` | B — PHP natif + PDO | Application PHP via PHP-FPM |
| `app-python.exemple.fr` | C — FastAPI + Uvicorn | API Python exposée par Nginx |

### 2.2 Table des ports et interfaces d'écoute

| Service | Port / socket | Interface(s) d'écoute | Exposé publiquement |
| --- | --- | --- | --- |
| SSH | `22/tcp` (port à adapter) | IPv4 + IPv6 selon politique | **Oui** (politique SSH) |
| Nginx HTTP | `80/tcp` | IPv4 + IPv6 | Oui (redirection 301 → HTTPS) |
| Nginx HTTPS | `443/tcp` | IPv4 + IPv6 | Oui |
| Express (app A) | `127.0.0.1:3001` | **boucle locale IPv4 uniquement** | **Non** |
| PHP-FPM (app B) | socket `/run/php/app-php.sock` | fichier local | **Non** |
| FastAPI/Uvicorn (app C) | `127.0.0.1:8000` | **boucle locale IPv4 uniquement** | **Non** |
| MariaDB | `127.0.0.1:3306` | **boucle locale IPv4 uniquement** | **Non** |
| phpMyAdmin | `127.0.0.1:8443` (Nginx local) | **boucle locale IPv4 uniquement** | **Non** (tunnel SSH) |

> Les ports `3001` et `8000` sont des **valeurs de référence**, internes, jamais ouvertes publiquement.

### 2.3 Routage Nginx

Un fichier `server` par domaine dans `/etc/nginx/sites-available/`, activé par lien symbolique dans `sites-enabled/` (nommage `app-react.conf`, `app-php.conf`, `app-python.conf`).

- **App A** : `root` vers le build React (`dist/`) ; `location /api/` → `proxy_pass http://127.0.0.1:3001`.
- **App B** : `root` vers `/srv/apps/php-app/current/public` ; `location ~ \.php$` → `fastcgi_pass unix:/run/php/app-php.sock`.
- **App C** : `proxy_pass http://127.0.0.1:8000`.
- **En-têtes de proxy** (rôle expliqué dans le cours) : `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`.
- **TLS** : un certificat par domaine (`app-react.exemple.fr`, etc.). Redirection HTTP → HTTPS ; HSTS ⏳ à décider après validation des trois domaines.

### 2.4 IPv4 / IPv6 (décision validée)

- Nginx et SSH doivent écouter explicitement sur **IPv4 et IPv6** lorsque IPv6 est disponible.
- Le pare-feu (nftables) doit filtrer **les deux familles** : une règle `inet` unique traitant `ip` **et** `ip6`, ou des règles `ip`/`ip6` explicites.
- **Limite à enseigner explicitement :** fermer un port en IPv4 **ne protège pas** si le même service écoute en IPv6. Un service écoutant sur `*:3001` en double pile est joignable en IPv6 même si la règle IPv4 l'interdit.
- Interfaces internes : Express, Uvicorn, MariaDB et phpMyAdmin sont liés à `127.0.0.1` (IPv4 boucle locale) — ils **n'écoutent pas** sur `::1` ni sur l'interface publique. Une écoute en `::` serait une régression à tester (§ 10, Q10).
- Si IPv6 **n'est pas** disponible sur l'offre : le documenter (module 04) comme une limite de l'environnement, sans supposer que le serveur est protégé pour autant.
- Vérifications associées : `ss -lntup` (les deux familles), `ip -6 addr`, `nft list ruleset`.

---

## 3. Comptes Linux et responsabilités

### 3.1 Matrice des comptes

| Identité | Responsabilité | sudo | Shell | Clé SSH | Statut |
| --- | --- | --- | --- | --- | --- |
| Administrateur nominatif (ex. `admin`) | Administration du VPS | **contrôlé** (groupe `sudo`) | interactif | clé dédiée | ✅ |
| `deploy-react` | Déploiement app A | **aucun sudo général** | **interactif conservé**, permissions limitées | clé distincte | ✅ |
| `deploy-php` | Déploiement app B | **aucun sudo général** | interactif, permissions limitées | clé distincte | ✅ |
| `deploy-python` | Déploiement app C | **aucun sudo général** | interactif, permissions limitées | clé distincte | ✅ |
| `svc-react` | **Exécution** du processus Express | aucun | `/usr/sbin/nologin` | aucune | ✅ |
| `svc-php` | **Exécution** du pool PHP-FPM | aucun | `/usr/sbin/nologin` | aucune | ✅ |
| `svc-python` | **Exécution** de Uvicorn | aucun | `/usr/sbin/nologin` | aucune | ✅ |
| `root` | Compte système (UID 0) | — | connexion SSH **désactivée** après validation | clé admin recommandée | ✅ |

**Séparation exécution / déploiement (décision validée) :** les comptes `deploy-*` **déploient** (écrivent, publient, rechargent leur service) ; les comptes `svc-*` **exécutent** (lancent le processus, lisent la configuration et les secrets). Aucun compte ne cumule les deux rôles.

**Shell interactif conservé (décision validée) :** les comptes de déploiement gardent un shell **interactif** (pas de `ForceCommand` bloquant par défaut), mais leurs **permissions Linux et leurs droits d'accès** restent limités à leur application. La restriction principale est donc **de permissions**, non de commande. Conséquence à assumer : un `deploy-*` peut lancer n'importe quelle commande autorisée à son UID — il ne peut simplement **pas** lire ni modifier les données des autres applications, ni obtenir de privilèges.

### 3.2 Groupes

| Groupe | Membres | Rôle |
| --- | --- | --- |
| `reactapp` | `deploy-react`, `svc-react` | App A |
| `phpapp` | `deploy-php`, `svc-php` | App B |
| `pythonapp` | `deploy-python`, `svc-python` | App C |

Aucun compte de déploiement n'appartient au groupe d'une autre application.

### 3.3 Principes

- **Clés SSH distinctes** par compte de déploiement ; clés privées **jamais** sur le VPS.
- **Permissions minimales** ; chaque application ignore les fichiers des autres.
- **Protection des secrets** : fichiers d'environnement en `640`, propriété `root:<groupe-app>`.
- **Tests d'accès croisés obligatoires** (§ 10, Q1–Q3).
- **Limite explicite :** trois comptes SSH **ne constituent pas une isolation complète**. Sans isolation noyau (conteneur/VM), une compromission de `root` atteint les trois applications. Les comptes séparent les responsabilités ; ils ne créent pas de frontière de sécurité forte.

---

## 4. Arborescence applicative

Convention sous `/srv/apps/`, avec livraisons versionnées et lien `current` pour un basculement atomique.

```text
/srv/apps/
├── react-app/
│   ├── releases/
│   │   ├── 20261015-0930/
│   │   ├── 20261016-1415/
│   │   └── 20261017-1010/          # version active (5 dernières conservées)
│   │       ├── dist/               # build React (statique, public)
│   │       └── server/             # code de l'API Express
│   ├── current -> releases/20261017-1010
│   └── shared/
│       ├── .env                    # secrets (640, root:reactapp)
│       └── logs/                   # journaux applicatifs (optionnel)
├── php-app/
│   ├── releases/<horodatage>/
│   │   ├── public/                 # SEUL dossier exposé par Nginx
│   │   └── src/                    # code PHP + PDO
│   ├── current -> releases/<horodatage>
│   └── shared/.env                 # 640, root:phpapp
└── python-app/
    ├── releases/<horodatage>/app/  # code FastAPI
    ├── venv/                       # environnement virtuel Python (svc-python)
    ├── current -> releases/<horodatage>
    └── shared/.env                 # 640, root:pythonapp
```

### 4.1 Propriété et permissions (cibles à vérifier en conditions réelles 🔴)

| Chemin | Propriétaire | Groupe | Mode | Justification |
| --- | --- | --- | --- | --- |
| `/srv/apps/<app>` | `deploy-<app>` | `<appgroupe>` | `750` | Personne d'autre ne traverse |
| `/srv/apps/<app>/releases` | `deploy-<app>` | `<appgroupe>` | `750` | Livraisons |
| `/srv/apps/<app>/releases/<ver>` | `deploy-<app>` | `<appgroupe>` | `750` | Lecture par `svc-*`, écriture par `deploy-*` |
| `/srv/apps/<app>/current` | (lien symbolique) | — | — | Bascule atomique |
| `/srv/apps/<app>/shared` | `deploy-<app>` | `<appgroupe>` | `750` | Secrets et journaux |
| `/srv/apps/<app>/shared/.env` | `root` | `<appgroupe>` | `640` | Lisible par le service, **non modifiable par lui** (Q5) |
| Dossier public PHP | `deploy-php` | `phpapp` | `755` | `www-data` (Nginx) doit lire les fichiers servis |

**Interdits :** aucun secret dans un dossier public ; aucun secret dans un build frontend React (les variables compilées sont publiques par nature) ; aucun mot de passe en clair dans un dépôt Git.

### 4.2 Versionnement et retour arrière

- Chaque déploiement crée `releases/<horodatage>` **sans écraser** la version active.
- `current` pointe vers la livraison active.
- **Rollback** = repointer `current` vers la livraison précédente connue comme fonctionnelle + recharger le service concerné.
- Politique de rétention : **5 versions réussies** (§ 11).

---

## 5. Services et ports

| Service | Rôle | Utilisateur d'exécution | Lancement | Port / socket | Exposition | Config | Journaux | Contrôle de santé |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SSH (sshd) | Accès distant | `root` (démon) | `ssh.service` | `22/tcp` | publique (politique) | `/etc/ssh/sshd_config` | `journalctl -u ssh` | `ssh -v` / `ssh -T` |
| Nginx | Reverse proxy + statique | `www-data` | `nginx.service` | `80`, `443` | publique | `/etc/nginx/` | `/var/log/nginx/` + journald | `nginx -t`, `curl -I` |
| Express (app A) | API Node.js | `svc-react` | `app-react-api.service` | `127.0.0.1:3001` | locale | unité systemd + `.env` | `journalctl -u app-react-api` | `curl 127.0.0.1:3001/health` |
| PHP-FPM (app B) | Exécution PHP | `svc-php` (pool) | `php8.4-fpm.service` | socket `/run/php/app-php.sock` | locale | `/etc/php/8.4/fpm/pool.d/app-php.conf` | `/var/log/php8.4-fpm.log` + journald | `curl -I https://app-php.../health` |
| FastAPI/Uvicorn (app C) | API Python | `svc-python` | `app-python-web.service` | `127.0.0.1:8000` | locale | unité systemd + `.env` | `journalctl -u app-python-web` | `curl 127.0.0.1:8000/health` |
| MariaDB | Base de données | `mysql` | `mariadb.service` | `127.0.0.1:3306` | locale | `/etc/mysql/` | `/var/log/mysql/` + journald | `mariadb-admin ping` |
| phpMyAdmin | Administration SQL | `svc-php` (pool dédié) | Nginx local + pool | `127.0.0.1:8443` | **tunnel SSH** | vhost local + pool | `/var/log/nginx/` | accès via tunnel |
| Certbot | Renouvellement TLS | `root` | `certbot.timer` | — | — | `/etc/letsencrypt/` | `journalctl -u certbot` | `certbot renew --dry-run` |
| logrotate | Rotation des journaux fichiers | `root` | `logrotate.timer` | — | — | `/etc/logrotate.d/` | — | `logrotate -d /etc/logrotate.conf` |

> PHP-FPM sur Debian 13 correspond à **PHP 8.4** 🟡 (numéro à confirmer au module 05 selon le paquet installé).

---

## 6. MariaDB et séparation SQL

- **Une seule instance MariaDB**, installée depuis les paquets Debian 13 (`sudo apt install mariadb-server`). Aucune source tierce.
- Écoute limitée à `127.0.0.1` (`bind-address = 127.0.0.1`). 🔴 à confirmer par `ss -lntp`.

### 6.1 Bases et utilisateurs

| Base | Utilisateur d'exécution | Utilisateur de migration | Hôte |
| --- | --- | --- | --- |
| `app_react` | `user_react` | `migrate_react` | `localhost` |
| `app_php` | `user_php` | `migrate_php` | `localhost` |
| `app_python` | `user_python` | `migrate_python` | `localhost` |

### 6.2 Privilèges attendus (cibles à vérifier au module 05)

| Compte | Privilèges | Portée | Usage |
| --- | --- | --- | --- |
| `user_*` (exécution) | `SELECT, INSERT, UPDATE, DELETE` | `<base>.*` **uniquement** | Requêtes applicatives courantes |
| `migrate_*` (migration) | `CREATE, ALTER, DROP, INDEX, REFERENCES` (+ DML) | `<base>.*` **uniquement** | **Uniquement** pendant un déploiement appliquant des migrations |

- **Aucun `GRANT ALL`.** Aucun `GRANT ... ON *.*` pour ces comptes.
- Les comptes d'exécution **ne peuvent pas** exécuter de DDL (Q6) et **ne peuvent pas** lire une autre base (Q7).
- Les comptes de migration sont utilisés avec un **identifiant distinct**, jamais embarqués dans l'application en production.

### 6.3 Connexion et secrets

- Connexion **locale** uniquement.
- Identifiants dans les fichiers `.env` (`640`, `root:<groupe-app>`), **jamais** dans le code ni dans Git.
- **Rotation des secrets** : générer un nouveau mot de passe → l'appliquer côté SQL (`ALTER USER`) → mettre à jour `.env` → redémarrer le service → tester. L'ancien mot de passe est retiré après vérification.

> Aucun mot de passe n'est fourni. L'apprenant génère ses secrets aléatoirement.

### 6.4 Syntaxe SQL

Exemples écrits en syntaxe **MariaDB** (compatible MySQL dans la majorité des cas). Toute instruction `CREATE USER` / `GRANT` sera vérifiée contre la documentation MariaDB en vigueur avant rédaction.

---

## 7. phpMyAdmin

- **Non exposé publiquement.** Aucun vhost sur `80`/`443`.
- Vhost Nginx **écoutant uniquement sur `127.0.0.1:8443`**, servi par un pool PHP-FPM dédié.
- **Accès par tunnel SSH** réservé aux administrateurs autorisés :
  `ssh -L 8443:127.0.0.1:8443 admin@$VPS_IP` puis `http://localhost:8443`.
- Authentification `auth_type = cookie`.
- **Aucun compte d'administration SQL n'est utilisé par les applications.**

> Le principe du tunnel est documenté ; 🔴 **aucune configuration de production n'a été testée** dans cette phase (Q8).

---

## 8. Sécurité et isolation

### 8.1 Contrôles obligatoires (socle)

- Comptes SSH séparés (admin nominatif + 3 comptes de déploiement) avec **clés distinctes**.
- **Aucun sudo général** pour `deploy-*` ni `svc-*`.
- SSH par **clé** ; connexion directe de `root` **désactivée après validation**.
- Permissions minimales (§ 4.1) ; secrets lisibles uniquement par le service et l'administrateur.
- Séparation des services (`User=` systemd, pool FPM distinct).
- Interfaces d'écoute restreintes à la boucle locale pour Express, Uvicorn, MariaDB, phpMyAdmin.
- **Pare-feu nftables** filtrant **IPv4 et IPv6** : seuls SSH (politique), 80 et 443 ouverts.
- **Stratégie de récupération** en cas de perte d'accès : console de secours de l'hébergeur + ordre de durcissement SSH documenté.

### 8.2 Renforcements complémentaires (hors socle obligatoire)

- Confinement systemd (`ProtectSystem`, `PrivateTmp`, `NoNewPrivileges`) selon pertinence.
- Limites de ressources (`MemoryMax`, `CPUQuota`) pour éviter l'effet « voisin bruyant ».
- Journalisation centralisée et alertes (module 11).

### 8.3 Garanties et limites

| Élément | Garanti | Non garanti |
| --- | --- | --- |
| Fichiers | Séparation par permissions/groupe | — |
| Processus | Séparation par `User=` et pool | Isolation noyau (namespaces) |
| Secrets | `.env` en `640 root:<groupe>` | Résistance à `root` compromis |
| Données SQL | Privilèges par base | Chiffrement au repos |
| Réseau | Boucle locale + pare-feu IPv4/IPv6 | Protection contre une élévation de privilèges |
| Ressources | Limites systemd optionnelles | Isolation complète CPU/RAM |

**Explicitement hors socle : conteneurs et machines virtuelles.** Aucune isolation de type conteneur n'est ajoutée sans décision validée.

### 8.4 Tests d'accès croisés (à appliquer dans les modules)

Liste et résultats attendus détaillés en § 10.

---

## 9. CI/CD

**Principe : un pipeline indépendant par application.**

| Aspect | Règle |
| --- | --- |
| Périmètre | Un dépôt par application |
| Tests | Unitaires + intégration, exécutés **avant** tout déploiement |
| Artefacts | Build React (`dist/`), dépendances PHP (Composer), Python (`venv`/`requirements.txt`) |
| Secrets CI/CD | Coffre de la forge, jamais dans le code |
| Clé de déploiement | Clé SSH **dédiée**, `deploy-*`, **sans sudo** |
| Opérations autorisées | Écrire dans `releases/`, rafraîchir `current`, redémarrer **son** service |
| Contrôle de santé | Requête HTTP sur `/health` après déploiement |
| Migrations | Via `migrate_*`, réversibles, sauvegarde préalable |
| Verrouillage | Un déploiement à la fois par application (`concurrency`) |
| Rollback | Repointer `current` + redémarrer le service |

**Interdit :** accorder des privilèges administrateur généraux au pipeline pour simplifier le déploiement.

> GitHub Actions est l'exemple de référence ; les principes sont transposables à d'autres forges.

---

## 10. Matrice de contrôle d'accès (Phase C)

**Aucun de ces contrôles n'a été exécuté** (le VPS ne doit pas être modifié pendant cette phase). Chaque ligne indique le contrôle attendu, le mécanisme, le test futur, le résultat attendu et la limite.

| # | Question | Mécanisme de protection | Test futur | Résultat attendu | Limite |
| --- | --- | --- | --- | --- | --- |
| Q1 | `deploy-react` peut-il lire les secrets PHP ? | `/srv/apps/php-app/shared/.env` en `640 root:phpapp` ; `deploy-react ∉ phpapp` | `sudo -u deploy-react cat /srv/apps/php-app/shared/.env` | **Permission refusée** (`Permission denied`) | Un `root` compromis lit tout |
| Q2 | `deploy-php` peut-il modifier les fichiers React ? | `/srv/apps/react-app` en `750 deploy-react:reactapp` ; `deploy-php ∉ reactapp` | `sudo -u deploy-php touch /srv/apps/react-app/current/dist/x` | **Permission refusée** | Groupes mal attribués = échec silencieux |
| Q3 | `deploy-python` peut-il lire les configurations des deux autres apps ? | Idem Q1/Q2 pour les deux autres arborescences | `sudo -u deploy-python cat ...` sur les deux `.env` et les configs | **Permission refusée** | Idem |
| Q4 | Un compte de déploiement peut-il obtenir un shell root ou un sudo général ? | Aucune entrée dans `/etc/sudoers` ni `sudoers.d` pour `deploy-*` | `sudo -l -U deploy-react` puis `sudo -u deploy-react sudo -l` | **Aucun droit sudo** ; `sudo` refuse | Une mauvaise entrée `sudoers` ouvrirait une élévation |
| Q5 | Les services peuvent-ils modifier leurs propres fichiers sensibles ? | `.env` appartient à `root:groupe`, mode `640` → `svc-*` peut **lire** mais **pas écrire** | Depuis le compte de service : `test -w /srv/apps/<app>/shared/.env` | **Non inscriptible** pour `svc-*` | `svc-*` peut lire ses propres secrets (nécessaire) |
| Q6 | Un utilisateur SQL d'exécution peut-il faire des migrations DDL inutiles ? | `user_*` limité à DML ; DDL réservé à `migrate_*` | En session `user_react` : `CREATE TABLE ...` | **Erreur `command denied`** | Une erreur de `GRANT` pourrait élargir les droits |
| Q7 | Un utilisateur SQL peut-il lire les autres bases ? | Chaque `user_*` limité à `<sa base>.*` | `user_react` : `SELECT ... FROM app_php.table` | **Erreur `command denied`** | — |
| Q8 | phpMyAdmin est-il accessible directement depuis Internet ? | Vhost uniquement sur `127.0.0.1:8443` ; pare-feu sans règle 8443 | Depuis l'extérieur : `curl http://$VPS_IP:8443` ; puis `ss -lntp \| grep 8443` | **Connexion refusée** ; écoute sur `127.0.0.1` seulement | Une règle pare-feu ajoutée par erreur rouvrirait l'accès |
| Q9 | Un port applicatif interne est-il publié par erreur ? | Express/Uvicorn liés à `127.0.0.1` ; pare-feu sans 3001/8000 | `ss -lntup` puis `curl http://$VPS_IP:3001` | Écoute `127.0.0.1` uniquement ; **connexion refusée de l'extérieur** | Un `0.0.0.0` accidentel exposerait le service |
| Q10 | Les services sont-ils protégés **en IPv4 et en IPv6** ? | Pare-feu `inet` couvrant `ip` et `ip6` ; services internes liés à `127.0.0.1` **et non** `::` | `ss -lntup` (les deux familles) ; `ip -6 addr` ; `nft list ruleset` ; test depuis un client IPv6 | Ports internes absents en IPv6 ; seuls 22/80/443 filtrés mais ouverts | Si IPv6 absent de l'offre, la limite doit être **documentée**, pas supposée sûre |

> **Règle de rédaction :** ces dix contrôles seront fournis comme tests exécutables dans les modules concernés (03, 05, 06, 07). Tant qu'ils ne sont pas exécutés, ils restent **non vérifiés** (🔴).

---

## 11. Rétention des versions et mécanisme de déploiement

### 11.1 Décision

✅ **Conserver les 5 dernières versions réussies de chaque application**, sous réserve de l'espace disque.

### 11.2 Séquence de déploiement (à documenter puis valider avant les commandes de production ⏳)

1. **Créer** une nouvelle version : `releases/<horodatage>` — sans toucher à la version active.
2. **Vérifier** la nouvelle version (fichiers présents, dépendances installées, démarrage à vide si possible).
3. **Contrôler avant bascule** : contrôle de santé de la nouvelle version **avant** de déplacer `current`.
4. **Basculer** `current` seulement si les contrôles ont réussi (bascule atomique du lien symbolique).
5. **Recharger/redémarrer** le service concerné, puis re-contrôler `/health`.
6. **Nettoyer** : supprimer les livraisons au-delà de la 5ᵉ **après** validation du déploiement.
7. **Vérifier l'espace disque** (`df -h`) avant d'accepter un nouveau déploiement.

### 11.3 Règles de rétention

- **Ne jamais supprimer la version active** (`current`), ni une version en cours de validation.
- **Préserver les données et fichiers partagés** (`shared/`) : ils ne sont **jamais** dans `releases/` et survivent au rollback.
- Le nettoyage ne supprime que des `releases/<ver>` **antérieures** à la 5ᵉ plus récente, et jamais le lien `current`.
- Si l'espace disque est insuffisant : **refuser** le déploiement et alerter, plutôt que de supprimer une version plus récente.

### 11.4 Retour arrière

- **Rollback** = repointer `current` vers une version connue comme fonctionnelle (une des 5 conservées) + redémarrer le service.
- Les migrations SQL : rollback **uniquement** si la migration est réversible ; sinon, restaurer la sauvegarde préalable (module 10).

---

## 12. Supervision initiale

✅ Socle retenu : **aucune plateforme de supervision lourde**.

| Outil | Rôle | Usage dans le cours |
| --- | --- | --- |
| `systemd` | État des services | `systemctl status`, `is-active`, `is-enabled` |
| `journald` | Journaux système et applicatifs | `journalctl -u <service>`, `-p err`, `--since` |
| `logrotate` | Rotation des journaux **fichiers** (Nginx, MariaDB, PHP-FPM) | `/etc/logrotate.d/`, mode `-d` (simulation) |
| Outils Linux natifs | CPU, RAM, swap, stockage, ports, processus | `top`/`htop`, `free -h`, `vmstat`, `df -h`, `du`, `ss -lntup`, `ps` |

**Non ajouté à ce stade :** Prometheus, Grafana, Netdata, agents APM, SaaS de supervision (⏳ décision ultérieure si besoin, en dehors du socle).

---

## 13. Décisions, hypothèses, points non vérifiés

### 13.1 Décisions validées (Prompt 3 §2)

Périmètre 12 pages + `index.html` (hors compte) ; dossier `cours/` ; HTML/CSS/JS ESM natif ; App A React + Express ; App B **PHP natif + PDO** ; App C FastAPI + Uvicorn ; **MariaDB native Debian 13** ; Nginx ; Let's Encrypt/Certbot ; admin nominatif avec sudo contrôlé ; `deploy-react|php|python` ; clés SSH distinctes ; **aucun sudo général** ; **shell interactif conservé** avec permissions limitées ; **comptes d'exécution `svc-*` séparés** ; tests d'accès croisés ; 1 MariaDB / 3 bases / 3 users d'exécution / 3 users de migration, privilèges limités, non exposée ; phpMyAdmin local + tunnel SSH ; **rétention 5 versions** ; supervision **systemd/journald/logrotate/outils natifs** ; **IPv4 + IPv6** pris en compte.

### 13.2 Hypothèses

- Caractéristiques du VPS, présence d'IPv6, PHP 8.4, Node LTS, versions applicatives : 🟡 à confirmer.

### 13.3 Non vérifié (🔴 — aucune exécution réelle)

- Toute la matrice § 10 (Q1–Q10).
- La disponibilité effective des ports, le fonctionnement du tunnel phpMyAdmin, le renouvellement Certbot.
- Les permissions cibles du § 4.1.

### 13.4 Validations futures (⏳)

| Réf. | Point | Module |
| --- | --- | --- |
| V1 | Politique HSTS après validation des trois domaines | 07 |
| V2 | Réversibilité concrète de chaque migration SQL | 09, 10 |
| V3 | Choix d'un outil de supervision **si** le socle natif devient insuffisant | 11 |
| V4 | Restriction SSH plus stricte des comptes de déploiement (si nécessaire) | 03, 09 |
| V5 | Confinement systemd (durcissement complémentaire) | 06, 11 |
| V6 | Comportement si IPv6 indisponible : documentation de la limite | 04 |

### 13.5 Écart de dénomination résolu

Le dossier officiel des pages de cours est **`cours/`** (décision Prompt 3 §2). Le Prompt 2 §3 mentionnait `pages/` : cette mention est **caduque**. Les douze entrées de `assets/data/modules.json` pointent sous `cours/`.
