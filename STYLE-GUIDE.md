# STYLE-GUIDE.md — Charte graphique Génération R92

> **But de ce fichier :** permettre de créer/modifier n'importe quelle page en gardant
> exactement le même design, sans repasser par un outil de design.
> Tout est piloté par `assets/css/style.css`. **On réutilise les classes existantes.
> On n'invente ni couleur, ni police, ni composant hors de cette liste.**

---

## 1. Couleurs (variables CSS — définies dans `:root`)

| Variable            | Valeur      | Usage                                                   |
|---------------------|-------------|---------------------------------------------------------|
| `--navy`            | `#0C1C2E`   | En-têtes, pieds de page, bandes sombres                 |
| `--navy-clair`      | `#16304a`   | Dégradés navy, cartes sur fond sombre, placeholders     |
| `--ciel`            | `#B8D8F8`   | Texte sur navy, accents clairs                          |
| `--bleu-vif`        | `#2E8FE0`   | Boutons, liens, prix, barres d'accent, sous-titres      |
| `--blanc`           | `#FFFFFF`   | Fonds clairs, cartes                                    |
| `--surface-clair`   | `#F5F9FD`   | Fonds de bandes claires (CTA, fil d'Ariane, encadrés)   |
| `--gris-texte`      | `#3B4A63`   | Couleur du corps de texte                               |

**Interdit :** toute couleur hors de cette palette. Pour une nuance, utiliser un
`rgba()` dérivé du navy/ciel/bleu (comme dans le CSS existant).

---

## 2. Typographie

- **Titres** (`.titre-section`, `h1`, `h3` de carte) → **Barlow Condensed** (700/800).
- **Corps de texte** → **Barlow** (400–700).
- **Monogrammes / gros chiffres de placeholder** → Barlow Condensed 800.
- ❌ **Kaushan Script et Anton sont retirés** (registre trop « manuscrit »/amateur).
  Ne pas les réintroduire.
- Chaque page charge ce lien Google Fonts dans le `<head>` :
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet">
  ```
- ❌ **Jamais de texte justifié.** Le corps de texte est aligné à gauche (déjà géré en CSS).

---

## 3. Recette d'une page intérieure (structure type)

```html
<header class="entete"> … menu identique partout … </header>

<!-- filigrane skyline (toutes les pages SAUF index.html) -->
<div class="filigrane-page"><img src="assets/img/hero-defense-watermark.png" alt="" aria-hidden="true"></div>

<!-- 1) BANDEAU DE TITRE (dégradé navy) — remplace l'ancienne 1re section blanche -->
<section class="bandeau-titre">
  <div class="conteneur">
    <p class="sous-titre">Rubrique</p>
    <h2 class="titre-section">Titre de la page</h2>
    <p class="chapo">Phrase d'introduction.</p>
  </div>
</section>

<!-- 2) Sections de contenu : alterner clair (.section) et navy (.section-sombre) -->
<section class="section"> … </section>
<section class="section section-sombre"> … </section>

<footer class="pied"> … 3 colonnes identiques partout … </footer>
```

**Rythme :** alterner sections claires et `.section-sombre` (navy) pour donner de la
profondeur. Éviter 3 sections blanches d'affilée.

⚠️ **Règle importante :** le `.bandeau-titre` est déjà navy. **La section qui le suit
immédiatement doit être claire** (`.section`, sans `section-sombre`) — sinon on obtient
deux blocs navy collés, ce qui alourdit la page. Placer les accents navy plus bas.

---

## 4. Composants réutilisables

### Bandeau de titre — `.bandeau-titre`
En-tête de page en dégradé navy avec fine barre bleue. Contient `.sous-titre` +
`.titre-section` + `.chapo`. **À mettre en tête de chaque page intérieure.**

### Cartes — `.carte`
Carte blanche standard. Variante `.carte-avantage` = barre bleu vif pleine en haut
(❌ plus de pointillés « couture »). Grilles : `.grille` (+ `.grille-ligne` pour un
nombre impair, `.grille-paires` pour un nombre pair — géré par `main.js`).

### Placeholder photo à la marque — `.placeholder-r92`
Tuile navy avec monogramme, pour tout emplacement photo en attente :
```html
<div class="placeholder-r92"><b>R92</b><span>Photo à venir</span></div>
```
Dans une grille 2 colonnes texte + photo, utiliser `.presentation-accueil` sur le conteneur.

### Vignette produit — `.produit-vignette`
Placeholder des cartes boutique. **Généré automatiquement par `main.js`** quand le champ
`image` d'un produit (dans `produits.json`) est vide. Renseigner `image` = nom du fichier
réel pour afficher une vraie photo.

### Membre du bureau — `.membre-photo`
Rond navy avec **initiales** (mettre les initiales dans le HTML) en attendant la photo :
```html
<div class="membre-photo">JJ</div>
```

### Fiche produit — `.fiche-produit`, `.produit-placeholder`
2 colonnes (visuel + infos). Le visuel en attente = `.produit-placeholder` (navy + logo).
Ajouter un fil d'Ariane en haut : `<nav class="fil-ariane">…</nav>`.

### Bande d'appel à l'action — `.section.bande-cta`
Bloc centré sur fond clair (titre + phrase + boutons).

### Boutons
- `.btn.btn-primaire` : plein bleu vif (action principale).
- `.btn.btn-contour` : contour clair, **sur fond navy** (hero).
- `.btn.btn-contour-bleu` : contour bleu, **sur fond clair** (action secondaire).
- `.btn-grand` : version large pour les CTA importants.

---

## 5. Placeholders : la règle d'or

Le site est un squelette : les vraies photos/textes arriveront des membres. **En attendant,
tout emplacement vide doit utiliser un placeholder à la marque** (`.placeholder-r92`,
`.produit-vignette`, `.membre-photo` avec initiales) — **jamais** un aplat gris, ni une
photo générique répétée, ni un texte « Contenu provisoire » visible en production.

---

## 6. Ce qu'il ne faut PAS faire

- ❌ Réintroduire Kaushan Script / Anton, ni une autre police.
- ❌ Ajouter des couleurs hors palette.
- ❌ Texte justifié.
- ❌ Motif « couture » en pointillés (retiré partout).
- ❌ Ronds/rectangles gris comme placeholders.
- ❌ Remplir une section « pour remplir » : chaque bloc doit avoir un sens.
