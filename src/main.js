import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0xffff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);



const edges = new THREE.EdgesGeometry(geometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const edgesLineSegments = new THREE.LineSegments(edges, edgesMaterial);
scene.add(edgesLineSegments);


//camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.25; // Damping inertia
controls.screenSpacePanning = false; // Do not allow panning up/down
controls.maxPolarAngle = Math.PI / 2; // Limit vertical movement to the ground




const controls = new DragControls([cube], camera, renderer.domElement);
// const controls2 = new DragControls([edgesLineSegments], camera, renderer.domElement);

controls.addEventListener('dragstart', function (event) {
    event.object.material.emissive.setHex(0xaaaaaa);
});

// controls.addEventListener('dragend', function (event) {
//     event.object.material.emissive.setHex(0xfffff00);
// });


camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // edgesLineSegments.rotation.x += 0.01;
    // edgesLineSegments.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
