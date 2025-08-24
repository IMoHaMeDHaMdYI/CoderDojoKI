let scene, camera, renderer;
let lastTime = 0;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize world and player
    initWorld(scene);
    initPlayer(camera);

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000 || 0;
    lastTime = time;

    updatePlayer(camera, deltaTime);

    renderer.render(scene, camera);
}

init();
