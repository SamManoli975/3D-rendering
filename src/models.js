import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7; // Adjust the camera position as needed

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Alpha: true allows for a transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the DOM
const container = document.getElementById("container3D");
if (container) {
  container.appendChild(renderer.domElement);
} else {
  console.error('Element with id "container3D" not found.');
}

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(5, 5, 5); // Top-left-ish
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1); // Ambient light
scene.add(ambientLight);

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the GLTF file
loader.load(
  './man/scene.gltf', // Adjust the path to your model
  function (gltf) {
    // If the file is loaded, add it to the scene
    const object = gltf.scene;
    scene.add(object);

    // Adjust scale of the object
    object.scale.set(5, 5, 5); // Example: scale up by a factor of 5
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
