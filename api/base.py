from flask import Blueprint, jsonify
import requests
from extensions import cache


api_route = Blueprint("api", __name__, url_prefix="/api")


@api_route.route('/locations')
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


def transform_to_geojson(data: list[dict]) -> dict:
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


NYC_API_URL = "https://data.cityofnewyork.us/resource/t95h-5fsr.json"
