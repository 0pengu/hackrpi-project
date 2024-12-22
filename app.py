from flask import Flask, jsonify, send_from_directory
from flask_caching import Cache
import requests
import os
from typing import Dict, List
from extensions import cache
from api.base import api_route

app = Flask(__name__, static_folder='dist', template_folder='dist')

# Initialize caching to app
cache.init_app(app)

app.register_blueprint(api_route)

# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def serve(path):
#     print(app.static_folder)
#     if path != "" and os.path.exists((app.static_folder + '/' + path if app.static_folder else "")):
#         return send_from_directory(app.static_folder if app.static_folder else "", path)
#     else:
#         return send_from_directory(app.static_folder if app.static_folder else "", 'index.html')


# if __name__ == '__main__':
#     app.run(debug=True)
