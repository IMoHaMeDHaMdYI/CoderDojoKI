const player = {
    height: 1.8,
    speed: 0.1,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canJump: true,
    jumpStrength: 0.15,
    gravity: 0.005,
};

function initPlayer(camera) {
    camera.position.set(0, player.height, 0);

    // Event listeners for movement
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW':
                player.moveForward = true;
                break;
            case 'KeyS':
                player.moveBackward = true;
                break;
            case 'KeyA':
                player.moveLeft = true;
                break;
            case 'KeyD':
                player.moveRight = true;
                break;
            case 'Space':
                if (player.canJump) {
                    player.velocity.y += player.jumpStrength;
                    player.canJump = false;
                }
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW':
                player.moveForward = false;
                break;
            case 'KeyS':
                player.moveBackward = false;
                break;
            case 'KeyA':
                player.moveLeft = false;
                break;
            case 'KeyD':
                player.moveRight = false;
                break;
        }
    });

    // Mouse look controls
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            camera.rotation.y -= event.movementX * 0.002;
            camera.rotation.x -= event.movementY * 0.002;
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        }
    });

    // Pointer Lock for immersive experience
    document.body.addEventListener('click', () => {
        document.body.requestPointerLock();
    });
}

function updatePlayer(camera, deltaTime) {
    // Apply gravity
    player.velocity.y -= player.gravity * deltaTime * 60; // Scale gravity by deltaTime

    // Movement
    player.direction.z = Number(player.moveForward) - Number(player.moveBackward);
    player.direction.x = Number(player.moveRight) - Number(player.moveLeft);
    player.direction.normalize(); // this ensures consistent movements in all directions

    if (player.moveForward || player.moveBackward) camera.translateZ(player.direction.z * player.speed * deltaTime * 60);
    if (player.moveLeft || player.moveRight) camera.translateX(player.direction.x * player.speed * deltaTime * 60);

    camera.position.y += player.velocity.y * deltaTime * 60;

    // Collision detection with world objects
    let onGround = false;
    for (let i = 0; i < worldObjects.length; i++) {
        const object = worldObjects[i];
        const bbox = new THREE.Box3().setFromObject(object);

        // Check if player is within x and z bounds of the object
        const playerX = camera.position.x;
        const playerZ = camera.position.z;

        const objectMinX = bbox.min.x;
        const objectMaxX = bbox.max.x;
        const objectMinZ = bbox.min.z;
        const objectMaxZ = bbox.max.z;

        if (playerX > objectMinX && playerX < objectMaxX &&
            playerZ > objectMinZ && playerZ < objectMaxZ) {

            // Check if player is falling onto the object
            const playerFeetY = camera.position.y - player.height / 2;
            const objectTopY = bbox.max.y;

            if (playerFeetY <= objectTopY && playerFeetY > objectTopY - 0.1 && player.velocity.y < 0) {
                camera.position.y = objectTopY + player.height / 2;
                player.velocity.y = 0;
                player.canJump = true;
                onGround = true;
            }
        }
    }

    // If not on any object, and below player.height, reset to player.height (ground)
    if (!onGround && camera.position.y < player.height) {
        camera.position.y = player.height;
        player.velocity.y = 0;
        player.canJump = true;
    }
}