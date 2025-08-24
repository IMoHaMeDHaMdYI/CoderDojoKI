const worldObjects = [];

function initWorld(scene) {
    // Clear existing objects from the scene and array
    while(worldObjects.length > 0) {
        const object = worldObjects.pop();
        scene.remove(object);
    }

    // Ground
    const groundGeometry = new THREE.BoxGeometry(100, 1, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.5;
    scene.add(ground);
    worldObjects.push(ground);

    // Easier Obstacles
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    // Starting Platform
    const startPlatform = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), platformMaterial);
    startPlatform.position.set(0, 0.5, 0);
    scene.add(startPlatform);
    worldObjects.push(startPlatform);

    // Easy Jump 1
    const platform1 = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 6), platformMaterial);
    platform1.position.set(15, 0.5, 0);
    scene.add(platform1);
    worldObjects.push(platform1);

    // Easy Jump 2
    const platform2 = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 6), platformMaterial);
    platform2.position.set(30, 0.5, 0);
    scene.add(platform2);
    worldObjects.push(platform2);

    // Slightly Higher Platform
    const platform3 = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), platformMaterial);
    platform3.position.set(45, 1.5, 0);
    scene.add(platform3);
    worldObjects.push(platform3);

    // Longer Platform
    const platform4 = new THREE.Mesh(new THREE.BoxGeometry(15, 1, 8), platformMaterial);
    platform4.position.set(65, 1.5, 0);
    scene.add(platform4);
    worldObjects.push(platform4);

    // Final Platform
    const platform5 = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), platformMaterial);
    platform5.position.set(85, 0.5, 0);
    scene.add(platform5);
    worldObjects.push(platform5);
}