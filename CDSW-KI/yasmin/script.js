const gameBoard = document.getElementById('gameBoard');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restartBtn');

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

let boardState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'O'; // Human starts as O
let humanPlayer = 'O'; // Human is always O
let gameActive = true;

function initializeGame() {
    gameBoard.innerHTML = '';
    boardState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = humanPlayer; // Human starts
    gameActive = true;
    statusDisplay.textContent = `Spieler ${humanPlayer} ist am Zug`;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    // Only allow human move if it's human's turn and cell is empty
    if (currentPlayer !== humanPlayer || boardState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    updateCell(clickedCell, clickedCellIndex);
    checkForWinner();

    // If game is still active, let AI make a move
    if (gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

function updateCell(cell, index) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    // Set color based on player
    cell.style.color = (currentPlayer === 'X') ? '#0000FF' : '#FFD700'; // Blue for X, Gold for O
}

function changePlayer() {
    currentPlayer = (currentPlayer === 'X') ? humanPlayer : 'X';
    statusDisplay.textContent = `Spieler ${currentPlayer} ist am Zug`;
}

function checkForWinner() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = boardState[winCondition[0]];
        let b = boardState[winCondition[1]];
        let c = boardState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.textContent = `Spieler ${currentPlayer} hat gewonnen!`;
        gameActive = false;
        return;
    }

    if (!boardState.includes('')) {
        statusDisplay.textContent = 'Unentschieden!';
        gameActive = false;
        return;
    }

    // Only change player if game is still active and no winner/draw
    if (gameActive) {
        changePlayer();
    }
}

function getEmptyCells() {
    return boardState.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
}

function checkWin(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

function makeAIMove() {
    if (!gameActive) return;

    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) return; // No moves left

    let bestMove = -1;

    // 1. Check for winning move for AI (X)
    for (let i = 0; i < emptyCells.length; i++) {
        const move = emptyCells[i];
        boardState[move] = 'X';
        if (checkWin(boardState, 'X')) {
            bestMove = move;
            boardState[move] = ''; // Undo move
            break;
        }
        boardState[move] = ''; // Undo move
    }

    // 2. Check for blocking move for Human (O)
    if (bestMove === -1) {
        for (let i = 0; i < emptyCells.length; i++) {
            const move = emptyCells[i];
            boardState[move] = humanPlayer;
            if (checkWin(boardState, humanPlayer)) {
                bestMove = move;
                boardState[move] = ''; // Undo move
                break;
            }
            boardState[move] = ''; // Undo move
        }
    }

    // 3. Take center
    if (bestMove === -1 && boardState[4] === '') {
        bestMove = 4;
    }

    // 4. Take opposite corner if human is in a corner
    if (bestMove === -1) {
        const corners = [0, 2, 6, 8];
        const oppositeCorners = [[0, 8], [2, 6], [6, 2], [8, 0]];
        for (const [corner1, corner2] of oppositeCorners) {
            if (boardState[corner1] === humanPlayer && boardState[corner2] === '' && emptyCells.includes(corner2)) {
                bestMove = corner2;
                break;
            }
        }
    }

    // 5. Take any empty corner
    if (bestMove === -1) {
        const corners = [0, 2, 6, 8];
        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            if (boardState[corner] === '' && emptyCells.includes(corner)) {
                bestMove = corner;
                break;
            }
        }
    }

    // 6. Take any empty side
    if (bestMove === -1) {
        const sides = [1, 3, 5, 7];
        for (let i = 0; i < sides.length; i++) {
            const side = sides[i];
            if (boardState[side] === '' && emptyCells.includes(side)) {
                bestMove = side;
                break;
            }
        }
    }

    // If no strategic move, pick a random empty cell
    if (bestMove === -1) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        bestMove = emptyCells[randomIndex];
    }

    // Perform the AI move
    const cellToClick = gameBoard.children[bestMove];
    currentPlayer = 'X'; // Ensure current player is X for AI move
    updateCell(cellToClick, bestMove);
    checkForWinner();
}

restartButton.addEventListener('click', initializeGame);

// Start the game for the first time
initializeGame();