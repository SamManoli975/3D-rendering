import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


// Create the scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 5); // Move the camera back and up
camera.lookAt(0, 0, 0); // Make the camera look at the center of the scene

// Create a renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a plane geometry and a basic material and combine them into a mesh
const geometry = new THREE.PlaneGeometry(10, 10); // Make the plane larger to act as a floor
const material = new THREE.MeshBasicMaterial({  side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);

const BoxGeo = new THREE.BoxGeometry(1,1);
const Boxmaterial = new THREE.MeshBasicMaterial({color: 0xffff00,  side: THREE.DoubleSide });
const cube = new THREE.Mesh(BoxGeo, Boxmaterial);
cube.position.y = -0.5; // Set the cube's y position to half its height to rest it on the plane
scene.add(cube);


// Rotate and position the plane to act as a floor
plane.rotation.x = -Math.PI / 2; // Rotate the plane 90 degrees
plane.position.y = -1; // Position the plane down along the y-axis

// Add the plane mesh to our scene
scene.add(plane);

// Initialize OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.25; // Damping inertia
controls.screenSpacePanning = false; // Do not allow panning up/down
controls.maxPolarAngle = Math.PI / 2; // Limit vertical movement to the ground
let moveDirection = { left: false, right: false, up: false, down: false };

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            moveDirection.up = true;
            break;
        case 'ArrowDown':
            moveDirection.down = true;
            break;
        case 'ArrowLeft':
            moveDirection.left = true;
            break;
        case 'ArrowRight':
            moveDirection.right = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            moveDirection.up = false;
            break;
        case 'ArrowDown':
            moveDirection.down = false;
            break;
        case 'ArrowLeft':
            moveDirection.left = false;
            break;
        case 'ArrowRight':
            moveDirection.right = false;
            break;
    }
});

function moveCube() {
    const speed = 0.1;
    if (moveDirection.up) cube.position.z -= speed;
    if (moveDirection.down) cube.position.z += speed;
    if (moveDirection.left) cube.position.x -= speed;
    if (moveDirection.right) cube.position.x += speed;
}

// Create an animation loop
function animate() {
    requestAnimationFrame(animate);

    moveCube(); // Move the cube based on key inputs

    controls.update(); // Update the controls

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Start the animation loop
animate();