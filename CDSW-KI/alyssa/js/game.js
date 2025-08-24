document.addEventListener('DOMContentLoaded', () => {
    initMap();
    player.init();

    // Add a default creature to player inventory for testing battles
    player.addToInventory(new Creature('Starter', 70, 12, 0, ''));

    document.addEventListener('keydown', (e) => {
        let moved = false;
        switch (e.key) {
            case 'ArrowUp':
                moved = player.move(0, -1);
                break;
            case 'ArrowDown':
                moved = player.move(0, 1);
                break;
            case 'ArrowLeft':
                moved = player.move(-1, 0);
                break;
            case 'ArrowRight':
                moved = player.move(1, 0);
                break;
            case 'i': // 'i' for inventory
                toggleInventory();
                break;
        }

        if (moved) {
            // Random encounter chance after each move
            if (Math.random() < 0.2) { // 20% chance of encounter
                startBattle(getRandomCreature());
            }
        }
    });

    // Inventory functionality
    const inventoryContainer = document.getElementById('inventory-container');
    const creatureList = document.getElementById('creature-list');
    const closeInventoryButton = document.getElementById('close-inventory');

    function toggleInventory() {
        if (inventoryContainer.style.display === 'none') {
            inventoryContainer.style.display = 'flex';
            updateInventoryUI();
        } else {
            inventoryContainer.style.display = 'none';
        }
    }

    function updateInventoryUI() {
        creatureList.innerHTML = '';
        if (player.inventory.length === 0) {
            creatureList.innerHTML = '<p>No creatures yet!</p>';
            return;
        }
        player.inventory.forEach(creature => {
            const listItem = document.createElement('li');
            listItem.textContent = `${creature.name} (HP: ${creature.hp}/${creature.maxHp})`;
            creatureList.appendChild(listItem);
        });
    }

    closeInventoryButton.addEventListener('click', toggleInventory);
});
