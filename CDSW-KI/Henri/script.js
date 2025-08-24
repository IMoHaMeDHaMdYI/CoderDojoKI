document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const diceButton = document.getElementById('dice-button');
    const diceResult = document.getElementById('dice-result');
    const turnIndicator = document.getElementById('turn-indicator');
    const boardSize = 10;

    const players = [
        {
            id: 1,
            color: 'Blue',
            positionIndex: 0,
            element: null,
            path: [
                { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 },
                { x: 4, y: 8 }, { x: 4, y: 7 }, { x: 3, y: 7 }, { x: 2, y: 7 }, { x: 2, y: 6 },
                { x: 2, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
                { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
                { x: 8, y: 1 }, { x: 8, y: 0 }
            ]
        },
        {
            id: 2,
            color: 'Red',
            positionIndex: 0,
            element: null,
            path: [
                { x: 9, y: 9 }, { x: 9, y: 8 }, { x: 9, y: 7 }, { x: 9, y: 6 }, { x: 9, y: 5 },
                { x: 8, y: 5 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 6, y: 7 },
                { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 },
                { x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 },
                { x: 0, y: 2 }
            ]
        },
        {
            id: 3,
            color: 'Green',
            positionIndex: 0,
            element: null,
            path: [
                { x: 9, y: 0 }, { x: 8, y: 0 }, { x: 7, y: 0 }, { x: 6, y: 0 }, { x: 5, y: 0 },
                { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 7, y: 3 },
                { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 },
                { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 }, { x: 2, y: 7 }, { x: 1, y: 7 },
                { x: 0, y: 8 }
            ]
        },
        {
            id: 4,
            color: 'Yellow',
            positionIndex: 0,
            element: null,
            path: [
                { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 },
                { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 2 },
                { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
                { x: 9, y: 4 }
            ]
        }
    ];

    let currentPlayerIndex = 0;
    let gameWon = false;

    function createBoard() {
        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
        }
    }

    function initializeGame() {
        createBoard();
        players.forEach(player => {
            drawPath(player);
            createPlayer(player);
        });
        updateTurnIndicator();
    }

    function drawPath(player) {
        player.path.forEach((pos, index) => {
            const cellIndex = pos.y * boardSize + pos.x;
            const cell = gameBoard.children[cellIndex];
            if (cell) {
                // A cell can be part of multiple paths, so we don't color it
                // but we do color the house
                if (index === player.path.length - 1) {
                    cell.classList.add(`house-${player.id}`);
                }
            }
        });
    }

    function createPlayer(player) {
        player.element = document.createElement('div');
        player.element.classList.add('player', `player-${player.id}`);
        drawPlayer(player);
    }

    function drawPlayer(player) {
        const currentPathPosition = player.path[player.positionIndex];
        const cellIndex = currentPathPosition.y * boardSize + currentPathPosition.x;
        const cell = gameBoard.children[cellIndex];
        if (cell) {
            cell.appendChild(player.element);
        }
    }

    function updateTurnIndicator() {
        const currentPlayer = players[currentPlayerIndex];
        turnIndicator.textContent = `Spieler ${currentPlayer.id} (${currentPlayer.color}) ist an der Reihe.`;
        turnIndicator.style.color = getComputedStyle(document.querySelector(`.player-${currentPlayer.id}`)).backgroundColor;
    }

    function rollDice() {
        if (gameWon) return;

        const roll = Math.floor(Math.random() * 6) + 1;
        const currentPlayer = players[currentPlayerIndex];
        diceResult.textContent = `Spieler ${currentPlayer.id} hat eine ${roll} gewürfelt!`;

        movePlayer(currentPlayer, roll);
    }

    function movePlayer(player, steps) {
        const newPositionIndex = player.positionIndex + steps;

        if (newPositionIndex < player.path.length) {
            player.positionIndex = newPositionIndex;
        } else {
            player.positionIndex = player.path.length - 1;
        }

        drawPlayer(player);

        if (player.positionIndex === player.path.length - 1) {
            gameWon = true;
            diceResult.innerHTML = `<b>Spieler ${player.id} (${player.color}) hat gewonnen!</b>`;
            turnIndicator.style.display = 'none';
            diceButton.disabled = true;
        } else {
            // Switch to the next player
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            updateTurnIndicator();
        }
    }

    diceButton.addEventListener('click', rollDice);

    initializeGame();
});
