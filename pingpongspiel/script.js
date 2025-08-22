const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.querySelector('.ball');
const player1ScoreElem = document.getElementById('player1-score');
const player2ScoreElem = document.getElementById('player2-score');

let ballX = 292.5;
let ballY = 192.5;
let ballSpeedX = 2;
let ballSpeedY = 2;

let paddle1Y = 150;
let paddle2Y = 150;
const paddleSpeed = 20;

let player1Score = 0;
let player2Score = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
        paddle1Y = Math.max(paddle1Y - paddleSpeed, 0);
    }
    if (e.key === 's') {
        paddle1Y = Math.min(paddle1Y + paddleSpeed, 300);
    }
    if (e.key === 'ArrowUp') {
        paddle2Y = Math.max(paddle2Y - paddleSpeed, 0);
    }
    if (e.key === 'ArrowDown') {
        paddle2Y = Math.min(paddle2Y + paddleSpeed, 300);
    }
});

function resetBall() {
    ballX = 292.5;
    ballY = 192.5;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = 2;
}

function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom walls
    if (ballY <= 0 || ballY >= 385) {
        ballSpeedY = -ballSpeedY;
    }

    // Ball collision with paddles
    if (
        (ballX <= 20 && ballX > 10 && ballY > paddle1Y && ballY < paddle1Y + 100) ||
        (ballX >= 570 && ballX < 580 && ballY > paddle2Y && ballY < paddle2Y + 100)
    ) {
        ballSpeedX = -ballSpeedX;
    }

    // Ball out of bounds (scoring)
    if (ballX < 0) {
        player2Score++;
        player2ScoreElem.textContent = player2Score;
        resetBall();
    } else if (ballX > 600) {
        player1Score++;
        player1ScoreElem.textContent = player1Score;
        resetBall();
    }

    // Update positions
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
    paddle1.style.top = paddle1Y + 'px';
    paddle2.style.top = paddle2Y + 'px';

    requestAnimationFrame(update);
}

update();
