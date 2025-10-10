# Where Am I? - Cosmic Position Calculator

## Project Overview

A web application that calculates and visualizes how far a person has traveled through space since their birth (or any historical/future date), relative to the Cosmic Microwave Background (CMB) radiation frame of reference.

**Live Site:** https://whereami-web.vercel.app/
**Repository:** https://github.com/NixVir/whereami-web

## Technology Stack

### Backend
- **Python 3.x** with Flask web framework
- **Astropy** - Astronomical calculations
- **Geopy** - Geocoding and location services
- **Vercel** - Serverless deployment platform

### Frontend
- **Three.js (r160)** - 3D WebGL visualization
- **Vanilla JavaScript** - No frameworks, pure JS
- **CSS3** - Responsive design with backdrop filters
- **HTML5** - Semantic markup

## Core Features

### 1. Journey Calculation
- **Input:** Birth date (or any date in history/future)
- **Output:**
  - Distance traveled in kilometers and light-years
  - Time elapsed
  - Current cosmic velocity (~369 km/s relative to CMB)
  - Cosmic separation between birth and current positions

### 2. 3D Visualization
- **Three.js Scene Components:**
  - Birth marker (dark red, positioned left)
  - Now marker (dark blue, positioned right)
  - Journey path connecting the two points
  - Animated camera fly-through along the journey
  - Multiple particle systems (7,100 stars across 4 scale levels)
  - Realistic starfield (2,500 sprite-based stars with 5 color types)
  - 8 nebulae with particle systems
  - Labeled celestial objects (Sirius, Betelgeuse, Polaris, Vega, Andromeda, Great Attractor, Orion Nebula, Pleiades)

### 3. Interactive Controls
- **Camera Controls:**
  - Left drag: Rotate view
  - Right drag: Pan
  - Scroll: Zoom in/out
  - Reset Camera button
- **Animation Controls:**
  - Play/Pause journey animation
  - Restart animation
  - Speed slider (0.5x to 5x)
  - **Timeline slider** (NEW) - Scrub through journey manually (0-100%)

### 4. Celestial Object Color Coding
- **Red gradient:** Objects moving farther away (redshift)
- **Blue gradient:** Objects moving closer (blueshift)
- **Logarithmic scaling** applied for visual perception
- Colors update based on time elapsed
- Labels show percentage distance change and movement direction

### 5. Preset Events
**Historical:**
- Pearl Harbor Attack (Dec 7, 1941)
- Battle of Hastings (Oct 14, 1066)
- Declaration of Independence (July 4, 1776)
- Great Pyramid Built (~2560 BCE)

**Future:**
- Next Total Solar Eclipse in North America (Aug 23, 2044)
- Year 2100
- Year 3000
- Year 9999 (maximum supported)

### 6. Mobile-Friendly Design
- Responsive layouts for all screen sizes
- Year/Month/Day dropdown selectors (better than date picker on mobile)
- Stacked UI elements on small screens
- Touch-friendly button sizes

## Project Structure

```
web/
├── app.py                      # Flask application entry point
├── cosmic_calculator.py        # Core astronomical calculations
├── geocoding.py               # Location geocoding utilities
├── spacetime_position.py      # Space-time position calculations
├── requirements.txt           # Python dependencies
├── vercel.json               # Vercel deployment configuration
├── runtime.txt               # Python version specification
├── static/
│   ├── css/
│   │   └── style.css         # All application styling
│   └── js/
│       ├── app.js            # Main application logic
│       ├── visualization.js  # Three.js 3D visualization
│       └── orbit-controls.js # Custom camera controls
└── templates/
    └── index.html            # Single-page application template
```

## Key Code Architecture

### Backend (app.py)
```python
# Main routes:
@app.route('/')              # Serve index page
@app.route('/api/geocode')   # Geocode locations
@app.route('/api/calculate') # Calculate cosmic journey
```

### Frontend Flow
1. **User selects date** → Year/Month/Day dropdowns populate hidden date field
2. **Click Calculate** → Geocode location → POST to /api/calculate
3. **Receive journey data** → Load into Three.js visualization
4. **Display results** → Stats, animation controls, timeline slider
5. **User interacts** → Scrub timeline, play animation, explore 3D space

### Visualization System (visualization.js)

**Key Methods:**
- `loadJourneyData(data)` - Initialize journey with backend data
- `createJourneyPath(start, end, distance)` - Generate curved path
- `playJourney()` - Animate camera along path (Birth → Now)
- `updateCelestialObjectColors(years)` - Apply red/blue shifts
- `setJourneyProgress(progress)` - Manual timeline control (0-1)
- `resetCamera()` - Return to default view

**Camera Positioning:**
- Birth point: `x = -distanceScale * 0.5` (left)
- Now point: `x = distanceScale * 0.5` (right)
- Camera distance: `1.5× distance between points` (minimum 100 units)
- Target: Midpoint between Birth and Now

### Celestial Color Algorithm

```javascript
// 1. Calculate distance change for each object
distanceChange = distanceNow - distanceAtBirth

// 2. Normalize relative to maximum change
normalizedChange = distanceChange / maxAbsChange

// 3. Apply logarithmic scaling
logScale = sign(normalizedChange) * log10(1 + |normalizedChange| * 9)

// 4. Map to color
if (distanceChange > 0) {
    // Moving away - red gradient
    rgb(100-255, 50-0, 50-0)
} else {
    // Moving closer - blue gradient
    rgb(50-0, 50-0, 100-255)
}
```

## Recent Major Changes (Latest Session)

### Timeline Slider Feature
- Added range input (0-100%) below animation controls
- Real-time percentage display
- Auto-pause when scrubbing
- Bi-directional sync with playback

### Improved Date Selection
- Replaced HTML5 date input with Year/Month/Day dropdowns
- Years from 1900 to 2125 (scrollable, easy to select distant years)
- Better mobile UX (no calendar popup)
- Works seamlessly with preset buttons

### UI/UX Refinements
- Changed header: "During Your Lifespan" → "Distance Traveled Since Birth"
- Journey summary: Removed location text, shows only age
- Moved Play button directly below header (more prominent)
- Made camera controls persistent (no auto-hide)
- Added Reset Camera button

### Frame of Reference Indicator
- Top-right corner display
- "Frame of Reference: Cosmic Microwave Background (CMB)"
- Subtitle: "All distances measured relative to the CMB rest frame"
- Always visible, high z-index (1001)

### Journey Orientation
- Birth point always on left
- Now point always on right
- Animation flows Birth → Now (left to right)
- Both markers guaranteed visible in initial view

## Performance Optimizations

### Particle Reduction (62.6% decrease)
- Earth-scale: 1000 → 600
- Solar-scale: 3000 → 1500
- Galactic: 5000 → 2000
- Cosmic: 10,000 → 3,000
- **Total: 19,000 → 7,100 particles**

### Texture Caching (99.8% reduction)
- Before: 2,500+ unique canvas textures
- After: 5 cached textures (one per star type)
- All stars of same type share single texture

### Code Cleanup
- Removed redundant starfield.js (duplicate canvas animation)
- Removed debug console.log statements from production
- Cleaned up unused CSS

## Known Limitations

1. **Date Range:** Backend supports 1900-9999 only (Python datetime limitations)
2. **Location:** Currently defaulted to "New York, NY, USA" (geocoding not exposed in UI)
3. **Time Zone:** Hardcoded to UTC
4. **Browser Support:** Requires WebGL support (modern browsers only)
5. **Three.js Version:** Using r160 with deprecated script includes (should migrate to ES modules)

## Configuration & Deployment

### Local Development
```bash
cd web
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
# Visit http://localhost:5000
```

### Vercel Deployment
- Automatic deployment on git push to main
- Serverless functions for API routes
- Static file serving from /static
- Configuration in vercel.json

### Environment Variables
None required - all configuration is hardcoded for simplicity

## Future Enhancement Ideas

1. **Location Selection:** Allow users to input birth/current locations
2. **Time Precision:** Add time-of-day selection (currently defaults to 12:00 UTC)
3. **Velocity Breakdown:** Visualize individual velocity components (Earth rotation, orbit, galactic motion, etc.)
4. **Journey Comparison:** Compare multiple people's journeys side-by-side
5. **Export Features:**
   - Download journey visualization as video
   - Share journey via URL with encoded parameters
   - Export data as JSON/CSV
6. **More Celestial Objects:** Add planets, moons, distant galaxies
7. **Historical Events Timeline:** Show major cosmic events along the journey path
8. **Three.js Migration:** Move to ES modules (r160+ recommended approach)
9. **Real-time Mode:** Show live position updates as time passes
10. **AR Mode:** View journey in augmented reality on mobile devices

## Debug & Troubleshooting

### Console Logging
Key debug messages to look for:
- `✅ Camera controls initialized!` - Controls setup successful
- `🎨 Updating celestial object colors for X years` - Color coding active
- `📷 Camera reset to default view` - Reset camera triggered

### Common Issues

**Celestial objects not showing colors:**
- Check console for "⚠️ Cannot update celestial colors"
- Verify `celestialObjects` and `celestialLabels` are initialized
- Ensure `updateCelestialObjectColors()` is called after journey loads

**Preset buttons not visible:**
- Scroll down in input panel (they're below date selectors)
- Check panel `max-height: 85vh` allows scrolling

**Frame reference indicator hidden:**
- Verify z-index: 1001 (higher than all other elements)
- Check it's outside #ui-overlay (should be sibling to #visualization-container)

**Journey animation not playing:**
- Verify `journeyCurve` is created successfully
- Check `isPlaying` flag and controls.enabled state
- Ensure `playJourney()` is called after journey data loads

## Code Quality Notes

### Strengths
- Clean separation of concerns (calculation, visualization, UI)
- Comprehensive error handling with console logging
- Mobile-first responsive design
- Consistent coding style

### Technical Debt
- Three.js using deprecated script includes
- Some hardcoded values (locations, timezone)
- Large monolithic JavaScript files (could be modularized)
- No automated tests
- No build process or minification

## Documentation & Resources

- **Three.js Docs:** https://threejs.org/docs/
- **Astropy Docs:** https://docs.astropy.org/
- **CMB Reference Frame:** Standard cosmological reference frame
- **Cosmic Velocities:** Earth's motion ~369 km/s relative to CMB

## Project Status

**Current State:** Production-ready, deployed, fully functional
**Last Major Update:** [Current Date]
**Active Issues:** None critical
**Maintenance:** Stable, no ongoing development planned

## Contact & Contribution

This is a personal project demonstrating cosmic position calculations and 3D visualization. The code is available for reference and educational purposes.

## Session Summary

This development session focused on:
1. ✅ Adding interactive timeline slider
2. ✅ Implementing preset event buttons
3. ✅ Improving mobile date selection UX
4. ✅ Enhancing celestial object color coding
5. ✅ Adding frame of reference indicator
6. ✅ Optimizing journey orientation and camera positioning
7. ✅ Fixing formatTimeSpan errors and date validation
8. ✅ Making UI more prominent and user-friendly

All features tested and deployed to production at https://whereami-web.vercel.app/

---

*Generated with Claude Code - A comprehensive guide to the Where Am I? Cosmic Position Calculator project.*
