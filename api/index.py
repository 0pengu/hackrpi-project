from flask import Flask, jsonify, send_from_directory
from flask_caching import Cache
import requests
import os
from typing import Dict, List

app = Flask(__name__, static_folder='dist', template_folder='dist')

# Configure caching
cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 500
})


NYC_API_URL = "https://data.cityofnewyork.us/resource/t95h-5fsr.json"


@app.route('/api/locations')
@cache.cached(timeout=3600, query_string=True)
def get_locations():
    try:
        data = get_cached_data()
        # Transform to GeoJSON for mapping
        geojson_data = transform_to_geojson(data)
        return jsonify(geojson_data)

    except requests.RequestException as e:
        return jsonify({'error': f'API Error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def transform_to_geojson(data: List[Dict]) -> Dict:
    features = []

    for d in data:
        coordinates = d['the_geom']['coordinates']
        if not coordinates[0] or not coordinates[1]:
            continue

        try:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [
                        float(coordinates[0]),
                        float(coordinates[1])
                    ]
                },
                'properties': {
                }
            }
            features.append(feature)
        except (ValueError, TypeError):
            continue

    return {
        'type': 'FeatureCollection',
        'features': features
    }


@cache.memoize(timeout=3600)
def get_cached_data():

    # Build query parameters for NYC API
    params = {'$limit': 300, '$select': 'the_geom'}

    """Get cached NYC location data"""
    response = requests.get(NYC_API_URL, params=params)
    response.raise_for_status()
    return response.json()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    print(app.static_folder)
    if path != "" and os.path.exists((app.static_folder + '/' + path if app.static_folder else "")):
        return send_from_directory(app.static_folder if app.static_folder else "", path)
    else:
        return send_from_directory(app.static_folder if app.static_folder else "", 'index.html')


# if __name__ == '__main__':
#     app.run(debug=True)
