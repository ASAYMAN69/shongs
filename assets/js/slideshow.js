let appData = [];
let groupedData = {};
let categories = [];
let currentCategoryIndex = 0;
let stack = [];
let removedCountInBatch = 0;
let totalRemovedCount = 0;
let autoSlideTimer = null;
const AUTO_SLIDE_DURATION = 10000; // 10 seconds

const Slideshow = {
    async init() {
        try {
            const res = await fetch('assets/data.json');
            appData = await res.json();
            
            // Group data by type
            appData.forEach(track => {
                const type = track.type || "In love";
                if (!groupedData[type]) groupedData[type] = [];
                groupedData[type].push(track);
            });
            
            // Fixed order for categories
            const preferredOrder = ["In love", "Admiring", "Dreaming a life with you", "Delusional", "Sed"];
            categories = preferredOrder.filter(cat => groupedData[cat]);
            
            // Add any types not in the preferred order
            Object.keys(groupedData).forEach(cat => {
                if (!categories.includes(cat)) categories.push(cat);
            });

        } catch (err) {
            console.error("Data fetch failed", err);
        }
    },

    startNextBatch() {
        if (currentCategoryIndex >= categories.length) {
            this.showEnd();
            return;
        }

        const type = categories[currentCategoryIndex];
        Intro.play(type, () => {
            this.buildBatchDeck(type);
            this.showScene();
            this.playTrack();
        });
    },

    buildBatchDeck(type) {
        const scene = document.getElementById('scene');
        const progress = document.getElementById('progress');
        
        // Clear previous deck
        scene.innerHTML = '';
        progress.innerHTML = '';
        stack = [];
        removedCountInBatch = 0;

        const batch = groupedData[type];
        
        batch.forEach((track, i) => {
            // Progress Dot
            const dot = document.createElement('div');
            dot.className = 'dot';
            progress.appendChild(dot);

            // Card
            const card = document.createElement('div');
            card.className = 'card';
            card.style.backgroundImage = `url('${track.thumbnail}')`;
            card.innerHTML = `
                <div class="card-body">
                    <div class="card-top">
                        <span class="card-label">${track.type}</span>
                        <span class="card-count">${i + 1} / ${batch.length}</span>
                    </div>
                    <div class="card-content">
                        <div class="card-headline">${track.name}</div>
                        <div class="card-tagline">${track.artist}</div>
                    </div>
                </div>
                <div class="stamp stamp-yes">❤️</div>
                <div class="stamp stamp-no">💔</div>
            `;
            scene.appendChild(card);
        });

        const cardEls = Array.from(scene.querySelectorAll('.card'));
        stack = cardEls; // stack[0] is the top card
        this.applyTransforms();
        this.updateProgress();
    },

    applyTransforms() {
        stack.forEach((card, i) => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.15, 0.64, 1), opacity 0.5s ease';
            const scale = Math.max(0, 1 - i * 0.05);
            const ty = i * 15;
            card.style.transform = `scale(${scale}) translateY(${ty}px)`;
            card.style.zIndex = 100 - i;
            card.style.opacity = i > 3 ? '0' : '1';
        });
    },

    updateProgress() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'done');
            if (i < removedCountInBatch) dot.classList.add('done');
            else if (i === removedCountInBatch) dot.classList.add('active');
        });
    },

    showScene() {
        document.getElementById('scene').style.display = 'block';
        document.getElementById('progress').style.display = 'flex';
        document.getElementById('hint').style.display = 'flex';
        
        // Use a small timeout for opacity transitions
        setTimeout(() => {
            document.getElementById('scene').style.opacity = '1';
            document.getElementById('progress').style.opacity = '1';
            document.getElementById('hint').style.opacity = '1';
        }, 50);
    },

    hideScene(callback) {
        const scene = document.getElementById('scene');
        const progress = document.getElementById('progress');
        const hint = document.getElementById('hint');

        scene.style.opacity = '0';
        progress.style.opacity = '0';
        hint.style.opacity = '0';

        setTimeout(() => {
            scene.style.display = 'none';
            progress.style.display = 'none';
            hint.style.display = 'none';
            callback();
        }, 800);
    },

    playTrack() {
        const type = categories[currentCategoryIndex];
        const batch = groupedData[type];
        
        if (removedCountInBatch >= batch.length) return;
        
        const audio = document.getElementById('audio-player');
        const track = batch[removedCountInBatch];
        
        this.clearAutoSlide();
        
        audio.pause();
        audio.src = track.music;
        audio.load();
        
        const onCanPlay = () => {
            audio.currentTime = track.start || 0;
            audio.play().then(() => {
                this.clearAutoSlide();
                autoSlideTimer = setTimeout(() => {
                    this.swipe(1); 
                }, AUTO_SLIDE_DURATION);
            }).catch(e => {
                console.log("Playback failed", e);
            });
            audio.removeEventListener('canplay', onCanPlay);
        };
        
        audio.addEventListener('canplay', onCanPlay);
    },

    clearAutoSlide() {
        if (autoSlideTimer) {
            clearTimeout(autoSlideTimer);
            autoSlideTimer = null;
        }
    },

    swipe(dir) {
        if (stack.length === 0) return;
        
        this.clearAutoSlide();
        const top = stack.shift();
        removedCountInBatch++;
        totalRemovedCount++;
        
        top.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        top.style.transform = `translateX(${dir * 1000}px) rotate(${dir * 30}deg)`;
        top.style.opacity = '0';
        
        this.updateProgress();
        
        setTimeout(() => {
            top.style.display = 'none';
            const type = categories[currentCategoryIndex];
            if (stack.length === 0) {
                // Batch finished
                const audio = document.getElementById('audio-player');
                audio.pause();
                currentCategoryIndex++;
                this.hideScene(() => {
                    this.startNextBatch();
                });
            } else {
                this.applyTransforms();
                this.playTrack();
            }
        }, 400);
    },

    showEnd() {
        const audio = document.getElementById('audio-player');
        audio.pause();
        document.getElementById('scene').style.display = 'none';
        document.getElementById('progress').style.display = 'none';
        document.getElementById('hint').style.display = 'none';
        document.getElementById('done-msg').classList.add('visible');
    },

    downloadAll() {
        console.log("Starting parallel downloads for", appData.length, "tracks...");
        appData.forEach((track, index) => {
            // Using a slight delay between triggers to prevent some browsers from blocking mass downloads
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = track.music;
                link.download = track.music.split('/').pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 100); 
        });
    }
};

window.Slideshow = Slideshow;

// Global App Init
function initApp() {
    Slideshow.init();
    
    document.getElementById('begin-btn').onclick = () => {
        Slideshow.startNextBatch();
    };

    // Interaction Logic
    let dragging = false, startX = 0, deltaX = 0;
    const scene = document.getElementById('scene');
    const THRESHOLD = 80;

    function handleStart(x) {
        if (stack.length === 0) return;
        dragging = true;
        startX = x;
        stack[0].style.transition = 'none';
        Slideshow.clearAutoSlide(); 
    }

    function handleMove(x) {
        if (!dragging || stack.length === 0) return;
        deltaX = x - startX;
        const rot = (deltaX / 300) * 15;
        stack[0].style.transform = `translateX(${deltaX}px) rotate(${rot}deg)`;
        
        const progressVal = Math.min(Math.abs(deltaX) / THRESHOLD, 1);
        const yes = stack[0].querySelector('.stamp-yes');
        const no = stack[0].querySelector('.stamp-no');
        
        if (deltaX > 10) { yes.style.opacity = progressVal; no.style.opacity = 0; }
        else if (deltaX < -10) { no.style.opacity = progressVal; yes.style.opacity = 0; }
        else { yes.style.opacity = 0; no.style.opacity = 0; }
    }

    function handleEnd() {
        if (!dragging || stack.length === 0) return;
        dragging = false;
        
        if (Math.abs(deltaX) > THRESHOLD) {
            Slideshow.swipe(deltaX > 0 ? 1 : -1);
        } else {
            stack[0].style.transition = 'transform 0.4s cubic-bezier(0.34, 1.15, 0.64, 1)';
            stack[0].style.transform = 'translateX(0) rotate(0deg)';
            stack[0].querySelector('.stamp-yes').style.opacity = 0;
            stack[0].querySelector('.stamp-no').style.opacity = 0;
            
            Slideshow.clearAutoSlide();
            autoSlideTimer = setTimeout(() => Slideshow.swipe(1), AUTO_SLIDE_DURATION);
        }
    }

    scene.addEventListener('mousedown', e => handleStart(e.clientX));
    window.addEventListener('mousemove', e => handleMove(e.clientX));
    window.addEventListener('mouseup', handleEnd);

    scene.addEventListener('touchstart', e => handleStart(e.touches[0].clientX), {passive:false});
    scene.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e.touches[0].clientX); }, {passive:false});
    window.addEventListener('touchend', handleEnd);

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') Slideshow.swipe(-1);
        if (e.key === 'ArrowRight') Slideshow.swipe(1);
    });
}
