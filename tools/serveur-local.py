#!/usr/bin/env python3
"""Petit serveur local pour développer le site Génération R92.

    python3 tools/serveur-local.py [port]     # 8000 par défaut
    → http://localhost:8000

Pourquoi ce fichier plutôt que « python3 -m http.server » ?
Parce que ce module, lancé en __main__, appelle os.getcwd() au chargement
(pour la valeur par défaut de --directory), ce qui échoue avec
« PermissionError: [Errno 1] Operation not permitted » dès que le processus
tourne dans un environnement restreint. Ici on n'appelle jamais os.getcwd() :
  - on se place à la racine du projet à partir de __file__, en chemin relatif ;
  - on passe « directory » explicitement au gestionnaire de requêtes, sinon
    SimpleHTTPRequestHandler retomberait lui aussi sur os.getcwd().

Rappel : les pages qui lisent un JSON (boutique, actualités, projets, sponsors)
ne fonctionnent qu'à travers un serveur, pas en double-cliquant le fichier.
"""
import functools
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Racine du projet = le dossier parent de tools/, atteint sans os.getcwd().
dossier_du_script = os.path.dirname(__file__) or "."
os.chdir(dossier_du_script)
os.chdir("..")

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Gestionnaire(SimpleHTTPRequestHandler):
    """Sert le dossier courant, avec un journal allégé et sans cache."""

    def end_headers(self):
        # En développement, on veut toujours la dernière version des fichiers.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format, *args):
        # Une ligne par requête, sans l'horodatage verbeux par défaut.
        sys.stderr.write("  %s\n" % (format % args))


if __name__ == "__main__":
    # « directory="." » est indispensable : sans lui, SimpleHTTPRequestHandler
    # appelle os.getcwd() dans son __init__.
    gestionnaire = functools.partial(Gestionnaire, directory=".")
    serveur = HTTPServer(("127.0.0.1", PORT), gestionnaire)
    print(f"Site Génération R92 servi sur http://localhost:{PORT}")
    print("Ctrl + C pour arrêter.")
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté.")
