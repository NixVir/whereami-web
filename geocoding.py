"""
Geocoding utilities for converting location descriptions to coordinates.
"""

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import time


class LocationGeocoder:
    """
    Handles geocoding of various location input formats.
    """

    def __init__(self, user_agent="cosmic_position_calculator", timeout=10):
        """
        Initialize geocoder with user agent.

        Args:
            user_agent: String identifying your application
            timeout: Timeout in seconds for geocoding requests
        """
        self.geocoder = Nominatim(user_agent=user_agent, timeout=timeout)

    def geocode_location(self, location_string, retry_count=5):
        """
        Geocode a location string to latitude/longitude coordinates.

        Args:
            location_string: Location as string (e.g., "New York, NY, USA" or "Paris, France")
            retry_count: Number of retries if geocoding fails

        Returns:
            tuple: (latitude, longitude, full_address) or (None, None, None) if failed
        """
        for attempt in range(retry_count):
            try:
                location = self.geocoder.geocode(location_string)

                if location:
                    return location.latitude, location.longitude, location.address
                else:
                    return None, None, None

            except GeocoderTimedOut:
                if attempt < retry_count - 1:
                    wait_time = 2 * (attempt + 1)  # Exponential backoff: 2, 4, 6, 8 seconds
                    print(f"Timeout, retrying in {wait_time} seconds... (attempt {attempt + 1}/{retry_count})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"Geocoding timed out after {retry_count} attempts")
                    return None, None, None

            except GeocoderServiceError as e:
                if attempt < retry_count - 1:
                    wait_time = 2 * (attempt + 1)
                    print(f"Service error, retrying in {wait_time} seconds... (attempt {attempt + 1}/{retry_count})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"Geocoding service error after {retry_count} attempts: {e}")
                    return None, None, None

            except Exception as e:
                print(f"Unexpected geocoding error: {e}")
                if attempt < retry_count - 1:
                    print(f"Retrying... (attempt {attempt + 1}/{retry_count})")
                    time.sleep(2)
                    continue
                return None, None, None

        return None, None, None

    def geocode_with_fallback(self, location_dict):
        """
        Geocode using multiple fallback strategies for flexible input.

        Args:
            location_dict: Dictionary with possible keys:
                - 'city': City name
                - 'state': State/province name
                - 'country': Country name
                - 'zip': ZIP/postal code
                - 'full': Full address string

        Returns:
            tuple: (latitude, longitude, full_address) or (None, None, None) if failed
        """
        # Try full address first if provided
        if 'full' in location_dict and location_dict['full']:
            result = self.geocode_location(location_dict['full'])
            if result[0] is not None:
                return result

        # Build address string from components
        address_components = []

        if 'city' in location_dict and location_dict['city']:
            address_components.append(location_dict['city'])

        if 'state' in location_dict and location_dict['state']:
            address_components.append(location_dict['state'])

        if 'zip' in location_dict and location_dict['zip']:
            address_components.append(location_dict['zip'])

        if 'country' in location_dict and location_dict['country']:
            address_components.append(location_dict['country'])

        if address_components:
            address_string = ", ".join(address_components)
            result = self.geocode_location(address_string)
            if result[0] is not None:
                return result

        # If all else fails, try just country
        if 'country' in location_dict and location_dict['country']:
            result = self.geocode_location(location_dict['country'])
            if result[0] is not None:
                return result

        return None, None, None

    def validate_coordinates(self, latitude, longitude):
        """
        Validate that coordinates are within valid ranges.

        Args:
            latitude: Latitude in degrees
            longitude: Longitude in degrees

        Returns:
            bool: True if valid, False otherwise
        """
        if latitude is None or longitude is None:
            return False

        if not (-90 <= latitude <= 90):
            return False

        if not (-180 <= longitude <= 180):
            return False

        return True


def parse_location_input(user_input):
    """
    Parse various formats of location input into a standardized dictionary.

    Supports formats like:
    - "New York, NY, 10001, USA"
    - "London, UK"
    - "Paris, France"
    - "Tokyo"

    Args:
        user_input: String with location information

    Returns:
        dict: Parsed location components
    """
    location_dict = {}

    # Simple parsing - split by comma
    parts = [p.strip() for p in user_input.split(',')]

    if len(parts) >= 1:
        location_dict['city'] = parts[0]

    if len(parts) >= 2:
        # Could be state/province or country
        location_dict['state'] = parts[1]

    if len(parts) >= 3:
        # Could be ZIP or country
        if parts[2].isdigit() or (len(parts[2]) >= 5 and parts[2][:5].isdigit()):
            location_dict['zip'] = parts[2]
        else:
            location_dict['country'] = parts[2]

    if len(parts) >= 4:
        location_dict['country'] = parts[3]

    # Also keep the full input
    location_dict['full'] = user_input

    return location_dict


# Example usage and testing
if __name__ == "__main__":
    geocoder = LocationGeocoder()

    test_locations = [
        "New York, NY, USA",
        "London, United Kingdom",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Paris, France",
        "Berlin, Germany",
        "Moscow, Russia",
        "Beijing, China"
    ]

    print("Testing geocoder:")
    print("-" * 80)

    for location in test_locations:
        lat, lon, address = geocoder.geocode_location(location)
        if lat is not None:
            print(f"\n{location}")
            print(f"  Coordinates: {lat:.4f}°, {lon:.4f}°")
            print(f"  Full address: {address}")
        else:
            print(f"\n{location}")
            print(f"  Failed to geocode")

        time.sleep(1)  # Be respectful to the geocoding service
