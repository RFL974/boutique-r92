#!/usr/bin/env bash
# =========================================================
# GÉNÉRATION R92 — À lancer le jour où l'association a un domaine
# ---------------------------------------------------------
#   ./tools/definir-domaine.sh https://generationr92.fr
#
# Trois choses exigent une URL absolue, et n'ont donc pas pu être posées
# tant que le site n'avait pas d'adresse. Ce script les ajoute d'un coup :
#
#   1. <link rel="canonical"> sur chaque page       (évite le contenu dupliqué)
#   2. <meta property="og:url"> sur chaque page     (aperçu au partage)
#      + og:image et twitter:image passent en URL absolue
#   3. sitemap.xml à la racine + ligne « Sitemap: » dans robots.txt
#
# Le script est idempotent : le relancer avec un autre domaine met tout à jour.
# =========================================================
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage : $0 https://mon-domaine.fr" >&2
  exit 1
fi

BASE="${1%/}"   # on enlève un éventuel / final
case "$BASE" in
  https://*|http://*) ;;
  *) echo "✗ L'URL doit commencer par https:// (ou http://)." >&2; exit 1 ;;
esac

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RACINE"

BASE="$BASE" python3 - <<'PY'
import os, re, pathlib, datetime

base = os.environ["BASE"]
racine = pathlib.Path(".")
# 404.html : pas de canonical ni de og:url (elle est en noindex, on ne la partage
# pas), mais son og:image doit quand même passer en absolu.
toutes = sorted(racine.glob("*.html"))
pages = [p for p in toutes if p.name != "404.html"]

COMMENTAIRE_ATTENTE = """  <!-- Aperçu au partage (WhatsApp, Facebook, Instagram, Slack, X…).
       og:url et rel="canonical" viendront quand l'association aura un domaine :
       voir tools/definir-domaine.sh -->
"""
COMMENTAIRE_FINAL = "  <!-- Aperçu au partage (WhatsApp, Facebook, Instagram, Slack, X…) -->\n"

def absolutiser_images(s):
    return re.sub(
        r'(<meta (?:property="og:image"|name="twitter:image") content=")(?:https?://[^"]*?/)?(assets/img/[^"]+)(">)',
        lambda m: m.group(1) + base + "/" + m.group(2) + m.group(3), s)

# Priorités : l'accueil d'abord, puis les pages qui font agir, puis le légal.
PRIORITE = {
    "index.html": "1.0",
    "qui-sommes-nous.html": "0.9", "nos-projets.html": "0.9", "adhesion.html": "0.9",
    "boutique.html": "0.9", "faire-un-don.html": "0.9",
    "actualites.html": "0.8", "grand-voyage.html": "0.8", "foire-a-tout.html": "0.8",
    "debardeur-r92.html": "0.8", "devenir-partenaire.html": "0.8", "sponsors.html": "0.7",
    "contact.html": "0.7", "faq.html": "0.6",
    "mentions-legales.html": "0.3", "cgv.html": "0.3", "rgpd.html": "0.3", "statuts.html": "0.3",
}

for p in pages:
    s = p.read_text(encoding="utf-8")
    url = f"{base}/{p.name}"
    if p.name == "index.html":
        url = f"{base}/"

    # 1. canonical (ajouté après le <title>, ou mis à jour s'il existe déjà)
    if 'rel="canonical"' in s:
        s = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s)
    else:
        s = re.sub(r"(</title>)", f'\\1\n  <link rel="canonical" href="{url}">', s, count=1)

    # 2. og:url (ajouté avant og:title, ou mis à jour)
    if 'property="og:url"' in s:
        s = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', s)
    else:
        s = re.sub(r'(  <meta property="og:title")', f'  <meta property="og:url" content="{url}">\n\\1', s, count=1)

    # 3. og:image et twitter:image en absolu
    s = absolutiser_images(s)

    # 4. le commentaire d'attente n'a plus lieu d'être
    s = s.replace(COMMENTAIRE_ATTENTE, COMMENTAIRE_FINAL)

    p.write_text(s, encoding="utf-8")
    print(f"  ✓ {p.name}")

# 404.html : images absolues et commentaire nettoyé, sans canonical ni og:url
q = racine / "404.html"
if q.exists():
    s = absolutiser_images(q.read_text(encoding="utf-8")).replace(COMMENTAIRE_ATTENTE, COMMENTAIRE_FINAL)
    q.write_text(s, encoding="utf-8")
    print("  ✓ 404.html (images absolues ; ni canonical ni og:url : page noindex)")

# 5. sitemap.xml
jour = datetime.date.today().isoformat()
lignes = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for p in pages:
    loc = f"{base}/" if p.name == "index.html" else f"{base}/{p.name}"
    lignes += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{jour}</lastmod>",
               f"    <priority>{PRIORITE.get(p.name, '0.5')}</priority>", "  </url>"]
lignes.append("</urlset>")
pathlib.Path("sitemap.xml").write_text("\n".join(lignes) + "\n", encoding="utf-8")
print(f"  ✓ sitemap.xml ({len(pages)} URL)")

# 6. robots.txt : ligne Sitemap
r = pathlib.Path("robots.txt")
txt = r.read_text(encoding="utf-8")
txt = re.sub(r"\n# Ligne « Sitemap: ».*?\n#   \./tools/definir-domaine\.sh.*?\n", "\n", txt, flags=re.DOTALL)
txt = re.sub(r"^Sitemap: .*$", "", txt, flags=re.MULTILINE).rstrip() + f"\n\nSitemap: {base}/sitemap.xml\n"
r.write_text(txt, encoding="utf-8")
print("  ✓ robots.txt : ligne Sitemap")
PY

echo
echo "Terminé. Pensez à :"
echo "  • relire un <head> pour vérifier l'URL"
echo "  • valider l'aperçu sur https://developers.facebook.com/tools/debug/"
echo "  • déclarer le sitemap dans la Search Console de Google"
