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
- **CSS3** - Responsive design with backdrop filters and mobile optimizations
- **HTML5** - Semantic markup

## Core Features

### 1. Journey Calculation
- **Input:** Birth date (or any date in history/future)
- **Default Date:** October 15, 1961 (provides 60+ year journey)
- **Output:**
  - Distance traveled in kilometers and light-years
  - Time elapsed
  - Current cosmic velocity (~369 km/s relative to CMB)
  - Cosmic separation between birth and current positions

### 2. 3D Visualization with Auto-Play
- **Three.js Scene Components:**
  - **Birth marker** (dark red "Earth's Position at Start Date")
  - **Current marker** (dark blue "Earth's Current Position")
  - **Journey path** connecting the two points
  - **Warp jump animation** - Linear travel from start to current position with star streaking effect (8 seconds)
  - **Auto zoom-out** - Reveals Andromeda Galaxy and cosmic context (6 seconds)
  - **Oort Cloud** - Bright cyan spherical shell (radii 350-500 units, 11,000 particles)
  - Multiple particle systems (7,100 stars across 4 scale levels)
  - Realistic starfield (2,500 sprite-based stars with 5 color types)
  - 8 nebulae with particle systems
  - **9 Labeled celestial objects:**
    - Sirius, Betelgeuse, Polaris, Vega, Orion Nebula, Pleiades
    - **Andromeda Galaxy** (approaching at 110 km/s - extra large label)
    - **Great Attractor** (we're moving toward it - extra large label)
    - **Virgo Cluster** (galaxy cluster we approach - extra large label)

### 3. Interactive Controls
- **Camera Controls:**
  - Left drag: Rotate view
  - Right drag: Pan
  - Scroll: Zoom in/out
  - Reset Camera button
- **Animation Controls:**
  - Play/Pause journey animation (auto-plays on results)
  - Restart animation
  - Speed slider (0.5x to 5x)
  - Timeline slider - Scrub through journey manually (0-100%)

### 4. Celestial Object Color Coding
- **Red gradient:** Objects moving farther away (redshift)
- **Blue gradient:** Objects moving closer (blueshift)
- **Logarithmic scaling** applied for visual perception
- Colors update dynamically based on time elapsed
- Labels show percentage distance change and movement direction
- **Approaching objects** (Andromeda, Great Attractor, Virgo) have extra-large labels (600×150)

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

### 6. Mobile-Responsive Design
- **Bottom sheet layout** on mobile (panels at bottom, 30vh height)
- Animation visible in top 70% of mobile screen
- Responsive layouts for all screen sizes
- Year/Month/Day dropdown selectors (better than date picker on mobile)
- Stacked UI elements on small screens
- Touch-friendly button sizes
- Increased transparency for better animation visibility (0.65-0.7 rgba)

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
│   │   └── style.css         # All application styling + mobile optimizations
│   └── js/
│       ├── app.js            # Main application logic + auto-play
│       ├── visualization.js  # Three.js 3D visualization + warp jump + Oort Cloud
│       ├── orbit-controls.js # Custom camera controls
│       └── starfield.js      # (Legacy - not actively used)
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
1. **User sees default date** → October 15, 1961 pre-selected
2. **Click Calculate** → Geocode location → POST to /api/calculate
3. **Receive journey data** → Load into Three.js visualization
4. **Auto-play animation** → 500ms delay, then warp jump + zoom out
5. **Display results** → Stats, animation controls, timeline slider
6. **User interacts** → Scrub timeline, play animation, explore 3D space

### Visualization System (visualization.js)

**Key Methods:**
- `loadJourneyData(data)` - Initialize journey with backend data
- `createJourneyPath(start, end, distance)` - Generate path geometry
- `playJourney()` - Two-phase animation: warp jump (8s) + zoom out (6s)
- `updateCameraWarpJump(start, end, progress)` - Linear warp effect with fog modulation
- `updateCameraZoomOut(center, progress)` - Smooth zoom to reveal Andromeda
- `updateCelestialObjectColors(years)` - Apply red/blue shifts
- `createOortCloud()` - Generate spherical shell with 11,000 particles
- `setJourneyProgress(progress)` - Manual timeline control (0-1)
- `resetCamera()` - Return to default view

**Camera Positioning:**
- Initial: `(birthPos.x-10, birthPos.y+5, birthPos.z+20)` - pulled back to see red marker
- Birth point: `x = -distanceScale * 0.5` (left)
- Current point: `x = distanceScale * 0.5` (right)
- Looks at birth position initially, then toward current during warp
- Final zoom shows Andromeda at [1500, 200, -1200]

**Warp Jump Animation:**
- **Phase 1 (8 seconds):** Linear travel from birth to current position
- Camera follows straight line (not curved path)
- Fog density varies (0.00015 → 0.00045) for star streaking effect
- Uses `easeInOutQuad` easing
- **Phase 2 (6 seconds):** Zoom out to show Andromeda Galaxy
- Camera pulls back to wide view showing cosmic scale
- Uses `easeInOutCubic` easing

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

## Recent Major Changes (Current Session)

### Mobile Animation Visibility Fix
- Changed panel layout from centered to **bottom sheet** style on mobile
- Panels now at bottom with **30vh max-height** (only 30% of screen)
- **70% of mobile screen** shows 3D animation unobstructed
- Increased panel transparency (0.65-0.7 rgba) for better background visibility
- Rounded top corners only (20px 20px 0 0) for modern sheet pattern

### Position Marker Label Updates
- "Birth" → **"Earth's Position at Start Date"**
- "Now" → **"Earth's Current Position"**
- Multi-line support added (word wrap at 480px width)
- Canvas size increased: 256×128 → 512×256 for clarity
- Label scale: 10×5 → 20×10 for readability

### Warp Jump Animation
- Replaced confusing curved path with **linear warp jump**
- Straight-line travel from start date to current position
- **Star streaking effect** via fog density modulation
- Two-phase animation: warp (8s) + zoom out (6s)
- **Auto-play** enabled - animation starts automatically after results load
- Camera positioned to see start marker clearly

### Celestial Object Enhancements
- Added **Andromeda Galaxy** as approaching object (110 km/s)
- Added **Virgo Cluster** as major approaching destination
- Updated **Great Attractor** velocity (we move toward it)
- All three approaching objects have **3x label size** (600×150)
- All three have **2x marker size** (80×80)
- All other celestial labels increased to **2x size** (400×100)

### Oort Cloud Implementation
- Two-layer spherical shell at radii 350 and 500 units
- **11,000 particles** total (5,000 inner + 6,000 outer)
- **Bright cyan color** (#00FFFF, #88FFFF) for high visibility
- Large particle sizes (8 and 6) with high opacity (0.8, 0.6)
- Additive blending for glow effect
- Labeled "Oort Cloud - Outer boundary of Solar System"
- Positioned at (0,0,0) encompassing the journey

### Default Date Change
- Changed from current year to **October 15, 1961**
- Provides meaningful 60+ year journey by default
- Demonstrates substantial cosmic travel distance

### Camera Position Fix
- Initial camera pulled back: `(birthPos.x-10, birthPos.y+5, birthPos.z+20)`
- Red birth marker now **clearly visible** at animation start
- Camera looks at birth position initially (not current)
- Matches warp jump starting position for smooth animation

### UI/UX Refinements
- Header changed: "Distance Traveled Since Birth" → **"Distance Traveled Since Date"**
- Frame of reference indicator always visible (top-right, z-index 1001)
- Journey orientation: Birth (left) → Current (right)
- All preset buttons and date selectors working seamlessly

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
- Removed redundant starfield.js canvas animation
- Streamlined particle systems
- Optimized material reuse

## Known Limitations

1. **Date Range:** Backend supports 1900-9999 only (Python datetime limitations)
2. **Location:** Currently defaulted to "New York, NY, USA" (geocoding not exposed in UI)
3. **Time Zone:** Hardcoded to UTC
4. **Browser Support:** Requires WebGL support (modern browsers only)
5. **Three.js Version:** Using r160 with deprecated script includes (should migrate to ES modules)
6. **Oort Cloud Scale:** May appear too small/large depending on journey distance

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
3. **Velocity Breakdown:** Visualize individual velocity components
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
11. **Kuiper Belt:** Add another solar system boundary visualization
12. **Heliosphere:** Visualize the Sun's magnetic influence bubble

## Debug & Troubleshooting

### Console Logging
Key debug messages to look for:
- `✅ Camera controls initialized!` - Controls setup successful
- `🌨️ Creating Oort Cloud...` - Oort Cloud initialization started
- `✅ Oort Cloud created successfully with label` - Oort Cloud rendered
- `🎨 Updating celestial object colors for X years` - Color coding active
- `Auto-playing journey animation` - Auto-play triggered
- `📷 Camera reset to default view` - Reset camera triggered

### Common Issues

**Oort Cloud not visible:**
- Check console for "🌨️ Creating Oort Cloud..." message
- Verify particle count and radii in logs
- Try manually zooming out with scroll wheel
- Check if camera is positioned inside the cloud

**Animation not auto-playing:**
- Verify 500ms delay after loadJourneyData
- Check `isPlaying` flag in console
- Ensure playJourney() is called after data loads
- Look for "Auto-playing journey animation" log

**Birth marker not visible:**
- Check camera position: should be (birthPos.x-10, birthPos.y+5, birthPos.z+20)
- Verify camera lookAt is targeting birthPos
- Birth marker should be clearly visible at animation start

**Mobile animation blocked:**
- Verify panels are at bottom with max-height: 30vh
- Check panel transparency is 0.65-0.7 rgba
- Animation should occupy top 70% of mobile viewport

## Code Quality Notes

### Strengths
- Clean separation of concerns (calculation, visualization, UI)
- Comprehensive error handling with console logging
- Mobile-first responsive design with modern UX patterns
- Consistent coding style
- Auto-play provides seamless user experience

### Technical Debt
- Three.js using deprecated script includes
- Some hardcoded values (locations, timezone)
- Large monolithic JavaScript files (could be modularized)
- No automated tests
- No build process or minification
- Oort Cloud scale may need dynamic adjustment based on journey distance

## Documentation & Resources

- **Three.js Docs:** https://threejs.org/docs/
- **Astropy Docs:** https://docs.astropy.org/
- **CMB Reference Frame:** Standard cosmological reference frame
- **Cosmic Velocities:** Earth's motion ~369 km/s relative to CMB
- **Oort Cloud:** Spherical shell at ~2,000-100,000 AU from Sun
- **Andromeda Collision:** Expected in ~4.5 billion years

## Project Status

**Current State:** Production-ready, deployed, fully functional
**Last Major Update:** October 2025
**Active Issues:** None critical
**Maintenance:** Stable, ongoing enhancements to visualization

## Session Summary

This comprehensive development session focused on:

### Completed Features ✅
1. **Warp jump animation** - Linear travel with star streaking effect
2. **Auto-play functionality** - Animation starts automatically
3. **Mobile optimization** - Bottom sheet layout, 70% animation visibility
4. **Position marker labels** - Clear, multi-line descriptions
5. **Celestial object expansion** - Added Andromeda, Great Attractor, Virgo Cluster
6. **Oort Cloud visualization** - 11,000-particle bright cyan sphere
7. **Label size increases** - All celestial objects 2-3x larger
8. **Camera positioning** - Birth marker clearly visible at start
9. **Default date** - October 15, 1961 for meaningful demo
10. **Text updates** - "Distance Traveled Since Date" header

### Technical Improvements 🔧
- Two-phase animation system (warp + zoom)
- Fog modulation for star streaking
- Multi-line text rendering with word wrap
- Dynamic camera positioning based on journey scale
- Additive blending for Oort Cloud glow effect
- Mobile-specific CSS with bottom sheet pattern

All features tested and deployed to production at https://whereami-web.vercel.app/

---

*Last Updated: October 2025*
*Generated with Claude Code - A comprehensive guide to the Where Am I? Cosmic Position Calculator project.*
