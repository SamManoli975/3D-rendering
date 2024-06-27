import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, -300);

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
const numberOfTracks = 2; // Set the desired number of tracks
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
    position: [158, 1.2, -468],
    rotation: [0,5.2,0]
});

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

// Define the path
const radius = 225; // Adjust this radius to change the width of the arc
const straightPathEndZ = -100; // Adjust this to change the length of the straight path
const centerX = 275; // Center of the circle in x-axis, adjust as needed
const centerY = -64; // Keeping the y coordinate constant
const centerZ = -180; // Center of the circle in z-axis, adjust as needed
const startAngle = Math.PI; // Start angle in radians (180 degrees)
const endAngle = Math.PI * 1.3; // End angle in radians (270 degrees)
const numPoints = 24; // Number of points along the arc

// Define waypoints for the straight path
const waypoints = [
  new THREE.Vector3(47, -64, 0),  // Starting point
  new THREE.Vector3(47, -64, straightPathEndZ) // End of straight path
];

// Generate waypoints along the circular arc
for (let i = 0; i <= numPoints; i++) {
  const angle = startAngle + (i * (endAngle - startAngle) / numPoints);
  const x = centerX + radius * Math.cos(angle);
  const z = centerZ + radius * Math.sin(angle);
  waypoints.push(new THREE.Vector3(x, centerY, z));
}

// Add waypoints for the straight path after the turn
const straightPathAfterTurnLength = 200; // Adjust this to change the length of the straight path after the turn
const lastArcPoint = waypoints[waypoints.length - 1];
const diagonalLength = Math.sqrt(straightPathAfterTurnLength ** 2 / 2); // Length of the diagonal path (hypotenuse)

for (let i = 1; i <= 10; i++) { // Number of points for the straight path after the turn
  const x = lastArcPoint.x + i * (straightPathAfterTurnLength / 7.7);
  const z = lastArcPoint.z - i * (straightPathAfterTurnLength / 10) * (diagonalLength / straightPathAfterTurnLength);
  waypoints.push(new THREE.Vector3(x, lastArcPoint.y, z));
}

// Create a smooth curve using CatmullRomCurve3
const curve = new THREE.CatmullRomCurve3(waypoints);
curve.curveType = 'catmullrom';
curve.tension = 0.5;

const tubeGeometry = new THREE.TubeGeometry(curve, 100, 1, 8, false);
const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tubeMesh);

let t = 0; // Parameter for the curve
const speed = 0.002; // Adjust the speed as needed

// Camera follow variables
const cameraDistance = 200; // Distance from the train
const cameraHeight = 100; // Height of the camera above the train
const cameraLookAtOffset = new THREE.Vector3(0, 10, -50); // Offset for where the camera should look at relative to train

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update controls for smooth interaction

    // Move the train along the waypoints
    if (train) {
      t += speed;
      if (t > 1) t = 0; // Loop back to start
      
      const position = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
  
      train.position.copy(position);
      train.lookAt(position.clone().add(tangent));

      // Calculate camera position based on train's position and movement
      const cameraTarget = train.position.clone().add(cameraLookAtOffset);
      const cameraPosition = train.position.clone().add(tangent.clone().multiplyScalar(-cameraDistance)).add(new THREE.Vector3(0, cameraHeight, 0)); // Adjust for camera height

      // Update camera position and target to follow the train from behind
      camera.position.copy(cameraPosition);
      camera.lookAt(cameraTarget);
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
