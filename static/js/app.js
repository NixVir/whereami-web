/**
 * Main application logic for Cosmic Position Calculator
 */

// API base URL - change for production
const API_BASE = window.location.origin;

// Global state
let visualization = null;
let currentData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after a moment
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);

    // Initialize 3D visualization
    visualization = new CosmicVisualization('visualization-container');

    // Set up event listeners
    setupEventListeners();

    // Check for same location checkbox
    updateLocationFieldState();
}

function setupEventListeners() {
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', handleCalculate);

    // Back button
    document.getElementById('back-btn').addEventListener('click', showInputPanel);

    // Same location checkbox
    document.getElementById('same-location').addEventListener('change', updateLocationFieldState);

    // Animation controls
    document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
    document.getElementById('restart-btn').addEventListener('click', restartAnimation);
    document.getElementById('speed-slider').addEventListener('input', updateSpeed);

    // Show details button
    document.getElementById('show-details-btn').addEventListener('click', toggleDetails);

    // Info button and modal
    document.getElementById('info-btn').addEventListener('click', () => {
        document.getElementById('info-modal').style.display = 'flex';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('info-modal').style.display = 'none';
    });

    // Close modal on background click
    document.getElementById('info-modal').addEventListener('click', (e) => {
        if (e.target.id === 'info-modal') {
            document.getElementById('info-modal').style.display = 'none';
        }
    });
}

function updateLocationFieldState() {
    const sameLocation = document.getElementById('same-location').checked;
    const currentLocationField = document.getElementById('current-location');

    if (sameLocation) {
        currentLocationField.disabled = true;
        currentLocationField.value = '';
        currentLocationField.placeholder = 'Same as birth location';
    } else {
        currentLocationField.disabled = false;
        currentLocationField.placeholder = 'Boulder, CO, USA';
    }
}

async function handleCalculate() {
    console.log('Calculate button clicked');
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';

    try {
        // Get form values first for validation
        const birthDate = document.getElementById('birth-date').value;
        const birthTime = document.getElementById('birth-time').value || '12:00';
        const birthTimezone = document.getElementById('birth-timezone').value;
        const birthLocation = document.getElementById('birth-location').value;
        const sameLocation = document.getElementById('same-location').checked;
        const currentLocation = sameLocation ? birthLocation : document.getElementById('current-location').value;

        // Validate inputs before showing loading screen
        if (!birthDate) {
            throw new Error('Please enter your birth date');
        }
        if (!birthLocation) {
            throw new Error('Please enter your birth location');
        }
        if (!sameLocation && !currentLocation) {
            throw new Error('Please enter your current location or check "Current location same as birth"');
        }

        // Show loading only after validation passes
        console.log('Showing loading screen');
        showLoading('Geocoding locations...');

        // Geocode birth location
        updateLoadingStatus('Geocoding birth location...');
        const birthGeocode = await geocodeLocation(birthLocation);

        // Geocode current location (if different)
        let currentGeocode;
        if (sameLocation) {
            currentGeocode = birthGeocode;
        } else {
            updateLoadingStatus('Geocoding current location...');
            currentGeocode = await geocodeLocation(currentLocation);
        }

        // Calculate cosmic position
        updateLoadingStatus('Calculating your cosmic journey...');
        const calculationData = {
            birth_date: birthDate,
            birth_time: birthTime + ':00',
            birth_timezone: birthTimezone,
            birth_latitude: birthGeocode.latitude,
            birth_longitude: birthGeocode.longitude,
            birth_address: birthGeocode.address,
            current_date: null,
            current_time: null,
            current_timezone: null,
            current_latitude: currentGeocode.latitude,
            current_longitude: currentGeocode.longitude,
            current_address: currentGeocode.address
        };

        const result = await calculatePosition(calculationData);

        // Store data and show results
        console.log('Storing result and preparing to show');
        currentData = result;
        updateLoadingStatus('Preparing visualization...');

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Hiding loading and showing results');
        hideLoading();
        showResults(result);

    } catch (error) {
        console.error('Error in handleCalculate:', error);
        console.error('Error stack:', error.stack);
        hideLoading();
        showError(error.message || 'An unexpected error occurred. Check console for details.');
    }
}

async function geocodeLocation(location) {
    console.log('Geocoding:', location);
    console.log('API URL:', `${API_BASE}/api/geocode`);

    try {
        const response = await fetch(`${API_BASE}/api/geocode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const text = await response.text();
            console.error('Response error body:', text);
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        console.log('Geocode result:', data);

        if (!data.success) {
            throw new Error(data.error || 'Geocoding failed');
        }

        return data;
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

async function calculatePosition(data) {
    console.log('Calculating position with data:', data);
    console.log('API URL:', `${API_BASE}/api/calculate`);

    try {
        const response = await fetch(`${API_BASE}/api/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Calculate response status:', response.status);
        console.log('Calculate response ok:', response.ok);

        if (!response.ok) {
            const text = await response.text();
            console.error('Calculate response error body:', text);
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const result = await response.json();
        console.log('Calculate result:', result);

        if (!result.success) {
            throw new Error(result.error || 'Calculation failed');
        }

        return result;
    } catch (error) {
        console.error('Calculate error:', error);
        throw error;
    }
}

function showResults(data) {
    console.log('showResults called with data:', data);

    try {
        // Hide input panel, show results panel
        console.log('Hiding input panel, showing results panel');
        document.getElementById('input-panel').style.display = 'none';
        document.getElementById('results-panel').style.display = 'block';

        // Update summary
        console.log('Updating summary');
        const years = data.displacement.time_elapsed_years.toFixed(2);
        document.getElementById('journey-summary').textContent =
            `From ${data.birth.location.address} to ${data.current.location.address} over ${years} years`;

        // Update stats
        console.log('Updating stats');
        document.getElementById('distance-traveled').textContent =
            formatLargeNumber(data.displacement.magnitude_km);

        document.getElementById('time-elapsed').textContent =
            years;

        document.getElementById('current-velocity').textContent =
            data.current.velocities.total.magnitude.toFixed(2);

        document.getElementById('light-years').textContent =
            data.displacement.magnitude_ly.toFixed(6);

        // Update cosmic separation
        console.log('Updating cosmic separation');
        if (data.cosmic_separation) {
            const sepKm = data.cosmic_separation.distance_km;
            const sepLy = data.cosmic_separation.distance_ly;
            document.getElementById('separation-distance').textContent =
                `${formatLargeNumber(sepKm)} km (${sepLy.toFixed(6)} light-years)`;
        }

        // Update spacecraft comparisons
        console.log('Updating spacecraft comparisons');
        displaySpacecraftComparisons(data.spacecraft_comparisons);

        // Update technical details
        console.log('Updating velocity breakdown');
        displayVelocityBreakdown(data.current.velocities);

        // Load into visualization
        console.log('Loading visualization data');
        visualization.loadJourneyData(data);

        console.log('showResults completed successfully');
    } catch (error) {
        console.error('Error in showResults:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

function displaySpacecraftComparisons(spacecraft) {
    const container = document.getElementById('spacecraft-list');
    container.innerHTML = '';

    spacecraft.slice(0, 5).forEach((craft, index) => {
        const div = document.createElement('div');
        div.className = 'spacecraft-item';

        const name = document.createElement('div');
        name.className = 'spacecraft-name';
        name.textContent = `${index + 1}. ${craft.name}`;

        const speed = document.createElement('div');
        speed.className = 'spacecraft-details';
        speed.textContent = `Speed: ${craft.speed_kms.toFixed(2)} km/s (${formatLargeNumber(craft.speed_kmh)} km/h)`;

        const record = document.createElement('div');
        record.className = 'spacecraft-details';
        record.textContent = craft.record;

        const time = document.createElement('div');
        time.className = 'spacecraft-details';
        if (craft.travel_time_years >= 1) {
            time.textContent = `Travel time: ${craft.travel_time_years.toFixed(2)} years`;
        } else {
            time.textContent = `Travel time: ${craft.travel_time_days.toFixed(1)} days`;
        }

        div.appendChild(name);
        div.appendChild(speed);
        div.appendChild(record);
        div.appendChild(time);

        container.appendChild(div);
    });
}

function displayVelocityBreakdown(velocities) {
    const container = document.getElementById('velocity-breakdown');
    container.innerHTML = '';

    const velocityNames = {
        'earth_rotation': 'Earth Rotation',
        'earth_orbit': 'Earth Orbital Motion',
        'solar_system_lsr': 'Solar System (LSR)',
        'galactic_rotation': 'Galactic Rotation',
        'galactic_oscillation': 'Galactic Oscillation',
        'local_group': 'Local Group Motion',
        'virgo_motion': 'Virgo Cluster Motion',
        'great_attractor': 'Great Attractor',
        'cmb_frame': 'CMB Rest Frame',
        'total': 'TOTAL VELOCITY'
    };

    for (const [key, name] of Object.entries(velocityNames)) {
        if (velocities[key]) {
            const div = document.createElement('div');
            div.className = 'velocity-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'velocity-name';
            nameSpan.textContent = name;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'velocity-value';
            valueSpan.textContent = `${velocities[key].magnitude.toFixed(2)} km/s`;

            div.appendChild(nameSpan);
            div.appendChild(valueSpan);
            container.appendChild(div);
        }
    }
}

function togglePlayPause() {
    const btn = document.getElementById('play-pause-btn');
    const icon = document.getElementById('play-pause-icon');

    if (visualization.isPlaying) {
        visualization.pauseJourney();
        icon.textContent = '▶';
        btn.innerHTML = '<span id="play-pause-icon">▶</span> Play Journey';
    } else {
        visualization.playJourney();
        icon.textContent = '⏸';
        btn.innerHTML = '<span id="play-pause-icon">⏸</span> Pause Journey';
    }
}

function restartAnimation() {
    visualization.restartJourney();
    const btn = document.getElementById('play-pause-btn');
    const icon = document.getElementById('play-pause-icon');
    icon.textContent = '⏸';
    btn.innerHTML = '<span id="play-pause-icon">⏸</span> Pause Journey';
}

function updateSpeed() {
    const speed = parseFloat(document.getElementById('speed-slider').value);
    document.getElementById('speed-value').textContent = speed + 'x';
    visualization.setAnimationSpeed(speed);
}

function toggleDetails() {
    const details = document.getElementById('technical-details');
    const btn = document.getElementById('show-details-btn');

    if (details.style.display === 'none' || !details.style.display) {
        details.style.display = 'block';
        btn.textContent = 'Hide Technical Details';
    } else {
        details.style.display = 'none';
        btn.textContent = 'Show Technical Details';
    }
}

function showInputPanel() {
    document.getElementById('results-panel').style.display = 'none';
    document.getElementById('input-panel').style.display = 'block';
}

function showLoading(message) {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    updateLoadingStatus(message);
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

function updateLoadingStatus(message) {
    document.getElementById('loading-status').textContent = message;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function formatLargeNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}
