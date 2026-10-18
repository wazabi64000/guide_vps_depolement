# SOURCES — Catalogue documentaire de VPS Academy 2026

> **Méthode de vérification.** Chaque URL est testée par requête HTTP (`curl -L`, code de statut) depuis l'environnement de production. La colonne « Vérif. » donne le résultat **réel**.
>
> **Trois passages ont été effectués le 2026-10-17** : un premier lors du Prompt 2, un second lors du Prompt 3 (recontrôle des sources non vérifiées et des sources complémentaires), un troisième lors du Prompt 5 (sources de réseau, d'adressage et d'accès distant nécessaires au parcours « serveur à domicile »). Les passages donnent les mêmes résultats sur les URL concernées.
>
> **Aucune date de consultation, version ou conclusion n'est inventée.** Un code `200` signifie uniquement que la page a répondu ; il ne vaut pas validation du contenu. Pour les sources ajoutées au Prompt 5, un extrait du contenu réellement reçu est cité en colonne « Précautions » quand la source est citée dans une page de cours.

## Niveaux de confiance employés

| Niveau | Signification |
| --- | --- |
| **A — Consultée et exploitable** | La page a répondu (`200`) et son contenu correspond au sujet visé. |
| **B — Consultée mais insuffisante** | La page a répondu, mais elle est inaccessible dans la pratique (blocage anti-bot), partielle, ou ne couvre pas le besoin. |
| **C — Inaccessible / non vérifiée** | Aucun code de statut exploitable obtenu. La source reste une **référence à consulter ultérieurement**, jamais présentée comme vérifiée. |

Distinction appliquée : **Doc produit** (éditeur du logiciel) · **Doc distribution** (Debian) · **Guide générique**.

---

## 1. Hébergeur et système

| # | Organisme | Sujet | URL | Vérif. 2026-10-17 | Niveau | Modules | Utilité | Précautions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | OVHcloud | Documentation générale VPS | https://docs.ovhcloud.com/fr/ | **200** | A | 01, 03, 04 | Console, réseau, snapshots, réinstallation | Liée à un fournisseur : présentée comme exemple transposable (doc produit, non doc Debian) |
| S1b | OVHcloud | Page produit « VPS » | https://www.ovhcloud.com/fr/vps/ | **200** | A | 01 | Offres VPS, caractéristiques et options affichées | Page commerciale : sert seulement à **situer** l'offre. Les caractéristiques réelles se relèvent dans la console, jamais dans cette page |
| S2 | Debian | Documentation officielle | https://www.debian.org/doc/ | **200** | A | tous | Point d'entrée de la doc Debian (doc distribution) | — |
| S3 | Debian | Debian Handbook | https://www.debian.org/doc/manuals/debian-handbook/ | **200** | A | 02, 05, 11 | Administration, paquets, services | Vérifier l'édition correspondant à trixie |
| S4 | Debian Wiki | nftables | https://wiki.debian.org/nftables | **200** | A | 03 | Référence du pare-feu natif Debian | Contenu wiki : revérifier avant usage |
| S5 | Debian | Page des versions | https://www.debian.org/releases/ | **200** | A | 01, tous | Statut de trixie (stable), dates de support | Source des faits de version |
| S5b | Debian | Notes de version trixie | https://www.debian.org/releases/trixie/releasenotes | **200** | A | 01, 05 | Nouveautés et paquets de Debian 13 | Forme `release-notes/` également testée : **200** |
| S5c | Debian | Avis de sécurité | https://www.debian.org/security/ | **200** | A | 02, 11 | Suivi des correctifs de sécurité | — |
| S5d | Debian | Guide d'installation trixie | https://www.debian.org/releases/trixie/installmanual | **200** | A | 01 (parcours B) | Installation d'un système Debian 13 sur une machine | Page vérifiée : titre « Installation Guide » et cible `amd64` présents. Le support d'installation détaillé est renvoyé au module 02 |
| S5e | Debian Wiki | NetworkConfiguration | https://wiki.debian.org/NetworkConfiguration | **200** | A | 01 (parcours B), 04 | Configuration réseau de la machine | Contenu vérifié : `/etc/network`, `interfaces`, NetworkManager mentionnés. Contenu wiki : revérifier avant usage |

## 2. Socle serveur

| # | Organisme | Sujet | URL | Vérif. 2026-10-17 | Niveau | Modules | Utilité | Précautions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S6 | Nginx | Documentation officielle | https://nginx.org/en/docs/ | **200** | A | 05, 07 | Directives, reverse proxy, TLS | Version Debian ≠ dernière version amont |
| S6b | Nginx | Module `stream` (TCP/UDP) | https://nginx.org/en/docs/stream/ngx_stream_core_module.html | **200** | A | 07 | Référence de l'écoute IPv4/IPv6 | Non nécessaire au socle initial |
| S7 | Certbot / EFF | Documentation et instructions | https://certbot.eff.org/ | **200** | A | 07 | Obtention et renouvellement TLS | Choisir la bonne combinaison serveur/OS |
| S8 | MariaDB | Documentation | https://mariadb.com/docs/ | **200** | A | 05, 10 | Installation, utilisateurs, privilèges, sauvegarde | Version Debian à confirmer au module 05 |
| S8b | MariaDB | Documentation serveur | https://mariadb.com/docs/server/ | **200** | A | 05 | Renvoi vers la doc serveur | — |
| S9 | phpMyAdmin | Documentation officielle | https://docs.phpmyadmin.net/ | **200** | A | 05 | Installation, `auth_type`, sécurité | Ne pas exposer publiquement |

## 3. Runtimes (doc produit)

| # | Organisme | Sujet | URL | Vérif. 2026-10-17 | Niveau | Modules | Utilité | Précautions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S10 | OpenJS / Node.js | Documentation Node.js | https://nodejs.org/docs/ | **200** | A | 05, 06 | Installation, LTS, Express | Debian fournit un Node plus ancien : ne pas installer n'importe quelle version |
| S10b | Node.js | Page de téléchargement (LTS) | https://nodejs.org/en/download | **200** | A | 05 | Choix de la version LTS | Vérifier la LTS en cours au moment du cours |
| S11 | Express | Documentation | https://expressjs.com/ | **200** | A | 06 | Routes, middleware, gestion d'erreurs | Vérifier la version majeure utilisée |
| S12 | Meta / React | Documentation | https://react.dev/ | **200** | A | 06, 08 | Build, variables d'environnement | Une variable compilée **n'est jamais un secret** |
| S13 | PHP | Manuel PHP (FR) | https://www.php.net/manual/fr/ | **200** | A | 05, 06 | PDO, sessions, config | Config PHP-FPM propre à Debian (`/etc/php/8.4/`) |
| S14 | Python | Documentation officielle | https://docs.python.org/3/ | **200** | A | 05, 06 | `venv`, packaging, stdlib | Version système à confirmer |
| S14b | Python | Module `venv` | https://docs.python.org/3/library/venv.html | **200** | A | 06 | Création d'environnement virtuel | — |
| S15 | FastAPI | Documentation | https://fastapi.tiangolo.com/ | **200** | A | 06 | Application ASGI, `/health`, déploiement | Exige un serveur ASGI (Uvicorn) |
| S16 | Uvicorn | Documentation | https://www.uvicorn.org/ | **000** | **C — NON VÉRIFIÉE** | 06 | Serveur ASGI | **Deuxième échec** (Prompt 2 puis Prompt 3) : domaine non résolu depuis l'environnement. À reconfirmer avec un accès réseau standard. Ne pas présenter d'exemple Uvicorn comme tiré de cette source |

## 4. Travail collaboratif et automatisation

| # | Organisme | Sujet | URL | Vérif. 2026-10-17 | Niveau | Modules | Utilité | Précautions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S17 | Git | Documentation | https://git-scm.com/doc | **200** | A | 08 | Branches, remotes, historique | — |
| S18 | GitHub | GitHub Actions (FR) | https://docs.github.com/fr/actions | **200** | A | 09 | Workflows, secrets, `concurrency` | Exemple de forge ; principes transposables |

## 5. Sécurité et système (guides génériques / outils)

| # | Organisme | Sujet | URL | Vérif. 2026-10-17 | Niveau | Modules | Utilité | Précautions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S19 | OWASP | Cheat Sheet Series | https://cheatsheetseries.owasp.org/ | **200** | A | 03, 05, 06, 11 | Bonnes pratiques de sécurité applicative | Guide générique : adapter au contexte Debian |
| S20 | OpenSSH | Manuel | https://www.openssh.com/manual.html | **200** | A | 03 | `sshd_config`, durcissement SSH | — |
| S21 | systemd | Manuels | https://www.freedesktop.org/software/systemd/man/ | **418** | **B — insuffisante** | 05, 06, 10, 11 | Unités, `journald`, timers | L'environnement reçoit un **HTTP 418 (blocage anti-bot)** : contenu non exploitable automatiquement. À consulter depuis un navigateur standard. Compléter par `man systemd.*` sur le serveur |

---

## 6. Réseau, adressage et accès distant (ajout Prompt 5)

Ces sources sont celles qui fondent le parcours « serveur à domicile » : adressage privé et public,
espace partagé des opérateurs, plages réservées à la documentation, et accès distant privé.

| # | Organisme | Sujet | URL | Vérif. 2026-10-17 | Niveau | Modules | Utilité | Précautions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S22 | IETF / RFC Editor | RFC 1918 — adresses privées | https://www.rfc-editor.org/rfc/rfc1918 | **200** | A | 01 (parcours B), 03, 04 | Fondement des plages `10/8`, `172.16/12`, `192.168/16` | Contenu vérifié dans le texte de la RFC : `10.0.0.0 – 10.255.255.255 (10/8 prefix)`, `172.16.0.0 – 172.31.255.255 (172.16/12 prefix)`, `192.168.0.0 – 192.168.255.255 (192.168/16 prefix)`. Également BCP 5 |
| S23 | IETF / RFC Editor | RFC 6598 (BCP 153) — espace d'adressage partagé | https://www.rfc-editor.org/rfc/rfc6598 | **200** | A | 01 (parcours B), 04 | Explique le CGNAT et la plage `100.64.0.0/10` | Contenu vérifié : « The Shared Address Space address range is `100.64.0.0/10` ». Ne pas en déduire qu'un abonné est *toujours* derrière un CGNAT : la page présente une **détection**, pas une certitude |
| S24 | IETF / RFC Editor | RFC 5737 — plages IPv4 pour la documentation | https://www.rfc-editor.org/rfc/rfc5737 | **200** | A | tous (exemples) | Justifie l'usage de `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` comme adresses d'exemple | Contenu vérifié : les trois blocs TEST-NET sont bien décrits. **Aucune adresse réelle n'est utilisée dans les exemples** |
| S25 | IETF / RFC Editor | RFC 3849 — préfixe IPv6 pour la documentation | https://www.rfc-editor.org/rfc/rfc3849 | **200** | A | tous (exemples) | Justifie l'usage de `2001:db8::/32` dans les exemples | Contenu vérifié : « The prefix allocated for documentation purposes is `2001:DB8::/32` » |
| S26 | WireGuard | Site officiel | https://www.wireguard.com/ | **200** | A | 01 (parcours B), 04 | Exemple de VPN pour un accès distant privé | Contenu vérifié : la page se présente comme « fast, modern, secure VPN tunnel ». Cité comme **exemple** de VPN, jamais comme installation imposée. Aucune commande WireGuard n'est donnée au module 01 |

---

## 7. Bilan de vérification (Prompt 5)

| Total de sources listées | Niveau A (consultée) | Niveau B (insuffisante) | Niveau C (non vérifiée) |
| --- | --- | --- | --- |
| **35** | **33** | 1 (`systemd` — HTTP 418) | 1 (`uvicorn` — aucun code de statut) |

> **Correction de décompte.** Les documents du Prompt 3 annonçaient « 23 sources ». Le fichier en
> contenait en réalité **27** (21 entrées `S1`–`S21` + 6 entrées suffixées `S5b`, `S5c`, `S6b`, `S8b`,
> `S10b`, `S14b`). Le chiffre « 23 » était donc **déjà sous-évalué** ; il est corrigé ici, et non
> recopié. Décompte actuel vérifié mécaniquement sur le fichier : 27 + 8 ajouts = **35**.

**Aucune source n'a été ajoutée sans vérification réelle.** Les huit entrées ajoutées au Prompt 5
(`S1b`, `S5d`, `S5e`, `S22`, `S23`, `S24`, `S25`, `S26`) ont été testées et contrôlées le 2026-10-17 :
code `200` pour chacune, et vérification d'un extrait de contenu pour celles qui fondent une
affirmation du cours (RFC 1918, RFC 6598, RFC 5737, RFC 3849, Debian trixie, WireGuard).

Les deux sources non vérifiées restent inchangées et conservent leur niveau : elles ne sont citées
que comme références à consulter.

## 8. Règles d'usage

1. Toute commande sensible est rédigée **après** consultation de la source, pas avant.
2. La **version Debian** (paquet de la distribution) prime sur la **dernière version amont** : le cours indique toujours laquelle est utilisée.
3. Une source de niveau **C** porte la mention **NON VÉRIFIÉE** et n'est jamais présentée comme une certitude ; une source de niveau **B** n'est pas citée comme « consultée et exploitable ».
4. Les licences de réutilisation des contenus sont respectées ; aucun texte n'est recopié massivement.
