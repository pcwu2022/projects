const themes = [
    { name: "Fantasy Realm", file: "data/fantasy.json" },
    { name: "Space Odyssey", file: "data/space_wars.json" },
    { name: "Sands of Egypt", file: "data/ancient_egypt.json" },
    { name: "Cyberpunk City", file: "data/cyberpunk.json" },
    { name: "Wild West", file: "data/western.json" },
    { name: "Pirate Adventure", file: "data/pirate.json" },
    { name: "Mystery Noir", file: "data/mystery.json" },
    { name: "Zombie Apocalypse", file: "data/zombie.json" },
    { name: "Dystopian Future", file: "data/dystopian.json" },
    { name: "Romantic Comedy", file: "data/romance.json" },
    { name: "Horror Night", file: "data/horror.json" },
    { name: "The Crimson Strait", file: "data/strait.json" },
];

const themeGallery = document.getElementById('theme-gallery');
const introModal = document.getElementById('intro-modal');
const introTitle = document.getElementById('intro-title');
const introDescription = document.getElementById('intro-description');
const introImageContainer = document.getElementById('intro-image-container');
const startStoryBtn = document.getElementById('start-story-btn');
const cancelIntroBtn = document.getElementById('cancel-intro');

// Music Elements
const audioElement = document.getElementById('background-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const volumeSlider = document.getElementById('volume-slider');

// Music State
let musicState = {
    enabled: true,
    volume: 0.5
};

let selectedThemeData = null;

async function init() {
    loadMusicSettings();
    renderThemeGallery();
    
    // Music Controls
    musicToggleBtn.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', changeVolume);
    
    cancelIntroBtn.addEventListener('click', () => {
        introModal.classList.add('hidden');
    });

    startStoryBtn.addEventListener('click', () => {
        if (selectedThemeData) {
            localStorage.setItem('selected_theme_file', selectedThemeData.file);
            localStorage.removeItem('onceUponATime_state'); // Clear old game state when starting a fresh one
            // Pass volume to game
            localStorage.setItem('musicVolume', musicState.volume.toString());
            window.location.href = 'game.html';
        }
    });

    // Handle back button from game
    const restart = new URLSearchParams(window.location.search).get('restart');
    if (restart) {
        localStorage.removeItem('selected_theme_file');
        localStorage.removeItem('onceUponATime_state');
    }
    
    // Start lobby music
    playMusic();
    
    // Handle autoplay policy: if music fails to play on load, resume on first user interaction
    document.addEventListener('click', resumeAudioPlayback, { once: true });
}

function resumeAudioPlayback() {
    if (musicState.enabled && audioElement.paused && audioElement.src) {
        audioElement.play().catch(() => {
            console.log('Could not resume music');
        });
    }
}

async function renderThemeGallery() {
    themeGallery.innerHTML = '';
    
    for (const theme of themes) {
        try {
            const response = await fetch(theme.file);
            const data = await response.json();
            
            const card = document.createElement('div');
            card.className = 'theme-card';
            card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${data.image})`;
            
            card.innerHTML = `
                <div class="theme-card-content">
                    <h3>${data.theme}</h3>
                </div>
            `;
            
            card.addEventListener('click', () => showIntro(data, theme.file));
            themeGallery.appendChild(card);
        } catch (e) {
            console.error("Failed to load theme card data", e);
        }
    }
}

function showIntro(data, file) {
    selectedThemeData = { ...data, file: file };
    introTitle.textContent = data.theme;
    introDescription.textContent = data.description;
    introImageContainer.style.backgroundImage = `url(${data.image})`;
    introModal.classList.remove('hidden');
}

// Music Controls
function playMusic() {
    if (musicState.enabled) {
        audioElement.src = 'audio/lobby.mp3';
        audioElement.volume = musicState.volume;
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
    musicState.enabled = !musicState.enabled;
    updateMusicUI();
    
    if (musicState.enabled) {
        audioElement.volume = musicState.volume;
        audioElement.play().catch(error => {
            console.log('Could not play music:', error);
        });
    } else {
        audioElement.pause();
    }
    
    saveMusicSettings();
}

function changeVolume(event) {
    musicState.volume = event.target.value / 100;
    audioElement.volume = musicState.volume;
    saveMusicSettings();
}

function updateMusicUI() {
    if (musicState.enabled) {
        musicToggleBtn.textContent = '🔊';
        musicToggleBtn.classList.remove('muted');
    } else {
        musicToggleBtn.textContent = '🔇';
        musicToggleBtn.classList.add('muted');
    }
}

function saveMusicSettings() {
    localStorage.setItem('musicEnabled', musicState.enabled.toString());
    localStorage.setItem('musicVolume', musicState.volume.toString());
}

function loadMusicSettings() {
    const savedEnabled = localStorage.getItem('musicEnabled');
    const savedVolume = localStorage.getItem('musicVolume');
    
    if (savedEnabled !== null) {
        musicState.enabled = savedEnabled === 'true';
    }
    if (savedVolume !== null) {
        musicState.volume = parseFloat(savedVolume);
    }
    
    volumeSlider.value = musicState.volume * 100;
    updateMusicUI();
}

init();
