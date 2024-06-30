import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 150, -500); // Adjusted camera position for better view

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

// Initialize OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;  // Ensure zoom is enabled
controls.autoRotate = false;

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

let train; // Declare train variable

// Load the GLTF file for the train
loader.load(
    'train/scene.gltf', // Adjust the path to your model
    function (gltf) {
        const object = gltf.scene;
        scene.add(object);
        train = object; // Assign object to train variable

        // Adjust scale and position of the object
        object.scale.set(10, 10, 10);
        object.position.set(47, -64, 0);

        // Set controls target to the train's position
        controls.target.copy(object.position);

        // Update controls for smooth interaction
        controls.update();
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading GLTF model:', error);
    }
);

// Load track models
const increment = 149;
const numberOfTracks = 5; // Set the desired number of tracks
const straightModels = [];
for (let i = 0; i < numberOfTracks; i++) {
    straightModels.push({
        path: 'PackTracks/straight2.gltf',
        scale: [1, 1, 1],
        position: [-35, 1.2, i * increment]
    });
}
straightModels.push({
    path: 'PackTracks/straight2.gltf',
    scale: [1, 1, 1],
    position: [157, 1.2, -464],
    rotation: [0, 5.2, 0]
},
{
  path: 'PackTracks/straight2.gltf',
  scale: [1, 1, 1],
  position: [286, 1.2, -533],
  rotation: [0, 5.2, 0]
});

// Curved tracks
const curvedModels = [];
curvedModels.push({
    path: 'PackTracks/Curved2.gltf',
    scale: [1, 1, 1],
    position: [167, 0, -235],
    rotation: [0, 5.78, 0]  // Rotate 90 degrees around Y-axis
},
{
  path: 'PackTracks/Curved2.gltf',
  scale: [1, 1, 1],
  position: [-77, 0, -237],
  rotation: [0, 10, 0]  // Rotate 90 degrees around Y-axis
});

// Function to load a single model
function loadModel(modelConfig) {
    loader.load(
        modelConfig.path,
        function (gltf) {
            const object = gltf.scene;
            object.scale.set(...modelConfig.scale);
            object.position.set(...modelConfig.position);
            if (modelConfig.rotation) {
                object.rotation.set(...modelConfig.rotation);
            }

            scene.add(object);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading GLTF model:', error);
        }
    );
}

// Load all models
straightModels.forEach(modelConfig => loadModel(modelConfig));
curvedModels.forEach(modelConfig => loadModel(modelConfig));

// Define the straight path before the decision point
const waypointsStraight = [
    new THREE.Vector3(47, -64, 0),
    new THREE.Vector3(47, -64, -100)
];

// Define the first curve (left turn)
const radius = 300; 
const centerX1 = 347; 
const centerY = -64; 
const centerZ1 = -135; 
const startAngle1 = Math.PI; 
const endAngle1 = Math.PI * 1.31; 
const numPoints = 23; // Number of points along the arc

const waypointsLeft = [
    new THREE.Vector3(47, -64, -100) // Starting point at decision point
];

// Generate waypoints along the first circular arc (left turn)
for (let i = 0; i <= numPoints; i++) {
    const angle = startAngle1 + (i * (endAngle1 - startAngle1) / numPoints);
    const x = centerX1 + radius * Math.cos(angle);
    const z = centerZ1 + radius * Math.sin(angle);
    waypointsLeft.push(new THREE.Vector3(x, centerY, z));
}

// Define the second curve (right turn)
const centerX2 = -247; 
const centerZ2 = -135; 
const startAngle2 = 0; 
const endAngle2 = Math.PI * 0.31; 

const waypointsRight = [
    new THREE.Vector3(47, -64, -100) // Starting point at decision point
];

// Generate waypoints along the second circular arc (right turn)
for (let i = 0; i <= numPoints; i++) {
    const angle = startAngle2 + (i * (endAngle2 - startAngle2) / numPoints);
    const x = centerX2 + radius * Math.cos(angle);
    const z = centerZ2 + radius * Math.sin(angle);
    waypointsRight.push(new THREE.Vector3(x, centerY, z));
}

// Create smooth curves using CatmullRomCurve3
const straightCurve = new THREE.CatmullRomCurve3(waypointsStraight);
const curveLeft = new THREE.CatmullRomCurve3(waypointsLeft);
const curveRight = new THREE.CatmullRomCurve3(waypointsRight);

let t = 0; // Parameter for the curve
const speed = 0.022; 

let currentCurve = straightCurve; // Set the default curve
let decisionMade = false; // Track if a decision has been made

// Camera follow variables
const cameraDistance = 200; // Distance from the train
const cameraHeight = 100; // Height of the camera above the train
const cameraLookAtOffset = new THREE.Vector3(0, 10, -50); // Offset for where the camera should look at relative to train

let isUserInteracting = false;

// Event listeners to detect user interaction
controls.addEventListener('start', () => {
    isUserInteracting = true;
});
controls.addEventListener('end', () => {
    isUserInteracting = false;
});

// Event listener for keyboard input to switch curves
window.addEventListener('keydown', (event) => {
    if (!decisionMade && train && train.position.distanceTo(new THREE.Vector3(47, -64, -100)) < 10) { // Check if near decision point
        if (event.key === '1') {
            currentCurve = curveLeft;
            decisionMade = true; // Prevent further input
        } else if (event.key === '2') {
            currentCurve = curveRight;
            decisionMade = true; // Prevent further input
        }
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update controls for smooth interaction

    // Move the train along the waypoints of the selected curve
    if (train) {
        t += speed;
        if (t > 1) t = 0; // Loop back to start

        const position = currentCurve.getPointAt(t);
        const tangent = currentCurve.getTangentAt(t);

        train.position.copy(position);
        train.lookAt(position.clone().add(tangent));

        if (!isUserInteracting) {
            // Calculate camera position based on train's position and movement
            const cameraTarget = train.position.clone().add(cameraLookAtOffset);
            const cameraPosition = train.position.clone().add(tangent.clone().multiplyScalar(-cameraDistance)).add(new THREE.Vector3(0, cameraHeight, 0)); // Adjust for camera height
        
            // Update camera position to follow the train from behind
            camera.position.copy(cameraPosition);
            // Ensure the camera looks at the train with the specified offset
            camera.lookAt(cameraTarget);
        
            // Ensure the controls target is also updated to match the camera's target
            controls.target.copy(cameraTarget);
        } else {
            // If the user is interacting, still update the controls target to follow the train
            const cameraTarget = train.position.clone().add(cameraLookAtOffset);
            controls.target.copy(cameraTarget);
        }
    }

    renderer.render(scene, camera);
}

// Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the 3D rendering
animate();
