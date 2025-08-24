const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

const gridSize = 20;
const numOpponents = 11;
const numFoods = 64;
const frameRate = 15;
let frameCount = 0;
let foodInterval;

let snakes = [];
let foods = [];
let eliminatedSnakes = [];
let gameOver = false;
let winner = null;
let countdown = 3;
let gameStarted = false;

function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    // Avoid red and orange
    if (color.substring(1, 3) === 'FF' && color.substring(3, 5) === '00') {
        return getRandomColor();
    }
    if (color.substring(1, 3) === 'FF' && color.substring(3, 5) === 'A5') {
        return getRandomColor();
    }
    return color;
}

function generateNewFood() {
    foods.push(getRandomPosition());
}

function startGame() {
    snakes = [];
    foods = [];
    eliminatedSnakes = [];
    gameOver = false;
    winner = null;
    countdown = 3;
    gameStarted = false;
    frameCount = 0;
    clearInterval(foodInterval);

    // Create player snake
    snakes.push({ body: [getRandomPosition()], direction: 'right', isPlayer: true, name: 'Player', color: 'orange' });

    // Create AI snakes
    for (let i = 0; i < numOpponents; i++) {
        snakes.push({ body: [getRandomPosition()], direction: 'left', isPlayer: false, name: `Opponent ${i + 1}`, color: getRandomColor() });
    }

    // Create food
    for (let i = 0; i < numFoods; i++) {
        foods.push(getRandomPosition());
    }

    countdownLoop();
}

restartButton.addEventListener('click', startGame);

function countdownLoop() {
    if (countdown > 0) {
        draw();
        ctx.fillStyle = 'white';
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
        countdown--;
        setTimeout(countdownLoop, 1000);
    } else {
        gameStarted = true;
        foodInterval = setInterval(generateNewFood, 5000);
        gameLoop();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snakes
    for (const snake of snakes) {
        ctx.fillStyle = snake.color;
        for (const segment of snake.body) {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    }

    // Draw food
    ctx.fillStyle = 'red';
    for (const food of foods) {
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }
}

function updateAI(snake) {
    const head = snake.body[0];
    let closestFood = null;
    let minDistance = Infinity;

    for (const food of foods) {
        const distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
        if (distance < minDistance) {
            minDistance = distance;
            closestFood = food;
        }
    }

    if (closestFood) {
        if (head.x < closestFood.x && snake.direction !== 'left') {
            snake.direction = 'right';
        } else if (head.x > closestFood.x && snake.direction !== 'right') {
            snake.direction = 'left';
        } else if (head.y < closestFood.y && snake.direction !== 'up') {
            snake.direction = 'down';
        } else if (head.y > closestFood.y && snake.direction !== 'down') {
            snake.direction = 'up';
        }
    }
}

function update() {
    if (gameOver || !gameStarted) return;

    const activeSnakes = [];

    for (let i = 0; i < snakes.length; i++) {
        const snake = snakes[i];
        if (!snake.isPlayer) {
            updateAI(snake);
        }

        const head = { x: snake.body[0].x, y: snake.body[0].y };

        switch (snake.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
            eliminatedSnakes.unshift(snake);
            for (let k = 0; k < snake.body.length; k++) {
                foods.push(snake.body[k]);
            }
            continue; // Snake dies
        }

        // Collision with other snakes
        let otherCollision = false;
        for (let j = 0; j < snakes.length; j++) {
            if (i === j) continue;
            const otherSnake = snakes[j];
            for (const segment of otherSnake.body) {
                if (head.x === segment.x && head.y === segment.y) {
                    otherCollision = true;
                    break;
                }
            }
            if (otherCollision) {
                eliminatedSnakes.unshift(snake);
                for (let k = 0; k < snake.body.length; k++) {
                    foods.push(snake.body[k]);
                }
                break;
            }
        }
        if (otherCollision) {
            continue; // Snake dies
        }

        snake.body.unshift(head);

        let ateFood = false;
        for (let j = 0; j < foods.length; j++) {
            if (head.x === foods[j].x && head.y === foods[j].y) {
                ateFood = true;
                foods.splice(j, 1);
                break;
            }
        }

        if (!ateFood) {
            snake.body.pop();
        }

        activeSnakes.push(snake);
    }

    snakes = activeSnakes;

    if (snakes.length <= 1) {
        gameOver = true;
        if (snakes.length === 1) {
            winner = snakes[0];
        }
    }
}

function gameLoop() {
    if (gameOver) {
        clearInterval(foodInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, 100);

        ctx.font = '20px Arial';
        let rank = 1;
        if (winner) {
            ctx.fillText(`${rank}. ${winner.name}`, canvas.width / 2, 150);
            rank++;
        }

        for (const snake of eliminatedSnakes) {
            ctx.fillText(`${rank}. ${snake.name}`, canvas.width / 2, 150 + (rank -1) * 30);
            rank++;
        }
        return;
    }

    requestAnimationFrame(gameLoop);

    frameCount++;
    if (frameCount < frameRate) {
        return;
    }

    frameCount = 0;
    update();
    draw();
}

document.addEventListener('keydown', e => {
    const playerSnake = snakes.find(s => s.isPlayer);
    if (playerSnake) {
        switch (e.key) {
            case 'ArrowUp':
                if (playerSnake.direction !== 'down') playerSnake.direction = 'up';
                break;
            case 'ArrowDown':
                if (playerSnake.direction !== 'up') playerSnake.direction = 'down';
                break;
            case 'ArrowLeft':
                if (playerSnake.direction !== 'right') playerSnake.direction = 'left';
                break;
            case 'ArrowRight':
                if (playerSnake.direction !== 'left') playerSnake.direction = 'right';
                break;
        }
    }
});

startGame();