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

let selectedThemeData = null;

async function init() {
    renderThemeGallery();
    
    cancelIntroBtn.addEventListener('click', () => {
        introModal.classList.add('hidden');
    });

    startStoryBtn.addEventListener('click', () => {
        if (selectedThemeData) {
            localStorage.setItem('selected_theme_file', selectedThemeData.file);
            localStorage.removeItem('onceUponATime_state'); // Clear old game state when starting a fresh one
            window.location.href = 'game.html';
        }
    });

    // Handle back button from game
    const restart = new URLSearchParams(window.location.search).get('restart');
    if (restart) {
        localStorage.removeItem('selected_theme_file');
        localStorage.removeItem('onceUponATime_state');
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

init();
