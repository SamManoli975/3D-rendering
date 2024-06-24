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

let train; // Declare train variable

// Load the GLTF file
loader.load(
  'train/scene.gltf', // Adjust the path to your model
  function (gltf) {
    // If the file is loaded, add it to the scene
    const object = gltf.scene;
    scene.add(object);
    train = object; // Assign object to train variable

    // Adjust scale and position of the object
    object.scale.set(9, 9, 9);
    object.position.set(49, -69, 0);

    // Position camera to focus on the train
    camera.position.set(object.position.x - 100, object.position.y + 200, object.position.z + 200);

    // Set controls target to the train's position
    controls.target.copy(object.position);

    // Update controls for smooth interaction
    controls.update();
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

const increment = 149;
const numberOfTracks = 2; // Set the desired number of tracks
const straightModels = [];
for (let i = 0; i < numberOfTracks; i++) {
  straightModels.push({
    path: 'PackTracks/straight2.gltf',
    scale: [1, 1, 1],
    position: [-35, 1.2, i * increment]
  });
}

// Curved tracks
const curvedModels = [];
curvedModels.push({
  path: 'PackTracks/Curved2.gltf',
  scale: [1, 1, 1],
  position: [167, 0, -237],
  rotation: [0, 5.78, 0]  // Rotate 90 degrees around Y-axis
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

// Initialize OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: smooth camera movement
controls.dampingFactor = 0.25; // Optional: speed of damping effect
controls.autoRotate = false; // Optional: disable auto-rotation


// Render the scene
function animate() {
  requestAnimationFrame(animate);
  
  


  // Apply rotation to the train (example: rotate around Y-axis)
  if (train) {
    // Example: Move the train forward in the scene
    train.position.z -= 1; // Adjust as needed for your animation

    // Update camera position to follow the train
    camera.position.set(train.position.x - 100, train.position.y + 200, train.position.z + 200);

    // Set controls target to the train's position
    controls.target.copy(train.position);
  }

  

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
