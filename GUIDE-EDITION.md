# Guide d'édition — Site Génération R92

Ce guide explique, **sans connaissances techniques**, comment modifier le contenu
du site toi-même. Prends ton temps, et fais une copie du fichier avant de le
modifier si tu n'es pas sûr.

> Règle d'or : après chaque modification d'un fichier `.json`, **vérifie qu'il ne
> reste pas d'erreur de virgule ou de guillemet** (voir la section « Pièges à
> éviter » en bas).

---

## 1. Où se trouve quoi

- Les **textes des pages** sont dans les fichiers `.html` (à la racine du projet).
- Les **actualités, produits et sponsors** sont dans `assets/data/` (fichiers `.json`).
- Les **images** (logo, photos, logos de sponsors) vont dans `assets/img/`.

---

## 2. Modifier / ajouter une ACTUALITÉ

Ouvre **`assets/data/actus.json`**. Chaque actualité ressemble à ceci :

```json
{
  "titre": "Reprise des entraînements",
  "date": "2026-08-25",
  "image": "hero-defense.png",
  "extrait": "Le texte court de l'actualité..."
}
```

- `titre` : le titre de l'actu.
- `date` : au format **AAAA-MM-JJ** (année-mois-jour).
- `image` : le **nom d'un fichier image** placé dans `assets/img/`.
- `extrait` : le texte affiché sur la carte.
- `page` *(facultatif)* : nom d'une page HTML d'article (ex. `"foire-a-tout.html"`). Si
  renseigné, la carte devient **cliquable** et un bouton **« Lire l'article »** ouvre l'article
  complet. Sans ce champ, l'actu reste une simple brève.

Pour **ajouter** une actu, copie un bloc entre `{ ... }`, colle-le, et sépare
les blocs par une **virgule**. Pour en **supprimer** une, efface son bloc `{ ... }`
(et la virgule en trop).

---

## 3. Modifier / ajouter un PRODUIT (boutique)

Ouvre **`assets/data/produits.json`** :

```json
{
  "nom": "Débardeur R92",
  "image": "debardeur.png",
  "description": "Description du produit...",
  "prix": "25 € adhérent / 30 € non-adhérent",
  "lien": "#"
}
```

- `image` : nom du fichier image dans `assets/img/`.
- `lien` : mets `"#"` tant que tu n'as pas de lien. Quand tu auras le lien
  **HelloAsso** de commande, remplace `"#"` par l'adresse complète (ex.
  `"https://www.helloasso.com/..."`). Le bouton « Commander » pointera dessus.

### Les projets (page « Nos projets »)

Le fichier **`assets/data/projets.json`** fonctionne de la même façon, pour les cartes de la
page « Nos projets ». Chaque projet a : `nom`, `description`, `image` (laisse `""` pour la
vignette R92) et `page` :
- `page` renseignée (ex. `"grand-voyage.html"`) → la carte devient **cliquable** et un
  bouton **« Lire l'article »** ouvre l'article détaillé correspondant.
- `page` vide (`""`) → carte simple « à venir », non cliquable.

---

## 3 bis. Ajouter un bouton « Ajouter à mon agenda » (événement)

Dès qu'un contenu (une **actualité**, un **projet**, un **produit**… ou une **page article**)
concerne un **événement daté**, tu peux faire apparaître **automatiquement** un bouton
**« Ajouter à mon agenda »**. En cliquant dessus, la personne télécharge un fichier `.ics`
(compatible **Apple Calendar, Google Agenda, Outlook**) qui ajoute l'événement à son
calendrier **avec un ou deux rappels** : la veille et/ou 2 heures avant.

> Le bouton n'apparaît **que si les trois informations obligatoires sont présentes** :
> une **date**, un **horaire de début** et un **lieu**. Sinon, rien ne s'affiche.

### a) Depuis un fichier JSON (actu, projet, produit)

Ajoute un bloc `"evenement"` à l'entrée concernée. Exemple dans `actus.json` :

```json
{
  "titre": "Tournoi amical inter-clubs",
  "date": "2026-09-14",
  "image": "hero-defense.png",
  "extrait": "Génération R92 organise un tournoi amical…",
  "evenement": {
    "date": "2026-09-14",
    "heureDebut": "10:00",
    "heureFin": "17:00",
    "lieu": "Stade du Plessis-Robinson, 92350 Le Plessis-Robinson",
    "rappel": "les-deux"
  }
}
```

- `date` : **obligatoire**, format `AAAA-MM-JJ`.
- `heureDebut` : **obligatoire**, format `HH:MM` (24 h).
- `lieu` : **obligatoire**.
- `heureFin` *(facultatif)* : si absent, on met **2 h après** le début.
- `titre` *(facultatif)* : sinon on reprend le titre de l'actu/produit/projet.
- `description` *(facultatif)* : sinon on reprend l'extrait/description du contenu.
- `rappel` *(facultatif)* : `"veille"` (la veille), `"2h"` (2 h avant) ou
  `"les-deux"` (**défaut** : les deux rappels).

### b) Directement dans une page HTML (fiche article)

Colle ce bloc à l'endroit voulu de la page (par ex. sous le titre de l'événement) :

```html
<div class="bloc-agenda" data-agenda
     data-titre="Foire à Tout du Plessis-Robinson"
     data-date="2026-09-12"
     data-heure-debut="09:00"
     data-heure-fin="18:00"
     data-lieu="Centre d'entraînement du Racing 92, Le Plessis-Robinson"
     data-description="Stand Génération R92 — vos dons financent nos projets."
     data-rappel="les-deux"></div>
```

Mêmes règles que ci-dessus (date + horaire + lieu obligatoires). Le bouton se
construit tout seul au chargement de la page.

---

## 4. Modifier / ajouter un SPONSOR

Ouvre **`assets/data/sponsors.json`** :

```json
{
  "nom": "Restaurant Lorada",
  "ville": "Cachan",
  "logo": "",
  "description": "Texte de remerciement...",
  "lien": "#"
}
```

- `logo` : laisse `""` pour afficher une **tuile navy provisoire avec le monogramme
  « R92 »**. Quand tu as le vrai logo, mets-le dans `assets/img/` et écris son nom
  ici, ex. `"logo": "lorada.png"`.
- `lien` : `"#"` = pas de bouton. Une vraie adresse (ex. le site du partenaire) fait
  apparaître un bouton « Visiter le site ».

> Astuce : les cartes se réorganisent automatiquement — 3 partenaires s'affichent
> sur une ligne, 2 ou 4 s'affichent par paires.

---

## 5. Remplacer une image (logo, photo, image d'accueil)

1. Dépose ta nouvelle image dans le dossier **`assets/img/`**.
2. Réfère-toi à elle par son **nom de fichier** dans le JSON (`"image": "ma-photo.jpg"`).

Conseils :
- Logos de sponsors : de préférence sur **fond blanc ou transparent** (PNG).
- L'image d'accueil `hero-defense.png` est **lourde** : compresse-la (par ex. sur
  https://squoosh.app) avant de mettre le site en ligne, pour un chargement rapide.

---

## 6. Ajouter les liens HelloAsso (adhésion et dons)

Certains boutons pointent pour l'instant vers `#` (rien). Quand tu auras tes liens
HelloAsso, ouvre le fichier concerné et remplace `href="#"` par ton adresse :

| Bouton                 | Fichier                  |
|------------------------|--------------------------|
| Adhérer en ligne       | `adhesion.html`          |
| Faire un don           | `faire-un-don.html`      |
| Commander (produits)   | `assets/data/produits.json` (champ `lien`) |
| Soutenir le projet     | `nos-projets.html`       |

Exemple : `<a ... href="#">Adhérer en ligne</a>` devient
`<a ... href="https://www.helloasso.com/associations/generation-r92/...">Adhérer en ligne</a>`.

---

## 7. Modifier le texte d'une page

Ouvre le fichier `.html` de la page (ex. `adhesion.html`) avec un éditeur de texte.
Le texte visible est entre les balises. Par exemple :

```html
<h2 class="titre-section">Le tarif</h2>
<p class="texte-large">20 € par an et par adhérent.</p>
```

Modifie uniquement le **texte entre les balises** (ici « Le tarif » et « 20 € par
an... »), sans toucher aux `<...>`.

---

## 8. Voir tes modifications

1. Lance le serveur local (voir README, section 4) :
   `python3 -m http.server 8000` puis ouvre http://localhost:8000
2. Recharge la page. Sur **Safari**, force le rechargement :
   **Affichage → Recharger la page depuis l'origine** (`Cmd + Option + R`).

---

## 9. Pièges à éviter dans les fichiers `.json`

- Chaque bloc `{ ... }` doit être **séparé du suivant par une virgule**,
  mais **le dernier bloc n'a pas de virgule** après lui.
- Les textes sont **entre guillemets droits** `"..."` (pas de guillemets courbes « »
  autour des valeurs).
- Si une page d'actus / produits / sponsors reste bloquée sur « Chargement… »,
  c'est presque toujours une **virgule ou un guillemet mal placé** dans le JSON.
  Un vérificateur en ligne comme https://jsonlint.com aide à repérer l'erreur.
