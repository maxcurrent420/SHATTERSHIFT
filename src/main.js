import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// UI Elements
const ammoValueDisplay = document.getElementById('ammo-value');
const healthBarInner = document.getElementById('health-bar-inner');

// Game State
let ammoCount = 10; // Initial ammo
const maxAmmo = 10;
let health = 100; // Initial health
const maxHealth = 100;

// Update UI
function updateUI() {
  ammoValueDisplay.textContent = ammoCount;
  healthBarInner.style.width = `${(health / maxHealth) * 100}%`;
}

// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Generate Terrain - Smoother approach
function generateTerrain() {
  const terrainGeometry = new THREE.PlaneGeometry(100, 100, 100, 100); // Increased segments for raycasting accuracy
  const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x888888, side: THREE.DoubleSide }); // DoubleSide for proper rendering
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);

  const vertices = terrainGeometry.attributes.position.array;
  const gridSize = 10; // Size of grid sections for height variation
  const maxTerrainHeight = 5; // Limit max terrain height

  for (let i = 0; i <= 100; i += gridSize) {
    for (let j = 0; j <= 100; j += gridSize) {
      const height = Math.random() * maxTerrainHeight;
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const index = (i + x) * 3 + (j + y) * 3 * 101 + 2; // Correct index calculation
          if (index < vertices.length) { // Safety check
             vertices[index] = height;
          }
        }
      }
    }
  }
  terrainGeometry.attributes.position.needsUpdate = true;
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true; // Terrain can receive shadows
  return terrain;
}


const terrain = generateTerrain();
scene.add(terrain);

// Player Cube
const playerGeometry = new THREE.BoxGeometry( 1, 1, 1 );
const playerMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
const playerCube = new THREE.Mesh( playerGeometry, playerMaterial );
scene.add( playerCube );
playerCube.position.set(0, 1, 0); // Initial position
playerCube.castShadow = true; // Player casts shadow


// Specter Cube
let specterCube; // Declare specterCube outside for capture mechanic to work correctly
function createSpecter() {
  const specterGeometry = new THREE.BoxGeometry( 0.8, 0.8, 0.8 ); // Slightly smaller than player
  const specterMaterial = new THREE.MeshLambertMaterial( { color: 0xff00ff } ); // Magenta color for Specter
  specterCube = new THREE.Mesh( specterGeometry, specterMaterial );
  scene.add( specterCube );
  specterCube.position.set(10, 1, 10); // Initial position away from player
  specterCube.castShadow = true; // Specter casts shadow
}
createSpecter();


camera.position.set(0, 2, 5);

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

const moveSpeed = 0.1;
const playerHeight = 1; // Approximate player height

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': keys.forward = true; break;
    case 'KeyS': keys.backward = true; break;
    case 'KeyA': keys.left = true; break;
    case 'KeyD': keys.right = true; break;
    case 'Space': keys.up = true; break;
    case 'ShiftLeft': keys.down = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': keys.forward = false; break;
    case 'KeyS': keys.backward = false; break;
    case 'KeyA': keys.left = false; break;
    case 'KeyD': keys.right = false; break;
    case 'Space': keys.up = false; break;
    case 'ShiftLeft': keys.down = false; break;
  }
});


// Shattershift Rifle - Simple line for now
const rifleLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const rifleLineGeometry = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1) ]);
const rifleLine = new THREE.Line(rifleLineGeometry, rifleLineMaterial);
camera.add(rifleLine); // Add rifle line to the camera
rifleLine.position.set(0, -0.1, -0.5); // Adjust position in front of camera
scene.add(camera); // Add camera to scene after adding rifle


// Raycaster for shooting and terrain collision
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // Mouse coordinates no longer needed for ray direction
const downRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0)); // Raycaster pointing downwards


// Gravity Well Visual Effect - Sphere
const gravityWellGeometry = new THREE.SphereGeometry(3, 32, 32); // Radius increased to 3 for effect, detail segments
const gravityWellMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 }); // Blue, semi-transparent
const gravityWellRadius = 3; // Radius for gravity effect

// Bullet Trail Visual
let bulletTrail;

function onMouseClick(event) {
  if (ammoCount <= 0) {
    console.log("Out of ammo!");
    return; // Don't shoot if out of ammo
  }

  ammoCount--; // Decrease ammo count on shot
  updateUI();

  raycaster.setFromCamera(new THREE.Vector2(), camera); // Raycast from center of camera

  console.log('Specter Cube for Raycast:', specterCube); // Debug: Check specterCube validity

  const intersects = raycaster.intersectObjects([specterCube, terrain]); // Raycast against Specter and Terrain

  console.log('Raycast Intersections:', intersects); // Debug: Check intersections

  if (intersects.length > 0) {
    const intersection = intersects[0]; // Get the closest intersection
    const point = intersection.point;
    const objectHit = intersection.object;

    console.log("Raycast Intersection Point:", point);
    console.log("Object Hit:", objectHit);


    // Bullet Trail Visualization - IMPROVED
    const points = [camera.position.clone(), point];
    const bulletTrailGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const bulletTrailMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 2 }); // Orange color, thicker line
    bulletTrail = new THREE.Line(bulletTrailGeometry, bulletTrailMaterial);
    scene.add(bulletTrail);
    console.log('Bullet Trail Created'); // Debug: Confirm bullet trail creation

    // Fading effect for bullet trail
    bulletTrailMaterial.transparent = true; // Enable transparency for fading
    let opacity = 1; // Initial opacity
    const fadeInterval = setInterval(() => {
      opacity -= 0.05; // Decrease opacity each interval
      bulletTrailMaterial.opacity = opacity;
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        if (bulletTrail && bulletTrail.parent) {
          scene.remove(bulletTrail);
          bulletTrail = null;
          console.log('Bullet Trail Removed'); // Debug: Confirm bullet trail removal
        }
      }
    }, 50); // Fade interval (milliseconds)


    // Visual effect - Gravity Well Sphere
    const gravityWellSphere = new THREE.Mesh(gravityWellGeometry, gravityWellMaterial);
    gravityWellSphere.position.copy(point);
    scene.add(gravityWellSphere);

    // Apply Gravity Effect
    applyGravityWellEffect(gravityWellSphere, point, 2000); // Apply effect for 2 seconds (same as visual duration)
  }
}

let specterPatrolDirection = new THREE.Vector3(1, 0, 0); // Initial patrol direction
const specterMoveSpeed = 0.02; // Slightly slower than player

function updateSpecterAI() {
  if (!specterCube) return; // Ensure specterCube is valid

  // Basic Patrol - Simple random direction changes
  if (Math.random() < 0.01) { // 1% chance to change direction each frame
    specterPatrolDirection.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize(); // Random direction
  }

  specterCube.position.addScaledVector(specterPatrolDirection, specterMoveSpeed);

  // Keep Specter roughly on terrain height (very basic)
  specterCube.position.y = Math.max(1, terrain.geometry.parameters.height / 20); // Basic terrain following - adjust as needed

  // Simple Containment - Keep Specter within terrain bounds (optional, adjust as needed)
  const terrainSizeHalf = terrain.geometry.parameters.width / 2;
  if (specterCube.position.x > terrainSizeHalf) specterPatrolDirection.x = -Math.abs(specterPatrolDirection.x);
  if (specterCube.position.x < -terrainSizeHalf) specterPatrolDirection.z = -Math.abs(specterPatrolDirection.z);
  if (specterCube.position.z > terrainSizeHalf) specterPatrolDirection.z = -Math.abs(specterPatrolDirection.z);
  if (specterCube.position.z < -terrainSizeHalf) specterPatrolDirection.z = Math.abs(specterPatrolDirection.z);
}


function applyGravityWellEffect(gravityWellSphere, wellPoint, duration) {
  const gravityObjects = [playerCube, specterCube]; // Array of objects affected by gravity, now includes specter

  gravityObjects.forEach(obj => {
    if (obj) { // Check if object is valid
      let gravityInterval = setInterval(() => {
        if (!obj || !gravityWellSphere.parent) { // Stop effect if object or sphere is removed
          clearInterval(gravityInterval);
          return;
        }

        const distance = obj.position.distanceTo(wellPoint);
        if (distance < gravityWellRadius) {
          // Calculate direction vector from object to gravity well center
          const direction = new THREE.Vector3().subVectors(wellPoint, obj.position).normalize();
          // Apply a force (simple position update for MVP)
          obj.position.addScaledVector(direction, 0.05); // Adjust force strength as needed

          if (obj === specterCube) { // Basic Capture Mechanic for Specter
            if (distance < 1) { // If Specter is very close to the center
              console.log("Specter Captured!");
              scene.remove(specterCube); // Remove Specter from scene
              specterCube = null; // Set to null to prevent further updates and errors
              clearInterval(gravityInterval); // Stop gravity effect on captured specter
              createSpecter(); // Respawn Specter after capture for continuous testing
              return; // Exit interval early
            }
          }
        }
      }, 50); // Interval for applying gravity effect (milliseconds)

      // Clear interval and remove sphere after duration
      setTimeout(() => {
        clearInterval(gravityInterval); // Clear interval when duration is over
        scene.remove(gravityWellSphere);
      }, duration);
    }
  });
}


window.addEventListener('click', onMouseClick, false);


function animate() {
  requestAnimationFrame( animate );

  // Terrain collision detection
  downRaycaster.set(playerCube.position, new THREE.Vector3(0, -1, 0)); // Raycast downwards from player position
  const intersects = downRaycaster.intersectObject(terrain);
  if (intersects.length > 0) {
    const intersectPoint = intersects[0].point;
    playerCube.position.y = intersectPoint.y + playerHeight / 2; // Adjust player position to be above terrain
  }


  if (keys.forward) playerCube.position.z -= moveSpeed;
  if (keys.backward) playerCube.position.z += moveSpeed;
  if (keys.left) playerCube.position.x -= moveSpeed;
  if (keys.right) playerCube.position.x += moveSpeed;
  if (keys.up) playerCube.position.y += moveSpeed;
  if (keys.down) playerCube.position.y -= moveSpeed;


  playerCube.rotation.x += 0.01;
  playerCube.rotation.y += 0.01;

  // Make camera follow the playerCube
  camera.position.x = playerCube.position.x;
  camera.position.y = playerCube.position.y + 2; // Camera slightly above
  camera.position.z = playerCube.position.z + 5; // Camera behind

  updateSpecterAI(); // Update Specter AI in animation loop
  updateUI(); // Update UI elements in animation loop

  renderer.render( scene, camera );
}

animate();
