# Projet — Site vitrine Génération R92

Association de rugby (Hauts-de-Seine). Site **statique** : HTML + CSS + un peu de JS.
**Aucun build, aucune base de données.** Hébergeable gratuitement (Netlify/Vercel).

## Structure
- 18 pages `.html` à la racine (index, qui-sommes-nous, nos-projets, actualites, boutique,
  adhesion, sponsors, faire-un-don, devenir-partenaire, contact, faq, mentions-legales,
  cgv, rgpd, statuts, debardeur-r92, grand-voyage, foire-a-tout). `debardeur-r92`,
  `grand-voyage` et `foire-a-tout` sont des pages « article/fiche » ouvertes depuis une carte
  (boutique / nos projets / actualités — via le champ `page` du JSON correspondant).
- `assets/css/style.css` (toute la charte), `assets/js/main.js` (charge les JSON, menu,
  cartes cliquables ; **échappe le HTML injecté et filtre les liens** — voir `echapper()`
  et `urlSure()`, garde-fous anti-XSS sur les données JSON), `assets/img/` (logo, hero,
  favicon, skyline.svg, poteaux-rugby.svg,
  noise.svg, hero-defense-watermark.png, equipe-qui-sommes-nous.jpg), `assets/data/`
  (actus.json, produits.json, projets.json, sponsors.json — **éditables à la main**).
- Docs : `README.md`, `GUIDE-EDITION.md`, **`STYLE-GUIDE.md`** (charte graphique détaillée).

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
  se répercute sur les 18 fichiers (souvent fait par petit script Python).
- Liens HelloAsso encore en `#` (adhésion, dons, boutique, débardeur).

## Lancer en local
```
cd "/Users/romainrifleu/Desktop/Mes applications/BoutiqueR92-1"
python3 -m http.server 8000
```
→ http://localhost:8000 · Rechargement forcé Safari : **Cmd + Option + R** (Cmd+Maj+R sur Chrome).
NB : les pages qui lisent un JSON (boutique, actus, sponsors) ne marchent QU'avec un serveur.

## Filigrane skyline continu — GÉNÉRALISÉ ✅
Filigrane skyline pleine largeur (couche `.filigrane-page`) présent sur **les 17 pages sauf
`index.html`** (l'accueil en est volontairement exclu). Chaque page a, juste après `</header>` :
`<div class="filigrane-page"><img src="assets/img/hero-defense-watermark.png" alt="" aria-hidden="true"></div>`
et la police **Barlow** dans son lien Google Fonts (`Barlow:wght@400;500;600;700`).
CSS global dans `style.css` : panneau translucide `body:has(.filigrane-page)
.section:not(.section-sombre) > .conteneur::before` (blanc 66 %), corps en Barlow, texte ardoise.
Réglages validés : filigrane pleine largeur `top:80px`, opacité 10 % ; panneau 66 % ;
texte ardoise `#3B4A63` ; corps Barlow.

## Décisions en attente
- **Filigrane navy** : on GARDE (décision utilisateur, 2026-07-07) l'ancien filigrane des sections
  navy (skyline.svg sur la 1re section navy, poteaux-rugby.svg sur les suivantes, via
  `.section-sombre::after`), EN PLUS du filigrane continu. À réévaluer plus tard si besoin.

## Note environnement
L'assistant ne peut pas produire de captures ici (pas de Chrome connecté, preview sandboxée) :
la validation visuelle se fait côté utilisateur (mode responsive du navigateur, desktop + 375px).
