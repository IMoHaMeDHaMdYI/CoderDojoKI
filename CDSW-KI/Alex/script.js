const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight( 0x404040 );
scene.add( ambientLight );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

const gridSize = 10;
const blockSize = 50;
const ground = new THREE.Group();
const world = [];

const blockColors = {
    grass: 0x00ff00,
    dirt: 0x8B4513,
    stone: 0x808080,
    void: 0x333333
};

for ( let x = 0; x < gridSize; x++ ) {
    world[x] = [];
    for ( let z = 0; z < gridSize; z++ ) {
        const blockStack = [];

        // Layer 0: Grass
        blockStack.push({ type: 'grass', level: 0 });

        // Layer -1: Dirt
        blockStack.push({ type: 'dirt', level: -1 });

        // Layers -2 to -5: Stone
        for (let i = 2; i <= 5; i++) {
            blockStack.push({ type: 'stone', level: -i });
        }

        // Layer -6: Void
        blockStack.push({ type: 'void', level: -6 });

        world[x][z] = blockStack;

        // Add all blocks in the stack to the scene, but only make the top one visible initially
        for (let i = 0; i < blockStack.length; i++) {
            const blockData = blockStack[i];
            const geometry = new THREE.BoxGeometry( blockSize, blockSize, blockSize );
            const material = new THREE.MeshStandardMaterial( { color: blockColors[blockData.type] } );
            const cube = new THREE.Mesh( geometry, material );
            cube.position.set( x * blockSize, blockData.level * blockSize, z * blockSize );

            const edges = new THREE.EdgesGeometry( geometry );
            const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
            cube.add( line );

            cube.visible = (i === 0); // Only top block is visible initially

            ground.add( cube );
            blockData.mesh = cube; // Store reference to the mesh
            blockData.originalColor = material.color.getHex(); // Store original color
        }
    }
}
scene.add( ground );

const playerGeometry = new THREE.SphereGeometry( blockSize / 2, 32, 16 );
const playerMaterial = new THREE.MeshStandardMaterial( { color: 0xffff00 } );
const player = new THREE.Mesh( playerGeometry, playerMaterial );
player.position.y = blockSize;
scene.add( player );

// Cat Model
let cat;
let mixer;
const clock = new THREE.Clock();
const loader = new THREE.GLTFLoader();
loader.load( 'minecraft-cat/source/Minecraft Cat.gltf', function ( gltf ) {
    cat = gltf.scene;
    cat.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
    cat.position.set(0, blockSize, 0); // Position on top of a block
    scene.add( cat );

    mixer = new THREE.AnimationMixer( cat );
    if (gltf.animations.length > 0) {
        const action = mixer.clipAction( gltf.animations[ 0 ] );
        action.play();
    }

}, undefined, function ( error ) {
    console.error( error );
} );

const speed = 5;
const keys = {
    w: false, s: false, a: false, d: false,
    arrowleft: false, arrowright: false,
    q: false, r: false
};
window.addEventListener( 'keydown', ( event ) => {
    keys[event.key.toLowerCase()] = true;
    if ( event.key === ' ' ) {
        event.preventDefault();
        mineBlock();
    }
    if ( event.key.toLowerCase() === 'e' ) {
        event.preventDefault();
        toggleInventory();
    }
} );
document.addEventListener( 'keyup', ( event ) => {
    keys[event.key.toLowerCase()] = false;
} );

camera.position.set( gridSize * blockSize / 2, 200, gridSize * blockSize );

// 2D Overlay Scene
const scene2d = new THREE.Scene();
const camera2d = new THREE.OrthographicCamera( 0, window.innerWidth, window.innerHeight, 0, 1, 1000 );
camera2d.position.z = 10;

const hotbar = new THREE.Group();
const hotbarSlots = 9;
const hotbarSlotSize = 80;
const hotbarItems = [];
for ( let i = 0; i < hotbarSlots; i++ ) {
    const geometry = new THREE.PlaneGeometry( hotbarSlotSize, hotbarSlotSize );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
    const slot = new THREE.Mesh( geometry, material );
    slot.position.set( window.innerWidth / 2 - (hotbarSlots * hotbarSlotSize / 2) + i * hotbarSlotSize, window.innerHeight - hotbarSlotSize, 0 );
    hotbar.add( slot );
    hotbarItems.push(null);
}
scene2d.add( hotbar );
scene2d.visible = false; // Inventory is hidden by default

function toggleInventory() {
    scene2d.visible = !scene2d.visible;
}

function mineBlock() {
    // Calculate player's position relative to the ground group
    const playerWorldPosition = new THREE.Vector3();
    player.getWorldPosition(playerWorldPosition);

    const groundInverseMatrix = new THREE.Matrix4();
    groundInverseMatrix.copy(ground.matrixWorld).invert();

    const playerLocalPosition = playerWorldPosition.applyMatrix4(groundInverseMatrix);

    const playerX = Math.round(playerLocalPosition.x / blockSize);
    const playerZ = Math.round(playerLocalPosition.z / blockSize);

    if (world[playerX] && world[playerX][playerZ] && world[playerX][playerZ].length > 0) {
        const minedBlockData = world[playerX][playerZ].shift(); // Remove top block from stack
        minedBlockData.mesh.visible = false; // Make the mined block invisible

        // Reveal the next block in the stack
        if (world[playerX][playerZ].length > 0) {
            const nextBlockData = world[playerX][playerZ][0];
            const geometry = new THREE.BoxGeometry( blockSize, blockSize, blockSize );
            const material = new THREE.MeshStandardMaterial( { color: blockColors[nextBlockData.type] } );
            const cube = new THREE.Mesh( geometry, material );
            cube.position.set( playerX * blockSize, nextBlockData.level * blockSize, playerZ * blockSize );

            const edges = new THREE.EdgesGeometry( geometry );
            const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
            cube.add( line );

            ground.add( cube );
            nextBlockData.mesh = cube; // Store reference to the new mesh
            nextBlockData.originalColor = material.color.getHex(); // Store original color
        }
        addItemToInventory(minedBlockData.type);
    }
}

const maxStackSize = 32;
function addItemToInventory(itemType) {
    let added = false;
    for (let i = 0; i < hotbarSlots; i++) {
        if (hotbarItems[i] && hotbarItems[i].type === itemType && hotbarItems[i].count < maxStackSize) {
            hotbarItems[i].count++;
            updateItemCount(hotbarItems[i]);
            added = true;
            break;
        } else if (!hotbarItems[i]) {
            const itemColor = blockColors[itemType];
            const geometry = new THREE.PlaneGeometry( hotbarSlotSize * 0.8, hotbarSlotSize * 0.8 );
            const material = new THREE.MeshBasicMaterial( { color: itemColor } );
            const itemMesh = new THREE.Mesh( geometry, material );
            itemMesh.position.copy(hotbar.children[i].position);
            hotbar.add(itemMesh);
            hotbarItems[i] = { mesh: itemMesh, type: itemType, count: 1 };
            updateItemCount(hotbarItems[i]);
            added = true;
            break;
        }
    }
}

function updateItemCount(item) {
    if (item.countMesh) {
        item.mesh.remove(item.countMesh);
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    context.fillStyle = 'white';
    context.font = 'Bold 40px Arial';
    context.textAlign = 'right';
    context.textBaseline = 'bottom';
    context.fillText(item.count.toString(), 60, 60);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry( hotbarSlotSize * 0.4, hotbarSlotSize * 0.4 );
    const countMesh = new THREE.Mesh(geometry, material);
    countMesh.position.set(hotbarSlotSize * 0.3, -hotbarSlotSize * 0.3, 0.1); // Position at bottom right
    item.mesh.add(countMesh);
    item.countMesh = countMesh;
}

let highlightedBlock = null;
let cameraAngle = 0;
const cameraDistance = 200;

let catTarget = new THREE.Vector3();
const catSpeed = 1;
const catWalkRadius = 200;

function setCatNewTarget() {
    catTarget.x = (Math.random() - 0.5) * catWalkRadius;
    catTarget.z = (Math.random() - 0.5) * catWalkRadius;
    catTarget.y = blockSize; // Keep cat on top of blocks
}

setCatNewTarget(); // Set initial target

function animate() {
    requestAnimationFrame( animate );

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    // Player movement (WASD only)
    if ( keys['w'] ) {
        player.position.z -= speed;
    }
    if ( keys['s'] ) {
        player.position.z += speed;
    }
    if ( keys['a'] ) {
        player.position.x -= speed;
    }
    if ( keys['d'] ) {
        player.position.x += speed;
    }

    // Map rotation (Arrow keys)
    if ( keys['arrowleft'] ) {
        ground.rotation.y += 0.05;
    }
    if ( keys['arrowright'] ) {
        ground.rotation.y -= 0.05;
    }

    // Camera rotation (Q and R keys)
    if ( keys['q'] ) {
        cameraAngle += 0.05;
    }
    if ( keys['r'] ) {
        cameraAngle -= 0.05;
    }

    // Cat random walk
    if (cat) {
        const distanceToTarget = cat.position.distanceTo(catTarget);
        if (distanceToTarget < catSpeed) {
            setCatNewTarget();
        } else {
            const direction = catTarget.clone().sub(cat.position).normalize();
            cat.position.addScaledVector(direction, catSpeed);
            cat.lookAt(catTarget.x, cat.position.y, catTarget.z);
        }
    }

    // Calculate player's position relative to the ground group
    const playerWorldPosition = new THREE.Vector3();
    player.getWorldPosition(playerWorldPosition);

    const groundInverseMatrix = new THREE.Matrix4();
    groundInverseMatrix.copy(ground.matrixWorld).invert();

    const playerLocalPosition = playerWorldPosition.applyMatrix4(groundInverseMatrix);

    const playerGridX = Math.round(playerLocalPosition.x / blockSize);
    const playerGridZ = Math.round(playerLocalPosition.z / blockSize);

    if (world[playerGridX] && world[playerGridX][playerGridZ] && world[playerGridX][playerGridZ].length > 0) {
        const blockUnderPlayer = world[playerGridX][playerGridZ][0]; // Get the top-most block
        player.position.y = (blockUnderPlayer.level * blockSize) + blockSize;

        // Highlight block under player
        if (highlightedBlock && highlightedBlock !== blockUnderPlayer.mesh) {
            // Restore original color of previously highlighted block
            const prevBlockData = world[highlightedBlock.userData.gridX][highlightedBlock.userData.gridZ].find(b => b.mesh === highlightedBlock);
            if (prevBlockData) {
                highlightedBlock.material.color.set(prevBlockData.originalColor);
            }
        }
        if (blockUnderPlayer.mesh !== highlightedBlock) {
            // Store original color and highlight new block
            blockUnderPlayer.mesh.userData.gridX = playerGridX;
            blockUnderPlayer.mesh.userData.gridZ = playerGridZ;
            blockUnderPlayer.mesh.material.color.set(0xffff00); // Highlight color (yellow)
            highlightedBlock = blockUnderPlayer.mesh;
        }
    } else if (highlightedBlock) {
        // No block under player, unhighlight previous block
        const prevBlockData = world[highlightedBlock.userData.gridX][highlightedBlock.userData.gridZ].find(b => b.mesh === highlightedBlock);
        if (prevBlockData) {
            highlightedBlock.material.color.set(prevBlockData.originalColor);
        }
        highlightedBlock = null;
    }

    camera.position.x = player.position.x + cameraDistance * Math.sin(cameraAngle);
    camera.position.z = player.position.z + cameraDistance * Math.cos(cameraAngle);
    camera.lookAt( player.position.x, player.position.y, player.position.z );

    renderer.autoClear = false;
    renderer.clear();
    renderer.render( scene, camera );
    renderer.clearDepth();
    renderer.render( scene2d, camera2d );
}
animate();