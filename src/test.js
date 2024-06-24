import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: smooth camera movement
controls.dampingFactor = 0.25; // Optional: speed of damping effect
controls.autoRotate = false; // Optional: disable auto-rotation

// GLTFLoader instance
const loader = new GLTFLoader();

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
const modelsToLoad = [
  {
    path: 'train/scene.gltf',
    scale: [9, 9, 9],
    position: [49, -69, 0]
  },
  {
    path: 'PackTracks/straight2.gltf',
    scale: [1, 1, 1],
    position: [-35, 1.2, 0]
  },
  {
    path: 'PackTracks/straight2.gltf',
    scale: [1, 1, 1],
    position: [-35, 1.2, 149] // Adjusted position for the second track
  },
  {
    path: 'PackTracks/Curved2.gltf',
    scale: [1, 1, 1],
    position: [167, 0, -237],
    rotation: [0, 5.78, 0] // Rotate 90 degrees around Y-axis
  }
];

modelsToLoad.forEach(modelConfig => loadModel(modelConfig));

const train = scene.getObjectByName('TrainScene'); // Assuming the train model has a specific name

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update train position (move the train forward)
  if (train) {
    train.position.z -= 1; // Adjust speed as needed
  }

  // Update camera position to follow the train
  if (train) {
    const distance = 400; // distance from train
    const height = 200;   // height above train
    const angle = Math.PI / 4; // angle from train (45 degrees in radians)

    const offsetX = Math.sin(angle) * distance;
    const offsetY = Math.cos(angle) * distance;

    camera.position.set(train.position.x - offsetX, train.position.y + height, train.position.z + offsetY);
    controls.target.copy(train.position);
  }

  controls.update(); // Update controls for smooth interaction
  renderer.render(scene, camera);
}

// Resize handling
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
