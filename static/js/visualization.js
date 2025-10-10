/**
 * Cosmic Position Visualization using Three.js
 * Creates a 3D fly-through animation showing journey through space
 */

class CosmicVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isPlaying = false;
        this.animationSpeed = 1.0;

        // Particle systems for different scales
        this.particles = {
            earth: null,
            solar: null,
            galactic: null,
            cosmic: null
        };

        // Journey data
        this.journeyData = null;
        this.pathLine = null;

        // Realistic elements
        this.stars = [];
        this.nebulae = [];
        this.lensFlares = [];
        this.controls = null;

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000011, 0.00015);

        // Create camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100000);
        this.camera.position.set(0, 0, 50);
        
        // Note: OrbitControls will be added after renderer is created

        // Create renderer with transparent background
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            premultipliedAlpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        this.container.appendChild(this.renderer.domElement);

        // Add SimpleOrbitControls for camera interaction
        if (typeof SimpleOrbitControls !== 'undefined') {
            this.controls = new SimpleOrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 10;
            this.controls.maxDistance = 5000;
            this.controls.enabled = true;
            console.log('✅ Camera controls initialized!');
            console.log('📌 Controls enabled:', this.controls.enabled);
            console.log('🖱️ Left drag = rotate, Right drag = pan, Scroll = zoom');
            
            // Add visual indicator
            this.addControlsIndicator();
        } else {
            console.error('❌ SimpleOrbitControls not loaded!');
        }

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Add point light
        const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        // Create initial particle systems
        this.createParticleSystems();

        // Create realistic space environment
        this.createMilkyWayBackground();
        this.createRealisticStarField();
        this.createNebulae();
        this.createCelestialLabels();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }


    createCelestialLabels() {
        // Define prominent celestial objects with their approximate positions
        const celestialObjects = [
            { name: 'Sirius', position: [-500, 300, -800], color: '#9BB0FF', info: 'Brightest star' },
            { name: 'Betelgeuse', position: [800, -400, 600], color: '#FFB380', info: 'Red supergiant' },
            { name: 'Polaris', position: [0, 1000, -200], color: '#FFF4EA', info: 'North Star' },
            { name: 'Vega', position: [-700, 600, 400], color: '#FFFFFF', info: 'Star in Lyra' },
            { name: 'Andromeda Galaxy', position: [1500, 200, -1200], color: '#E6E6FA', info: '2.5 million light-years away' },
            { name: 'Great Attractor', position: [-1200, -800, -1500], color: '#FF6347', info: 'Gravitational anomaly' },
            { name: 'Orion Nebula', position: [900, -300, 700], color: '#FF69B4', info: 'Stellar nursery' },
            { name: 'Pleiades', position: [600, 400, -600], color: '#B0C4DE', info: 'Seven Sisters' }
        ];

        this.celestialLabels = [];

        celestialObjects.forEach(obj => {
            // Create a marker for the celestial object
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Draw a bright star marker
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            const col = new THREE.Color(obj.color);
            const r = Math.floor(col.r * 255);
            const g = Math.floor(col.g * 255);
            const b = Math.floor(col.b * 255);
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(' + r + ',' + g + ',' + b + ', 0.9)');
            gradient.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ', 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(obj.position[0], obj.position[1], obj.position[2]);
            sprite.scale.set(40, 40, 1);  // Much larger markers
            
            this.scene.add(sprite);
            this.celestialLabels.push(sprite);

            // Create text label
            const labelCanvas = document.createElement('canvas');
            labelCanvas.width = 1024;
            labelCanvas.height = 256;
            const labelCtx = labelCanvas.getContext('2d');
            
            // Draw label background with rounded rectangle
            labelCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            labelCtx.beginPath();
            const x = 20, y = 20, w = 984, h = 216, radius = 20;
            labelCtx.moveTo(x + radius, y);
            labelCtx.lineTo(x + w - radius, y);
            labelCtx.quadraticCurveTo(x + w, y, x + w, y + radius);
            labelCtx.lineTo(x + w, y + h - radius);
            labelCtx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            labelCtx.lineTo(x + radius, y + h);
            labelCtx.quadraticCurveTo(x, y + h, x, y + h - radius);
            labelCtx.lineTo(x, y + radius);
            labelCtx.quadraticCurveTo(x, y, x + radius, y);
            labelCtx.closePath();
            labelCtx.fill();
            
            // Draw border
            labelCtx.strokeStyle = obj.color;
            labelCtx.lineWidth = 3;
            labelCtx.stroke();
            
            // Draw text - much larger
            labelCtx.fillStyle = obj.color;
            labelCtx.font = 'Bold 72px Arial';
            labelCtx.textAlign = 'center';
            labelCtx.fillText(obj.name, 512, 104);
            
            labelCtx.fillStyle = '#AAA';
            labelCtx.font = '48px Arial';
            labelCtx.fillText(obj.info, 512, 176);
            
            const labelTexture = new THREE.CanvasTexture(labelCanvas);
            const labelMaterial = new THREE.SpriteMaterial({
                map: labelTexture,
                transparent: true
            });
            
            const labelSprite = new THREE.Sprite(labelMaterial);
            labelSprite.position.set(obj.position[0], obj.position[1] + 60, obj.position[2]);
            labelSprite.scale.set(200, 50, 1);  // Much larger labels
            
            this.scene.add(labelSprite);
            this.celestialLabels.push(labelSprite);
        });
    }

    createParticleSystems() {
        // Earth-scale particles (nearby stars)
        this.particles.earth = this.createParticleField(1000, 100, 0x88ccff, 0.5);
        this.scene.add(this.particles.earth);

        // Solar system scale (farther stars)
        this.particles.solar = this.createParticleField(3000, 500, 0x6699cc, 0.3);
        this.scene.add(this.particles.solar);

        // Galactic scale (distant stars)
        this.particles.galactic = this.createParticleField(5000, 2000, 0x4466aa, 0.2);
        this.scene.add(this.particles.galactic);

        // Cosmic scale (very distant objects)
        this.particles.cosmic = this.createParticleField(10000, 5000, 0x223388, 0.1);
        this.scene.add(this.particles.cosmic);
    }

    createParticleField(count, radius, color, opacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < count; i++) {
            // Random position in sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.cbrt(Math.random()) * radius;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.push(x, y, z);

            // Color with some variation
            const col = new THREE.Color(color);
            col.r += (Math.random() - 0.5) * 0.2;
            col.g += (Math.random() - 0.5) * 0.2;
            col.b += (Math.random() - 0.5) * 0.2;

            colors.push(col.r, col.g, col.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Create circular sprite texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw circular gradient
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.PointsMaterial({
            size: 2,
            map: texture,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Points(geometry, material);
    }

    createTextLabel(text, position, color) {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        // Draw text
        context.fillStyle = color;
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 128, 64);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);

        // Create sprite material
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(position.x, position.y + 5, position.z);
        sprite.scale.set(10, 5, 1);

        return sprite;
    }

    createPositionMarker(position, color, label) {
        // Create a glowing sphere marker (smaller size)
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(position.x, position.y, position.z);

        // Add a glow effect with a larger transparent sphere
        const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(position.x, position.y, position.z);

        // Create text label
        const colorHex = '#' + new THREE.Color(color).getHexString();
        const textSprite = this.createTextLabel(label, position, colorHex);

        // Add pulsing animation data
        sphere.userData = { scale: 1, growing: true, label: label };
        glow.userData = { scale: 1, growing: true };

        this.scene.add(sphere);
        this.scene.add(glow);
        this.scene.add(textSprite);

        return { sphere, glow, label: textSprite };
    }

    createJourneyPath(startPos, endPos, distanceKm) {
        // Create a path showing actual cosmic displacement
        // Validate inputs to prevent NaN
        if (isNaN(startPos.x) || isNaN(startPos.y) || isNaN(startPos.z) ||
            isNaN(endPos.x) || isNaN(endPos.y) || isNaN(endPos.z)) {
            console.error('Invalid position data for path creation');
            return null;
        }

        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const dz = endPos.z - startPos.z;
        
        // Create waypoints along the actual trajectory
        const curve = new THREE.CatmullRomCurve3([
            // Start at birth position
            new THREE.Vector3(startPos.x, startPos.y, startPos.z),

            // 25% of the way
            new THREE.Vector3(
                startPos.x + dx * 0.25,
                startPos.y + dy * 0.25,
                startPos.z + dz * 0.25
            ),

            // 50% of the way
            new THREE.Vector3(
                startPos.x + dx * 0.5,
                startPos.y + dy * 0.5,
                startPos.z + dz * 0.5
            ),

            // 75% of the way
            new THREE.Vector3(
                startPos.x + dx * 0.75,
                startPos.y + dy * 0.75,
                startPos.z + dz * 0.75
            ),

            // End at current position
            new THREE.Vector3(endPos.x, endPos.y, endPos.z)
        ]);

        const points = curve.getPoints(200);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create gradient colors along the path
        const colors = [];
        const startColor = new THREE.Color(0x00ff88); // Green for birth
        const endColor = new THREE.Color(0xff0088);   // Pink for current

        for (let i = 0; i < points.length; i++) {
            const t = i / (points.length - 1);
            const color = new THREE.Color().lerpColors(startColor, endColor, t);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });

        if (this.pathLine) {
            this.scene.remove(this.pathLine);
        }

        this.pathLine = new THREE.Line(geometry, material);
        this.scene.add(this.pathLine);

        return curve;
    }

    loadJourneyData(data) {
        this.journeyData = data;

        // Remove old markers if they exist
        if (this.birthMarker) {
            this.scene.remove(this.birthMarker.sphere);
            this.scene.remove(this.birthMarker.glow);
            if (this.birthMarker.label) this.scene.remove(this.birthMarker.label);
        }
        if (this.currentMarker) {
            this.scene.remove(this.currentMarker.sphere);
            this.scene.remove(this.currentMarker.glow);
            if (this.currentMarker.label) this.scene.remove(this.currentMarker.label);
        }
        
        // Remove old path
        if (this.pathLine) {
            this.scene.remove(this.pathLine);
            this.pathLine.geometry.dispose();
            this.pathLine.material.dispose();
            this.pathLine = null;
        }
        if (this.pathTube) {
            this.scene.remove(this.pathTube);
            this.pathTube.geometry.dispose();
            this.pathTube.material.dispose();
            this.pathTube = null;
        }

        console.log('Journey data displacement:', data.displacement);

        // Use geographic coordinates with meaningful separation
        const geoScale = 100;
        const distanceScale = Math.log10(data.displacement.magnitude_km || 1) * 10;

        // Birth position at origin
        const birthPos = {
            x: 0,
            y: 0,
            z: 0
        };

        // Current position based on geographic difference plus distance traveled
        const currentPos = {
            x: (data.current.location.longitude - data.birth.location.longitude) / 180 * geoScale,
            y: (data.current.location.latitude - data.birth.location.latitude) / 90 * geoScale,
            z: distanceScale
        };

        console.log('Birth position:', birthPos);
        console.log('Current position:', currentPos);

        // Create position markers with new colors
        this.birthMarker = this.createPositionMarker(birthPos, 0x8B0000, 'Birth');  // Dark red
        this.currentMarker = this.createPositionMarker(currentPos, 0x00008B, 'Now');  // Dark blue

        // Get distance traveled for path scaling
        const distanceKm = data.displacement.magnitude_km;

        // Create journey path
        this.journeyCurve = this.createJourneyPath(currentPos, birthPos, distanceKm);

        // Position camera to see the full journey
        const midX = (currentPos.x + birthPos.x) / 2;
        const midY = (currentPos.y + birthPos.y) / 2;
        const midZ = (currentPos.z + birthPos.z) / 2;
        
        // Calculate distance for camera placement
        const distance = Math.sqrt(
            Math.pow(currentPos.x - birthPos.x, 2) +
            Math.pow(currentPos.y - birthPos.y, 2) +
            Math.pow(currentPos.z - birthPos.z, 2)
        );

        // Camera positioned to see the full path from an angle
        this.camera.position.set(
            midX + distance * 0.5,
            midY + distance * 0.3,
            midZ + distance * 0.8
        );
        this.camera.lookAt(midX, midY, midZ);
    }


    // Easing function for smooth camera movement
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    playJourney() {
        if (!this.journeyData || !this.journeyCurve) return;

        this.isPlaying = true;
        this.journeyProgress = 0;
        
        // Disable controls during journey
        if (this.controls) {
            this.controls.enabled = false;
        }

        const duration = 10000 / this.animationSpeed;
        const startTime = Date.now();

        const animate = (time) => {
            if (!this.isPlaying) return;

            const elapsed = Date.now() - startTime;
            const rawProgress = Math.min(elapsed / duration, 1);

            // Apply easing for smooth acceleration/deceleration
            this.journeyProgress = this.easeInOutCubic(rawProgress);

            if (rawProgress >= 1) {
                this.journeyProgress = 1;
                this.isPlaying = false;
                
                // Re-enable controls when journey finishes
                if (this.controls) {
                    this.controls.enabled = true;
                }
            }

            // Get position along curve
            const point = this.journeyCurve.getPoint(this.journeyProgress);
            const tangent = this.journeyCurve.getTangent(this.journeyProgress);

            // Smooth camera movement with slight offset
            this.camera.position.copy(point);
            this.camera.position.z += 30;
            this.camera.position.y += 10;

            const lookAt = point.clone().add(tangent.multiplyScalar(50));
            this.camera.lookAt(lookAt);

            if (this.isPlaying) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    pauseJourney() {
        this.isPlaying = false;
        
        // Re-enable controls when paused
        if (this.controls) {
            this.controls.enabled = true;
        }
    }

    restartJourney() {
        this.journeyProgress = 0;
        this.playJourney();
    }

    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Rotate particle systems slowly
        if (this.particles.earth) {
            this.particles.earth.rotation.y += 0.0002;
        }
        if (this.particles.solar) {
            this.particles.solar.rotation.y += 0.0001;
        }
        if (this.particles.galactic) {
            this.particles.galactic.rotation.y += 0.00005;
        }
        if (this.particles.cosmic) {
            this.particles.cosmic.rotation.y += 0.00002;
        }

        // Animate stars with twinkling effect
        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.userData.twinkleSpeed + star.userData.twinklePhase);
            const targetOpacity = star.userData.baseOpacity * (0.7 + twinkle * 0.3);
            star.material.opacity = targetOpacity;
        });

        // Rotate nebulae slowly
        this.nebulae.forEach(nebula => {
            nebula.rotation.y += nebula.userData.rotationSpeed;
            nebula.rotation.x += nebula.userData.rotationSpeed * 0.5;
        });

        // Update lens flares to face camera
        this.lensFlares.forEach(flare => {
            flare.lookAt(this.camera.position);
        });

        // Animate markers with pulsing effect
        if (this.birthMarker && this.birthMarker.sphere) {
            const sphere = this.birthMarker.sphere;
            const glow = this.birthMarker.glow;

            if (sphere.userData.growing) {
                sphere.userData.scale += 0.01;
                if (sphere.userData.scale >= 1.2) {
                    sphere.userData.growing = false;
                }
            } else {
                sphere.userData.scale -= 0.01;
                if (sphere.userData.scale <= 0.8) {
                    sphere.userData.growing = true;
                }
            }

            sphere.scale.set(sphere.userData.scale, sphere.userData.scale, sphere.userData.scale);
            glow.scale.set(sphere.userData.scale, sphere.userData.scale, sphere.userData.scale);
        }

        if (this.currentMarker && this.currentMarker.sphere) {
            const sphere = this.currentMarker.sphere;
            const glow = this.currentMarker.glow;

            if (sphere.userData.growing) {
                sphere.userData.scale += 0.01;
                if (sphere.userData.scale >= 1.2) {
                    sphere.userData.growing = false;
                }
            } else {
                sphere.userData.scale -= 0.01;
                if (sphere.userData.scale <= 0.8) {
                    sphere.userData.growing = true;
                }
            }

            sphere.scale.set(sphere.userData.scale, sphere.userData.scale, sphere.userData.scale);
            glow.scale.set(sphere.userData.scale, sphere.userData.scale, sphere.userData.scale);
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    addControlsIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'controls-indicator';
        indicator.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 10px; font-family: Arial; z-index: 1000; border: 2px solid #667eea;">
                <div style="font-weight: bold; margin-bottom: 8px; color: #667eea;">🎮 Camera Controls Active</div>
                <div style="font-size: 12px; line-height: 1.6;">
                    🖱️ <strong>Left Drag</strong>: Rotate<br>
                    🖱️ <strong>Right Drag</strong>: Pan<br>
                    🖱️ <strong>Scroll</strong>: Zoom
                </div>
            </div>
        `;
        document.body.appendChild(indicator);
        
        // Remove after 5 seconds
        setTimeout(() => {
            const elem = document.getElementById('controls-indicator');
            if (elem) {
                elem.style.transition = 'opacity 1s';
                elem.style.opacity = '0';
                setTimeout(() => elem.remove(), 1000);
            }
        }, 5000);
    }


    resetCamera() {
        if (!this.journeyData) return;
        
        // Reset to the default view showing the journey
        const data = this.journeyData;
        const birthPos = { x: 0, y: 0, z: 0 };
        const currentPos = {
            x: (data.current.location.longitude - data.birth.location.longitude) / 180 * 100,
            y: (data.current.location.latitude - data.birth.location.latitude) / 90 * 100,
            z: Math.log10(data.displacement.magnitude_km || 1) * 10
        };
        
        const midX = (currentPos.x + birthPos.x) / 2;
        const midY = (currentPos.y + birthPos.y) / 2;
        const midZ = (currentPos.z + birthPos.z) / 2;
        
        const distance = Math.sqrt(
            Math.pow(currentPos.x - birthPos.x, 2) +
            Math.pow(currentPos.y - birthPos.y, 2) +
            Math.pow(currentPos.z - birthPos.z, 2)
        );
        
        this.camera.position.set(
            midX + distance * 0.5,
            midY + distance * 0.3,
            midZ + distance * 0.8
        );
        this.camera.lookAt(midX, midY, midZ);
        
        if (this.controls) {
            this.controls.target.set(midX, midY, midZ);
        }
        
        console.log('📷 Camera reset to default view');
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    createMilkyWayBackground() {
        const geometry = new THREE.SphereGeometry(50000, 64, 64);
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
        gradient.addColorStop(0, '#000308');
        gradient.addColorStop(0.4, '#00010a');
        gradient.addColorStop(0.5, '#1a0f2e');
        gradient.addColorStop(0.6, '#00010a');
        gradient.addColorStop(1, '#000308');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 1024);
        
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const radius = Math.random() * 1.5;
            const brightness = Math.random();
            ctx.fillStyle = 'rgba(255, 255, 255, ' + brightness + ')';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });
        
        const skybox = new THREE.Mesh(geometry, material);
        this.scene.add(skybox);
    }

    createRealisticStarField() {
        const starTypes = [
            { color: 0x9BB0FF, size: 3, count: 200 },
            { color: 0xFFFFFF, size: 2.5, count: 500 },
            { color: 0xFFFF00, size: 2, count: 800 },
            { color: 0xFFCC66, size: 1.8, count: 600 },
            { color: 0xFF6666, size: 1.5, count: 400 }
        ];

        starTypes.forEach(starType => {
            for (let i = 0; i < starType.count; i++) {
                const distance = 1000 + Math.random() * 10000;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const x = distance * Math.sin(phi) * Math.cos(theta);
                const y = distance * Math.sin(phi) * Math.sin(theta);
                const z = distance * Math.cos(phi);
                const size = starType.size * (0.5 + Math.random() * 1.5);
                const brightness = 0.3 + Math.random() * 0.7;
                
                // Create sprite texture for smooth circular stars
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                
                const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                const col = new THREE.Color(starType.color);
                const r = Math.floor(col.r * 255);
                const g = Math.floor(col.g * 255);
                const b = Math.floor(col.b * 255);
                
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.1, 'rgba(' + r + ',' + g + ',' + b + ', 1)');
                gradient.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ', 0.6)');
                gradient.addColorStop(0.7, 'rgba(' + r + ',' + g + ',' + b + ', 0.2)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 64, 64);
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 1,
                    blending: THREE.AdditiveBlending
                });
                
                const star = new THREE.Sprite(spriteMaterial);
                star.position.set(x, y, z);
                star.scale.set(size * 6, size * 6, 1);
                star.userData = {
                    baseOpacity: brightness,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinklePhase: Math.random() * Math.PI * 2
                };
                
                this.stars.push(star);
                this.scene.add(star);
                
                if (brightness > 0.7 && Math.random() > 0.7) {
                    this.createLensFlare(star.position, starType.color, brightness);
                }
            }
        });
    }

    createLensFlare(position, color, intensity) {
        const flareGeometry = new THREE.CircleGeometry(5, 32);
        const flareMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: intensity * 0.3,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        const flare = new THREE.Mesh(flareGeometry, flareMaterial);
        flare.position.copy(position);
        this.lensFlares.push(flare);
        this.scene.add(flare);
    }

    createNebulae() {
        const nebulaColors = [
            { color: 0xFF1493 },
            { color: 0x00CED1 },
            { color: 0x9370DB },
            { color: 0xFF4500 }
        ];

        for (let i = 0; i < 8; i++) {
            const nebulaType = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
            const distance = 5000 + Math.random() * 20000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = distance * Math.sin(phi) * Math.cos(theta);
            const y = distance * Math.sin(phi) * Math.sin(theta);
            const z = distance * Math.cos(phi);

            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];

            for (let j = 0; j < 1000; j++) {
                const radius = 500 + Math.random() * 1000;
                const angle1 = Math.random() * Math.PI * 2;
                const angle2 = Math.random() * Math.PI * 2;
                const px = x + Math.cos(angle1) * Math.sin(angle2) * radius;
                const py = y + Math.sin(angle1) * Math.sin(angle2) * radius;
                const pz = z + Math.cos(angle2) * radius;
                positions.push(px, py, pz);
                
                const col = new THREE.Color(nebulaType.color);
                col.r += (Math.random() - 0.5) * 0.3;
                col.g += (Math.random() - 0.5) * 0.3;
                col.b += (Math.random() - 0.5) * 0.3;
                colors.push(col.r, col.g, col.b);
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 20,
                vertexColors: true,
                transparent: true,
                opacity: 0.15,
                sizeAttenuation: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const nebula = new THREE.Points(geometry, material);
            nebula.userData = { rotationSpeed: (Math.random() - 0.5) * 0.0001 };
            this.nebulae.push(nebula);
            this.scene.add(nebula);
        }
    }

}



// Make resetCamera accessible globally
window.resetVisualizationCamera = function() {
    if (window.visualization) {
        window.visualization.resetCamera();
    }
};

// Export for use in app.js
window.CosmicVisualization = CosmicVisualization;
