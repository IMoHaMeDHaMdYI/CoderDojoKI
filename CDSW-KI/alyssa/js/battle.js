let currentWildCreature = null;
let playerCreature = null; // For now, player uses a default creature

const battleContainer = document.getElementById('battle-container');
const mapContainer = document.getElementById('map-container');
const battleLog = document.getElementById('battle-log');
const playerCreatureName = document.getElementById('player-creature-name');
const playerCreatureHp = document.getElementById('player-creature-hp');
const wildCreatureName = document.getElementById('wild-creature-name');
const wildCreatureHp = document.getElementById('wild-creature-hp');
const attackButton = document.getElementById('attack-button');
const catchButton = document.getElementById('catch-button');
const runButton = document.getElementById('run-button');

function logBattleMessage(message) {
    battleLog.innerHTML += `<p>${message}</p>`;
    battleLog.scrollTop = battleLog.scrollHeight; // Auto-scroll to bottom
}

function updateBattleUI() {
    playerCreatureName.textContent = playerCreature.name;
    playerCreatureHp.textContent = `${playerCreature.hp}/${playerCreature.maxHp}`;
    wildCreatureName.textContent = currentWildCreature.name;
    wildCreatureHp.textContent = `${currentWildCreature.hp}/${currentWildCreature.maxHp}`;
}

function startBattle(wildCreature) {
    currentWildCreature = wildCreature;
    // For simplicity, player always uses the first creature in inventory, or a default one
    playerCreature = player.inventory.length > 0 ? player.inventory[0] : new Creature('Hero', 70, 12, 0, ''); // Default player creature

    mapContainer.style.display = 'none';
    battleContainer.style.display = 'flex';
    battleLog.innerHTML = ''; // Clear previous logs

    logBattleMessage(`A wild ${currentWildCreature.name} appeared!`);
    updateBattleUI();
}

function endBattle() {
    battleContainer.style.display = 'none';
    mapContainer.style.display = 'grid';
    // Reset creature HP if battle ended without fainted
    if (playerCreature.hp <= 0) {
        logBattleMessage(`${playerCreature.name} fainted! You blacked out.`);
        // Optionally, move player to a safe spot or heal
    }
    if (currentWildCreature.hp <= 0 && !currentWildCreature.isCaught) {
        logBattleMessage(`${currentWildCreature.name} fainted!`);
    }
    currentWildCreature = null;
    playerCreature = null;
}

function playerAttack() {
    const damage = playerCreature.attack;
    currentWildCreature.takeDamage(damage);
    logBattleMessage(`${playerCreature.name} attacked ${currentWildCreature.name} for ${damage} damage!`);
    updateBattleUI();

    if (currentWildCreature.isFainted()) {
        logBattleMessage(`${currentWildCreature.name} fainted!`);
        endBattle();
    } else {
        wildCreatureAttack();
    }
}

function wildCreatureAttack() {
    const damage = currentWildCreature.attack;
    playerCreature.takeDamage(damage);
    logBattleMessage(`${currentWildCreature.name} attacked ${playerCreature.name} for ${damage} damage!`);
    updateBattleUI();

    if (playerCreature.isFainted()) {
        logBattleMessage(`${playerCreature.name} fainted!`);
        endBattle();
    }
}

function tryCatchCreature() {
    const catchChance = currentWildCreature.catchRate * (1 - (currentWildCreature.hp / currentWildCreature.maxHp));
    logBattleMessage(`You try to catch ${currentWildCreature.name}...`);

    if (Math.random() < catchChance) {
        logBattleMessage(`You caught ${currentWildCreature.name}!`);
        player.addToInventory(currentWildCreature);
        currentWildCreature.isCaught = true; // Mark as caught to prevent fainted message
        endBattle();
    } else {
        logBattleMessage(`${currentWildCreature.name} broke free!`);
        wildCreatureAttack(); // Wild creature gets a free attack
    }
}

// Event Listeners for Battle Actions
attackButton.addEventListener('click', playerAttack);
catchButton.addEventListener('click', tryCatchCreature);
runButton.addEventListener('click', () => {
    logBattleMessage('You ran away!');
    endBattle();
});
