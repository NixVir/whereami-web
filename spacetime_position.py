"""
Space-time position calculator.
Computes a person's position through space at different times.
"""

import numpy as np
from datetime import datetime
from astropy.time import Time
from astropy import units as u
import pytz

from cosmic_calculator import CosmicMotionCalculator, format_velocity_vector, format_position_vector
from geocoding import LocationGeocoder, parse_location_input


class SpaceTimePosition:
    """
    Represents a person's position in space and time.
    """

    def __init__(self, birth_datetime, birth_location, current_datetime=None, current_location=None):
        """
        Initialize with birth information and optional current information.

        Args:
            birth_datetime: datetime object for time of birth (timezone-aware)
            birth_location: tuple (latitude, longitude, address_string)
            current_datetime: datetime object for current time (timezone-aware), defaults to now
            current_location: tuple (latitude, longitude, address_string), defaults to birth location
        """
        self.birth_datetime = birth_datetime
        self.birth_latitude = birth_location[0]
        self.birth_longitude = birth_location[1]
        self.birth_address = birth_location[2]

        # Current time defaults to now
        if current_datetime is None:
            self.current_datetime = datetime.now(pytz.UTC)
        else:
            self.current_datetime = current_datetime

        # Current location defaults to birth location
        if current_location is None:
            self.current_latitude = self.birth_latitude
            self.current_longitude = self.birth_longitude
            self.current_address = self.birth_address
        else:
            self.current_latitude = current_location[0]
            self.current_longitude = current_location[1]
            self.current_address = current_location[2]

        # Calculate age
        self.age_seconds = (self.current_datetime - self.birth_datetime).total_seconds()
        self.age_years = self.age_seconds / (365.25 * 24 * 3600)

        # Initialize calculator
        self.calculator = CosmicMotionCalculator()

    def calculate_birth_position(self):
        """
        Calculate position and velocity at time of birth.

        Returns:
            dict: Contains velocities and metadata
        """
        birth_time = Time(self.birth_datetime)

        velocities = self.calculator.calculate_total_velocity(
            self.birth_latitude,
            self.birth_longitude,
            birth_time
        )

        return {
            'time': self.birth_datetime,
            'location': {
                'latitude': self.birth_latitude,
                'longitude': self.birth_longitude,
                'address': self.birth_address
            },
            'velocities': velocities,
            'astropy_time': birth_time
        }

    def calculate_current_position(self):
        """
        Calculate position and velocity at current time.

        Returns:
            dict: Contains velocities and metadata
        """
        current_time = Time(self.current_datetime)

        velocities = self.calculator.calculate_total_velocity(
            self.current_latitude,
            self.current_longitude,
            current_time
        )

        return {
            'time': self.current_datetime,
            'location': {
                'latitude': self.current_latitude,
                'longitude': self.current_longitude,
                'address': self.current_address
            },
            'velocities': velocities,
            'astropy_time': current_time
        }

    def calculate_displacement(self):
        """
        Calculate total displacement through space from birth to current time.

        Returns:
            dict: Contains displacement vectors and distances
        """
        birth_data = self.calculate_birth_position()
        current_data = self.calculate_current_position()

        # Use birth velocities for displacement calculation
        # (simplified - assumes constant velocity)
        birth_velocities = birth_data['velocities']

        displacement = self.calculator.calculate_position_change(
            birth_velocities,
            self.age_seconds
        )

        displacement_magnitude_km = np.linalg.norm(displacement)
        displacement_magnitude_au = displacement_magnitude_km / 149597870.7
        displacement_magnitude_ly = displacement_magnitude_km / 9.461e12

        return {
            'displacement_vector_km': displacement,
            'displacement_magnitude_km': displacement_magnitude_km,
            'displacement_magnitude_au': displacement_magnitude_au,
            'displacement_magnitude_ly': displacement_magnitude_ly,
            'time_elapsed_seconds': self.age_seconds,
            'time_elapsed_years': self.age_years,
            'birth_data': birth_data,
            'current_data': current_data
        }

    def generate_report(self):
        """
        Generate a comprehensive report of position and motion through spacetime.

        Returns:
            str: Formatted report
        """
        displacement_data = self.calculate_displacement()
        birth_data = displacement_data['birth_data']
        current_data = displacement_data['current_data']

        report = []
        report.append("=" * 80)
        report.append("COSMIC POSITION REPORT")
        report.append("Where Were You in Space and Time?")
        report.append("=" * 80)
        report.append("")

        # Birth information
        report.append("BIRTH INFORMATION")
        report.append("-" * 80)
        report.append(f"Date/Time: {birth_data['time'].strftime('%Y-%m-%d %H:%M:%S %Z')}")
        report.append(f"Location: {birth_data['location']['address']}")
        report.append(f"Coordinates: {birth_data['location']['latitude']:.4f}°, {birth_data['location']['longitude']:.4f}°")
        report.append("")

        # Current information
        report.append("CURRENT INFORMATION")
        report.append("-" * 80)
        report.append(f"Date/Time: {current_data['time'].strftime('%Y-%m-%d %H:%M:%S %Z')}")
        report.append(f"Location: {current_data['location']['address']}")
        report.append(f"Coordinates: {current_data['location']['latitude']:.4f}°, {current_data['location']['longitude']:.4f}°")
        report.append(f"Age: {self.age_years:.2f} years ({self.age_seconds:,.0f} seconds)")
        report.append("")

        # Velocities at birth
        report.append("VELOCITIES AT BIRTH (km/s)")
        report.append("-" * 80)
        birth_vel = birth_data['velocities']
        report.append(format_velocity_vector("Earth Rotation", birth_vel['earth_rotation']))
        report.append(format_velocity_vector("Earth Orbital Motion", birth_vel['earth_orbit']))
        report.append(format_velocity_vector("Solar System (LSR)", birth_vel['solar_system_lsr']))
        report.append(format_velocity_vector("Galactic Rotation", birth_vel['galactic_rotation']))
        report.append(format_velocity_vector("Galactic Oscillation", birth_vel['galactic_oscillation']))
        report.append(format_velocity_vector("Local Group Motion", birth_vel['local_group']))
        report.append(format_velocity_vector("Virgo Cluster Motion", birth_vel['virgo_motion']))
        report.append(format_velocity_vector("Great Attractor", birth_vel['great_attractor']))
        report.append(format_velocity_vector("CMB Rest Frame", birth_vel['cmb_frame']))
        report.append("")
        report.append(format_velocity_vector("TOTAL VELOCITY", birth_vel['total']))
        report.append("")

        # Velocities at current time
        report.append("VELOCITIES AT CURRENT TIME (km/s)")
        report.append("-" * 80)
        current_vel = current_data['velocities']
        report.append(format_velocity_vector("Earth Rotation", current_vel['earth_rotation']))
        report.append(format_velocity_vector("Earth Orbital Motion", current_vel['earth_orbit']))
        report.append(format_velocity_vector("Solar System (LSR)", current_vel['solar_system_lsr']))
        report.append(format_velocity_vector("Galactic Rotation", current_vel['galactic_rotation']))
        report.append(format_velocity_vector("Galactic Oscillation", current_vel['galactic_oscillation']))
        report.append(format_velocity_vector("Local Group Motion", current_vel['local_group']))
        report.append(format_velocity_vector("Virgo Cluster Motion", current_vel['virgo_motion']))
        report.append(format_velocity_vector("Great Attractor", current_vel['great_attractor']))
        report.append(format_velocity_vector("CMB Rest Frame", current_vel['cmb_frame']))
        report.append("")
        report.append(format_velocity_vector("TOTAL VELOCITY", current_vel['total']))
        report.append("")

        # Displacement
        report.append("DISPLACEMENT THROUGH SPACE (Birth to Current)")
        report.append("-" * 80)
        report.append(format_position_vector(
            "Total Displacement",
            displacement_data['displacement_vector_km']
        ))
        report.append("")
        report.append(f"Distance Traveled: {displacement_data['displacement_magnitude_km']:.3e} km")
        report.append(f"                   {displacement_data['displacement_magnitude_au']:.3e} AU")
        report.append(f"                   {displacement_data['displacement_magnitude_ly']:.6f} light-years")
        report.append("")

        # Speed comparison
        report.append("SPEED COMPARISONS")
        report.append("-" * 80)
        total_speed_kms = birth_vel['total_magnitude']
        total_speed_kmh = total_speed_kms * 3600
        total_speed_c = total_speed_kms / 299792.458  # fraction of speed of light

        report.append(f"Your velocity relative to CMB: {total_speed_kms:.2f} km/s")
        report.append(f"                                {total_speed_kmh:,.0f} km/h")
        report.append(f"                                {total_speed_c:.6f} c (times speed of light)")
        report.append("")

        # Put it in perspective
        report.append("PERSPECTIVE")
        report.append("-" * 80)

        distance_km = displacement_data['displacement_magnitude_km']

        # Earth-Moon distance
        earth_moon_km = 384400
        moon_distances = distance_km / earth_moon_km

        # Earth-Sun distance
        au_km = 149597870.7
        sun_distances = distance_km / au_km

        # Light time
        light_seconds = distance_km / 299792.458
        light_minutes = light_seconds / 60
        light_hours = light_minutes / 60
        light_days = light_hours / 24

        report.append(f"In {self.age_years:.2f} years, you have moved:")
        report.append(f"  • {moon_distances:.2f} times the Earth-Moon distance")
        report.append(f"  • {sun_distances:.4f} times the Earth-Sun distance")
        report.append("")

        if light_days >= 1:
            report.append(f"Light would take {light_days:.2f} days to travel this distance")
        elif light_hours >= 1:
            report.append(f"Light would take {light_hours:.2f} hours to travel this distance")
        elif light_minutes >= 1:
            report.append(f"Light would take {light_minutes:.2f} minutes to travel this distance")
        else:
            report.append(f"Light would take {light_seconds:.2f} seconds to travel this distance")

        report.append("")

        # Spacecraft comparison
        report.append("SPACECRAFT TRAVEL TIME COMPARISON")
        report.append("-" * 80)
        report.append("How long would it take the fastest human spacecraft to travel this distance?")
        report.append("")

        # Top 5 fastest spacecraft (by heliocentric velocity)
        spacecraft = [
            {
                'name': 'Parker Solar Probe',
                'speed_kms': 163.0,
                'speed_kmh': 586800,
                'year': 2021,
                'record': 'Fastest human-made object ever'
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
                'name': 'Juno',
                'speed_kms': 73.61,
                'speed_kmh': 265000,
                'year': 2016,
                'record': 'Fastest Jupiter mission'
            },
            {
                'name': 'New Horizons',
                'speed_kms': 58.54,
                'speed_kmh': 210744,
                'year': 2015,
                'record': 'Fastest Earth departure velocity'
            }
        ]

        # Sort by speed (descending)
        spacecraft.sort(key=lambda x: x['speed_kms'], reverse=True)

        for i, craft in enumerate(spacecraft[:5], 1):
            travel_time_seconds = distance_km / craft['speed_kms']
            travel_time_minutes = travel_time_seconds / 60
            travel_time_hours = travel_time_minutes / 60
            travel_time_days = travel_time_hours / 24
            travel_time_years = travel_time_days / 365.25

            report.append(f"{i}. {craft['name']}")
            report.append(f"   Speed: {craft['speed_kms']:.2f} km/s ({craft['speed_kmh']:,} km/h)")
            report.append(f"   Record: {craft['record']} ({craft['year']})")

            # Format travel time appropriately
            if travel_time_years >= 1:
                report.append(f"   Travel time: {travel_time_years:.2f} years ({travel_time_days:,.0f} days)")
            elif travel_time_days >= 1:
                report.append(f"   Travel time: {travel_time_days:.2f} days ({travel_time_hours:,.1f} hours)")
            elif travel_time_hours >= 1:
                report.append(f"   Travel time: {travel_time_hours:.2f} hours ({travel_time_minutes:,.1f} minutes)")
            else:
                report.append(f"   Travel time: {travel_time_minutes:.2f} minutes ({travel_time_seconds:,.1f} seconds)")

            report.append("")

        report.append("=" * 80)

        return "\n".join(report)


def normalize_timezone(tz_string):
    """
    Normalize common timezone abbreviations to full timezone names.

    Args:
        tz_string: Timezone string (abbreviation or full name)

    Returns:
        str: Normalized timezone name
    """
    # Common US timezone mappings
    tz_mappings = {
        'eastern': 'America/New_York',
        'est': 'America/New_York',
        'edt': 'America/New_York',
        'et': 'America/New_York',
        'central': 'America/Chicago',
        'cst': 'America/Chicago',
        'cdt': 'America/Chicago',
        'ct': 'America/Chicago',
        'mountain': 'America/Denver',
        'mst': 'America/Denver',
        'mdt': 'America/Denver',
        'mt': 'America/Denver',
        'pacific': 'America/Los_Angeles',
        'pst': 'America/Los_Angeles',
        'pdt': 'America/Los_Angeles',
        'pt': 'America/Los_Angeles',
        'alaska': 'America/Anchorage',
        'akst': 'America/Anchorage',
        'akdt': 'America/Anchorage',
        'hawaii': 'Pacific/Honolulu',
        'hst': 'Pacific/Honolulu',
        # Common international
        'gmt': 'GMT',
        'utc': 'UTC',
        'bst': 'Europe/London',
        'cet': 'Europe/Paris',
        'jst': 'Asia/Tokyo',
        'aest': 'Australia/Sydney',
    }

    tz_lower = tz_string.lower().strip()

    if tz_lower in tz_mappings:
        return tz_mappings[tz_lower]

    # Return original if no mapping found
    return tz_string


def parse_datetime_input(date_str, time_str=None, timezone_str='UTC'):
    """
    Parse date and optional time strings into timezone-aware datetime.

    Args:
        date_str: Date string in format YYYY-MM-DD
        time_str: Optional time string in format HH:MM or HH:MM:SS
        timezone_str: Timezone string (e.g., 'UTC', 'America/New_York', or 'Mountain')

    Returns:
        datetime: Timezone-aware datetime object
    """
    try:
        # Parse date
        date_parts = date_str.split('-')
        year = int(date_parts[0])
        month = int(date_parts[1])
        day = int(date_parts[2])

        # Parse time if provided
        if time_str:
            time_parts = time_str.split(':')
            hour = int(time_parts[0])
            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
            second = int(time_parts[2]) if len(time_parts) > 2 else 0
        else:
            hour = 12  # Default to noon
            minute = 0
            second = 0

        # Get timezone (normalize common abbreviations)
        normalized_tz = normalize_timezone(timezone_str)
        tz = pytz.timezone(normalized_tz)

        # Create datetime
        dt = datetime(year, month, day, hour, minute, second)
        dt = tz.localize(dt)

        return dt

    except Exception as e:
        print(f"Error parsing datetime: {e}")
        return None


# Example usage
if __name__ == "__main__":
    print("Testing SpaceTimePosition calculator...")
    print("")

    # Example: Someone born in New York on January 1, 1990
    geocoder = LocationGeocoder()

    # Birth location
    birth_lat, birth_lon, birth_addr = geocoder.geocode_location("New York, NY, USA")
    if birth_lat is None:
        print("Failed to geocode birth location")
        exit(1)

    print(f"Birth location: {birth_addr}")
    print(f"Coordinates: {birth_lat:.4f}°, {birth_lon:.4f}°")
    print("")

    # Create birth datetime
    birth_dt = parse_datetime_input("1990-01-01", "08:30:00", "America/New_York")
    print(f"Birth time: {birth_dt}")
    print("")

    # Current location
    current_lat, current_lon, current_addr = geocoder.geocode_location("Los Angeles, CA, USA")
    print(f"Current location: {current_addr}")
    print(f"Coordinates: {current_lat:.4f}°, {current_lon:.4f}°")
    print("")

    # Create position calculator
    position = SpaceTimePosition(
        birth_dt,
        (birth_lat, birth_lon, birth_addr),
        current_location=(current_lat, current_lon, current_addr)
    )

    # Generate report
    report = position.generate_report()
    print(report)
