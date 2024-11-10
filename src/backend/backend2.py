from flask import Flask, jsonify, request
from flask_caching import Cache
import requests 
from datetime import datetime
import os
from typing import Dict, List
import geojson

app = Flask(__name__)

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
    params = {'$limit': 100, '$select': 'the_geom'}   
        
    """Get cached NYC location data"""
    response = requests.get(NYC_API_URL, params=params)
    response.raise_for_status()
    return response.json()

@app.route('/')
def index():
    """Serve the main map page"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>NYC Locations Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
            #map { height: 100vh; width: 100%; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
            const map = L.map('map').setView([40.7128, -74.0060], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            fetch('/api/locations')
                .then(response => response.json())
                .then(data => {
                    L.geoJSON(data, {
                        pointToLayer: (feature, latlng) => {
                            return L.marker(latlng)
                                .bindPopup(`
                                    <h3>${feature.properties.name}</h3>
                                    <p>${feature.properties.address}</p>
                                    <p>Type: ${feature.properties.site_type}</p>
                                    <p>Borough: ${feature.properties.borough}</p>
                                `);
                        }
                    }).addTo(map);
                });
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(debug=True)