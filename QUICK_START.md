# Quick Start Guide

Get your cosmic journey calculator online in **5 minutes** for **$0**.

## 🚀 Fastest Path to Deployment

### Step 1: Test Locally (2 minutes)

```bash
cd web
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000 and verify everything works.

### Step 2: Deploy to Vercel (3 minutes)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git push
```

2. Go to https://vercel.com

3. Click "New Project" → Import your repo

4. Click "Deploy"

5. Done! Share your URL 🎉

## 📁 What You Have

### Complete Web Application
- ✅ Flask API backend
- ✅ Three.js 3D visualization
- ✅ Responsive design
- ✅ Free deployment configs
- ✅ Complete documentation

### File Structure
```
web/
├── app.py              # Flask API
├── requirements.txt    # Dependencies
├── templates/
│   └── index.html     # Main page
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── visualization.js  # 3D graphics
│       └── app.js           # App logic
└── [deployment configs]
```

## 🎨 Features

### User Experience
- Beautiful space-themed UI
- 3D particle star field
- Animated cosmic fly-through
- Mobile responsive

### Calculations
- Real-time geocoding
- Multi-scale velocity calculations
- Spacecraft comparisons
- Technical breakdowns

### Animation
- Smooth camera transitions
- Adjustable playback speed
- Play/pause controls
- Restart capability

## 🆓 Free Hosting Options

### Vercel ⭐ Recommended
- **Pros**: Fastest, auto-deploys, global CDN
- **Cons**: 10s timeout
- **Deploy**: 5 minutes

### Railway
- **Pros**: No timeouts, $5 free credit/month
- **Cons**: Needs credit card
- **Deploy**: 10 minutes

### Render
- **Pros**: Easy setup, no credit card initially
- **Cons**: Cold starts after inactivity
- **Deploy**: 10 minutes

## 🔧 Local Development

### Run Development Server
```bash
cd web
python app.py
```

Server runs at http://localhost:5000

### Hot Reload
Flask automatically reloads on file changes in debug mode.

### Test API Endpoints

**Geocode:**
```bash
curl -X POST http://localhost:5000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"location": "Boulder, CO"}'
```

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

## 📝 Customization

### Change Colors
Edit `static/css/style.css`:
```css
/* Line 47: Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Animation Speed
Edit `static/js/visualization.js`:
```javascript
// Line 128: Duration in milliseconds
const duration = 10000; // Change this
```

### Modify Particle Count
Edit `static/js/visualization.js`:
```javascript
// Lines 62-75: Adjust particle counts
this.createParticleField(1000, ...); // Reduce for mobile
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID [number] /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Module Not Found
```bash
pip install -r requirements.txt
```

### Geocoding Timeout
- Check internet connection
- Try more specific location
- Increase timeout in `geocoding.py`

## 📊 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.11 + Flask |
| API | REST with CORS |
| Frontend | Vanilla JavaScript |
| 3D Graphics | Three.js |
| Animation | Tween.js |
| Styling | CSS3 |
| Calculations | Astropy |
| Geocoding | Geopy (Nominatim) |

## 🎯 Next Steps

1. **Test locally** to verify everything works
2. **Deploy to Vercel** (fastest)
3. **Share your URL** with friends
4. **Customize** colors and animations
5. **Add features** from the roadmap

## 📚 Documentation

- **[Full README](README.md)** - Complete documentation
- **[Deployment Guide](../DEPLOYMENT_GUIDE.md)** - Detailed deployment steps
- **[Web Plan](../WEB_DEPLOYMENT_PLAN.md)** - Architecture and design
- **[Main Project](../README.md)** - CLI version docs

## 🚨 Need Help?

1. Check the [Deployment Guide](../DEPLOYMENT_GUIDE.md)
2. Review error messages carefully
3. Check browser console (F12)
4. Look at server logs
5. Try a different browser

## 🎉 You're Ready!

Your cosmic journey calculator is ready to share with the world!

```bash
# Deploy in 3 commands:
git push
vercel
# Share your URL!
```

**May your cosmic journey be illuminating!** 🌌✨
