import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;
let train, trainPath;
let clock = new THREE.Clock();
const speed = 5; // Adjust speed as needed



function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  // Load train model
  const loader = new GLTFLoader();
  loader.load(
    'train/scene.gltf', // Adjust path to your train model
    function (gltf) {
      train = gltf.scene;
      scene.add(train);
      // Set initial position and orientation of the train
      train.position.set(0, 0, 0);
      train.scale.set(10, 10, 10); // Adjust scale as needed
    },
    undefined,
    function (error) {
      console.error('Error loading train model', error);
    }
  );

  // Define a Bezier curve path
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-50, 0, 0),
    new THREE.Vector3(-25, 0, 25),
    new THREE.Vector3(25, 0, -25),
    new THREE.Vector3(50, 0, 0)
  );

  // Store the curve for movement calculation
  trainPath = curve;

  // Event listeners for arrow key control
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Move the train along the curve based on user input
  if (train && trainPath) {
    moveTrain(delta);
  }

  controls.update();
  renderer.render(scene, camera);
}

function moveTrain(delta) {
  const movement = speed * delta;

  // Sample position on the curve based on time
  const point = trainPath.getPointAt(Date.now() % 1000 / 1000);
  train.position.copy(point);

  // Orient the train along the tangent of the curve
  const tangent = trainPath.getTangentAt(Date.now() % 1000 / 1000).normalize();
  train.lookAt(point.clone().add(tangent));

  // Adjust train speed for smooth movement
  train.translateZ(movement);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 38: // Up arrow
      speedUp();
      break;
    case 40: // Down arrow
      slowDown();
      break;
    case 37: // Left arrow
      turnLeft();
      break;
    case 39: // Right arrow
      turnRight();
      break;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case 38: // Up arrow
    case 40: // Down arrow
      resetSpeed();
      break;
  }
}

function speedUp() {
  speed += 1;
}

function slowDown() {
  speed -= 1;
  if (speed < 0) speed = 0;
}

function turnLeft() {
  // Implement turning left logic
}

function turnRight() {
  // Implement turning right logic
}

function resetSpeed() {
  speed = 5; // Reset to default speed
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
init();
animate();