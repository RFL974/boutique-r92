# Génération R92 — Site vitrine

Site web de l'association **Génération R92** (rugby, Hauts-de-Seine).

Site **statique** (HTML, CSS, un peu de JavaScript). Aucune base de données, aucun
compte, aucune étape de build. Hébergeable **gratuitement** sur Netlify ou Vercel.

> Pour modifier le contenu au quotidien (actus, produits, sponsors, textes),
> voir le guide pas-à-pas : **[GUIDE-EDITION.md](GUIDE-EDITION.md)**.
>
> Pour créer ou retoucher une page, voir la charte : **[STYLE-GUIDE.md](STYLE-GUIDE.md)**.

---

## 1. Structure du projet

```
BoutiqueR92-1/
├── index.html                → Accueil (hero plein écran)
├── qui-sommes-nous.html      → L'association, valeurs, bureau, mot du président
├── nos-projets.html          → Nos projets (cartes lues depuis un JSON)
├── grand-voyage.html         → Article détaillé : Le Grand Voyage
├── actualites.html           → Actualités (cartes lues depuis un JSON)
├── foire-a-tout.html         → Article détaillé : Foire à Tout (12 septembre 2026)
├── boutique.html             → Boutique (produits lus depuis un JSON)
├── debardeur-r92.html        → Fiche produit détaillée (débardeur)
├── adhesion.html             → Adhérer (avantages, tarif, comment adhérer)
├── sponsors.html             → Ils nous soutiennent (partenaires, lus depuis un JSON)
├── faire-un-don.html         → Faire un don
├── devenir-partenaire.html   → Devenir partenaire
├── contact.html              → Contact (email + Instagram)
├── faq.html                  → FAQ (20 questions, en accordéon)
├── mentions-legales.html     → Mentions légales
├── cgv.html                  → CGV
├── rgpd.html                 → Politique de confidentialité
├── statuts.html              → Statuts
├── 404.html                  → Page « introuvable » (servie par Netlify)
│
├── robots.txt                → Indexation ouverte aux moteurs
├── netlify.toml              → En-têtes HTTP : sécurité + cache
│
├── README.md                 → Ce fichier
├── GUIDE-EDITION.md          → Guide de modification (non technique)
├── STYLE-GUIDE.md            → Charte graphique détaillée (design)
│
├── tools/
│   ├── definir-domaine.sh    → À lancer le jour où l'association a un domaine
│   └── optimiser-images.sh   → Régénère les images web depuis _sources/
│
├── _sources/                 → Photos et PNG d'origine. Hors dépôt, hors déploiement.
│
└── assets/
    ├── css/style.css         → Toute la charte graphique (couleurs, mise en page)
    ├── js/main.js            → Charge les JSON, menu, cartes, bouton « Ajouter à mon agenda »
    ├── img/                  → Logo, hero, filigrane, photos, og-image (2,3 Mo au total)
    └── data/
        ├── actus.json        → ✏️ Les actualités
        ├── produits.json     → ✏️ Les produits de la boutique
        ├── projets.json      → ✏️ Les projets (page Nos projets)
        └── sponsors.json     → ✏️ Les partenaires / sponsors
```

Les fichiers `.json` du dossier `assets/data/` sont **faits pour être édités à la main**.

---

## 2. Navigation

**Menu principal (en-tête, sur toutes les pages) :**

`Accueil` · `L'association ▾` · `Nous soutenir ▾` · `Contact`

- **L'association** (menu déroulant) : Qui sommes-nous · Nos projets · Actualités
- **Nous soutenir** (menu déroulant) : Adhérer · Boutique · Faire un don ·
  Ils nous soutiennent · Devenir partenaire

Sur mobile, le menu se replie derrière un bouton **☰** (hamburger).

**Pied de page (sur toutes les pages)** — plan du site en 3 colonnes
(L'association / Nous soutenir / Infos & légal), puis l'email
`generationr92@gmail.com` et l'Instagram `@generationr92`.

L'en-tête et le pied de page sont **recopiés dans chaque fichier** (pas d'include) :
une modification du menu se répercute donc sur les 19 pages, généralement via un
petit script Python.

---

## 3. Charte graphique (couleurs officielles)

Définies une seule fois en haut de `assets/css/style.css` (variables CSS) :

| Couleur     | Code      | Usage                                            |
|-------------|-----------|--------------------------------------------------|
| Navy        | `#0C1C2E` | En-têtes, pieds de page, sections sombres        |
| Ciel        | `#B8D8F8` | Bleu ciel signature                              |
| Bleu vif R92| `#2E8FE0` | Boutons, liens, prix, accents                    |
| Blanc       | `#FFFFFF` | Fonds clairs                                     |

Pour changer une couleur **partout**, il suffit de modifier sa valeur en haut de
`assets/css/style.css` (bloc `:root`).

Polices (chargées depuis Google Fonts, nécessitent une connexion internet) :
**Barlow Condensed** (titres) et **Barlow** (corps de texte).

> Charte graphique complète : voir **STYLE-GUIDE.md**.

---

## 4. Lancer le site en local

⚠️ Ouvrir `index.html` par double-clic **ne charge pas** les fichiers JSON
(sécurité des navigateurs). Il faut un petit serveur local.

### Option A — Python (déjà installé sur Mac)

```bash
cd "/Users/romainrifleu/Desktop/Mes applications/BoutiqueR92-1"
python3 -m http.server 8000
```

Puis ouvrir **http://localhost:8000** dans le navigateur.
Pour arrêter : `Ctrl + C`.

### Option B — Extension VS Code « Live Server »

Clic droit sur `index.html` → **Open with Live Server**.

> Astuce Safari : pour forcer le rechargement après une modification,
> menu **Affichage → Recharger la page depuis l'origine** (`Cmd + Option + R`).

---

## 5. Mettre le site en ligne (gratuit)

Le site est 100 % statique : aucune étape de build.

- **Netlify** : connecter le dépôt GitHub, ou glisser-déposer le dossier sur
  https://app.netlify.com/drop
- **Vercel** : déposer le dossier sur https://vercel.com (ou la commande `vercel`)

`netlify.toml` applique automatiquement les en-têtes de sécurité (CSP, HSTS,
anti-clickjacking) et les durées de cache. `404.html` est servi pour toute
adresse inconnue.

### 5 bis. Le jour où l'association a un nom de domaine

Trois choses exigent une **URL absolue** et sont donc volontairement absentes :
`<link rel="canonical">`, `<meta property="og:url">` et `sitemap.xml`.
Un seul script les met toutes en place :

```bash
./tools/definir-domaine.sh https://generationr92.fr
```

Il pose canonical + og:url sur les 18 pages indexables, bascule `og:image`,
`twitter:image` et les images du JSON-LD en URL absolue, écrit `sitemap.xml`
et complète `robots.txt`. Il est relançable si le domaine change.

---

## 6. Référencement et accessibilité — ce qui est en place

- Un `<h1>` unique par page, hiérarchie de titres sans saut de niveau.
- `<main>` et lien d'évitement « Aller au contenu » (WCAG 2.4.1).
- Balises **Open Graph** et **Twitter Card** : aperçu correct au partage sur
  WhatsApp, Facebook, Instagram, Slack. Image dédiée `assets/img/og-image.jpg`.
- Données structurées **JSON-LD** : `SportsOrganization` (accueil),
  `Event` (Foire à Tout), `FAQPage` (les 20 questions).
- `<title>` en « Sujet | Génération R92 », descriptions de 110 à 160 caractères.
- Images : `width`/`height` sur toutes les `<img>` (pas de décalage au
  chargement), `loading="lazy"` sous la ligne de flottaison.

---

## 7. Les images

Les photos d'origine vivent dans **`_sources/`**, un dossier exclu du dépôt Git
et donc du déploiement. `assets/img/` n'en contient que les versions web
(2,3 Mo au total, contre 15,5 Mo à l'origine).

Pour régénérer les versions web après avoir ajouté ou remplacé un original :

```bash
./tools/optimiser-images.sh
```

Le script n'utilise que `sips`, livré avec macOS. Si une dimension change,
pensez à mettre à jour les attributs `width`/`height` de la balise `<img>`.

> Les originaux restent aussi récupérables dans l'historique Git, au tout premier
> commit : `git show 2bf6157:assets/img/hero-defense.png > hero-defense.png`

---

## 8. Ce qu'il reste à compléter

Ces points dépendent d'informations que seule l'association peut fournir.

- **Liens HelloAsso** — les boutons pointent aujourd'hui sur `#` :
  - Adhésion : « Adhérer en ligne » (`adhesion.html`)
  - Dons : « Faire un don en ligne » (`faire-un-don.html`)
  - Débardeur : « Je porte nos couleurs » (`debardeur-r92.html`, deux boutons)
  - Le Grand Voyage : « Soutenir le projet » (`grand-voyage.html`)
  - Boutique : champ `lien` dans `assets/data/produits.json`
  - Sponsors : champ `lien` dans `assets/data/sponsors.json`
- **Mentions légales** — 9 marqueurs `[À DÉFINIR]` / `[À COMPLÉTER]` dans
  `mentions-legales.html` (siège social, n° RNA), `cgv.html` (transporteur, durée
  d'adhésion) et `rgpd.html` (durée de conservation, cookies…).
- **Nom de domaine** — voir la section 5 bis.
- **Photos du bureau** (ronds navy à initiales) sur `qui-sommes-nous.html`
- **Logos des sponsors** (tuiles navy « R92 ») via `assets/data/sponsors.json`
- **Le mot du président** : texte provisoire, en attente de la version définitive
- **Fiche produit JSON-LD** : pas de balisage `Product` sur le débardeur tant que
  les offres n'ont pas d'URL HelloAsso.

Voir **[GUIDE-EDITION.md](GUIDE-EDITION.md)** pour savoir comment faire chacune
de ces modifications.
