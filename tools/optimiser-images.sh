#!/usr/bin/env bash
# =========================================================
# GÉNÉRATION R92 — Régénère les images web depuis _sources/
# ---------------------------------------------------------
# N'utilise que « sips », livré avec macOS : aucune installation.
# Les originaux vivent dans _sources/ (exclu de Git et du déploiement).
# Les versions optimisées atterrissent dans assets/img/.
#
#   ./tools/optimiser-images.sh
#
# Qualités retenues (validées à l'œil, recadrage 1:1) :
#   - photos           q55  — indiscernables de l'original
#   - hero             q60  — illustration, masquée par un voile navy
#   - filigrane        q50  — affiché à 10 % d'opacité
#   - logo             PNG  — le canal alpha est indispensable sur fond navy
# =========================================================
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$RACINE/_sources"
DST="$RACINE/assets/img"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ ! -d "$SRC" ]; then
  echo "✗ Dossier _sources/ introuvable." >&2
  echo "  Les originaux sont récupérables dans l'historique Git (premier commit)." >&2
  exit 1
fi

# convertir <source> <largeur> <qualité> <destination>
convertir() {
  local src="$SRC/$1" largeur="$2" qualite="$3" dst="$DST/$4"
  [ -f "$src" ] || { echo "  – $1 absent, ignoré"; return 0; }
  cp "$src" "$TMP/t"
  sips --resampleWidth "$largeur" "$TMP/t" >/dev/null
  sips -s format jpeg -s formatOptions "$qualite" "$TMP/t" --out "$dst" >/dev/null 2>&1
  printf "  ✓ %-32s %s\n" "$4" "$(du -h "$dst" | cut -f1)"
}

echo "Régénération des images web…"
convertir hero-defense.png                 1920 60 hero-defense.jpg
convertir hero-defense-watermark.png       1800 50 hero-defense-watermark.jpg
convertir accueil-association-originale.jpg    1040 55 accueil-association.jpg
convertir equipe-qui-sommes-nous-originale.jpg 1040 55 equipe-qui-sommes-nous.jpg
convertir grand-voyage-originale.jpg           1200 55 grand-voyage.jpg
convertir actu-foire-a-tout-originale.jpg      1000 55 actu-foire-a-tout.jpg
for n in 1 2 3 4 5; do
  convertir "debardeur-$n-originale.jpg" 1000 55 "debardeur-$n.jpg"
done
convertir debardeur-r92-originale.jpg 1000 55 debardeur-r92.jpg

# Le logo garde sa transparence : on le redimensionne sans changer de format.
if [ -f "$SRC/logo-r92-original.png" ]; then
  cp "$SRC/logo-r92-original.png" "$DST/logo-r92.png"
  sips --resampleWidth 700 "$DST/logo-r92.png" >/dev/null
  printf "  ✓ %-32s %s\n" "logo-r92.png" "$(du -h "$DST/logo-r92.png" | cut -f1)"
fi

echo
echo "Total assets/img/ : $(du -sh "$DST" | cut -f1)"
echo "⚠️  Si une dimension change, pensez aux attributs width/height des <img>."
