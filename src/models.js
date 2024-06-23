import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add some lights
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);



// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the GLTF file
loader.load(
  'train/scene.gltf', // Adjust the path to your model
  function train(gltf) {
    // If the file is loaded, add it to the scene
    const object = gltf.scene;
    scene.add(object);
    

    // Adjust scale of the object
    object.scale.set(5, 5, 5); // Example: scale up by a factor of 5
    return object
  },
  function (xhr) {
    // While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // If there is an error, log it
    console.error('Error loading GLTF model:', error);
  }
);
const increment = 52;
const numberOfTracks = 1; // Set the desired number of tracks
const models = [];
for (let i = 0; i < numberOfTracks; i++) {
  models.push({
    path: 'PackTracks/scene.gltf',
    scale: [1, 1, 1],
    position: [0, 1.2, i * increment]
  });
}

// Function to load a single model
function loadModel(modelConfig) {
  loader.load(
    modelConfig.path,
    function (gltf) {
      const object = gltf.scene;
      object.scale.set(...modelConfig.scale);
      object.position.set(...modelConfig.position);
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
models.forEach(modelConfig => loadModel(modelConfig));

// Initialize OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: smooth camera movement
controls.dampingFactor = 0.25; // Optional: speed of damping effect
controls.autoRotate = false; // Optional: disable auto-rotation

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update controls for smooth interaction
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
