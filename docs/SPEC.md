# Spécification v1 — tirage de films façon case opening

Outil perso (deux utilisateurs) qui remplace le « shuffle » de Letterboxd par un tirage façon case opening / TCG sur une liste publique Letterboxd.

Nom : **« On regarde quoi ? »** (EN : *« What's on tonight? »*). Choisi sur le prototype, contre « Ticket Roulette ».

## Contexte d'usage

- Deux utilisateurs, **téléphone uniquement** (un Android, un iPhone).
- Une liste publique d'environ 170 films, qui change souvent : des films sont ajoutés, et retirés une fois vus.
- Interface en **FR/EN** : langue du téléphone par défaut, avec un bouton pour changer.
- Application installable sur l'écran d'accueil (**PWA**).

## Parcours

### 1. Entrée de la liste

- Un champ pour coller une URL. Formats acceptés :
  - `letterboxd.com/<user>/list/<slug>/` (avec ou sans `www`, slash final ou suffixes comme `/detail/`) ;
  - lien court `boxd.it/<code>`, que le backend suit pour retrouver l'URL complète.
- **Android** : l'app installée apparaît dans le menu Partager. Partager une liste depuis l'app Letterboxd ouvre directement le deck (Web Share Target).
- **iPhone** : copier-coller uniquement. Le copier-coller reste aussi disponible sur Android.
- L'URL est retenue sur le téléphone (localStorage), avec un lien « changer de liste ».
- Le contenu de la liste est relu à chaque visite, puisqu'elle change souvent.
- Pendant le chargement, une animation de cartes distribuées fait patienter.

### 2. Deck et tirage

- Roue horizontale façon case opening, composée de cartes de dos. Dans la roue, le dos est coloré selon le genre principal, sans texte.
- Le résultat est tiré au sort de façon équitable dans toute la liste. Une bande d'environ 60 cartes est ensuite construite pour s'arrêter dessus.
- Décélération animée par GSAP : léger dépassement, puis retour en place.
- **Jusqu'à 3 tirages, chacun lancé à la main** (« Shuffle », puis « Ajouter un tirage »).
- Pas de doublon dans une session, et pas de reroll.
- Si la liste a moins de 3 films, le nombre de tirages est plafonné au nombre de films.
- Chaque carte tirée glisse dans un emplacement sous la roue.
- Son (tic à chaque carte qui passe, ding à l'arrêt), activé par défaut, avec un bouton muet.
- Vibration sur Android uniquement : l'iPhone ne permet pas de faire vibrer depuis une page web.

### 3. Cartes tirées

- Au dos : la durée et jusqu'à 2 genres.
- Un tap retourne la carte (retournement 3D en CSS) et révèle l'affiche.
- Effet holo qui suit l'inclinaison du téléphone (gyroscope). L'autorisation iOS est demandée au premier tap sur « Shuffle ». Si elle est refusée, le reflet suit le doigt.
- On peut retourner les cartes, en tirer d'autres ou choisir à tout moment.
- **Seule une carte retournée peut être choisie.**

### 4. Carte choisie (plein écran)

- Affiche en grand, titre, année, durée, genres.
- Synopsis court (3 lignes, dépliable).
- Un bouton **« Voir sur Letterboxd »**, qui mène à la page du film. Il n'existe pas d'URL web qui ouvre directement la fenêtre de review.
- Un bouton discret **« Recommencer »**, qui ramène au deck.

## Données

- **L'API officielle Letterboxd n'est pas une option** : Letterboxd n'accorde pas d'accès aux projets personnels.
- **Liste** : le backend lit `/<user>/list/<slug>/page/N/` (100 films par page) jusqu'à tomber sur une page vide. Chaque film est un `li.posteritem` dont les attributs `data-item-slug`, `data-item-name` (« Titre (Année) ») et `data-item-link` donnent ce qu'il faut. letterboxd.com ne renvoie pas d'en-tête CORS, donc un backend est obligatoire.
- **Infos complémentaires** : TMDb, recherche par titre et année, puis récupération des détails. Ça donne l'affiche, la durée, les genres et le synopsis en FR et EN.
  - La clé TMDb reste côté serveur.
  - La mention d'attribution TMDb doit être affichée.
- **Repli** : si un film est introuvable sur TMDb, il reste dans le tirage, avec « durée inconnue » au dos et l'affiche Letterboxd au recto (`/film/<slug>/poster/std/<largeur>/`, qui renvoie du JSON).
- **Cache** : les infos de chaque film sont gardées 30 jours, avec le slug comme clé. La liste elle-même n'est pas mise en cache.
  - Le cache passe par le stockage intégré à Nuxt (`unstorage`) : stockage clé-valeur sur Vercel, fichiers sur le Raspberry Pi.
- **Rien n'est mémorisé** en v1 : pas d'historique des tirages. Les films vus sont retirés à la main sur Letterboxd.
- **Risque accepté** : lire automatiquement les pages de Letterboxd est contraire à ses conditions d'utilisation (clause anti-scraping). On reste discret, avec peu de requêtes et du cache.

## Cas limites

- Liste privée ou introuvable : message clair, puis retour au champ de saisie.
- Liste vide : « La liste est vide, ajoutez des films sur Letterboxd ».
- Liste de moins de 3 films : nombre de tirages plafonné.

## Stack

- **Nuxt + TypeScript.** Le backend tourne dans les routes serveur de Nuxt (Nitro).
- **GSAP** pour la roue.
- **CSS / Web Animations API** pour le retournement et le holo.
- **PWA** avec Web Share Target.
- **Hébergement** : **Vercel**. Test de l'hébergeur réussi le 2026-10-23 : depuis une fonction Vercel, la page de liste et le JSON d'affiche répondent 200, sans blocage Cloudflare. La sonde est dans `spike/host-probe/`, sur la branche `prototype/da-retro`. Le Raspberry Pi à la maison, exposé par un tunnel, reste la solution de repli si Cloudflare se met à bloquer.

## Direction artistique

Cinéma rétro, variante **A « Guichet »** retenue sur le prototype. Le prototype est conservé sur la branche locale `prototype/da-retro`, dans le dossier `prototype/da-retro/`, et s'ouvre avec `?variant=A&nom=2`. Pas de système de rareté, tous les films se valent.

- **Ambiance :** marquise de cinéma à ampoules qui clignotent en chenillard, avec le nom en lettrage Art déco (Limelight) qui brille comme un néon. Fond velours bordeaux, filets et boutons dorés. Texte courant en machine à écrire (Courier Prime).
- **Organisation :** tout tient sur un seul écran de téléphone, sans défilement. Vérifié en 390×844 et 360×740. De haut en bas :
  1. la marquise ;
  2. le nom de la liste, le nombre de films et le bouton son ;
  3. la roue, sur toute la largeur ;
  4. le gros bouton laiton (« Tourner la roue », puis « Un autre ticket · 2/3 ») ;
  5. une grille de 3 emplacements de tickets ;
  6. une ligne d'aide.
- **Cartes dans la roue :** petits tickets d'entrée crantés sur les côtés, avec une bande en haut à la couleur du genre principal. Un squelette illisible reprend la disposition du dos d'un ticket tiré (« Entrée », durée, 2 genres, numéro de série), pour que les tickets ne paraissent pas vides. Deux repères dorés, en haut et en bas, marquent le centre.
- **Spin :** environ 3 s de décélération (ease-out), puis un recentrage de 0,4 s. Son validé tel quel : un tic à chaque ticket qui passe, un ding à l'arrêt, un souffle au retournement et une fanfare au choix.
- **Dos des cartes tirées :** ticket papier crème avec une bande de couleur « Entrée », la durée en grand, 2 genres au maximum et un numéro de série. Le bouton « Choisir » apparaît sous la carte une fois qu'elle est retournée.
- **Couleur et genres affichés :** on met d'abord en avant les genres les plus distinctifs (Animation, Documentaire, Horreur, Science-fiction…), et Drame passe en dernier.

## Ordre de travail

1. **Test de l'hébergeur** : vérifier qu'une fonction déployée sur Vercel arrive à lire la liste sans être bloquée par Cloudflare. Si elle est bloquée, passer au Raspberry Pi.
2. **Prototype jetable de la DA** : variantes de dos de carte et d'écran principal, une par nom candidat. À regarder sur téléphone.
3. **Le projet Nuxt.**

À faire côté utilisateur : créer un compte TMDb et demander une clé API.
