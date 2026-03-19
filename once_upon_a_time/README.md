# Once Upon a Time - Storyteller's Gate

A collaborative storytelling card game where players work together to weave epic tales across multiple magical realms. This web application manages your personal deck of story elements while you and your friends create unforgettable narratives together.

## About the Game

**Once Upon a Time** is a creative storytelling game inspired by the classic card game of the same name. Unlike traditional digital games, this is a **framework for imagination** — the game provides you with story elements (characters, objects, and events), but the actual storytelling happens through conversation with your friends.

Each player builds their own narrative arc by playing story cards from their hand, claiming the role of Storyteller and narrating how their cards fit into the unfolding tale. The first player to use all their story cards and deliver a satisfying ending wins the game.

## Features

- **12 Immersive Themes**: Choose from Fantasy, Space, Ancient Egypt, Cyberpunk, Western, Pirates, Mystery, Zombies, Dystopian, Romance, Horror, and more
- **Theme-Specific Story Elements**: Each theme has 150+ unique words and 13+ ending phrases tailored to its setting
- **Persistent Game State**: Your hand and deck are automatically saved to your browser, allowing you to pause and resume games
- **Multi-Device Multiplayer**: Play with friends on separate devices while maintaining individual hands
- **Responsive Design**: Works seamlessly on phones, tablets, and desktops

## Game Rules

### Setup
1. All players select the **same theme** to keep the story cohesive
2. Each player draws **5 starting cards** (story elements) and **1 ending card** (their "Happy Ever After")
3. Decide who starts as the **Storyteller**

### Gameplay
1. **The Storyteller** narrates a tale, weaving in elements from the cards in their hand
2. When the Storyteller mentions something from one of their cards (e.g., "The King grew angry"), they **click that card to play it**
3. **Other Players** listen carefully. If they hear something that matches a card in _their_ hand, they can **interrupt** and become the new Storyteller
4. When interrupted, the previous Storyteller typically **draws a new card** from their deck as punishment
5. The new Storyteller continues the story from where the previous one left off

### Winning
- Your goal is to **play all your storytelling cards** from your hand
- Once your hand is empty (all cards played), you can trigger the **End the Story** button
- You then deliver your **Ending card** to conclude the tale with a satisfying finale
- The first player to finish their ending wins the game!

### Drawing Cards
- Use the **Draw Card** button anytime to pull from your personal deck
- This is useful if you get stuck, run out of playable cards, or after being interrupted
- You can only end the game once your hand is completely empty

## How to Play

### For First-Time Players
1. Open the app and browse the available themes
2. Click a theme to read its description and view a preview image
3. Click "Start Your Story" to begin
4. You'll see your starting hand of 5 cards and 1 ending card
5. Read the "How to Play" guide for detailed rules

### With Friends
- **Each player** opens the app on their own device
- **All players select the same theme** to maintain story consistency
- **Designate who starts** as the Storyteller
- **Take turns narrating** and interrupting based on the rules above
- **No central server needed** — each device manages its own hand independently

### Game Controls
- **Draw Card**: Add a new card from your personal deck
- **Play Card**: Click a card in your hand when you narrate it
- **End the Story**: Available only when your hand is empty — click to proceed to your ending
- **Return to Gallery**: Go back to select a different theme

## Themes & Settings

Choose from these richly detailed worlds:

- **Fantasy Realm** - Knights, dragons, castles, and magic
- **Space Odyssey** - Starships, aliens, and cosmic adventures
- **Sands of Egypt** - Pharaohs, pyramids, and ancient mysteries
- **Cyberpunk City** - Neon lights, hackers, and futuristic rebellion
- **Wild West** - Cowboys, outlaws, and frontier justice
- **Pirate Adventure** - Treasure, ships, and high seas
- **Mystery Noir** - Detectives, secrets, and dark intrigue
- **Zombie Apocalypse** - Survival, undead, and human drama
- **Dystopian Future** - Oppression, resistance, and hope
- **Romantic Comedy** - Love, misunderstandings, and happy endings
- **Horror Night** - Fear, darkness, and supernatural dread
- **The Crimson Strait** - A unique world waiting to be explored

## Technical Details

### Browser Storage
- All game progress is saved to your browser's **localStorage**
- Your hand, deck, and current theme are preserved even if you close the tab
- Starting a new game creates a fresh deck
- Returning to a previous theme resumes your last game in that world

### Supported Browsers
- Chrome/Chromium (60+)
- Firefox (55+)
- Safari (11+)
- Edge (79+)

### Data Structure
Each theme JSON file contains:
- **theme**: The name of the world
- **description**: Atmospheric introduction text
- **image**: A beautiful intro image
- **words**: 150+ story elements relevant to the theme
- **endings**: 13+ thematic ending phrases

## Tips for Great Storytelling

- **Be Creative**: Use the words as inspiration, not literal script — weave them naturally into your narrative
- **Stay in Character**: Adopt the tone and style of your chosen theme
- **Listen Carefully**: Pay attention to other players' cards to find interruption opportunities
- **Build on the Story**: When you become Storyteller, continue logically from where the previous narrator left off
- **Make Bold Moves**: Don't be afraid to take your story in unexpected directions
- **Embrace Chaos**: Interruptions and surprises make for the most memorable tales

## Installation & Usage

### No Installation Required
This is a pure HTML/CSS/JavaScript web application. Simply:
1. Open `index.html` in your browser
2. Start exploring themes and telling stories

### Local Testing
To run locally:
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Project Structure

```
once_upon_a_time/
├── index.html          # Landing page & theme gallery
├── game.html           # Main game interface
├── help.html           # Rules and FAQ
├── index.css           # Styling for all pages
├── landing.js          # Theme selection logic
├── script.js           # Game mechanics & state management
├── assets/             # Images and visual assets
└── data/               # Theme JSON files
    ├── fantasy.json
    ├── space_wars.json
    ├── ancient_egypt.json
    ├── cyberpunk.json
    ├── western.json
    ├── pirate.json
    ├── mystery.json
    ├── zombie.json
    ├── dystopian.json
    ├── romance.json
    ├── horror.json
    └── strait.json
```

## Credits

Created by [Po-Chun Wu](https://pcwu2022.github.io)

## License & Inspiration

This digital implementation is inspired by the tabletop card game "Once Upon a Time," but reimagined as a single-player deck management tool for multiplayer storytelling. The game emphasizes collaborative narrative over competitive mechanics.

---

**May your tales be legendary.** ✨
