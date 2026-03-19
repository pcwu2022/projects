// Game State
let gameState = {
    theme: null,
    wordDeck: [],
    endingDeck: [],
    hand: [],
    endingCard: null,
    isGameOver: false,
    music: '',
    musicEnabled: true,
    musicVolume: 0.5
};

// DOM Elements
const drawBtn = document.getElementById('draw-btn');
const endGameBtn = document.getElementById('end-game-btn');
const wordCardsContainer = document.getElementById('word-cards');
const endingCardContainer = document.getElementById('ending-card');
const deckCountEl = document.getElementById('deck-count');
const gameTitleEl = document.getElementById('game-title');

// Music Elements
const audioElement = document.getElementById('background-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const volumeSlider = document.getElementById('volume-slider');

// Initialize Game
async function init() {
    loadFromLocalStorage();
    
    drawBtn.addEventListener('click', drawCard);
    endGameBtn.addEventListener('click', endGame);
    musicToggleBtn.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', changeVolume);
    
    document.getElementById('back-to-home').addEventListener('click', () => {
        stopMusic();
        window.location.href = 'index.html?restart=true';
    });

    const selectedFile = localStorage.getItem('selected_theme_file');
    
    if (!gameState.theme && selectedFile) {
        await startGame(selectedFile);
    } else if (!gameState.theme) {
        // No theme selected, go back to landing
        window.location.href = 'index.html';
    } else {
        render();
        if (gameState.music) {
            playMusic();
        }
    }
}

// Start/Restart Game
async function startGame(themeFile) {
    try {
        const response = await fetch(themeFile);
        const data = await response.json();
        
        gameState = {
            theme: data.theme,
            themeFile: themeFile,
            description: data.description,
            image: data.image,
            music: data.music || '',
            musicEnabled: true,
            musicVolume: 0.5,
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
        playMusic();
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
        saveToLocalStorage();
        
        const overlay = document.getElementById('ending-overlay');
        const img = document.getElementById('ending-image');
        const phrase = document.getElementById('ending-phrase');
        
        img.style.backgroundImage = `url(${gameState.image})`;
        phrase.textContent = gameState.endingCard;
        overlay.classList.remove('hidden');
    }
}

// Rendering
function render() {
    // Update Title & Background
    if (gameState.theme) {
        gameTitleEl.textContent = gameState.theme;
        if (gameState.image) {
            document.body.style.backgroundImage = `url(${gameState.image})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundPosition = 'center';
        }
    }

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
    
    // Update Music UI
    volumeSlider.value = gameState.musicVolume * 100;
    updateMusicUI();
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

// Music Controls
function playMusic() {
    if (gameState.music && gameState.musicEnabled) {
        audioElement.src = gameState.music;
        audioElement.volume = gameState.musicVolume;
        audioElement.play().catch(error => {
            console.log('Could not play music:', error);
        });
    }
}

function stopMusic() {
    audioElement.pause();
    audioElement.src = '';
}

function toggleMusic() {
    gameState.musicEnabled = !gameState.musicEnabled;
    updateMusicUI();
    
    if (gameState.musicEnabled && gameState.music) {
        audioElement.volume = gameState.musicVolume;
        audioElement.play().catch(error => {
            console.log('Could not play music:', error);
        });
    } else {
        audioElement.pause();
    }
    
    saveToLocalStorage();
}

function changeVolume(event) {
    gameState.musicVolume = event.target.value / 100;
    audioElement.volume = gameState.musicVolume;
    saveToLocalStorage();
}

function updateMusicUI() {
    if (gameState.musicEnabled) {
        musicToggleBtn.textContent = '🔊';
        musicToggleBtn.classList.remove('muted');
    } else {
        musicToggleBtn.textContent = '🔇';
        musicToggleBtn.classList.add('muted');
    }
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
    }
}

function showNotification(title, message) {
    document.getElementById('notification-title').textContent = title;
    notificationMessage.textContent = message;
    notificationOverlay.classList.remove('hidden');
}

// Start
init();
