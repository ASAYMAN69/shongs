const Intro = {
    lines: {
        "In love": [
            "Every moment with you feels like a dream.",
            "You are the melody to my heart's song."
        ],
        "Dreaming a life with you": [
            "Building a future in your eyes.",
            "Forever sounds just about right."
        ],
        "Delusional": [
            "Lost in a world where you are mine.",
            "Chasing shadows of our perfect illusion."
        ],
        "Sed": [
            "Tears fall like rain in your absence.",
            "Aching for a touch that's only a memory."
        ],
        "Admiring": [
            "Your smile outshines the brightest stars.",
            "I could spend an eternity just looking at you."
        ]
    },

    async play(type, callback) {
        const startScreen = document.getElementById('start-screen');
        const beginBtn = document.getElementById('begin-btn');
        const intro1 = document.getElementById('intro-line-1');
        const intro2 = document.getElementById('intro-line-2');

        startScreen.style.display = 'flex';
        startScreen.style.opacity = '1';
        beginBtn.style.display = 'none';

        const lines = this.lines[type] || this.lines["In love"];

        // Line 1
        intro1.innerText = lines[0];
        intro1.classList.add('visible');
        await new Promise(r => setTimeout(r, 3000));
        intro1.classList.remove('visible');
        await new Promise(r => setTimeout(r, 1200));

        // Line 2
        intro2.innerText = lines[1];
        intro2.classList.add('visible');
        await new Promise(r => setTimeout(r, 3000));
        intro2.classList.remove('visible');
        await new Promise(r => setTimeout(r, 1200));

        startScreen.style.opacity = '0';
        setTimeout(() => {
            startScreen.style.display = 'none';
            callback(); // Start the slideshow batch
        }, 1000);
    }
};
