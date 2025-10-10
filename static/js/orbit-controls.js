/**
 * Simplified OrbitControls for mouse interaction
 * Based on Three.js OrbitControls but simplified
 */

class SimpleOrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.enabled = true;

        // Settings
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        this.minDistance = 10;
        this.maxDistance = 5000;
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.panSpeed = 1.0;

        // Internal state
        this.target = new THREE.Vector3();
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.panOffset = new THREE.Vector3();
        this.scale = 1;
        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();
        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        this.state = 'NONE';
        this.mouseButtons = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);

        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('wheel', this.onMouseWheel);
        this.domElement.addEventListener('contextmenu', this.onContextMenu);

        this.update();
    }

    onMouseDown(event) {
        if (!this.enabled) return;

        console.log('🖱️ Mouse down detected!', event.button === 0 ? 'LEFT' : event.button === 2 ? 'RIGHT' : 'OTHER');
        event.preventDefault();

        if (event.button === this.mouseButtons.LEFT) {
            this.state = 'ROTATE';
            this.rotateStart.set(event.clientX, event.clientY);
            console.log('🔄 Rotate mode activated');
        } else if (event.button === this.mouseButtons.RIGHT) {
            this.state = 'PAN';
            this.panStart.set(event.clientX, event.clientY);
            console.log('👆 Pan mode activated');
        }

        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(event) {
        if (!this.enabled) return;

        event.preventDefault();

        if (this.state === 'ROTATE') {
            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

            const element = this.domElement;
            this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
            this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;

            this.rotateStart.copy(this.rotateEnd);
        } else if (this.state === 'PAN') {
            this.panEnd.set(event.clientX, event.clientY);
            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

            this.pan(this.panDelta.x, this.panDelta.y);

            this.panStart.copy(this.panEnd);
        }
    }

    onMouseUp() {
        if (!this.enabled) return;

        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);

        this.state = 'NONE';
    }

    onMouseWheel(event) {
        if (!this.enabled) return;

        console.log('🔍 Scroll detected:', event.deltaY < 0 ? 'Zoom IN' : 'Zoom OUT');
        event.preventDefault();
        event.stopPropagation();

        if (event.deltaY < 0) {
            this.scale /= 0.95;
        } else if (event.deltaY > 0) {
            this.scale *= 0.95;
        }
    }

    onContextMenu(event) {
        if (!this.enabled) return;
        event.preventDefault();
    }

    pan(deltaX, deltaY) {
        const offset = new THREE.Vector3();
        const element = this.domElement;

        offset.copy(this.camera.position).sub(this.target);
        let targetDistance = offset.length();
        targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

        const panLeft = new THREE.Vector3();
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(this.camera.matrix, 0);
        panLeft.copy(v).multiplyScalar(-2 * deltaX * targetDistance / element.clientHeight);

        const panUp = new THREE.Vector3();
        v.setFromMatrixColumn(this.camera.matrix, 1);
        panUp.copy(v).multiplyScalar(2 * deltaY * targetDistance / element.clientHeight);

        this.panOffset.add(panLeft).add(panUp);
    }

    update() {
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();

        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();

        offset.copy(this.camera.position).sub(this.target);
        offset.applyQuaternion(quat);

        this.spherical.setFromVector3(offset);

        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;

        this.spherical.phi = Math.max(0.001, Math.min(Math.PI - 0.001, this.spherical.phi));
        this.spherical.radius *= this.scale;
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        this.target.add(this.panOffset);

        offset.setFromSpherical(this.spherical);
        offset.applyQuaternion(quatInverse);

        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);

        if (this.enableDamping) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.set(0, 0, 0);
        }

        this.scale = 1;

        return false;
    }

    dispose() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('wheel', this.onMouseWheel);
        this.domElement.removeEventListener('contextmenu', this.onContextMenu);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
    }
}

// Make it available globally
window.SimpleOrbitControls = SimpleOrbitControls;
