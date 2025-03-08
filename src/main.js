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
playerCube.position.set(0, 2, 0); // Initial position - raised to 2 units
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
  up: false, // Spacebar for jump - keeping 'up' for jump for now
  down: false,
  jump: false // New jump key state
};

const moveSpeed = 0.1;
const playerHeight = 1; // Approximate player height
const jumpVelocity = 0.07; // Initial jump velocity
let isJumping = false; // Track if player is currently jumping
let verticalVelocity = 0; // Vertical velocity for jumping and gravity
const gravityValue = -0.002; // Standard gravity value


document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': keys.forward = true; break;
    case 'KeyS': keys.backward = true; break;
    case 'KeyA': keys.left = true; break;
    case 'KeyD': keys.right = true; break;
    case 'Space': keys.jump = true; break; // Set jump key to true
    case 'ShiftLeft': keys.down = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': keys.forward = false; break;
    case 'KeyS': keys.backward = false; break;
    case 'KeyA': keys.left = false; break;
    case 'KeyD': keys.right = false; break;
    case 'Space': keys.jump = false; break; // Set jump key to false
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

// Gravity Well Projectile Properties
let gravityWellSphere;
let gravityWellVelocity = new THREE.Vector3();
let gravity = -0.0008; // Reduced gravity for longer arc - slightly reduced more
let isGravityWellLaunched = false;
let gravityWellTargetPoint = new THREE.Vector3(); // Store target point
const initialUpwardVelocity = 0.06; // Increased initial upward velocity


function onMouseClick(event) {
  if (ammoCount <= 0) {
    console.log("Out of ammo!");
    return; // Don't shoot if out of ammo
  }

  ammoCount--; // Decrease ammo count on shot
  updateUI();

  raycaster.setFromCamera(new THREE.Vector2(), camera); // Raycast from center of camera
  const intersects = raycaster.intersectObjects([specterCube, terrain]); // Raycast against Specter and Terrain

  if (intersects.length > 0) {
    let intersection = intersects[0];
    const specterIntersection = intersects.find(intersect => intersect.object === specterCube);
    if (specterIntersection) {
      intersection = specterIntersection;
    }
    gravityWellTargetPoint = intersection.point.clone(); // Store the intersection point as target

    // Bullet Trail Visualization - IMPROVED - visualize initial shot direction
    const points = [camera.position.clone(), gravityWellTargetPoint];
    const bulletTrailGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const bulletTrailMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 2 }); // Orange color, thicker line
    bulletTrail = new THREE.Line(bulletTrailGeometry, bulletTrailMaterial);
    scene.add(bulletTrail);

    // Fading effect for bullet trail
    bulletTrailMaterial.transparent = true;
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.05;
      bulletTrailMaterial.opacity = opacity;
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        if (bulletTrail && bulletTrail.parent) {
          scene.remove(bulletTrail);
          bulletTrail = null;
        }
      }
    }, 50);


    // Create Gravity Well Sphere - Projectile
    gravityWellSphere = new THREE.Mesh(gravityWellGeometry, gravityWellMaterial);
    gravityWellSphere.position.copy(camera.position); // Start at camera position
    scene.add(gravityWellSphere);
    isGravityWellLaunched = true;

    // Calculate initial velocity - trajectory towards target point - with upward component
    const direction = new THREE.Vector3().subVectors(gravityWellTargetPoint, camera.position).normalize();
    gravityWellVelocity.copy(direction.multiplyScalar(0.12)); // Reduced horizontal speed
    gravityWellVelocity.y = initialUpwardVelocity; // Set initial upward velocity
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


function applyGravityWellEffect(gravityWellSphere, wellPoint, duration, objectHit) {
  const gravityObjects = [];
  if (objectHit === specterCube) {
    gravityObjects.push(specterCube); // Only apply gravity to specter if specter was hit
  } else {
    gravityObjects.push(playerCube, specterCube); // Apply to both player and specter if terrain or something else is hit
  }


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

      // Clear interval and remove sphere after duration - Reduced duration to 1 second (1000ms)
      setTimeout(() => {
        clearInterval(gravityInterval); // Clear interval when duration is over
        scene.remove(gravityWellSphere);
      }, 1000); // Reduced duration to 1000 ms (1 second)
    }
  });
}


window.addEventListener('click', onMouseClick, false);


function animate() {
  requestAnimationFrame( animate );

  // Terrain collision detection
  downRaycaster.set(playerCube.position, new THREE.Vector3(0, -1, 0)); // Raycast downwards from player position
  const intersects = downRaycaster.intersectObject(terrain);
  const onGround = intersects.length > 0; // Check if player is on the ground

  if (onGround) {
    const intersectPoint = intersects[0].point;
    playerCube.position.y = intersectPoint.y + playerHeight / 2; // Adjust player position to be above terrain
    verticalVelocity = 0; // Reset vertical velocity when on ground
    isJumping = false; // Reset jumping state when on ground
  } else {
    verticalVelocity += gravityValue * 2; // Apply stronger gravity when falling
    playerCube.position.y += verticalVelocity; // Apply vertical velocity
  }


  if (keys.forward) playerCube.position.z -= moveSpeed;
  if (keys.backward) playerCube.position.z += moveSpeed;
  if (keys.left) playerCube.position.x -= moveSpeed;
  if (keys.right) playerCube.position.x += moveSpeed; // Corrected typo here
  if (keys.jump && onGround && !isJumping) { // Jump condition: on ground and jump key pressed and not already jumping
    verticalVelocity = jumpVelocity; // Apply jump velocity
    isJumping = true; // Set jumping state
  }
  if (keys.down) playerCube.position.y -= moveSpeed; // Keep 'down' for debug/descent


  playerCube.rotation.x += 0.01;
  playerCube.rotation.y += 0.01;

  // Make camera follow the playerCube
  camera.position.x = playerCube.position.x;
  camera.position.y = playerCube.position.y + 2; // Camera slightly above
  camera.position.z = playerCube.position.z + 5; // Camera behind

  updateSpecterAI(); // Update Specter AI in animation loop
  updateUI(); // Update UI elements in animation loop


  // Gravity Well Projectile Animation
  if (isGravityWellLaunched && gravityWellSphere) {
    gravityWellVelocity.y += gravity; // Apply gravity
    gravityWellSphere.position.add(gravityWellVelocity);


    // Basic collision detection with terrain for projectile - very simplified
    if (gravityWellSphere.position.y <= 1 && gravityWellVelocity.y < 0) { // Roughly terrain level and going down
      isGravityWellLaunched = false; // Stop projectile motion
      gravityWellVelocity.set(0, 0, 0); // Reset velocity
      applyGravityWellEffect(gravityWellSphere, gravityWellSphere.position, 1000, terrain); // Reduced duration to 1 second
      gravityWellSphere = null; // Clear sphere after effect starts
    }
  }


  renderer.render( scene, camera );
}

animate();
