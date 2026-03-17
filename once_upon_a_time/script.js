// Game State
let gameState = {
    theme: null,
    wordDeck: [],
    endingDeck: [],
    hand: [],
    endingCard: null,
    isGameOver: false
};

// DOM Elements
const themeSelector = document.getElementById('theme-selector');
const restartBtn = document.getElementById('restart-btn');
const drawBtn = document.getElementById('draw-btn');
const endGameBtn = document.getElementById('end-game-btn');
const wordCardsContainer = document.getElementById('word-cards');
const endingCardContainer = document.getElementById('ending-card');
const deckCountEl = document.getElementById('deck-count');
const notificationOverlay = document.getElementById('notification-overlay');
const closeNotificationBtn = document.getElementById('close-notification');
const notificationMessage = document.getElementById('notification-message');

// Initialize Game
async function init() {
    loadFromLocalStorage();
    
    themeSelector.addEventListener('change', () => {
        if (confirm('Start a new story with this theme? Progress will be lost.')) {
            startGame();
        } else {
            // Revert selector if cancelled
            themeSelector.value = gameState.themeFile || themeSelector.options[0].value;
        }
    });

    restartBtn.addEventListener('click', () => {
        if (confirm('Restart the story?')) {
            startGame();
        }
    });

    drawBtn.addEventListener('click', drawCard);
    endGameBtn.addEventListener('click', endGame);
    closeNotificationBtn.addEventListener('click', () => {
        notificationOverlay.classList.add('hidden');
        if (gameState.isGameOver) startGame();
    });

    if (!gameState.theme) {
        startGame();
    } else {
        render();
    }
}

// Start/Restart Game
async function startGame() {
    const themeFile = themeSelector.value;
    try {
        const response = await fetch(themeFile);
        const data = await response.json();
        
        gameState = {
            theme: data.theme,
            themeFile: themeFile,
            wordDeck: shuffle([...data.words]),
            endingDeck: shuffle([...data.endings]),
            hand: [],
            endingCard: null,
            isGameOver: false
        };

        // Initial hand: 5 words, 1 ending
        for (let i = 0; i < 5; i++) {
            if (gameState.wordDeck.length > 0) {
                gameState.hand.push(gameState.wordDeck.pop());
            }
        }
        gameState.endingCard = gameState.endingDeck.pop();

        saveToLocalStorage();
        render();
    } catch (error) {
        console.error('Failed to load theme:', error);
        alert('Failed to load story elements. Please check your connection.');
    }
}

// Game Actions
function drawCard() {
    if (gameState.wordDeck.length > 0) {
        gameState.hand.push(gameState.wordDeck.pop());
        saveToLocalStorage();
        render();
    } else {
        alert("The deck of tales is empty!");
    }
}

function playCard(index) {
    gameState.hand.splice(index, 1);
    saveToLocalStorage();
    render();
}

function endGame() {
    if (gameState.hand.length === 0) {
        gameState.isGameOver = true;
        showNotification("The End", gameState.endingCard);
    }
}

// Rendering
function render() {
    // Render Hand
    wordCardsContainer.innerHTML = '';
    gameState.hand.forEach((word, index) => {
        const card = createCard(word, 'word-card', () => playCard(index));
        wordCardsContainer.appendChild(card);
    });

    // Render Ending Card
    endingCardContainer.innerHTML = '';
    if (gameState.endingCard) {
        const card = createCard(gameState.endingCard, 'ending-card', null);
        card.classList.add('face-up'); // Ending card is always visible to player
        endingCardContainer.appendChild(card);
    }

    // Update Stats
    deckCountEl.textContent = gameState.wordDeck.length;
    
    // Update Buttons
    endGameBtn.disabled = gameState.hand.length > 0 || gameState.isGameOver;
}

function createCard(content, className, onClick) {
    const card = document.createElement('div');
    card.className = `card ${className} face-up`; // Always face-up for hand deck view
    
    // Add Tooltips
    if (className === 'word-card') {
        card.title = "Click to play this element in your story!";
    } else if (className === 'ending-card') {
        card.title = "Your secret ending. Play this only when your hand is empty!";
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';
    contentDiv.textContent = content;
    
    card.appendChild(contentDiv);
    
    if (onClick) {
        card.addEventListener('click', onClick);
    }
    
    return card;
}

// Helpers
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveToLocalStorage() {
    localStorage.setItem('onceUponATime_state', JSON.stringify(gameState));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('onceUponATime_state');
    if (saved) {
        gameState = JSON.parse(saved);
        themeSelector.value = gameState.themeFile;
    }
}

function showNotification(title, message) {
    document.getElementById('notification-title').textContent = title;
    notificationMessage.textContent = message;
    notificationOverlay.classList.remove('hidden');
}

// Start
init();
