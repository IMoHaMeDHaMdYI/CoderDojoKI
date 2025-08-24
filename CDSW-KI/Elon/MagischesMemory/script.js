const gameBoard = document.getElementById('game-board');
const winMessage = document.getElementById('win-message');
const restartButton = document.getElementById('restart-button');

const magicItems = ['\ud83e\uddd9', '\ud83d\udd2e', '\u2728', '\ud83d\udcdc', '\ud83e\udd89', '\ud83d\udd11', '\ud83c\udf0c', '\ud83d\udcda'];
let cards = [...magicItems, ...magicItems];

let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function createBoard() {
    gameBoard.innerHTML = '';
    shuffle(cards);
    cards.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.item = item;

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.textContent = '?';

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        cardBack.textContent = item;

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('is-flipped');

    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    lockBoard = true;
    const [card1, card2] = flippedCards;

    if (card1.dataset.item === card2.dataset.item) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards[0].removeEventListener('click', flipCard);
    flippedCards[1].removeEventListener('click', flipCard);
    matchedPairs++;
    resetBoard();
    if (matchedPairs === magicItems.length) {
        setTimeout(() => winMessage.classList.add('show'), 500);
    }
}

function unflipCards() {
    setTimeout(() => {
        flippedCards[0].classList.remove('is-flipped');
        flippedCards[1].classList.remove('is-flipped');
        resetBoard();
    }, 1200);
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}

function restartGame() {
    winMessage.classList.remove('show');
    matchedPairs = 0;
    createBoard();
}

restartButton.addEventListener('click', restartGame);

createBoard();
