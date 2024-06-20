import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


// Create the scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,40, 40); // Move the camera back and up
camera.lookAt(0, 0, 0); // Make the camera look at the center of the scene


//wall 
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
];
// Create a renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const floorSize = 50;
const cellSize = floorSize / maze.length; // Adjust cell size to fit the floor
const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal

// Group for tilting
const tiltGroup = new THREE.Group();
scene.add(tiltGroup);

// Add the floor to the group
tiltGroup.add(floor);

//walls of maze
const wallGeometry = new THREE.BoxGeometry(cellSize, 2, cellSize);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
const walls = [];

for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 1) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(j * cellSize - floorSize / 2 + cellSize / 2, 0, -i * cellSize + floorSize / 2 - cellSize / 2); // Position the wall based on the array index
            tiltGroup.add(wall);
            walls.push(wall);
        }
    }
}

//shape
const shapeGeo = new THREE.SphereGeometry(1, 64, 32);
const Boxmaterial = new THREE.MeshBasicMaterial({ color: 0xfffff0, side: THREE.DoubleSide });
const cube = new THREE.Mesh(shapeGeo, Boxmaterial);
cube.position.y = 0; // Set the cube's y position to half its height to rest it on the plane
tiltGroup.add(cube);

// Position the floor down along the y-axis
floor.position.y = -1;



// Variables to smooth out the tilt motion
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const planeNormal = new THREE.Vector3(0, 1, 0);

// Variables to smooth out the tilt motion
let targetTiltX = 0;
let targetTiltZ = 0;
const tiltSpeed = 0.1; // Adjust this value for smoothness

// Event listener for mouse movement
window.addEventListener('mousemove', (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate the intersection point on the plane
    const intersects = raycaster.intersectObject(floor);
    if (intersects.length > 0) {
        const point = intersects[0].point;

        // Calculate the tilt angles based on the intersection point
        const maxTiltAngle = Math.PI / 6; // Maximum tilt angle (30 degrees)
        targetTiltX = THREE.MathUtils.clamp((point.z / floorSize) * maxTiltAngle, -maxTiltAngle, maxTiltAngle);
        targetTiltZ = THREE.MathUtils.clamp((point.x / floorSize) * maxTiltAngle, -maxTiltAngle, maxTiltAngle);
    }
});



// Initialize OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Enable smooth damping
// controls.dampingFactor = 0.25; // Damping inertia
// controls.screenSpacePanning = false; // Do not allow panning up/down
// controls.maxPolarAngle = Math.PI / 2; // Limit vertical movement to the ground
let moveDirection = { left: false, right: false, up: false, down: false };
// let keyPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

document.addEventListener('keydown', (event) => {
    // if(!keyPressed[event.code]) {
    //     keyPressed[event.code] = true;
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
    // }
});

document.addEventListener('keyup', (event) => {
    // keyPressed[event.code] = false

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

function checkCollision(newPosition) {
    const cubeBox = new THREE.Box3().setFromObject(cube);
    cubeBox.translate(newPosition.clone().sub(cube.position));
    for (const wall of walls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (cubeBox.intersectsBox(wallBox)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function moveCube() {
    const speed = 0.5;
    let newPosition = cube.position.clone();

    if (moveDirection.up) {
        newPosition.z -= speed;
    }
    if (moveDirection.down) {
        newPosition.z += speed;
    }
    if (moveDirection.left) {
        newPosition.x -= speed;
    }
    if (moveDirection.right) {
        newPosition.x += speed;
    }

    if (!checkCollision(newPosition)) {
        cube.position.copy(newPosition);
    }
}
function moveBall() {
    const speed = 0.1; // Adjust speed as needed
    const maxTiltAngle = Math.PI / 6; // Maximum tilt angle (30 degrees)

    // Calculate the movement direction based on tilt angles
    const tiltX = tiltGroup.rotation.x;
    const tiltZ = tiltGroup.rotation.z;

    // Calculate movement direction from tilt angles
    const moveDirection = new THREE.Vector3(
        Math.sin(tiltZ) * Math.cos(tiltX),
        -Math.sin(tiltX),
        Math.cos(tiltZ) * Math.cos(tiltX)
    );

    // Scale the movement direction by speed
    moveDirection.multiplyScalar(speed);

    // Update ball position
    cube.position.add(moveDirection);
}

// Create an animation loop
function animate() {
    requestAnimationFrame(animate);

    moveCube(); // Move the cube based on key inputs
    moveBall();

    // Smoothly interpolate the tilt angles
    tiltGroup.rotation.x += (targetTiltX - tiltGroup.rotation.x) * tiltSpeed;
    tiltGroup.rotation.z += (targetTiltZ - tiltGroup.rotation.z) * tiltSpeed;
    // controls.update(); // Update the controls

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Start the animation loop
animate();