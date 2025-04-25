let scene, camera, renderer, rider, bike, wheels = [];
let checkpoints = [], killbricks = [], currentCheckpoint;
let overlay, titleScreen, startButton;

window.addEventListener('DOMContentLoaded', () => {
  overlay = document.getElementById('overlay');
  titleScreen = document.getElementById('title-screen');
  startButton = document.getElementById('start-button');

  startButton.addEventListener('click', () => {
    titleScreen.style.display = 'none';
    init();
    animate();
  });
});

function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#87ceeb");

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(100, 1, 100),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  ground.position.y = -0.5;
  scene.add(ground);

  // Build character + bike
  buildBikeAndRider();

  // Obstacles
  buildCheckpointsAndKillbricks();

  // Events
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
}

function buildBikeAndRider() {
  const bikeGroup = new THREE.Group();

  // Frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  bikeGroup.add(frame);

  // Wheels
  for (let i = -1; i <= 1; i += 2) {
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.1, 16, 100),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(i, -0.3, 0);
    wheels.push(wheel);
    bikeGroup.add(wheel);
  }

  // Seat post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  post.position.set(0, 0.4, 0);
  bikeGroup.add(post);

  // Rider - head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffcc99 })
  );
  head.position.set(0, 1.5, 0);
  bikeGroup.add(head);

  // Rider - body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  body.position.set(0, 1, 0);
  bikeGroup.add(body);

  bikeGroup.position.set(0, 0, 0);
  currentCheckpoint = bikeGroup.position.clone();
  rider = bikeGroup;
  scene.add(rider);
}

function buildCheckpointsAndKillbricks() {
  for (let i = 1; i <= 5; i++) {
    const checkpoint = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    checkpoint.position.set(i * 10, 0, 0);
    scene.add(checkpoint);
    checkpoints.push(checkpoint);

    const killbrick = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.5, 2),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    killbrick.position.set(i * 10 + 5, 0.25, 0);
    scene.add(killbrick);
    killbricks.push(killbrick);
  }
}

function onKeyDown(event) {
  const move = 0.5;
  switch (event.key) {
    case 'w': rider.position.z -= move; break;
    case 's': rider.position.z += move; break;
    case 'a': rider.position.x -= move; break;
    case 'd': rider.position.x += move; break;
  }
  checkCollisions();
}

function checkCollisions() {
  const box = new THREE.Box3().setFromObject(rider);

  for (let cp of checkpoints) {
    if (box.intersectsBox(new THREE.Box3().setFromObject(cp))) {
      currentCheckpoint.copy(cp.position);
      showOverlay('Checkpoint Reached!');
    }
  }

  for (let kb of killbricks) {
    if (box.intersectsBox(new THREE.Box3().setFromObject(kb))) {
      rider.position.copy(currentCheckpoint);
      showOverlay('You hit a killbrick!');
    }
  }
}

function showOverlay(message) {
  overlay.textContent = message;
  overlay.style.display = 'block';
  setTimeout(() => overlay.style.display = 'none', 2000);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  camera.lookAt(rider.position);
  renderer.render(scene, camera);
}
