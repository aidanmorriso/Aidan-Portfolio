// HEARTBEAT: JS_VERSION_2.4_FINAL_CLEAN
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // --- System Boot-up Sequence --
    const bootSequence = [
        "INITIALIZING_SYSTEM_CORE...",
        "LOADING_NEURAL_NETWORKS...",
        "ESTABLISHING_CYBER_LINK...",
        "DECRYPTING_PORTFOLIO_DATA...",
        "ACCESS_GRANTED.",
        "WELCOME, USER."
    ];
    
    const bootOverlay = document.createElement('div');
    bootOverlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: #0a0a0a;
        color: #00ffff;
        font-family: 'Courier New', Courier, monospace;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
        text-align: center;
    `;
    document.body.appendChild(bootOverlay);

    let step = 0;
    const interval = setInterval(() => {
        if (step < bootSequence.length) {
            bootOverlay.innerHTML = `<span>> ${bootSequence[step]}</span>`;
            step++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                bootOverlay.style.opacity = '0';
                bootOverlay.style.transition = 'opacity 1s ease';
                setTimeout(() => bootOverlay.remove(), 1000);
            }, 500);
        }
    }, 800);
    
    // Toggle Main Dropdown
    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('show');
        });
    }
    
    // Submenu Logic (Art Dropdown)
    const submenuTriggers = document.querySelectorAll('.submenu-trigger');
    submenuTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parent = trigger.closest('.has-submenu');
            if (parent) {
                parent.classList.toggle('active');
            }
        });
    });
    
    // Close submenus and main nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target) && !e.target.closest('.has-submenu')) {
            navLinks.classList.remove('show');
            document.querySelectorAll('.has-submenu').forEach(el => el.classList.remove('active'));
        }
    });
    
    // Tab switching logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add('active');
        });
    });
    
    // Skill bubble expansion logic
    const expandBtns = document.querySelectorAll('.expand-btn');
    expandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const bubble = btn.closest('.skill-bubble');
            if (bubble) {
                bubble.classList.toggle('active');
            } else {
                console.error('Could not find parent .skill-bubble');
            }
        });
    });
    
    // --- Music Player Engine ---
    const musicPlayer = {
        audioCtx: null,
        analyser: null,
        source: null,
        audioElement: null,
        currentTrackIndex: 0,
        tracks: [
            "0% (feat. ZillaKami).m4a", "304.m4a", "41 Cypher.m4a", "4U.m4a", "5 Freeway.m4a",
            "AWKWARD CAR DRIVE.m4a", "All the Time.m4a", "Aww Shit.m4a", "BIG.m4a", "Baby Father.m4a",
            "Bad Ass Jit.m4a", "Beg Your Pardon.m4a", "Bestfriends.m4a", "Bet.m4a", "Big Shot Cream Soda.m4a",
            "Book Bag (feat. BlueBucksClan).m4a", "Born With It.m4a", "Brown Munde.m4a", "COLORS.m4a", "Champagne Face.m4a",
            "Change Ya Life.m4a", "Check This Out.m4a", "Choir.m4a", "Chopping Block (feat. Rpg Wok).m4a", "Cinderella.m4a",
            "Click.m4a", "Courtesy.m4a", "Crash Dummy.m4a", "Crazy Story, Pt. 3.m4a", "Cyanide (feat. Ghostemane).m4a",
            "DOAK PT2.m4a", "Dead Cracka (feat. BLP KOSHER).m4a", "Dear God.m4a", "Dirty Dan.m4a", "Don't Start Pt. 2.m4a",
            "EVIL TWINS.m4a", "Easter Pink.m4a", "Errbody.m4a", "Fair Trade.m4a", "Feel What You Feelin.m4a",
            "First Day Out.m4a", "Foot Fungus.m4a", "For The Night.m4a", "Freddy K.m4a", "Freddy Vs. Jason (feat. Loso3k0 & FREDOBAGZ).m4a",
            "Freedom Of Speech.m4a", "From Dallas 2 Austin (feat. Quin NFN).m4a", "GARE DU NORD.m4a", "GATTI.m4a", "Get Bucks.m4a",
            "Get Deady.m4a", "Ghostface Killers.m4a", "HEAT STICK.m4a", "Hellcat.m4a", "Hoes Come Easy.m4a",
            "Häagen Dazs.m4a", "Jaat Da Muqabala.m4a", "Knife Talk.m4a", "Lemme See.m4a", "Let's Get It (Remix) (feat. 21 Savage).m4a",
            "Long Year.m4a", "Making The Band (Danity Kane).m4a", "Material Girl.m4a", "Megitsune.m4a", "Mind Right (feat. Warhol.SS).m4a",
            "NOTAHO3.m4a", "Never Tell Freestyle.m4a", "No Hook II.m4a", "No Show & Tell.m4a", "Ocean Spray.m4a",
            "Old Dog.m4a", "On The Quarter Pipe.m4a", "One Time.m4a", "Onna Come Up.m4a", "P.O.P..m4a",
            "POP BANDS.m4a", "ParaPara Cannibal (Extended mix).m4a", "Pcd Onda Backroad.m4a", "Perc Popper.m4a", "Phil Jackson.m4a",
            "Poppin It (feat. Stinc Team).m4a", "Pressure.m4a", "Rick And Morty.m4a", "Ruth’s Chris Freestyle (feat. Drakeo the Ruler).m4a", "Self-Inflicted.m4a",
            "ShaBar Shalom (feat. Blp Kosher).m4a", "SkeletonRaps.m4a", "SoIcyBoyz 2 (feat. Pooh Shiesty, Foogiano & Tay Keith).m4a", "Speak Up.m4a", "Spinnin (feat. Nemzzz) - Segway Remix.m4a",
            "Straightenin.m4a", "Swing My Door.m4a", "TIED UP (feat. Tanboymiguel).m4a", "Tables Turn.m4a", "Tales from Tha Guttah.m4a",
            "The Purge 2.m4a", "The Purge.m4a", "The Renegade Never Dies.m4a", "Thousand Ways.m4a", "Traplantic.m4a",
            "Turn Heads.m4a", "Tweaker.m4a", "Two Door.m4a", "Unexplainable.m4a", "Unlucky Me.m4a",
            "Venom.m4a", "Villains, pt. 2 Flipp.m4a", "Voo Doo.m4a", "Westside 2 the Westside.m4a", "Whuss the Deal.m4a",
            "Wicked Witch.m4a", "Zone 2 No Censor.m4a", "party! (dance alone).m4a", "plata negra.m4a", "Åååfrestelse.m4a"
        ],
        init() {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.setupVisualizer();
            this.updatePlaylistUI();
            this.setupControls();
        },
        setupVisualizer() {
            const canvas = document.getElementById('musicVisualizer');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                requestAnimationFrame(draw);
                this.analyser.getByteFrequencyData(dataArray);
                ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;
                    ctx.fillStyle = `rgb(${dataArray[i] + 150}, 0, ${255 - dataArray[i]})`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            };
            draw();
        },
        setupControls() {
            const playBtn = document.getElementById('btn-play');
            const prevBtn = document.getElementById('btn-prev');
            const nextBtn = document.getElementById('btn-next');
            const volumeSlider = document.getElementById('volume-slider');

            if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
            if (prevBtn) prevBtn.addEventListener('click', () => this.prevTrack());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    if (this.audioElement) this.audioElement.volume = e.target.value;
                });
            }
        },
        async loadTrack(index) {
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement.src = "";
            }
            
            const trackName = this.tracks[index];
            this.audioElement = new Audio(`./music/${trackName}`);
            this.audioElement.crossOrigin = "anonymous";
            
            this.source = this.audioCtx.createMediaElementSource(this.audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
            
            this.audioElement.play();
            document.getElementById('current-track-title').innerText = trackName.replace('.m4a', '').toUpperCase();
            document.getElementById('current-track-artist').innerText = 'SYSTEM_ACTIVE_STREAM';
            this.updatePlaylistUI();
        },
        togglePlay() {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            if (this.audioElement) {
                if (this.audioElement.paused) {
                    this.audioElement.play();
                    document.getElementById('btn-play').innerText = 'PAUSE';
                } else {
                    this.audioElement.pause();
                    document.getElementById('btn-play').innerText = 'EXECUTE';
                }
            }
        },
        nextTrack() {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            this.loadTrack(this.currentTrackIndex);
        },
        prevTrack() {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
            this.loadTrack(this.currentTrackIndex);
        },
        updatePlaylistUI() {
            const list = document.getElementById('track-list');
            if (!list) return;
            list.innerHTML = '';
            this.tracks.slice(0, 30).forEach((track, i) => {
                const li = document.createElement('li');
                li.className = i === this.currentTrackIndex ? 'active-track' : '';
                li.innerHTML = `<span class="track-num">${i + 1}</span> ${track.replace('.m4a', '')}`;
                list.appendChild(li);
            });
            const countEl = document.getElementById('track-count');
            if (countEl) countEl.innerText = `${this.currentTrackIndex + 1}/${this.tracks.length}`;
        }
    };

    if (document.getElementById('musicVisualizer')) {
        musicPlayer.init();
    }
});

// --- Last.fm Widget Integration ---
const LASTFM_USERNAME = 'geesycharlic';
const LASTFM_API_KEY = '5a5838b1bc7fd21c53f5b3433ae6a777';
const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

async function fetchLastFmTrack() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.recenttracks && data.recenttracks.track.length > 0) {
            const track = data.recenttracks.track[0];
            const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
            
            const imageArray = track.image;
            const imageUrl = imageArray.find(img => img.size === 'large')['#text'] || '';
            
            document.getElementById('lastfm-song').textContent = track.name;
            document.getElementById('lastfm-artist').textContent = track.artist['#text'];
            document.getElementById('lastfm-status').textContent = isPlaying ? 'Now Playing' : 'Last Played';
            
            document.getElementById('lastfm-art').src = imageUrl;
            document.getElementById('lastfm-widget').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching Last.fm signal:', error);
    }
}

fetchLastFmTrack();
setInterval(fetchLastFmTrack, 30000);
