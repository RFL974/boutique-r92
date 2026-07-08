# Projet — Site vitrine Génération R92

Association de rugby (Hauts-de-Seine). Site **statique** : HTML + CSS + un peu de JS.
**Aucun build, aucune base de données.** Hébergeable gratuitement (Netlify/Vercel).

## Dépôt Git
Dépôt privé `https://github.com/RFL974/boutique-r92.git`, branche `main`.
Commiter par lots cohérents. **Ne jamais commiter `_sources/`** (déjà dans `.gitignore`).

## Structure
- 19 pages `.html` à la racine : les 18 pages du site + `404.html` (servie par Netlify).
  `debardeur-r92`, `grand-voyage` et `foire-a-tout` sont des pages « article/fiche »
  ouvertes depuis une carte (boutique / nos projets / actualités — via le champ `page`
  du JSON correspondant).
- `assets/css/style.css` (toute la charte), `assets/js/main.js` (charge les JSON, menu,
  cartes cliquables, bouton « Ajouter à mon agenda » ; **échappe le HTML injecté et filtre
  les liens** — voir `echapper()` et `urlSure()`, garde-fous anti-XSS sur les données JSON),
  `assets/img/` (logo, hero, filigrane, og-image, photos, svg — 2,3 Mo), `assets/data/`
  (actus.json, produits.json, projets.json, sponsors.json — **éditables à la main**).
- `tools/definir-domaine.sh` (pose canonical + og:url + sitemap.xml le jour du domaine),
  `tools/optimiser-images.sh` (régénère les images web depuis `_sources/`).
- `_sources/` : photos et PNG d'origine. **Hors dépôt et hors déploiement.**
- `robots.txt`, `netlify.toml` (sécurité + cache).
- Docs : `README.md`, `GUIDE-EDITION.md`, **`STYLE-GUIDE.md`** (charte graphique détaillée).

## Règles SEO / accessibilité (acquises — ne pas régresser)
- **Un seul `<h1>` par page** : le titre du `.bandeau-titre` (et non un `<h2>`).
  Aucun saut de niveau. Le pied de page utilise `<h2 class="pied-titre">`.
- Chaque page a `<main id="contenu" tabindex="-1">` et, en tête de `<body>`, le lien
  d'évitement `<a class="lien-evitement" href="#contenu">`.
- Chaque page porte ses balises Open Graph + Twitter Card + `theme-color`.
  ⚠️ **Pas de `og:url` ni de `canonical` tant qu'il n'y a pas de domaine** (voir plus bas).
- `<title>` en « Sujet | Génération R92 » ; `meta description` de 110 à 160 caractères.
- Toute `<img>` porte `width`, `height` et `decoding="async"` ; `loading="lazy"` sauf
  au-dessus de la ligne de flottaison (logos d'en-tête/hero, filigrane).
- JSON-LD : `SportsOrganization` (index), `Event` (foire-a-tout), `FAQPage` (faq).

## Charte (couleurs — NE PAS en introduire d'autres)
- Navy `#0C1C2E` · Navy clair `#16304a` · Ciel `#B8D8F8` · Bleu vif `#2E8FE0` · Blanc `#FFFFFF`
- Off-white `#FAFBFC` (dégradé des cartes), ardoise `#3B4A63` (texte), surface claire `#F5F9FD` autorisés.
- Titres = **Barlow Condensed** ; corps de texte = **Barlow**.
  ⚠️ **Kaushan Script et Anton ont été retirés** (refonte pro 2026-07-07) — ne pas les réintroduire.

## 👉 Design : suivre STYLE-GUIDE.md
Tout le design (composants, placeholders, recette de page, do/don't) est décrit dans
**`STYLE-GUIDE.md`**. Le lire avant de créer/modifier une page. En résumé : bandeau de titre
navy en tête de page (`.bandeau-titre`), alternance sections claires / `.section-sombre`,
placeholders à la marque (`.placeholder-r92`, `.produit-vignette`, `.membre-photo` avec
initiales — jamais de gris), pas de texte justifié, pas de motif « couture » pointillé.
✅ **Harmonisation terminée** : les 15 pages intérieures ouvrent toutes sur un `.bandeau-titre`
navy ; la section qui suit le bandeau est **toujours claire** (jamais deux blocs navy collés —
règle d'alternance détaillée dans STYLE-GUIDE.md).

## Conventions
- Ne jamais désigner l'association par « le club » → dire « l'association » ou « Génération R92 »
  (« inter-clubs »/« clubs voisins » restent OK). Slogan « Plus qu'un club » = signature, à garder.
- Menu : Accueil · L'association ▾ (Qui sommes-nous, Nos projets, Actualités) ·
  Nous soutenir ▾ (Adhérer, Boutique, Faire un don, Ils nous soutiennent, Devenir partenaire) ·
  Contact. Pied de page en 3 colonnes + email `generationr92@gmail.com` + Instagram `@generationr92`.
- En-tête et pied de page sont **copiés dans chaque page** (pas d'include) → une modif de menu
  se répercute sur les 19 fichiers (souvent fait par petit script Python).
- Liens HelloAsso encore en `#` (adhésion, dons, boutique, débardeur, Grand Voyage).
- Images : ne jamais remettre de PNG lourd. Les originaux vivent dans `_sources/`,
  `tools/optimiser-images.sh` régénère les versions web (JPEG q55, `sips` suffit).

## Lancer en local
```
cd "/Users/romainrifleu/Desktop/Mes applications/BoutiqueR92-1"
python3 tools/serveur-local.py          # et non « -m http.server » : voir plus bas
```
→ http://localhost:8000 · Rechargement forcé Safari : **Cmd + Option + R** (Cmd+Maj+R sur Chrome).
NB : les pages qui lisent un JSON (boutique, actus, sponsors) ne marchent QU'avec un serveur.

**Aperçu intégré (preview) :** `python3 -m http.server` échoue ici (le module appelle
`os.getcwd()` au chargement, refusé par le bac à sable). Et le projet étant sous `~/Desktop`,
protégé par macOS (TCC), le processus de preview peut faire `stat()` mais pas `open()` sur les
fichiers → 404 partout. Contournement : `./tools/miroir-preview.sh` crée un miroir en liens durs
dans `/private/tmp/r92-preview`, sur lequel pointe `.claude/launch.json`. Lancer le script
AVANT `preview_start`. Vrai correctif : sortir le projet de `~/Desktop`.

## Filigrane skyline continu — GÉNÉRALISÉ ✅
Filigrane skyline pleine largeur (couche `.filigrane-page`) présent sur **les 17 pages sauf
`index.html`** (l'accueil en est volontairement exclu). Chaque page a, juste après `</header>` :
`<div class="filigrane-page"><img src="assets/img/hero-defense-watermark.jpg" ...></div>`
et la police **Barlow** dans son lien Google Fonts (`Barlow:wght@400;500;600;700`).
CSS global dans `style.css` : panneau translucide `body:has(.filigrane-page)
.section:not(.section-sombre) > .conteneur::before` (blanc 66 %), corps en Barlow, texte ardoise.
Réglages validés : filigrane pleine largeur `top:80px`, opacité 10 % ; panneau 66 % ;
texte ardoise `#3B4A63` ; corps Barlow.

## Décisions en attente
- **Nom de domaine** : aucun choisi (décision utilisateur, 2026-07-08). Conséquence assumée :
  ni `canonical`, ni `og:url`, ni `sitemap.xml`. **Dès qu'un domaine existe, lancer
  `./tools/definir-domaine.sh https://…`** — le rappeler à l'utilisateur s'il parle de
  domaine, de déploiement ou de mise en ligne publique.
- **Filigrane navy** : on GARDE (décision utilisateur, 2026-07-07) l'ancien filigrane des sections
  navy (skyline.svg sur la 1re section navy, poteaux-rugby.svg sur les suivantes, via
  `.section-sombre::after`), EN PLUS du filigrane continu. À réévaluer plus tard si besoin.
- **Mentions légales** : 9 marqueurs `[À DÉFINIR]` / `[À COMPLÉTER]` — à remplir par l'association.

## Note environnement
L'assistant ne peut pas produire de captures ici (pas de Chrome connecté, preview sandboxée) :
la validation visuelle se fait côté utilisateur (mode responsive du navigateur, desktop + 375px).
