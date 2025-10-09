# Where Am I? - Web Version

Interactive 3D web visualization of your cosmic journey through space and time.

## Features

- **Beautiful 3D Visualization**: Three.js-powered cosmic fly-through
- **Interactive Journey**: Watch your path through space animate in real-time
- **Comprehensive Data**: All cosmic motion calculations from the CLI version
- **Spacecraft Comparisons**: See how long it would take for the fastest spacecraft
- **Mobile Responsive**: Works on desktop, tablet, and mobile

## Free Deployment Options

### Option 1: Vercel (Recommended for Quick Start)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd web
vercel
```

3. Follow the prompts to link your account

**Pros**: Easiest deployment, automatic HTTPS, global CDN
**Cons**: 10s function timeout on free tier

### Option 2: Railway.app

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your repo
4. Railway auto-detects Python and deploys

**Pros**: No timeouts, $5/month free credit, persistent storage
**Cons**: Requires credit card (won't charge on free tier)

### Option 3: Render

1. Create account at https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn app:app`

**Pros**: Free tier available, no credit card required initially
**Cons**: Spins down after inactivity (30s cold start)

### Option 4: PythonAnywhere (Easiest for Beginners)

1. Create free account at https://www.pythonanywhere.com
2. Upload files via web interface
3. Configure WSGI file to point to `app.py`
4. Click "Reload" and you're live

**Pros**: Very beginner-friendly, no CLI needed
**Cons**: Limited free resources, slower performance

## Local Development

1. Install dependencies:
```bash
cd web
pip install -r requirements.txt
```

2. Run the development server:
```bash
python app.py
```

3. Open browser to http://localhost:5000

## Project Structure

```
web/
├── app.py                      # Flask API
├── requirements.txt            # Python dependencies
├── Procfile                    # For Railway/Heroku
├── vercel.json                # For Vercel
├── runtime.txt                # Python version
├── templates/
│   └── index.html             # Main page
├── static/
│   ├── css/
│   │   └── style.css          # Styles
│   └── js/
│       ├── visualization.js   # Three.js visualization
│       └── app.js             # Frontend logic
└── README.md
```

## API Endpoints

### POST /api/geocode
Geocode a location string to coordinates.

**Request:**
```json
{
  "location": "Boulder, CO, USA"
}
```

**Response:**
```json
{
  "success": true,
  "latitude": 40.0150,
  "longitude": -105.2705,
  "address": "Boulder, Colorado, USA"
}
```

### POST /api/calculate
Calculate cosmic position and journey.

**Request:**
```json
{
  "birth_date": "1971-11-17",
  "birth_time": "06:00:00",
  "birth_timezone": "Mountain",
  "birth_latitude": 39.1001,
  "birth_longitude": -94.5781,
  "birth_address": "Kansas City, MO",
  "current_latitude": 40.0150,
  "current_longitude": -105.2705,
  "current_address": "Boulder, CO"
}
```

**Response:**
```json
{
  "success": true,
  "birth": { ... },
  "current": { ... },
  "displacement": { ... },
  "spacecraft_comparisons": [ ... ]
}
```

### GET /api/forces
Get comprehensive catalog of forces and motions.

### GET /api/health
Health check endpoint.

## Technology Stack

### Backend
- **Flask**: Lightweight Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Astropy**: Astronomical calculations
- **Geopy**: Geocoding service
- **Gunicorn**: Production WSGI server

### Frontend
- **Three.js**: 3D graphics library
- **Tween.js**: Smooth animations
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with backdrop filters

## Performance Optimization

### For Free Hosting
- Minimal dependencies
- Efficient particle systems with LOD
- Lazy loading of 3D assets
- Compressed textures and models

### Tips
- Use CDN for Three.js (included)
- Enable caching headers
- Minimize API calls
- Optimize particle counts for mobile

## Customization

### Change Color Scheme
Edit `static/css/style.css`:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Particle colors */
const color = 0x88ccff; /* In visualization.js */
```

### Adjust Animation Speed
Default speed is 10 seconds. Change in `visualization.js`:
```javascript
const duration = 10000 / this.animationSpeed; // Change 10000
```

### Modify Particle Density
Reduce for better mobile performance in `visualization.js`:
```javascript
this.particles.earth = this.createParticleField(1000, ...); // Reduce 1000
```

## Troubleshooting

### Geocoding Fails
- Check internet connection
- Nominatim has rate limits (1 req/sec)
- Try more specific locations
- Add country to location string

### 3D Visualization Lag
- Reduce particle counts in `visualization.js`
- Lower mobile particle counts
- Check browser WebGL support
- Try different browser

### Deployment Issues

**Vercel timeout:**
- Geocoding can be slow
- Consider caching coordinates
- Use local geocoding fallback

**Railway/Render sleep:**
- Free tier spins down after 15 min
- First request has cold start
- Consider paid tier for always-on

## Free Tier Limits

### Vercel
- 100GB bandwidth/month
- 100 hours compute/month
- 10s function timeout
- ✅ Good for moderate traffic

### Railway
- $5 free credit/month
- 500 hours compute/month
- No timeout limits
- ✅ Best for hobby projects

### Render
- 750 hours/month
- Spins down after 15 min inactive
- 30s cold start
- ✅ Good for demos

### PythonAnywhere
- 1 web app
- Limited CPU
- Slower performance
- ✅ Good for learning

## Future Enhancements

Potential additions (contributions welcome):

- [ ] Save/share journey URLs
- [ ] Social media sharing cards
- [ ] More 3D assets (Earth, Sun models)
- [ ] VR support
- [ ] Compare multiple people
- [ ] Historical date calculations
- [ ] Animated CMB visualization
- [ ] Sound effects for journey
- [ ] AR mobile experience

## Credits

- **Astropy**: Astronomy calculations
- **Three.js**: 3D visualization
- **OpenStreetMap**: Geocoding via Nominatim
- **NASA**: Spacecraft data

## License

Educational and personal use. Attribution requested.

---

**Built with ❤️ to explore our cosmic journey through space and time** 🚀🌌
