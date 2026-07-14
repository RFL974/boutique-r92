/* =========================================================
   GÉNÉRATION R92 — Le peu de JavaScript du site
   -----------------------------------------------------
   Rôle : lire les fichiers JSON (actus + produits) et
   fabriquer les cartes automatiquement dans les pages.
   Comme ça, pour ajouter une actu ou un produit, tu
   n'édites QUE le fichier JSON, pas le HTML.
   ========================================================= */

/* Petite fonction pour transformer une date "2026-08-25"
   en date lisible en français : "25 août 2026". */
function formaterDate(dateISO) {
  // Si la date est vide ou invalide, on renvoie tel quel.
  const d = new Date(dateISO);
  if (isNaN(d)) return dateISO;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/* Applique la disposition d'une grille selon le nombre de cartes :
   - nombre pair          -> "grille-paires" (deux par ligne)
   - 1 ou 3 cartes        -> "grille-ligne"  (toutes sur une même ligne, ça reste aéré)
   - impair >= 5          -> aucune classe    -> grille responsive par défaut (3 colonnes
                             qui s'aèrent et passent à la ligne), sinon 5+ cartes seraient
                             écrasées sur une seule ligne. */
function appliquerDispositionGrille(conteneur, nombre) {
  conteneur.classList.remove('grille-ligne', 'grille-paires');
  if (nombre <= 0) return;
  if (nombre % 2 === 0) {
    conteneur.classList.add('grille-paires');
  } else if (nombre <= 3) {
    conteneur.classList.add('grille-ligne');
  }
  // impair >= 5 : on ne met aucune classe -> .grille par défaut (1/2/3 colonnes responsives).
}

/* Rend cliquables les cartes qui ont une fiche détaillée (attribut data-page).
   Un clic sur la carte ouvre la fiche — SAUF si on a cliqué sur un lien/bouton
   (ex : "Commander"), qui garde son propre comportement. */
function initCartesCliquables(conteneur) {
  const cartes = conteneur.querySelectorAll('.carte-cliquable');
  cartes.forEach(function (carte) {
    carte.addEventListener('click', function (evenement) {
      if (evenement.target.closest('a')) return; // clic sur un lien : on le laisse agir
      const page = carte.getAttribute('data-page');
      if (page) window.location.href = page;
    });
  });
}

/* Sécurité (anti-injection HTML / XSS) : échappe les caractères spéciaux d'une
   valeur venant d'un fichier JSON avant de l'insérer dans la page.
   On échappe AUSSI les guillemets " et ' : ces valeurs sont parfois placées
   dans des attributs (par ex. href="…", src="…", alt="…"). Sans cet échappement,
   un guillemet présent dans le JSON permettrait de « sortir » de l'attribut et
   d'injecter du code. */
function echapper(texte) {
  return (texte == null ? '' : String(texte))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Sécurité : n'autorise dans un lien (href) que des adresses sûres.
   Bloque les schémas dangereux (javascript:, data:, vbscript:) qui pourraient
   exécuter du code au clic, et renvoie "#" à la place. Les liens http(s),
   mailto:, les ancres (#) et les chemins internes (ex. debardeur-r92.html)
   restent autorisés. */
function urlSure(url) {
  const u = (url == null ? '' : String(url)).trim();
  if (u === '') return '#';
  // On teste le schéma sur une version débarrassée des caractères de contrôle
  // (tabulations, retours à la ligne, etc.). Certains navigateurs les ignorent
  // à l'intérieur d'un schéma d'URL : sans ce nettoyage, un « java\tscript: »
  // passerait à travers le filtre ci-dessous.
  const nettoye = u.replace(/[\u0000-\u001F\u007F]/g, '');
  if (/^(javascript|data|vbscript):/i.test(nettoye)) return '#';
  return u;
}

/* =========================================================
   ÉVÉNEMENTS — bouton « Ajouter à mon agenda » (.ics) + rappel
   ---------------------------------------------------------
   Dès qu'un contenu fournit une DATE, un HORAIRE et un LIEU,
   on génère automatiquement un bouton qui télécharge un fichier
   .ics standard (compatible Apple Calendar, Google Agenda,
   Outlook…) contenant l'événement ET un ou deux rappels
   (la veille et/ou 2 h avant).

   Deux façons de décrire un événement :
   1) Dans un JSON (actus / projets / produits) : ajouter un objet
      "evenement" à l'entrée concernée. Exemple :
        "evenement": {
          "date": "2026-09-12",       (obligatoire, AAAA-MM-JJ)
          "heureDebut": "14:00",      (obligatoire, HH:MM)
          "heureFin": "18:00",        (facultatif — défaut : +2 h)
          "lieu": "Gymnase …, 92350 …", (obligatoire)
          "titre": "…",               (facultatif — défaut : titre du contenu)
          "description": "…",         (facultatif — défaut : extrait du contenu)
          "rappel": "les-deux"        (facultatif : "veille" | "2h" | "les-deux")
        }
   2) Dans une page HTML : placer un bloc
        <div data-agenda data-date="…" data-heure-debut="…"
             data-heure-fin="…" data-lieu="…" data-titre="…"
             data-description="…" data-rappel="…"></div>
   Sans les trois champs obligatoires (date, horaire, lieu),
   AUCUN bouton n'apparaît.
   ========================================================= */

/* Échappe les caractères spéciaux d'un texte pour le format iCalendar
   (RFC 5545) : antislash, point-virgule, virgule et retours à la ligne. */
function echapperICS(texte) {
  return (texte == null ? '' : String(texte))
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/* Fabrique un « slug » sans accents ni caractères spéciaux (pour l'UID et
   le nom de fichier). Ex. : "Foire à Tout" -> "foire-a-tout". */
function slugEvenement(texte) {
  return (texte || 'evenement')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'evenement';
}

/* "2026-09-12" + "14:00" -> "20260912T140000" (heure locale « flottante »,
   interprétée dans le fuseau de la personne — adapté à un public en France). */
function horodatageICS(date, heure) {
  const d = String(date).replace(/-/g, '');
  const h = (String(heure || '00:00').replace(/:/g, '') + '0000').slice(0, 6);
  return d + 'T' + h;
}

/* Vrai seulement si l'événement a le minimum requis : date + horaire + lieu. */
function evenementComplet(ev) {
  return !!(ev && ev.date && ev.heureDebut && ev.lieu);
}

/* Construit le texte complet d'un fichier .ics pour un événement. */
function construireICS(ev) {
  const pad = (n) => String(n).padStart(2, '0');

  // Heure de fin : celle fournie, sinon 2 h après le début (calcul en local,
  // ce qui gère proprement un éventuel passage à minuit).
  let finDate = ev.date, finHeure = ev.heureFin;
  if (!finHeure) {
    const [a, m, j] = ev.date.split('-').map(Number);
    const [hh, mm] = ev.heureDebut.split(':').map(Number);
    const fin = new Date(a, m - 1, j, hh + 2, mm);
    finDate = fin.getFullYear() + '-' + pad(fin.getMonth() + 1) + '-' + pad(fin.getDate());
    finHeure = pad(fin.getHours()) + ':' + pad(fin.getMinutes());
  }

  const uid = slugEvenement(ev.titre) + '-' + String(ev.date).replace(/-/g, '') + '@generationr92';

  // Horodatage de création (maintenant, en UTC).
  const now = new Date();
  const dtstamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate())
    + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';

  // Rappels : "veille" (-P1D), "2h" (-PT2H) ou "les-deux" (défaut).
  const rappel = (ev.rappel || 'les-deux').toLowerCase();
  const declencheurs = [];
  if (rappel === 'veille' || rappel === 'les-deux') declencheurs.push('-P1D');
  if (rappel === '2h' || rappel === 'les-deux') declencheurs.push('-PT2H');

  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Generation R92//Site vitrine//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + dtstamp,
    'DTSTART:' + horodatageICS(ev.date, ev.heureDebut),
    'DTEND:' + horodatageICS(finDate, finHeure),
    'SUMMARY:' + echapperICS(ev.titre),
    'DESCRIPTION:' + echapperICS(ev.description || ''),
    'LOCATION:' + echapperICS(ev.lieu)
  ];
  declencheurs.forEach(function (trigger) {
    lignes.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + echapperICS('Rappel : ' + ev.titre),
      'TRIGGER:' + trigger,
      'END:VALARM'
    );
  });
  lignes.push('END:VEVENT', 'END:VCALENDAR');
  return lignes.join('\r\n');
}

/* Crée le bouton <a> « Ajouter à mon agenda » (télécharge le .ics).
   Renvoie null si l'événement est incomplet (aucun bouton affiché).
   titreDefaut / descriptionDefaut : repris du contenu si non précisés.
   options.classes / options.label : personnalisent l'apparence et le texte
   (utilisé pour reprendre le style d'un bouton déjà présent dans une page). */
function creerBoutonAgenda(ev, titreDefaut, descriptionDefaut, options) {
  if (!evenementComplet(ev)) return null;
  options = options || {};
  const evComplet = {
    date: ev.date,
    heureDebut: ev.heureDebut,
    heureFin: ev.heureFin || '',
    lieu: ev.lieu,
    titre: ev.titre || titreDefaut || 'Événement Génération R92',
    description: ev.description || descriptionDefaut || '',
    rappel: ev.rappel || 'les-deux'
  };
  const ics = construireICS(evComplet);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });

  const a = document.createElement('a');
  a.className = options.classes || 'btn btn-primaire bouton-agenda';
  a.href = URL.createObjectURL(blob);
  a.download = slugEvenement(evComplet.titre) + '-r92.ics';
  a.textContent = options.label || 'Ajouter à mon agenda';
  a.setAttribute('aria-label', 'Ajouter « ' + evComplet.titre + ' » à mon agenda');
  return a;
}

/* Ajoute le bouton agenda dans chaque carte dont l'entrée JSON porte un
   objet "evenement" complet (date + horaire + lieu). Appelée après le rendu. */
function ajouterAgendaCartes(conteneur, items) {
  const cartes = conteneur.querySelectorAll('.carte');
  items.forEach(function (item, i) {
    const bouton = creerBoutonAgenda(
      item.evenement,
      item.titre || item.nom,
      item.extrait || item.description
    );
    if (!bouton || !cartes[i]) return;
    const corps = cartes[i].querySelector('.carte-corps') || cartes[i];
    corps.appendChild(bouton);
  });
}

/* Remplace les éléments [data-agenda] présents dans les pages par le bouton
   « Ajouter à mon agenda ». L'élément d'origine sert de gabarit : ses classes
   CSS et son texte sont repris (on garantit au moins la classe .btn). S'il
   manque une info obligatoire, l'élément est simplement retiré (rien affiché). */
function initBlocsAgenda() {
  document.querySelectorAll('[data-agenda]').forEach(function (bloc) {
    let classes = (bloc.getAttribute('class') || '').trim();
    if (!/(^|\s)btn(\s|$)/.test(classes)) {
      classes = ('btn btn-primaire ' + classes).trim();
    }
    const label = (bloc.textContent || '').trim();
    const bouton = creerBoutonAgenda({
      date: bloc.getAttribute('data-date'),
      heureDebut: bloc.getAttribute('data-heure-debut'),
      heureFin: bloc.getAttribute('data-heure-fin') || '',
      lieu: bloc.getAttribute('data-lieu'),
      titre: bloc.getAttribute('data-titre') || '',
      description: bloc.getAttribute('data-description') || '',
      rappel: bloc.getAttribute('data-rappel') || 'les-deux'
    }, '', '', { classes: classes, label: label });
    if (bouton) bloc.replaceWith(bouton);
    else bloc.remove();
  });
}

/* ---------------------------------------------------------
   ITINÉRAIRE — bouton « On y va ! » (ouvre l'app de navigation)
   Sur mobile, un même bouton doit ouvrir l'application de
   navigation de la personne. Il n'existe pas de solution
   universelle : chaque système a sa mécanique.
   --------------------------------------------------------- */

/* Construit l'URL d'itinéraire adaptée à l'appareil, à partir d'une adresse en
   texte. Le but : ouvrir SON application de navigation.
   - Android : schéma geo: → le système propose les apps installées
     (Google Maps, Waze, Mappy…) et c'est la personne qui choisit.
   - iPhone / iPad : Plans (iOS n'offre pas de sélecteur d'application).
   - Ordinateur : Google Maps sur le web.
   Renvoie toujours une URL http(s) ou geo: — jamais un schéma exécutable. */
function lienItineraire(lieu) {
  const q = encodeURIComponent(String(lieu == null ? '' : lieu).trim());
  if (!q) return '';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'https://maps.apple.com/?q=' + q;
  if (/Android/i.test(ua)) return 'geo:0,0?q=' + q;
  return 'https://www.google.com/maps/search/?api=1&query=' + q;
}

/* Remplace les éléments [data-itineraire] par un bouton « On y va ! » qui ouvre
   l'app de navigation vers l'adresse (attribut data-lieu). Même principe que
   initBlocsAgenda : l'élément d'origine sert de gabarit (ses classes et son
   texte sont repris). Sans data-lieu exploitable, l'élément est retiré. */
function initBlocsItineraire() {
  document.querySelectorAll('[data-itineraire]').forEach(function (bloc) {
    const lieu = bloc.getAttribute('data-lieu');
    const href = lienItineraire(lieu);
    if (!href) { bloc.remove(); return; }

    let classes = (bloc.getAttribute('class') || '').trim();
    if (!/(^|\s)btn(\s|$)/.test(classes)) classes = ('btn ' + classes).trim();
    const label = (bloc.textContent || '').trim() || 'On y va !';

    const a = document.createElement('a');
    a.className = classes;
    a.href = href;
    // Les liens http(s) (ordinateur) s'ouvrent dans un nouvel onglet ; les
    // schémas geo:/maps: (mobile) ouvrent directement l'application.
    if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    a.setAttribute('aria-label', label + ' — itinéraire vers ' + (lieu || 'l’événement'));
    // Icône épingle (hérite de la couleur du texte) + libellé échappé.
    a.innerHTML = '<svg class="btn-icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
      + '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/>'
      + '</svg><span>' + echapper(label) + '</span>';
    bloc.replaceWith(a);
  });
}

/* ---------------------------------------------------------
   CARTE « TOURNOI » DYNAMIQUE
   La carte du tournoi apparaît dans les actualités UNIQUEMENT quand le tournoi est
   publié depuis l'admin du mini-site tournoi (https://rfl974.github.io/tournoi-r92/).
   Les deux sites partagent le même backend (Google Apps Script) : on lui demande
   simplement si `tournoi_publie` vaut "oui".
   --------------------------------------------------------- */
const TOURNOI_API_URL = 'https://script.google.com/macros/s/AKfycbz_jRSNnFCjJvhUiofO6n3lg41ev8_9UDuvVGB_KDpm_EYZVSgwyi55MG8AfKu2JRQFBA/exec';
const TOURNOI_PAGE_URL = 'https://rfl974.github.io/tournoi-r92/tournoi.html';  // le tournoi EN DIRECT
const TOURNOI_ARTICLE_URL = 'tournoi.html';                                    // la page d'article (ce site)

/* Cache des infos du tournoi (une seule requête par page). */
let __infosTournoi;

/* Récupère les infos du tournoi depuis le backend (nom, date, lieu, description, affiche,
   publié ?). Renvoie un objet, ou un objet { publie:false } en cas de souci (délai max 4 s
   pour ne jamais bloquer la page). Les deux sites partagent le même backend Apps Script. */
async function chargerInfosTournoi() {
  if (__infosTournoi) return __infosTournoi;
  try {
    const ctrl = new AbortController();
    const minuteur = setTimeout(function () { ctrl.abort(); }, 9000); // Apps Script démarre parfois lentement
    const reponse = await fetch(TOURNOI_API_URL + '?action=getConfig', { signal: ctrl.signal });
    clearTimeout(minuteur);
    if (!reponse.ok) return { publie: false };
    const g = (await reponse.json()).global || {};
    __infosTournoi = {
      publie: String(g.tournoi_publie).toLowerCase() === 'oui',
      nom: g.tournoi_nom || '',
      date: g.tournoi_date || '',
      lieu: g.tournoi_lieu || '',
      description: g.tournoi_description || '',
      afficheId: g.tournoi_affiche_id || '',
      heureDebut: g.heure_debut || '',
      heureFin: g.heure_fin || ''
    };
    return __infosTournoi;
  } catch (e) {
    return { publie: false };
  }
}

/* URL d'affichage d'une affiche stockée dans Google Drive (CDN lh3, largeur maxi w).
   NB : on utilise lh3.googleusercontent.com (et non drive.google.com/thumbnail) car ce
   dernier bloque le hotlinking depuis un autre site. */
function urlAffiche(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 1000);
}

/* Coupe un texte à `max` caractères (sans couper un mot au milieu) + « … ». */
function extraitCourt(texte, max) {
  texte = String(texte == null ? '' : texte).trim();
  max = max || 160;
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : max).trim() + '…';
}

/* L'entrée d'actualité « Tournoi » (même format que actus.json), construite depuis les
   infos réelles. `imageUrl` = l'affiche (Drive) ; `page` = la page d'article de ce site. */
function actuTournoi(t) {
  return {
    titre: t.nom || 'Tournoi Génération R92',
    date: t.date || new Date().toISOString().slice(0, 10),
    imageUrl: t.afficheId ? urlAffiche(t.afficheId, 800) : '',
    image: 'hero-defense.jpg', // secours si aucune affiche
    extrait: extraitCourt(t.description, 160) ||
      'Le tournoi est ouvert ! Poules, planning et scores en direct.',
    page: TOURNOI_ARTICLE_URL,
    boutonTexte: 'Découvrir le tournoi'
  };
}

/* ---------------------------------------------------------
   CHARGEMENT DES ACTUALITÉS
   Cherche un conteneur avec l'id "liste-actus" ; s'il
   existe (page Actualités), on remplit les cartes.
   --------------------------------------------------------- */
let __actusBase = null; // les actus du JSON (sans la carte tournoi)

async function chargerActus() {
  const conteneur = document.getElementById('liste-actus');
  if (!conteneur) return; // Pas sur la page actus : on ne fait rien.

  try {
    const reponse = await fetch('assets/data/actus.json');
    if (!reponse.ok) throw new Error('Réponse HTTP ' + reponse.status);
    __actusBase = await reponse.json();
    rendreActus(conteneur, __actusBase); // affichage IMMÉDIAT des actus
  } catch (erreur) {
    // Message affiché si le fichier ne se charge pas (ex : ouvert sans serveur local).
    conteneur.innerHTML =
      '<p class="message-info">Impossible de charger les actualités. ' +
      'Lance le site avec un petit serveur local (voir instructions).</p>';
    console.error(erreur);
    return;
  }

  // Sans bloquer l'affichage : si le tournoi est publié, on ré-affiche avec sa carte EN TÊTE
  // (le backend Apps Script peut être lent au démarrage — on ne fait pas attendre les actus).
  const t = await chargerInfosTournoi();
  if (t && t.publie && __actusBase) {
    rendreActus(conteneur, [actuTournoi(t)].concat(__actusBase));
  }
}

/* Construit et injecte les cartes d'actualités dans le conteneur. */
function rendreActus(conteneur, actus) {
  conteneur.innerHTML = actus.map(function (actu) {
    // "page" = article détaillé (facultatif). S'il est renseigné, la carte devient
    // cliquable, le titre devient un lien et un bouton apparaît.
    const page = actu.page && actu.page !== '' ? urlSure(actu.page) : '';
    const classeCarte = page ? 'carte carte-cliquable' : 'carte';
    const dataPage = page ? ` data-page="${echapper(page)}"` : '';
    const titre = page
      ? `<h3><a href="${echapper(page)}">${echapper(actu.titre)}</a></h3>`
      : `<h3>${echapper(actu.titre)}</h3>`;
    const texteBouton = actu.boutonTexte ? actu.boutonTexte : "Lire l'article";
    const bouton = page
      ? `<a class="btn btn-primaire" href="${echapper(page)}">${echapper(texteBouton)}</a>`
      : '';
    // Image : une URL complète (affiche du tournoi sur Drive) OU un fichier local assets/img.
    const imgSrc = actu.imageUrl ? echapper(actu.imageUrl) : ('assets/img/' + echapper(actu.image));
    return `
      <article class="${classeCarte}"${dataPage}>
        <img src="${imgSrc}" alt="${echapper(actu.titre)}" loading="lazy" decoding="async">
        <div class="carte-corps">
          <span class="carte-date">${echapper(formaterDate(actu.date))}</span>
          ${titre}
          <p>${echapper(actu.extrait)}</p>
          ${bouton}
        </div>
      </article>
    `;
  }).join('');
  appliquerDispositionGrille(conteneur, actus.length);
  initCartesCliquables(conteneur);
  ajouterAgendaCartes(conteneur, actus);
}

/* ---------------------------------------------------------
   PAGE D'ARTICLE DU TOURNOI (tournoi.html de CE site)
   Remplie dynamiquement depuis les infos saisies dans l'admin du mini-site tournoi.
   --------------------------------------------------------- */
async function chargerArticleTournoi() {
  const zone = document.getElementById('article-tournoi');
  if (!zone) return; // pas sur la page d'article

  const t = await chargerInfosTournoi();
  if (!t || !t.publie) {
    zone.innerHTML = '<section class="section"><div class="conteneur">' +
      '<p class="message-info">Aucun tournoi en cours pour le moment. ' +
      'Reviens quand un tournoi sera annoncé !</p></div></section>';
    return;
  }

  const nom = t.nom || 'Tournoi Génération R92';
  document.title = nom + ' | Génération R92';
  const set = function (id, valeur) {
    const el = document.getElementById(id);
    if (el) el.textContent = valeur;
  };
  set('art-titre', nom);
  set('art-fil', nom);
  set('art-description', t.description || 'Suivez notre tournoi et encouragez nos équipes !');
  set('art-date', t.date ? formaterDate(t.date) : 'À venir');
  set('art-lieu', t.lieu || 'À préciser');

  // Affiche (image Drive). Sans affiche, on retire le bloc image.
  const img = document.getElementById('art-affiche');
  if (img) {
    if (t.afficheId) {
      img.src = urlAffiche(t.afficheId, 1200);
      img.alt = 'Affiche — ' + nom;
    } else {
      const bloc = document.getElementById('art-affiche-bloc');
      if (bloc) bloc.remove();
    }
  }

  // Boutons : agenda (.ics, 2 rappels) + itinéraire « On y va ». Le bouton « Voir le
  // tournoi en direct » est déjà dans la page (lien fixe). On crée les éléments data-*
  // puis on laisse initBlocsAgenda/initBlocsItineraire les transformer en boutons.
  const boutons = document.getElementById('art-boutons');
  if (boutons) {
    const agenda = document.createElement('a');
    agenda.className = 'btn btn-primaire btn-grand';
    agenda.setAttribute('data-agenda', '');
    agenda.setAttribute('data-titre', nom);
    agenda.setAttribute('data-date', t.date || '');
    agenda.setAttribute('data-heure-debut', t.heureDebut || '09:00');
    agenda.setAttribute('data-heure-fin', t.heureFin || '');
    agenda.setAttribute('data-lieu', t.lieu || '');
    agenda.setAttribute('data-description', t.description || '');
    agenda.setAttribute('data-rappel', 'les-deux');
    agenda.textContent = 'Ajouter à mon agenda';
    boutons.appendChild(agenda);

    const itineraire = document.createElement('a');
    itineraire.className = 'btn btn-primaire btn-grand btn-itineraire';
    itineraire.setAttribute('data-itineraire', '');
    itineraire.setAttribute('data-lieu', t.lieu || '');
    itineraire.textContent = 'On y va !';
    boutons.appendChild(itineraire);

    initBlocsAgenda();       // remplace [data-agenda] par le bouton .ics (2 rappels)
    initBlocsItineraire();   // remplace [data-itineraire] par le bouton « On y va »
  }
}

/* ---------------------------------------------------------
   CHARGEMENT DES PRODUITS (BOUTIQUE)
   --------------------------------------------------------- */
async function chargerProduits() {
  const conteneur = document.getElementById('liste-produits');
  if (!conteneur) return; // Pas sur la page boutique : on ne fait rien.

  try {
    const reponse = await fetch('assets/data/produits.json');
    if (!reponse.ok) throw new Error('Réponse HTTP ' + reponse.status);
    const produits = await reponse.json();

    conteneur.innerHTML = produits.map(function (produit) {
      // Le bouton "Commander" pointe vers "#" pour l'instant (il recevra plus tard
      // l'adresse HelloAsso, dans le JSON). urlSure() bloque au passage tout lien
      // dangereux (javascript:, data:…) qui aurait été mis dans le JSON.
      const lien = urlSure(produit.lien);
      // "page" = fiche produit détaillée (facultatif). Si elle existe, la carte
      // devient cliquable et le titre devient un lien vers cette fiche.
      const page = produit.page && produit.page !== '' ? urlSure(produit.page) : '';
      const classeCarte = page ? 'carte carte-cliquable' : 'carte';
      const dataPage = page ? ` data-page="${echapper(page)}"` : '';
      const titre = page
        ? `<h3><a href="${echapper(page)}">${echapper(produit.nom)}</a></h3>`
        : `<h3>${echapper(produit.nom)}</h3>`;
      // Visuel : une vraie image si "image" est renseigné, sinon une vignette
      // placeholder à la marque (monogramme R92 sur fond navy).
      const visuel = produit.image && produit.image !== ''
        ? `<img src="assets/img/${echapper(produit.image)}" alt="${echapper(produit.nom)}" loading="lazy" decoding="async">`
        : `<div class="produit-vignette" aria-hidden="true"><b>R92</b><span>Photo à venir</span></div>`;
      return `
        <article class="${classeCarte}"${dataPage}>
          ${visuel}
          <div class="carte-corps">
            ${titre}
            <p>${echapper(produit.description)}</p>
            <div class="prix">${echapper(produit.prix)}</div>
            <a class="btn btn-primaire" href="${echapper(lien)}">Commander</a>
          </div>
        </article>
      `;
    }).join('');
    appliquerDispositionGrille(conteneur, produits.length);
    initCartesCliquables(conteneur);
    ajouterAgendaCartes(conteneur, produits);
  } catch (erreur) {
    conteneur.innerHTML =
      '<p class="message-info">Impossible de charger les produits. ' +
      'Lance le site avec un petit serveur local (voir instructions).</p>';
    console.error(erreur);
  }
}

/* ---------------------------------------------------------
   CHARGEMENT DES SPONSORS
   --------------------------------------------------------- */
async function chargerSponsors() {
  const conteneur = document.getElementById('liste-sponsors');
  if (!conteneur) return; // Pas sur la page sponsors : on ne fait rien.

  try {
    const reponse = await fetch('assets/data/sponsors.json');
    if (!reponse.ok) throw new Error('Réponse HTTP ' + reponse.status);
    const sponsors = await reponse.json();

    conteneur.innerHTML = sponsors.map(function (s) {
      // Logo : une image si "logo" est renseigné, sinon une tuile navy provisoire
      // affichant le monogramme « R92 » (rendu par la classe .sponsor-logo-vide).
      const logo = s.logo && s.logo !== ''
        ? `<img class="sponsor-logo" src="assets/img/${echapper(s.logo)}" alt="${echapper(s.nom)}" loading="lazy" decoding="async">`
        : `<div class="sponsor-logo sponsor-logo-vide" aria-hidden="true"></div>`;
      // Ville : affichée seulement si renseignée.
      const ville = s.ville && s.ville !== ''
        ? `<p class="sponsor-ville">${echapper(s.ville)}</p>`
        : '';
      // Le bouton "Visiter le site" n'apparaît que si un vrai lien est fourni.
      const lien = s.lien && s.lien !== '' && s.lien !== '#'
        ? `<a class="btn btn-primaire" href="${echapper(urlSure(s.lien))}" target="_blank" rel="noopener">Visiter le site</a>`
        : '';
      return `
        <article class="carte carte-sponsor">
          ${logo}
          <div class="carte-corps">
            <h3>${echapper(s.nom)}</h3>
            ${ville}
            <p>${echapper(s.description)}</p>
            ${lien}
          </div>
        </article>
      `;
    }).join('');
    appliquerDispositionGrille(conteneur, sponsors.length);
  } catch (erreur) {
    conteneur.innerHTML =
      '<p class="message-info">Impossible de charger les sponsors. ' +
      'Lance le site avec un petit serveur local (voir README).</p>';
    console.error(erreur);
  }
}

/* ---------------------------------------------------------
   CHARGEMENT DES PROJETS (page "Nos projets")
   Même principe que la boutique : chaque projet devient une
   carte. Si le projet a une "page" (article détaillé), sa carte
   devient cliquable et un bouton "Lire l'article" apparaît.
   --------------------------------------------------------- */
async function chargerProjets() {
  const conteneur = document.getElementById('liste-projets');
  if (!conteneur) return; // Pas sur la page projets : on ne fait rien.

  try {
    const reponse = await fetch('assets/data/projets.json');
    if (!reponse.ok) throw new Error('Réponse HTTP ' + reponse.status);
    const projets = await reponse.json();

    conteneur.innerHTML = projets.map(function (projet) {
      // "page" = article détaillé (facultatif). S'il existe, la carte devient
      // cliquable, le titre devient un lien et un bouton "Lire l'article" s'affiche.
      const page = projet.page && projet.page !== '' ? urlSure(projet.page) : '';
      const classeCarte = page ? 'carte carte-cliquable' : 'carte';
      const dataPage = page ? ` data-page="${echapper(page)}"` : '';
      const titre = page
        ? `<h3><a href="${echapper(page)}">${echapper(projet.nom)}</a></h3>`
        : `<h3>${echapper(projet.nom)}</h3>`;
      // Visuel : vraie image si "image" est renseigné, sinon vignette à la marque.
      const visuel = projet.image && projet.image !== ''
        ? `<img src="assets/img/${echapper(projet.image)}" alt="${echapper(projet.nom)}" loading="lazy" decoding="async">`
        : `<div class="produit-vignette" aria-hidden="true"><b>R92</b><span>Photo à venir</span></div>`;
      // Bouton "Lire l'article" uniquement si un article est lié.
      const bouton = page
        ? `<a class="btn btn-primaire" href="${echapper(page)}">Lire l'article</a>`
        : '';
      return `
        <article class="${classeCarte}"${dataPage}>
          ${visuel}
          <div class="carte-corps">
            ${titre}
            <p>${echapper(projet.description)}</p>
            ${bouton}
          </div>
        </article>
      `;
    }).join('');
    appliquerDispositionGrille(conteneur, projets.length);
    initCartesCliquables(conteneur);
    ajouterAgendaCartes(conteneur, projets);
  } catch (erreur) {
    conteneur.innerHTML =
      '<p class="message-info">Impossible de charger les projets. ' +
      'Lance le site avec un petit serveur local (voir README).</p>';
    console.error(erreur);
  }
}

/* ---------------------------------------------------------
   MENU DÉROULANT "Nous soutenir"
   Sur ordinateur il s'ouvre au survol (géré en CSS).
   Sur mobile/tactile, on l'ouvre/ferme au clic sur le bouton.
   --------------------------------------------------------- */
function initMenuDeroulant() {
  const menus = document.querySelectorAll('.menu-deroulant');

  menus.forEach(function (menu) {
    const bouton = menu.querySelector('.menu-deroulant-btn');
    if (!bouton) return;

    bouton.addEventListener('click', function (evenement) {
      evenement.stopPropagation(); // évite de refermer aussitôt
      const ouvert = menu.classList.toggle('ouvert');
      bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
  });

  // Un clic ailleurs sur la page referme le menu.
  document.addEventListener('click', function () {
    menus.forEach(function (menu) {
      menu.classList.remove('ouvert');
      const bouton = menu.querySelector('.menu-deroulant-btn');
      if (bouton) bouton.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------
   CARROUSEL D'IMAGES (fiche produit)
   Défilement des photos avec flèches, puces et clavier.
   Ne s'active que si un élément [data-carrousel] existe.
   --------------------------------------------------------- */
function initCarrousel() {
  const carrousels = document.querySelectorAll('[data-carrousel]');

  carrousels.forEach(function (carrousel) {
    const piste = carrousel.querySelector('.carrousel-piste');
    const slides = Array.from(carrousel.querySelectorAll('.carrousel-slide'));
    const conteneurPoints = carrousel.querySelector('.carrousel-points');
    if (!piste || slides.length === 0) return;

    let index = 0;

    // Construit une puce par diapositive.
    const points = slides.map(function (slide, i) {
      const point = document.createElement('button');
      point.type = 'button';
      point.className = 'carrousel-point';
      point.setAttribute('aria-label', 'Aller à la photo ' + (i + 1));
      point.addEventListener('click', function () { aller(i); });
      if (conteneurPoints) conteneurPoints.appendChild(point);
      return point;
    });

    function afficher() {
      piste.style.transform = 'translateX(-' + (index * 100) + '%)';
      points.forEach(function (p, i) {
        p.classList.toggle('actif', i === index);
      });
    }
    function aller(i) {
      index = (i + slides.length) % slides.length;
      afficher();
    }

    const prec = carrousel.querySelector('.carrousel-prec');
    const suiv = carrousel.querySelector('.carrousel-suiv');
    if (prec) prec.addEventListener('click', function () { aller(index - 1); });
    if (suiv) suiv.addEventListener('click', function () { aller(index + 1); });

    // Navigation au clavier (flèches gauche/droite quand le carrousel a le focus).
    carrousel.setAttribute('tabindex', '0');
    carrousel.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'ArrowLeft') { aller(index - 1); }
      else if (evenement.key === 'ArrowRight') { aller(index + 1); }
    });

    afficher();
  });
}

/* ---------------------------------------------------------
   MENU MOBILE (bouton hamburger)
   Ouvre/ferme la navigation sur petit écran.
   --------------------------------------------------------- */
function initMenuMobile() {
  const bouton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!bouton || !nav) return;

  bouton.addEventListener('click', function (evenement) {
    evenement.stopPropagation();
    const ouvert = nav.classList.toggle('ouvert');
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
}

/* On lance tout quand la page est prête.
   Chaque fonction ne s'active que si les éléments concernés existent. */
document.addEventListener('DOMContentLoaded', function () {
  chargerActus();
  chargerArticleTournoi();
  chargerProduits();
  chargerSponsors();
  chargerProjets();
  initMenuDeroulant();
  initMenuMobile();
  initCarrousel();
  initBlocsAgenda();
  initBlocsItineraire();
});
