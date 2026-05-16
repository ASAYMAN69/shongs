const Intro = {
    lines: {
        "In love": [
            "amar fault na that i fell for you that hard",
            "apni e eto pretty hmh, ei gaan gula apnar jonno"
        ],
        "Dreaming a life with you": [
            "hmmmm, what if we.....",
            "me wanna stay with you <3 forever :3"
        ],
        "Delusional": [
            "kn je apnar chinta sharakkhon mathay ghure",
            "tokhon eigula shuni aarki, bhallage, hehe"
        ],
        "Sed": [
            "eid e je etodin chhuti, apnar shathe je.... :(",
            "onkdin dekha hobe na :( ami kintu koshto paabo"
        ],
        "Admiring": [
            "your smile was the first thing that had me mesmerized",
            "now even the thoughts of you is enough"
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
