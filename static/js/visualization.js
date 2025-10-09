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

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0003);

        // Create camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100000);
        this.camera.position.set(0, 0, 50);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Add point light
        const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        // Create initial particle systems
        this.createParticleSystems();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
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

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    }

    createJourneyPath(startPos, endPos) {
        // Create a curved path from start to end
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(startPos.x, startPos.y, startPos.z),
            new THREE.Vector3(
                (startPos.x + endPos.x) / 2,
                (startPos.y + endPos.y) / 2 + 50,
                (startPos.z + endPos.z) / 2
            ),
            new THREE.Vector3(endPos.x, endPos.y, endPos.z)
        ]);

        const points = curve.getPoints(200);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
            color: 0xff00ff,
            linewidth: 2,
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

        // Normalize coordinates to reasonable 3D space
        const scale = 100;

        const birthPos = {
            x: (data.birth.location.longitude / 180) * scale,
            y: (data.birth.location.latitude / 90) * scale,
            z: 0
        };

        const currentPos = {
            x: (data.current.location.longitude / 180) * scale,
            y: (data.current.location.latitude / 90) * scale,
            z: 0
        };

        // Create journey path
        this.journeyCurve = this.createJourneyPath(currentPos, birthPos);

        // Position camera at current location
        this.camera.position.set(currentPos.x, currentPos.y, currentPos.z + 30);
        this.camera.lookAt(currentPos.x, currentPos.y, currentPos.z);
    }

    playJourney() {
        if (!this.journeyData || !this.journeyCurve) return;

        this.isPlaying = true;
        this.journeyProgress = 0;

        const duration = 10000 / this.animationSpeed; // 10 seconds base

        const animate = (time) => {
            if (!this.isPlaying) return;

            this.journeyProgress += (16 * this.animationSpeed) / duration;

            if (this.journeyProgress >= 1) {
                this.journeyProgress = 1;
                this.isPlaying = false;
            }

            // Get position along curve
            const point = this.journeyCurve.getPoint(this.journeyProgress);
            const tangent = this.journeyCurve.getTangent(this.journeyProgress);

            // Update camera position and orientation
            this.camera.position.copy(point);
            this.camera.position.z += 30;

            const lookAt = point.clone().add(tangent);
            this.camera.lookAt(lookAt);

            if (this.isPlaying) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    pauseJourney() {
        this.isPlaying = false;
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

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Export for use in app.js
window.CosmicVisualization = CosmicVisualization;
