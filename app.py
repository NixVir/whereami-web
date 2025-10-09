"""
Flask API for Cosmic Position Calculator
Provides REST endpoints for the web visualization
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS

from cosmic_calculator import CosmicMotionCalculator, MotionForcesCatalog
from geocoding import LocationGeocoder
from spacetime_position import SpaceTimePosition, parse_datetime_input, normalize_timezone

app = Flask(__name__,
            static_folder='static',
            template_folder='templates')
CORS(app)  # Enable CORS for all routes

# Initialize geocoder once
geocoder = LocationGeocoder()


@app.route('/')
def index():
    """Serve the main web interface."""
    return render_template('index.html')


@app.route('/api/geocode', methods=['POST'])
def geocode():
    """
    Geocode a location string to coordinates.

    Request JSON:
        {
            "location": "Boulder, CO, USA"
        }

    Response JSON:
        {
            "latitude": 40.0150,
            "longitude": -105.2705,
            "address": "Boulder, Boulder County, Colorado, USA",
            "success": true
        }
    """
    try:
        data = request.get_json()
        location_string = data.get('location', '')

        if not location_string:
            return jsonify({
                'success': False,
                'error': 'Location string is required'
            }), 400

        lat, lon, address = geocoder.geocode_location(location_string)

        if lat is None:
            return jsonify({
                'success': False,
                'error': f'Could not geocode location: {location_string}'
            }), 404

        return jsonify({
            'success': True,
            'latitude': lat,
            'longitude': lon,
            'address': address
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/calculate', methods=['POST'])
def calculate_position():
    """
    Calculate cosmic position and journey.

    Request JSON:
        {
            "birth_date": "1971-11-17",
            "birth_time": "06:00:00",
            "birth_timezone": "Mountain",
            "birth_latitude": 39.1001,
            "birth_longitude": -94.5781,
            "birth_address": "Kansas City, MO, USA",
            "current_date": null,  # null for current time
            "current_time": null,
            "current_timezone": null,
            "current_latitude": 40.0150,
            "current_longitude": -105.2705,
            "current_address": "Boulder, CO, USA"
        }

    Response JSON:
        {
            "success": true,
            "birth": {
                "datetime": "1971-11-17T06:00:00-07:00",
                "location": {...},
                "velocities": {...}
            },
            "current": {
                "datetime": "2025-10-09T...",
                "location": {...},
                "velocities": {...}
            },
            "displacement": {
                "vector_km": [x, y, z],
                "magnitude_km": 123456789.0,
                "magnitude_au": 0.825,
                "magnitude_ly": 0.00013,
                "time_elapsed_years": 53.89
            },
            "spacecraft_comparisons": [...]
        }
    """
    try:
        data = request.get_json()

        # Parse birth datetime
        birth_dt = parse_datetime_input(
            data['birth_date'],
            data.get('birth_time', '12:00:00'),
            data.get('birth_timezone', 'UTC')
        )

        if birth_dt is None:
            return jsonify({
                'success': False,
                'error': 'Invalid birth date/time'
            }), 400

        # Parse current datetime (if provided)
        current_dt = None
        if data.get('current_date'):
            current_dt = parse_datetime_input(
                data['current_date'],
                data.get('current_time', '12:00:00'),
                data.get('current_timezone', 'UTC')
            )

        # Create birth location tuple
        birth_location = (
            data['birth_latitude'],
            data['birth_longitude'],
            data.get('birth_address', 'Unknown')
        )

        # Create current location tuple (if different)
        current_location = None
        if data.get('current_latitude') is not None:
            current_location = (
                data['current_latitude'],
                data['current_longitude'],
                data.get('current_address', 'Unknown')
            )

        # Calculate position
        position = SpaceTimePosition(
            birth_dt,
            birth_location,
            current_datetime=current_dt,
            current_location=current_location
        )

        # Get displacement data
        displacement_data = position.calculate_displacement()

        # Format response
        response = {
            'success': True,
            'birth': {
                'datetime': displacement_data['birth_data']['time'].isoformat(),
                'location': displacement_data['birth_data']['location'],
                'velocities': {
                    key: {
                        'x': float(vel[0]),
                        'y': float(vel[1]),
                        'z': float(vel[2]),
                        'magnitude': float(sum(v**2 for v in vel)**0.5)
                    }
                    for key, vel in displacement_data['birth_data']['velocities'].items()
                    if key != 'total_magnitude'
                }
            },
            'current': {
                'datetime': displacement_data['current_data']['time'].isoformat(),
                'location': displacement_data['current_data']['location'],
                'velocities': {
                    key: {
                        'x': float(vel[0]),
                        'y': float(vel[1]),
                        'z': float(vel[2]),
                        'magnitude': float(sum(v**2 for v in vel)**0.5)
                    }
                    for key, vel in displacement_data['current_data']['velocities'].items()
                    if key != 'total_magnitude'
                }
            },
            'displacement': {
                'vector_km': [
                    float(displacement_data['displacement_vector_km'][0]),
                    float(displacement_data['displacement_vector_km'][1]),
                    float(displacement_data['displacement_vector_km'][2])
                ],
                'magnitude_km': float(displacement_data['displacement_magnitude_km']),
                'magnitude_au': float(displacement_data['displacement_magnitude_au']),
                'magnitude_ly': float(displacement_data['displacement_magnitude_ly']),
                'time_elapsed_seconds': float(displacement_data['time_elapsed_seconds']),
                'time_elapsed_years': float(displacement_data['time_elapsed_years'])
            },
            'cosmic_separation': displacement_data['cosmic_separation'],
            'spacecraft_comparisons': generate_spacecraft_comparisons(
                displacement_data['displacement_magnitude_km']
            )
        }

        return jsonify(response)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/forces', methods=['GET'])
def get_forces_catalog():
    """
    Get the comprehensive catalog of forces and motions.

    Response JSON:
        {
            "success": true,
            "catalog": {
                "actual_forces": [...],
                "terrestrial_motions": [...],
                ...
            }
        }
    """
    try:
        catalog = MotionForcesCatalog.get_all_forces()
        return jsonify({
            'success': True,
            'catalog': catalog
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def generate_spacecraft_comparisons(distance_km):
    """Generate spacecraft travel time comparisons."""
    spacecraft = [
        {
            'name': 'Parker Solar Probe',
            'speed_kms': 163.0,
            'speed_kmh': 586800,
            'year': 2021,
            'record': 'Fastest human-made object ever'
        },
        {
            'name': 'Juno',
            'speed_kms': 73.61,
            'speed_kmh': 265000,
            'year': 2016,
            'record': 'Fastest Jupiter mission'
        },
        {
            'name': 'Helios 2',
            'speed_kms': 70.22,
            'speed_kmh': 252792,
            'year': 1976,
            'record': 'Held speed record for 45 years'
        },
        {
            'name': 'Helios 1',
            'speed_kms': 68.75,
            'speed_kmh': 247500,
            'year': 1975,
            'record': 'First to exceed 240,000 km/h'
        },
        {
            'name': 'New Horizons',
            'speed_kms': 58.54,
            'speed_kmh': 210744,
            'year': 2015,
            'record': 'Fastest Earth departure velocity'
        }
    ]

    results = []
    for craft in spacecraft:
        travel_time_seconds = distance_km / craft['speed_kms']
        travel_time_years = travel_time_seconds / (365.25 * 24 * 3600)
        travel_time_days = travel_time_years * 365.25

        results.append({
            'name': craft['name'],
            'speed_kms': craft['speed_kms'],
            'speed_kmh': craft['speed_kmh'],
            'year': craft['year'],
            'record': craft['record'],
            'travel_time_seconds': travel_time_seconds,
            'travel_time_days': travel_time_days,
            'travel_time_years': travel_time_years
        })

    return results


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return jsonify({
        'status': 'healthy',
        'service': 'cosmic-position-calculator'
    })


if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=5000)
