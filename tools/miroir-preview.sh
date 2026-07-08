#!/usr/bin/env bash
# =========================================================
# GÉNÉRATION R92 — Miroir pour l'aperçu intégré (preview)
# ---------------------------------------------------------
# Utile UNIQUEMENT pour l'aperçu intégré de Claude Code.
# Pour développer normalement :  python3 tools/serveur-local.py
#
# Pourquoi ce détour ?
# Le projet vit sous ~/Desktop, dossier protégé par macOS (TCC).
# Le processus qui lance l'aperçu n'a pas cette permission : il peut
# faire stat() sur les fichiers, mais pas les open() — d'où des 404
# sur toutes les pages, et l'impossibilité même de lancer un script
# situé là. Vérifié à la sonde, ce n'est pas contournable en config.
#
# Ce script crée /private/tmp/r92-preview, un miroir en LIENS DURS :
# mêmes inodes que les fichiers du projet, mais accessibles par un
# chemin que le bac à sable autorise. Une modification enregistrée
# « en place » est donc visible immédiatement, sans resynchroniser.
# En revanche, un fichier recréé (git checkout, certains éditeurs)
# casse son lien : relancer ce script.
#
#   ./tools/miroir-preview.sh
#   puis, dans Claude Code : preview_start « site-r92 »
#
# Le vrai correctif, au choix :
#   • déplacer le projet hors de ~/Desktop (ex. ~/Projets/) ;
#   • ou accorder l'accès au dossier Bureau dans Réglages Système
#     → Confidentialité et sécurité → Fichiers et dossiers.
# =========================================================
set -euo pipefail

PROJET="$(cd "$(dirname "$0")/.." && pwd)"
MIROIR="/private/tmp/r92-preview"

cd "$PROJET"
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "✗ Ce script s'appuie sur « git ls-files » : dépôt Git introuvable." >&2
  exit 1
fi

# On vide le miroir sans supprimer le dossier lui-même : un serveur déjà
# lancé y a son répertoire courant, et le recréer le laisserait pointer
# sur un inode disparu (toutes les pages tomberaient en 404).
mkdir -p "$MIROIR"
find "$MIROIR" -mindepth 1 -delete

lies=0
copies=0
# Les fichiers suivis par Git, plus le serveur lui-même.
{ git ls-files -z; printf 'tools/serveur-local.py\0'; } | sort -zu | while IFS= read -r -d '' f; do
  mkdir -p "$MIROIR/$(dirname "$f")"
  if ln "$PROJET/$f" "$MIROIR/$f" 2>/dev/null; then
    lies=$((lies + 1))
  else
    # volumes différents : on retombe sur une copie (il faudra resynchroniser)
    cp "$PROJET/$f" "$MIROIR/$f"
    copies=$((copies + 1))
  fi
done

total=$(find "$MIROIR" -type f | wc -l | tr -d ' ')
echo "✓ Miroir prêt : $MIROIR ($total fichiers)"
echo "  Lancer ensuite l'aperçu « site-r92 » (port 8000)."
