# Génération R92 — Site vitrine

Site web de l'association **Génération R92** (rugby, Hauts-de-Seine).

Site **statique** (HTML, CSS, un peu de JavaScript). Aucune base de données, aucun
compte, aucune étape de build. Hébergeable **gratuitement** sur Netlify ou Vercel.

> Pour modifier le contenu au quotidien (actus, produits, sponsors, textes),
> voir le guide pas-à-pas : **[GUIDE-EDITION.md](GUIDE-EDITION.md)**.

---

## 1. Structure du projet

```
BoutiqueR92-1/
├── index.html                → Accueil (hero plein écran)
├── qui-sommes-nous.html      → L'association, valeurs, bureau, mot du président
├── nos-projets.html          → Nos projets (cartes lues depuis un JSON)
├── grand-voyage.html         → Article détaillé : Le Grand Voyage
├── actualites.html           → Actualités (cartes lues depuis un JSON)
├── foire-a-tout.html         → Article détaillé : Foire à Tout (actualité)
├── boutique.html             → Boutique (produits lus depuis un JSON)
├── debardeur-r92.html        → Fiche produit détaillée (débardeur)
├── adhesion.html             → Adhérer (avantages, tarif, comment adhérer)
├── sponsors.html             → Ils nous soutiennent (partenaires, lus depuis un JSON)
├── faire-un-don.html         → Faire un don            (placeholder)
├── devenir-partenaire.html   → Devenir partenaire      (placeholder)
├── contact.html              → Contact (email + Instagram)
├── faq.html                  → FAQ                     (placeholder)
├── mentions-legales.html     → Mentions légales        (placeholder)
├── cgv.html                  → CGV                     (placeholder)
├── rgpd.html                 → Politique de confidentialité (placeholder)
├── statuts.html              → Statuts                 (placeholder)
├── README.md                 → Ce fichier
├── GUIDE-EDITION.md          → Guide de modification (non technique)
├── STYLE-GUIDE.md            → Charte graphique détaillée (design)
└── assets/
    ├── css/
    │   └── style.css         → Toute la charte graphique (couleurs, mise en page)
    ├── js/
    │   └── main.js           → Charge les JSON et fabrique les cartes
    ├── img/
    │   ├── logo-r92.png      → Logo (toujours sur fond navy)
    │   ├── hero-defense.png  → Image de fond de l'accueil
    │   └── favicon.svg       → Icône de l'onglet du navigateur
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

Le site est 100 % statique : aucun réglage nécessaire.

- **Netlify** : glisser-déposer le dossier du projet sur https://app.netlify.com/drop
- **Vercel** : déposer le dossier sur https://vercel.com (ou la commande `vercel`)

Les adresses « propres » (ex. `/qui-sommes-nous`) fonctionnent automatiquement.

---

## 6. Ce qu'il reste à compléter

- **Liens HelloAsso** (boutons aujourd'hui sur `#`) :
  - Adhésion : bouton « Adhérer en ligne » (`adhesion.html`)
  - Dons : page « Faire un don »
  - Boutique : boutons « Commander » (champ `lien` dans `assets/data/produits.json`)
  - Le Grand Voyage : bouton « Soutenir le projet » (`nos-projets.html`)
- **Pages légales** (contenu « à venir ») : Mentions légales, CGV, RGPD, Statuts, FAQ
- **Photos du bureau** (ronds navy à initiales) sur `qui-sommes-nous.html`
- **Logos des sponsors** (tuiles navy « R92 ») via `assets/data/sponsors.json`
- **Le mot du président** : texte provisoire, en attente de la version définitive
- **Image du hero** : `hero-defense.png` est lourde (~6 Mo) — à compresser avant mise en ligne

Voir **[GUIDE-EDITION.md](GUIDE-EDITION.md)** pour savoir comment faire chacune de ces modifications.
