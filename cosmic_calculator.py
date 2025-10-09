"""
Cosmic Position Calculator
Calculates a person's position and velocity through space-time relative to various reference frames,
including the Cosmic Microwave Background (CMB).
"""

import numpy as np
from astropy import units as u
from astropy.coordinates import (
    EarthLocation, AltAz, GCRS, ICRS,
    SkyCoord, get_sun, get_body
)
from astropy.time import Time
from datetime import datetime
import pytz


class CosmicMotionCalculator:
    """
    Calculates velocities and positions through various cosmic reference frames.
    All velocities are stored in km/s for consistency.
    """

    # Physical constants and velocities (km/s unless noted)
    EARTH_ROTATION_EQUATOR = 0.465  # km/s at equator
    EARTH_ORBITAL_VELOCITY = 29.78  # km/s around Sun
    SOLAR_SYSTEM_LSR = 20.0  # Peculiar motion relative to Local Standard of Rest
    SUN_GALACTIC_ORBIT = 230.0  # km/s around Milky Way center
    GALACTIC_PLANE_OSCILLATION = 7.0  # km/s perpendicular to galactic plane

    # Milky Way motion in Local Group
    MW_LOCAL_GROUP = 100.0  # km/s approximate

    # Local Group toward Virgo Cluster
    LOCAL_GROUP_VIRGO = 600.0  # km/s

    # Motion toward Great Attractor
    GREAT_ATTRACTOR = 600.0  # km/s

    # Our velocity relative to CMB rest frame
    CMB_DIPOLE_VELOCITY = 369.0  # km/s
    CMB_DIPOLE_RA = 167.99  # degrees (right ascension)
    CMB_DIPOLE_DEC = -6.98  # degrees (declination)

    # Galactic coordinates
    GALACTIC_CENTER_DISTANCE = 8178.0  # parsecs (~26,700 light-years)

    def __init__(self):
        """Initialize the calculator with CMB dipole direction."""
        # CMB dipole direction in ICRS coordinates
        self.cmb_direction = SkyCoord(
            ra=self.CMB_DIPOLE_RA * u.degree,
            dec=self.CMB_DIPOLE_DEC * u.degree,
            frame='icrs'
        )

    def earth_rotation_velocity(self, latitude, longitude, time):
        """
        Calculate velocity due to Earth's rotation at a given location and time.

        Args:
            latitude: Geographic latitude in degrees
            longitude: Geographic longitude in degrees
            time: astropy Time object

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Velocity magnitude at this latitude
        v_mag = self.EARTH_ROTATION_EQUATOR * np.cos(np.radians(latitude))

        # Direction is eastward (perpendicular to radius, in equatorial plane component)
        # Simplified: eastward velocity in Earth-centered frame
        v_east = v_mag

        # Convert to 3D velocity vector (simplified)
        # In practice, this needs proper coordinate transformation
        velocity = np.array([
            -v_east * np.sin(np.radians(longitude)),
            v_east * np.cos(np.radians(longitude)),
            0.0
        ])

        return velocity

    def earth_orbital_velocity(self, time):
        """
        Calculate Earth's orbital velocity around the Sun at given time.

        Args:
            time: astropy Time object

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Earth's orbital velocity is approximately constant
        # Direction varies with position in orbit
        # This is a simplified calculation - actual orbit is elliptical

        # Get Earth's position relative to Sun
        # For simplicity, use average orbital velocity
        # Direction perpendicular to Sun-Earth line

        return np.array([0, self.EARTH_ORBITAL_VELOCITY, 0])

    def solar_system_velocity(self):
        """
        Calculate Sun's motion through the Local Standard of Rest.

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Solar apex: direction Sun is moving toward
        # RA: 18h, Dec: +30° in equatorial coordinates
        # Velocity: ~20 km/s

        apex_ra = 270.0  # degrees (18 hours)
        apex_dec = 30.0  # degrees

        velocity = self.SOLAR_SYSTEM_LSR * np.array([
            np.cos(np.radians(apex_dec)) * np.cos(np.radians(apex_ra)),
            np.cos(np.radians(apex_dec)) * np.sin(np.radians(apex_ra)),
            np.sin(np.radians(apex_dec))
        ])

        return velocity

    def galactic_rotation_velocity(self):
        """
        Calculate Sun's orbital velocity around Milky Way center.

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Sun orbits galactic center at ~230 km/s
        # Direction: roughly toward galactic coordinates l=90°, b=0°

        return np.array([0, self.SUN_GALACTIC_ORBIT, 0])

    def galactic_plane_oscillation_velocity(self, time):
        """
        Calculate velocity due to Sun's oscillation above/below galactic plane.

        Args:
            time: astropy Time object

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Simplified: assume constant average velocity
        # Actual velocity varies with position in oscillation cycle

        return np.array([0, 0, self.GALACTIC_PLANE_OSCILLATION])

    def local_group_velocity(self):
        """
        Calculate Milky Way's motion within Local Group.

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Motion toward M31 (Andromeda)
        # M31 coordinates: RA: 00h 42m, Dec: +41° 16'

        m31_ra = 10.5  # degrees
        m31_dec = 41.27  # degrees

        velocity = self.MW_LOCAL_GROUP * np.array([
            np.cos(np.radians(m31_dec)) * np.cos(np.radians(m31_ra)),
            np.cos(np.radians(m31_dec)) * np.sin(np.radians(m31_ra)),
            np.sin(np.radians(m31_dec))
        ])

        return velocity

    def virgo_cluster_velocity(self):
        """
        Calculate Local Group's motion toward Virgo Cluster.

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Virgo Cluster coordinates: RA: 12h 27m, Dec: +12° 43'

        virgo_ra = 186.75  # degrees
        virgo_dec = 12.72  # degrees

        velocity = self.LOCAL_GROUP_VIRGO * np.array([
            np.cos(np.radians(virgo_dec)) * np.cos(np.radians(virgo_ra)),
            np.cos(np.radians(virgo_dec)) * np.sin(np.radians(virgo_ra)),
            np.sin(np.radians(virgo_dec))
        ])

        return velocity

    def great_attractor_velocity(self):
        """
        Calculate motion toward Great Attractor.

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # Great Attractor: galactic coordinates l=320°, b=0°
        # Convert to equatorial (approximate)

        ga_ra = 220.0  # degrees (approximate)
        ga_dec = -45.0  # degrees (approximate)

        velocity = self.GREAT_ATTRACTOR * np.array([
            np.cos(np.radians(ga_dec)) * np.cos(np.radians(ga_ra)),
            np.cos(np.radians(ga_dec)) * np.sin(np.radians(ga_ra)),
            np.sin(np.radians(ga_dec))
        ])

        return velocity

    def cmb_rest_frame_velocity(self):
        """
        Calculate our total velocity relative to CMB rest frame.

        Returns:
            velocity vector in km/s (3D numpy array)
        """
        # CMB dipole velocity and direction
        ra_rad = np.radians(self.CMB_DIPOLE_RA)
        dec_rad = np.radians(self.CMB_DIPOLE_DEC)

        velocity = self.CMB_DIPOLE_VELOCITY * np.array([
            np.cos(dec_rad) * np.cos(ra_rad),
            np.cos(dec_rad) * np.sin(ra_rad),
            np.sin(dec_rad)
        ])

        return velocity

    def calculate_total_velocity(self, latitude, longitude, time):
        """
        Calculate total velocity through all reference frames.

        Args:
            latitude: Geographic latitude in degrees
            longitude: Geographic longitude in degrees
            time: astropy Time object

        Returns:
            dictionary with individual and total velocity components
        """
        velocities = {
            'earth_rotation': self.earth_rotation_velocity(latitude, longitude, time),
            'earth_orbit': self.earth_orbital_velocity(time),
            'solar_system_lsr': self.solar_system_velocity(),
            'galactic_rotation': self.galactic_rotation_velocity(),
            'galactic_oscillation': self.galactic_plane_oscillation_velocity(time),
            'local_group': self.local_group_velocity(),
            'virgo_motion': self.virgo_cluster_velocity(),
            'great_attractor': self.great_attractor_velocity(),
            'cmb_frame': self.cmb_rest_frame_velocity()
        }

        # Calculate total velocity (vector sum)
        total = np.zeros(3)
        for v in velocities.values():
            total += v

        velocities['total'] = total
        velocities['total_magnitude'] = np.linalg.norm(total)

        return velocities

    def calculate_position_change(self, velocities, time_delta_seconds):
        """
        Calculate position change given velocities and time interval.

        Args:
            velocities: dictionary from calculate_total_velocity
            time_delta_seconds: time interval in seconds

        Returns:
            position change in kilometers (3D numpy array)
        """
        # Position = velocity * time
        total_velocity = velocities['total']  # km/s
        position_change = total_velocity * time_delta_seconds

        return position_change


class MotionForcesCatalog:
    """
    Comprehensive catalog of forces and motions acting on a person.
    """

    @staticmethod
    def get_all_forces():
        """
        Returns comprehensive list of all forces and motions.

        Returns:
            dict: Categorized forces and motions with descriptions
        """
        return {
            "actual_forces": {
                "description": "Real forces acting on your body",
                "forces": [
                    {
                        "name": "Gravity (Earth)",
                        "magnitude": "~9.81 m/s² downward",
                        "description": "Earth's gravitational pull on your mass"
                    },
                    {
                        "name": "Normal Force",
                        "magnitude": "Equals weight when stationary",
                        "description": "Ground/floor pushing up against gravity"
                    },
                    {
                        "name": "Friction",
                        "magnitude": "Varies with motion and surface",
                        "description": "Resistance when moving across surfaces"
                    },
                    {
                        "name": "Air Resistance (Drag)",
                        "magnitude": "~0.5-1.5 N when walking",
                        "description": "Atmospheric drag opposing motion"
                    },
                    {
                        "name": "Tidal Forces (Moon/Sun)",
                        "magnitude": "~10⁻⁷ N (negligible)",
                        "description": "Differential gravitational pull across body"
                    },
                    {
                        "name": "Electromagnetic Forces",
                        "magnitude": "Varies widely",
                        "description": "From charged objects, electric/magnetic fields"
                    },
                    {
                        "name": "Solar Radiation Pressure",
                        "magnitude": "~10⁻⁸ N",
                        "description": "Photons from sunlight hitting your body"
                    },
                    {
                        "name": "Solar Wind Pressure",
                        "magnitude": "~10⁻¹¹ N (negligible)",
                        "description": "Charged particles from the Sun"
                    },
                    {
                        "name": "Coriolis Force",
                        "magnitude": "~10⁻³ N when walking",
                        "description": "Apparent force due to Earth's rotation (in rotating frame)"
                    },
                    {
                        "name": "Centrifugal Force",
                        "magnitude": "~0.034 m/s² at equator",
                        "description": "Apparent outward force from Earth's rotation"
                    }
                ]
            },
            "terrestrial_motions": {
                "description": "Earth-based motions",
                "motions": [
                    {
                        "name": "Earth's Rotation",
                        "velocity": "465 m/s (1,674 km/h) at equator",
                        "period": "23h 56m 4s (sidereal day)",
                        "description": "Rotation about Earth's axis"
                    },
                    {
                        "name": "Earth's Orbital Motion",
                        "velocity": "29.78 km/s (107,208 km/h)",
                        "period": "365.256 days (sidereal year)",
                        "description": "Revolution around the Sun"
                    },
                    {
                        "name": "Axial Precession",
                        "velocity": "~0.005 arcsec/year",
                        "period": "25,772 years",
                        "description": "Wobbling of Earth's rotational axis"
                    },
                    {
                        "name": "Nutation",
                        "velocity": "Variable, ~9 arcseconds amplitude",
                        "period": "18.6 years (main component)",
                        "description": "Small oscillations in precession"
                    },
                    {
                        "name": "Polar Motion",
                        "velocity": "~0.03 arcsec/day",
                        "period": "~14 months (Chandler wobble)",
                        "description": "Movement of Earth's rotational poles"
                    },
                    {
                        "name": "Earth's Orbital Precession",
                        "velocity": "11.6 arcsec/year",
                        "period": "~112,000 years",
                        "description": "Rotation of Earth's orbital ellipse"
                    }
                ]
            },
            "solar_system_motions": {
                "description": "Solar System motions through the galaxy",
                "motions": [
                    {
                        "name": "Solar System LSR Motion",
                        "velocity": "~20 km/s",
                        "period": "N/A",
                        "description": "Sun's peculiar motion relative to Local Standard of Rest"
                    },
                    {
                        "name": "Sun's Galactic Orbit",
                        "velocity": "~230 km/s (828,000 km/h)",
                        "period": "~225-250 million years (galactic year)",
                        "description": "Sun orbiting the Milky Way center"
                    },
                    {
                        "name": "Galactic Plane Oscillation",
                        "velocity": "~7 km/s",
                        "period": "~70 million years (full cycle)",
                        "description": "Sun's motion above/below galactic plane"
                    },
                    {
                        "name": "Radial Migration",
                        "velocity": "~few km/s over gigayears",
                        "period": "Billions of years",
                        "description": "Slow movement toward/away from galactic center"
                    }
                ]
            },
            "galactic_motions": {
                "description": "Milky Way's motion through space",
                "motions": [
                    {
                        "name": "Milky Way in Local Group",
                        "velocity": "~100-140 km/s toward M31",
                        "period": "~4 billion years (MW-M31 collision)",
                        "description": "Motion within our galaxy group"
                    },
                    {
                        "name": "Local Group toward Virgo",
                        "velocity": "~600 km/s",
                        "period": "N/A",
                        "description": "Local Group falling toward Virgo Cluster"
                    },
                    {
                        "name": "Virgo Supercluster Motion",
                        "velocity": "Complex, ~300 km/s",
                        "period": "N/A",
                        "description": "Virgo Supercluster's internal dynamics"
                    },
                    {
                        "name": "Motion toward Great Attractor",
                        "velocity": "~600 km/s",
                        "period": "N/A",
                        "description": "Large-scale flow toward gravitational anomaly"
                    },
                    {
                        "name": "Motion toward Shapley Supercluster",
                        "velocity": "Contributing to overall flow",
                        "period": "N/A",
                        "description": "Beyond Great Attractor, even larger concentration"
                    }
                ]
            },
            "cosmic_scale_motions": {
                "description": "Large-scale cosmological motions",
                "motions": [
                    {
                        "name": "CMB Dipole Motion",
                        "velocity": "369 km/s (1,328,400 km/h)",
                        "period": "N/A",
                        "description": "Our velocity relative to CMB rest frame"
                    },
                    {
                        "name": "Hubble Flow",
                        "velocity": "~70 km/s per megaparsec",
                        "period": "N/A",
                        "description": "Expansion of space itself"
                    },
                    {
                        "name": "Peculiar Velocity",
                        "velocity": "~600 km/s",
                        "period": "N/A",
                        "description": "Our deviation from pure Hubble flow"
                    }
                ]
            },
            "exotic_effects": {
                "description": "Exotic and quantum effects (mostly negligible)",
                "effects": [
                    {
                        "name": "Gravitational Waves",
                        "magnitude": "Strain ~10⁻²¹ during detection events",
                        "description": "Ripples in spacetime passing through"
                    },
                    {
                        "name": "Dark Energy Effects",
                        "magnitude": "~10⁻⁹ m/s² (accelerating expansion)",
                        "description": "Acceleration of cosmic expansion"
                    },
                    {
                        "name": "Quantum Vacuum Fluctuations",
                        "magnitude": "Planck scale (~10⁻³⁵ m)",
                        "description": "Virtual particles in quantum vacuum"
                    },
                    {
                        "name": "Casimir Force",
                        "magnitude": "~10⁻⁷ N at nanometer scales",
                        "description": "Quantum vacuum pressure between close surfaces"
                    },
                    {
                        "name": "Unruh Effect",
                        "magnitude": "~10⁻²⁰ K at 1 m/s² acceleration",
                        "description": "Apparent temperature due to acceleration"
                    },
                    {
                        "name": "Frame Dragging",
                        "magnitude": "~10⁻⁹ arcsec/year near Earth",
                        "description": "Spacetime dragging due to Earth's rotation"
                    },
                    {
                        "name": "Cosmic Neutrino Background",
                        "magnitude": "~10⁻³³ N (extremely negligible)",
                        "description": "Relic neutrinos from Big Bang"
                    }
                ]
            }
        }

    @staticmethod
    def print_forces_catalog():
        """Print formatted catalog of all forces and motions."""
        catalog = MotionForcesCatalog.get_all_forces()

        print("\n" + "="*80)
        print("COMPREHENSIVE CATALOG OF FORCES AND MOTIONS")
        print("="*80 + "\n")

        for category, data in catalog.items():
            print(f"\n{category.upper().replace('_', ' ')}")
            print("-" * 80)
            print(f"Description: {data['description']}\n")

            items = data.get('forces') or data.get('motions') or data.get('effects')

            for item in items:
                print(f"• {item['name']}")
                if 'velocity' in item:
                    print(f"  Velocity: {item['velocity']}")
                if 'magnitude' in item:
                    print(f"  Magnitude: {item['magnitude']}")
                if 'period' in item:
                    print(f"  Period: {item['period']}")
                print(f"  {item['description']}\n")


def format_velocity_vector(name, velocity_vector, units="km/s"):
    """Format a velocity vector for display."""
    mag = np.linalg.norm(velocity_vector)
    return f"{name:30s}: [{velocity_vector[0]:10.3f}, {velocity_vector[1]:10.3f}, {velocity_vector[2]:10.3f}] {units} (magnitude: {mag:.3f} {units})"


def format_position_vector(name, position_vector, units="km"):
    """Format a position vector for display."""
    mag = np.linalg.norm(position_vector)

    # Convert to various units for readability
    mag_km = mag
    mag_au = mag / 149597870.7  # km to AU
    mag_ly = mag / 9.461e12  # km to light-years

    result = f"{name:30s}: [{position_vector[0]:.3e}, {position_vector[1]:.3e}, {position_vector[2]:.3e}] {units}\n"
    result += f"{'':30s}  Magnitude: {mag_km:.3e} km"

    if mag_au > 0.01:
        result += f" ({mag_au:.3f} AU)"
    if mag_ly > 0.01:
        result += f" ({mag_ly:.3f} light-years)"

    return result
