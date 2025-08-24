const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const player1ScoreElem = document.getElementById('player1-score');
const player2ScoreElem = document.getElementById('player2-score');

// Spiel-Konstanten
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 7;
const INITIAL_BALL_SPEED = 5;
const WINNING_SCORE = 20; // Angepasst für 5 Bälle
const BALL_COUNT = 5;

// Teams definieren (mit Startpositionen)
const team1_start = [
    { x: canvas.width / 4, y: canvas.height / 2 - paddleHeight / 2 },
    { x: 30, y: canvas.height / 2 - paddleHeight / 2 }
];
const team2_start = [
    { x: canvas.width * 3 / 4 - paddleWidth, y: canvas.height / 2 - paddleHeight / 2 },
    { x: canvas.width - paddleWidth - 30, y: canvas.height / 2 - paddleHeight / 2 }
];

let team1, team2, balls, player1Score, player2Score, gameOver;

function createBall() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: ballRadius,
        speedX: (Math.random() > 0.5 ? 1 : -1) * (INITIAL_BALL_SPEED * (Math.random() * 0.5 + 0.75)),
        speedY: (Math.random() > 0.5 ? 1 : -1) * (INITIAL_BALL_SPEED * (Math.random() * 0.5 + 0.75)),
        color: '#FFF'
    };
}

function initializeGame() {
    team1 = [
        { ...team1_start[0], width: paddleWidth, height: paddleHeight, color: '#FFF', speed: 8 },
        { ...team1_start[1], width: paddleWidth, height: paddleHeight, color: '#AAA', speed: 5 }
    ];
    team2 = [
        { ...team2_start[0], width: paddleWidth, height: paddleHeight, color: '#FFF', speed: 8 },
        { ...team2_start[1], width: paddleWidth, height: paddleHeight, color: '#AAA', speed: 12 } // Hohe Geschwindigkeit für Abwehr
    ];
    
    balls = [];
    for(let i = 0; i < BALL_COUNT; i++) {
        balls.push(createBall());
    }

    player1Score = 0;
    player2Score = 0;
    gameOver = false;
    updateScoreboard();
}

// Steuerung
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });
canvas.addEventListener('click', () => {
    if (gameOver) {
        initializeGame();
        gameLoop();
    }
});

function moveHumanPlayers() {
    const human1 = team1[0];
    const human2 = team2[0];
    if (keys['w'] && human1.y > 0) human1.y -= human1.speed;
    if (keys['s'] && human1.y < canvas.height - human1.height) human1.y += human1.speed;
    if (keys['ArrowUp'] && human2.y > 0) human2.y -= human2.speed;
    if (keys['ArrowDown'] && human2.y < canvas.height - human2.height) human2.y += human2.speed;
}

function moveAiPlayers() {
    // --- KI 1 (links): Folgt dem nächstgelegenen Ball (einfache Logik) ---
    const findClosestBall = (player) => {
        let closest = null;
        let minDistance = Infinity;
        for (const ball of balls) {
            const dist = Math.abs(ball.x - player.x);
            if (dist < minDistance) {
                minDistance = dist;
                closest = ball;
            }
        }
        return closest;
    };
    const ai1 = team1[1];
    const targetBall1 = findClosestBall(ai1);
    if(targetBall1) {
        const center1 = ai1.y + ai1.height / 2;
        if (center1 < targetBall1.y - 10 && ai1.y < canvas.height - ai1.height) ai1.y += ai1.speed;
        else if (center1 > targetBall1.y + 10 && ai1.y > 0) ai1.y -= ai1.speed;
    }

    // --- KI 2 (rechts): Das "Abwehr-Genie" ---
    const ai2 = team2[1];
    let bestThreat = null;
    let minTimeToGoal = Infinity;

    // 1. Finde die unmittelbarste Bedrohung
    for (const ball of balls) {
        // Nur Bälle berücksichtigen, die sich auf das Tor zubewegen
        if (ball.speedX > 0) {
            const distanceX = ai2.x - (ball.x + ball.radius);
            const timeToGoal = distanceX / ball.speedX;

            if (timeToGoal > 0 && timeToGoal < minTimeToGoal) {
                minTimeToGoal = timeToGoal;
                bestThreat = ball;
            }
        }
    }

    // 2. Reagiere auf die Bedrohung oder zentriere dich
    let targetY;
    if (bestThreat) {
        // Berechne den Auftreffpunkt auf der Y-Achse
        const predictedY = bestThreat.y + bestThreat.speedY * minTimeToGoal;
        targetY = predictedY - ai2.height / 2; // Ziel ist die Mitte des Schlägers
    } else {
        // Wenn keine Bedrohung, zentriere den Schläger
        targetY = canvas.height / 2 - ai2.height / 2;
    }

    // 3. Bewege den Schläger zum Ziel (mit hoher Geschwindigkeit)
    if (ai2.y + ai2.height / 2 < targetY + 10) {
        ai2.y += ai2.speed;
    } else if (ai2.y + ai2.height / 2 > targetY - 10) {
        ai2.y -= ai2.speed;
    }

    // Sicherstellen, dass der Schläger im Spielfeld bleibt
    if (ai2.y < 0) ai2.y = 0;
    if (ai2.y > canvas.height - ai2.height) ai2.y = canvas.height - ai2.height;
}


function moveBalls() {
    for (const ball of balls) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.speedY = -ball.speedY;

        if (ball.x + ball.radius > canvas.width) {
            player1Score++;
            updateScoreboard();
            checkWinCondition();
            resetBall(ball);
        } else if (ball.x - ball.radius < 0) {
            player2Score++;
            updateScoreboard();
            checkWinCondition();
            resetBall(ball);
        }

        const allPlayers = [...team1, ...team2];
        for (const player of allPlayers) {
            if (ball.x - ball.radius < player.x + player.width && ball.x + ball.radius > player.x && ball.y > player.y && ball.y < player.y + player.height) {
                ball.speedX = -ball.speedX;
                break;
            }
        }
    }
}

function checkWinCondition() {
    if (!gameOver && (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE)) {
        gameOver = true;
    }
}

function updateScoreboard() {
    player1ScoreElem.textContent = player1Score;
    player2ScoreElem.textContent = player2Score;
}

function resetBall(ball) {
    if (gameOver) return;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
    ball.speedY = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#FFF';
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    drawRect(0, 0, canvas.width, canvas.height, '#006400');
    drawNet();
    for (const player of team1) drawRect(player.x, player.y, player.width, player.height, player.color);
    for (const player of team2) drawRect(player.x, player.y, player.width, player.height, player.color);
    for (const ball of balls) drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function drawGameOver() {
    drawRect(0, 0, canvas.width, canvas.height, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = 'white';
    ctx.font = '50px Courier New';
    ctx.textAlign = 'center';
    const winner = player1Score >= WINNING_SCORE ? 'Spieler 1' : 'Spieler 2';
    ctx.fillText(`${winner} gewinnt!`, canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '30px Courier New';
    ctx.fillText('Klicke zum Neustarten', canvas.width / 2, canvas.height / 2 + 20);
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }
    moveHumanPlayers();
    moveAiPlayers();
    moveBalls();
    drawGame();
    requestAnimationFrame(gameLoop);
}

initializeGame();
gameLoop();
