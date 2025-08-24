document.addEventListener('DOMContentLoaded', () => {
    const hungerBar = document.getElementById('hunger-bar');
    const happinessBar = document.getElementById('happiness-bar');
    const cleanlinessBar = document.getElementById('cleanliness-bar');
    const feedButton = document.getElementById('feed-button');
    const playButton = document.getElementById('play-button');
    const batheButton = document.getElementById('bathe-button');
    const catImage = document.getElementById('cat-image');

    let hunger = 100;
    let happiness = 100;
    let cleanliness = 100;

    function updateStats() {
        hungerBar.value = hunger;
        happinessBar.value = happiness;
        cleanlinessBar.value = cleanliness;
    }

    function decreaseStats() {
        hunger = Math.max(0, hunger - 2);
        happiness = Math.max(0, happiness - 1);
        cleanliness = Math.max(0, cleanliness - 0.5);
        updateStats();
    }

    feedButton.addEventListener('click', () => {
        hunger = Math.min(100, hunger + 10);
        updateStats();
    });

    playButton.addEventListener('click', () => {
        happiness = Math.min(100, happiness + 10);
        updateStats();
    });

    batheButton.addEventListener('click', () => {
        cleanliness = Math.min(100, cleanliness + 15);
        updateStats();
    });

    setInterval(decreaseStats, 1000);

    updateStats();
});