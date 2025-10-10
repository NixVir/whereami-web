/**
 * Realistic Starfield Background using Canvas
 */

class StarfieldBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.animationId = null;

        // Style the canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '1';
        this.canvas.style.pointerEvents = 'none';

        // Insert canvas into body
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.init();
    }

    init() {
        this.resize();
        this.createStars();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        const starCount = 300;

        // Star temperature types with realistic colors
        const starTypes = [
            { color: '#9BB0FF', size: [1, 3], temp: 'blue', probability: 0.1 },      // Hot blue
            { color: '#FFFFFF', size: [0.8, 2.5], temp: 'white', probability: 0.25 }, // White
            { color: '#FFF4EA', size: [0.8, 2.5], temp: 'yellow', probability: 0.35 }, // Yellow-white
            { color: '#FFD2A1', size: [0.7, 2], temp: 'orange', probability: 0.2 },   // Orange
            { color: '#FFB380', size: [0.6, 1.8], temp: 'red', probability: 0.1 }     // Red
        ];

        for (let i = 0; i < starCount; i++) {
            // Select star type based on probability
            const rand = Math.random();
            let cumulative = 0;
            let type = starTypes[0];

            for (const starType of starTypes) {
                cumulative += starType.probability;
                if (rand <= cumulative) {
                    type = starType;
                    break;
                }
            }

            const star = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: type.size[0] + Math.random() * (type.size[1] - type.size[0]),
                color: type.color,
                alpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.5 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.02, // Slow drift
                vy: (Math.random() - 0.5) * 0.02
            };

            this.stars.push(star);
        }
    }

    drawStar(star, time) {
        // Calculate twinkling
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.alpha * twinkle;

        // Create radial gradient for glow effect
        const gradient = this.ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 3
        );

        // Parse color and create gradient
        gradient.addColorStop(0, this.hexToRgba(star.color, alpha));
        gradient.addColorStop(0.3, this.hexToRgba(star.color, alpha * 0.6));
        gradient.addColorStop(0.6, this.hexToRgba(star.color, alpha * 0.2));
        gradient.addColorStop(1, this.hexToRgba(star.color, 0));

        // Draw the star with glow
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw bright center
        this.ctx.fillStyle = this.hexToRgba(star.color, alpha);
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    animate() {
        const time = Date.now() * 0.001;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw stars
        this.stars.forEach(star => {
            // Move star slowly
            star.x += star.vx;
            star.y += star.vy;

            // Wrap around screen
            if (star.x < -10) star.x = this.canvas.width + 10;
            if (star.x > this.canvas.width + 10) star.x = -10;
            if (star.y < -10) star.y = this.canvas.height + 10;
            if (star.y > this.canvas.height + 10) star.y = -10;

            this.drawStar(star, time);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize starfield when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.starfield = new StarfieldBackground();
    });
} else {
    window.starfield = new StarfieldBackground();
}
