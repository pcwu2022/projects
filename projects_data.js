/* projects_data.js
   Exposes `window.PROJECTS` as an array of project objects.
   Fields: title, href, image, description, date
   Use placeholders where data is missing.
*/
window.PROJECTS = [
    {
        title: "NTU Food",
        href: "https://pcwu2022.github.io/ntufood",
        image: "images/ntufood.png",
        description: "An app to explore restaurants around NTU campus. Featured on Joeman's YouTube channel.",
        date: "May 2023",
        tag: "No-AI"
    },
    {
        title: "Chinese Chess",
        href: "chess/index.html",
        image: "images/chinese_chess.png",
        description: "A Chinese Chess game that you can play with the computer. The program runs on MiniMax algortihm.",
        date: "July 2020",
        tag: "No-AI"
    },
    {
        title: "Sudoku",
        href: "games/sudoku.html",
        image: "images/sudoku.png",
        description: "A Sudoku game that provides hints while playing. I built this game in 3 hours as a programming challenge.",
        date: "July 2022",
        tag: "No-AI"
    },
    // { 
    //     title: "Games", 
    //     href: "games/game.html", 
    //     image: "images/games.png", 
    //     description: "A collection of small browser games (snake, minesweeper, etc) based on an HTML-based ProcessingJS parser developed by me.", 
    //     date: "2020 - 2024",
    //     tag: "No-AI" 
    // },
    {
        title: "Whiskers",
        href: "https://whiskers-codes.vercel.app/",
        image: "images/whiskers.png",
        description: "A web based IDE for writing Scratch-like code. Designed for students transitioning from blocks to code.",
        date: "February 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "Random Flashcards",
        href: "https://pcwu2022.github.io/vocabulary_flashcards/",
        image: "images/vocabulary.png",
        description: "A vocabulary flashcard app that randomly picks words of your vocabulary level, determined by a small algorithm.",
        date: "January 2025",
        tag: "AI-Enhanced"
    },
    {
        title: "SLEK System",
        href: "https://slek-system.vercel.app/",
        image: "images/slek.png",
        description: "A web-based simulation system to help medical students practice diagnosis and treatment.",
        date: "October 2024",
        tag: "No-AI"
    },
    {
        title: "Acquired Universe",
        href: "https://pcwu2022.github.io/acquired_universe",
        image: "images/acquired_universe.png",
        description: "An interactive time-lapse of every company covered on the Acquired podcast and where its listeners are in the world.",
        date: "March 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "Urban Radius",
        href: "https://urban-radius.vercel.app/",
        image: "images/urban_radius.png",
        description: "A simulation of a calculation method to define a city's borders based on population distribution.",
        date: "June 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "Minesweeper",
        href: "games/minesweeper.html",
        image: "images/minesweeper.png",
        description: "A Minesweeper game built in 2 hours as a programming challenge.",
        date: "May 2022",
        tag: "No-AI"
    },
    {
        title: "Snake",
        href: "games/snake.html",
        image: "images/snake.png",
        description: "A game of Snake that can be played through pressing arrows on the keyboard or buttons on the screen. I built this game in 2 hours as a programming challenge, and it was later used to train an AI model using reinforcement learning.",
        date: "March 2022",
        tag: "No-AI"
    },
    {
        title: "Plonkit Guessr",
        href: "plonkit/index.html",
        image: "images/plonkit.png",
        description: "A Geoguessr training game based on the Plonkit database",
        date: "December 2025",
        tag: "Vibe-Coded"
    },
    {
        title: "Linguist - Guess the Language",
        href: "language/index.html",
        image: "images/language.png",
        description: "A game to test your language recognition skills. Can you guess the language based on a short text sample?",
        date: "March 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "Streetlight",
        href: "https://pcwu2022.github.io/streetlight/",
        image: "images/streetlight.png",
        description: "A memory game to test how well you know the streets around you. Data source: cities in Taiwan",
        date: "June 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "Essay Creator",
        href: "hulan/index.html",
        image: "images/hulan.png",
        description: "A gibberish essay creater invented before ChatGPT.",
        date: "April 2020",
        tag: "No-AI"
    },
    {
        title: "Once Upon a Time",
        href: "once_upon_a_time/index.html",
        image: "images/once_upon_a_time.png",
        description: "A game where you have to complete the story based on the deck of cards. Played by multiple people.",
        date: "March 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "KMAP Solver",
        href: "kmap/index.html",
        image: "images/kmap.png",
        description: "A brute-force Karnaugh Map solver. Type in the minterm expansion and it would output the minterms grouped by minimizing the SOP form.",
        date: "November 2022",
        tag: "No-AI"
    },
    {
        title: "@maps.az",
        href: "https://pcwu2022.github.io/maps.az/",
        image: "images/maps.png",
        description: "A showcase of interactive maps created for my instagram account @maps.az.",
        date: "December 2025",
        tag: "Vibe-Coded"
    },
    {
        title: "Taiwan Railway Memory Game",
        href: "tra_names/index.html",
        image: "images/tra_names.png",
        description: "How many TRA stations can you name?",
        date: "September 2025",
        tag: "Vibe-Coded"
    },
    {
        title: "Taipei Metro Memory Game",
        href: "taipei_metro_memory/index.html",
        image: "images/taipei_metro_memory.png",
        description: "A memory game to test how well you know the Taipei Metro system.",
        date: "March 2026",
        tag: "Vibe-Coded"
    },
    {
        title: "Taipei Metro Level",
        href: "taipei_metro_level/index.html",
        image: "images/taipei_metro_level.png",
        description: "How many stations have you been to in Taipei Metro?",
        date: "September 2025",
        tag: "Vibe-Coded"
    },
    {
        title: "EE Quiz",
        href: "eequiz/index.html",
        image: "images/eequiz.png",
        description: "How many NTUEE Professors can you name?",
        date: "November 2025",
        tag: "Vibe-Coded"
    },
    {
        title: "Cornway's Game of Life",
        href: "cornway/cornway.html",
        image: "images/cornway.png",
        description: "A Game of Life implementation.",
        date: "October 2025",
        tag: "No-AI"
    },
    {
        title: "Wave Simulator",
        href: "wave/index.html",
        image: "images/wave.png",
        description: "A visualization of different variables affecting wave properties.",
        date: "August 2021",
        tag: "No-AI"
    },
    {
        title: "Phishing Simulator",
        href: "phishing/index.html",
        image: "images/phishing.png",
        description: "A demonstration of how phishing attacks work.",
        date: "July 2024",
        tag: "AI-Enhanced"
    },
    {
        title: "Git Archive",
        href: "https://pcwu2022.github.io/gitarchive/rick/create.html",
        image: "https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/22312759/rickroll_4k.jpg?quality=90&strip=all&crop=0,10.749448450723,100,78.501103098554",
        description: "A rickrolling website with custom title and description for sharing via social media.",
        date: "July 2024",
        tag: "AI-Enhanced"
    }
];
