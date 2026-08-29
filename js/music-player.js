document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LOGIN SYSTEM ---
    const loginTerminal = document.getElementById('login-terminal');
    const playerTerminal = document.getElementById('player-terminal');
    const loginUser = document.getElementById('login-user');
    const loginPass = document.getElementById('login-pass');
    const btnLogin = document.getElementById('btn-login');
    const loginError = document.getElementById('login-error');

    async function attemptLogin() {
        const userIn = loginUser.value.trim().toLowerCase();
        const passIn = loginPass.value;

        try {
            const response = await fetch('users.json');
            if (!response.ok) throw new Error("Could not load users.json");
            const data = await response.json();
            
            const validUser = data.users.find(u => u.username === userIn && u.password === passIn);

            if (validUser) {
                btnLogin.innerText = `ACCESS GRANTED`;
                btnLogin.style.background = "#00ffff";
                btnLogin.style.color = "#000";
                
                setTimeout(() => {
                    loginTerminal.style.display = "none";
                    playerTerminal.style.display = "block";
                    loadLibrary();
                }, 800);
            } else {
                triggerLoginError();
            }
        } catch (err) {
            console.error("Auth System Error:", err);
            loginError.innerText = "ERR 500: DATABASE OFFLINE.";
            triggerLoginError();
        }
    }

    function triggerLoginError() {
        loginError.style.display = "block";
        loginPass.value = ""; 
        btnLogin.style.borderColor = "#ff003c";
        btnLogin.style.color = "#ff003c";
        setTimeout(() => {
            btnLogin.style.borderColor = "#00ffff";
            btnLogin.style.color = "#00ffff";
        }, 400);
    }

    btnLogin.addEventListener('click', attemptLogin);
    loginPass.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });


    // --- 2. MUSIC PLAYER CORE VARIABLES ---
    const audio = document.getElementById('main-audio-player');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    const playlistContainer = document.getElementById('playlist-container');
    const nowPlayingTitle = document.getElementById('now-playing-title');
    
    // 2D VR Canvas Elements
    const vrCanvas = document.getElementById('vr-2d-visualizer');
    const vrCtx = vrCanvas.getContext('2d');
    const vrSongTitle = document.getElementById('vr-song-title');
    const vrBtnPrev = document.getElementById('vr-btn-prev');
    const vrBtnNext = document.getElementById('vr-btn-next');

    // UI Elements
    const btnPlay = document.getElementById('btn-play');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnShuffle = document.getElementById('btn-shuffle');
    const btnLoop = document.getElementById('btn-loop');
    const progressBar = document.getElementById('progress-bar');
    const volumeBar = document.getElementById('volume-bar');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    
    // State Tracking
    let audioContext, analyser, source, dataArray;
    let contextInitialized = false;
    let musicLibrary = {};
    let currentTrackName = "";
    let currentFolder = "";
    let currentPlaylist = [];
    let currentTrackIndex = -1;
    let isShuffle = false;
    let isLooping = false;
    let isDragging = false;


    // --- 3. JSON LIBRARY FETCHING ---
    async function loadLibrary() {
        try {
            playlistContainer.innerHTML = '<div style="color:#00ffff; font-family:monospace; padding:10px;">SCANNING DIRECTORY...</div>';
            const response = await fetch('library.json');
            if (!response.ok) throw new Error("Missing library.json");
            musicLibrary = await response.json();
            renderFolders();
        } catch (err) {
            playlistContainer.innerHTML = '<div style="color:#ff003c; font-family:monospace; padding:10px;">ERR: /LIBRARY.JSON NOT FOUND</div>';
        }
    }

    function renderFolders() {
        playlistContainer.innerHTML = '';
        for (const folderName in musicLibrary) {
            const folderEl = document.createElement('div');
            folderEl.style.cssText = 'cursor: pointer; padding: 10px; border-bottom: 1px solid rgba(0,255,255,0.1); color: #00ffff; font-family: monospace; font-size: 14px; font-weight: bold; transition: 0.2s;';
            folderEl.innerText = `📁 [DIR] /${folderName}`;
            folderEl.addEventListener('mouseenter', () => folderEl.style.background = 'rgba(0, 255, 255, 0.1)');
            folderEl.addEventListener('mouseleave', () => folderEl.style.background = 'transparent');
            folderEl.addEventListener('click', () => renderSongs(folderName, musicLibrary[folderName]));
            playlistContainer.appendChild(folderEl);
        }
    }

    function renderSongs(folderName, songsArray) {
        playlistContainer.innerHTML = '';
        const backEl = document.createElement('div');
        backEl.style.cssText = 'cursor: pointer; padding: 10px; border-bottom: 1px solid rgba(0,255,255,0.3); color: #ff00ff; font-family: monospace; font-size: 14px; font-weight: bold; transition: 0.2s;';
        backEl.innerText = '◄ [..] RETURN TO ROOT';
        backEl.addEventListener('mouseenter', () => backEl.style.background = 'rgba(255, 0, 255, 0.1)');
        backEl.addEventListener('mouseleave', () => backEl.style.background = 'transparent');
        backEl.addEventListener('click', renderFolders);
        playlistContainer.appendChild(backEl);

        songsArray.forEach((track, index) => {
            const trackEl = document.createElement('div');
            trackEl.style.cssText = 'cursor: pointer; padding: 10px 10px 10px 25px; border-bottom: 1px solid rgba(0,255,255,0.1); color: #ddd; transition: 0.2s; font-family: monospace; font-size: 14px;';
            trackEl.innerText = `└─ ${track}`;
            trackEl.addEventListener('mouseenter', () => { trackEl.style.color = '#00ffff'; trackEl.style.background = 'rgba(0, 255, 255, 0.1)'; });
            trackEl.addEventListener('mouseleave', () => { trackEl.style.color = '#ddd'; trackEl.style.background = 'transparent'; });
            trackEl.addEventListener('click', () => loadAndPlayTrack(folderName, songsArray, index));
            playlistContainer.appendChild(trackEl);
        });
    }


    // --- 4. MEDIA SESSION API ---
    function updateMediaSessionMetadata() {
        if ('mediaSession' in navigator) {
            const cleanTitle = currentTrackName.replace(/\.[^/.]+$/, "");
            navigator.mediaSession.metadata = new MediaMetadata({
                title: cleanTitle,
                artist: 'Voyage Data Stream',
                album: currentFolder,
                artwork: [{ src: 'gallery/wellington_port_night.jpg', sizes: '512x512', type: 'image/jpeg' }]
            });
        }
    }

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => audio.play());
        navigator.mediaSession.setActionHandler('pause', () => audio.pause());
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
        navigator.mediaSession.setActionHandler('seekbackward', (details) => { audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0); });
        navigator.mediaSession.setActionHandler('seekforward', (details) => { audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration); });
        navigator.mediaSession.setActionHandler('seekto', (details) => { audio.currentTime = details.seekTime; });
    }


    // --- 5. AUDIO PLAYBACK & CONTROLS ---
    async function loadAndPlayTrack(folder, trackArray, index) {
        try {
            if (!contextInitialized) setupWebAudio();
            if (audioContext && audioContext.state === 'suspended') await audioContext.resume();

            currentFolder = folder;
            currentPlaylist = trackArray;
            currentTrackIndex = index;
            currentTrackName = trackArray[index];

            audio.src = `./music/${folder}/${currentTrackName}`;
            updateMediaSessionMetadata();
            await audio.play();
        } catch (err) {
            console.error("Playback failed.", err);
        }
    }

    function playNext() {
        if (currentPlaylist.length === 0) return;
        let nextIndex = isShuffle ? Math.floor(Math.random() * currentPlaylist.length) : (currentTrackIndex + 1) % currentPlaylist.length;
        loadAndPlayTrack(currentFolder, currentPlaylist, nextIndex);
    }

    function playPrev() {
        if (currentPlaylist.length === 0) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0; 
            return;
        }
        let prevIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        loadAndPlayTrack(currentFolder, currentPlaylist, prevIndex);
    }

    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);
    vrBtnNext.addEventListener('click', playNext); // Hook up VR skip button
    vrBtnPrev.addEventListener('click', playPrev); // Hook up VR rewind button

    btnPlay.addEventListener('click', async () => {
        if (!audio.src) return;
        if (!contextInitialized) setupWebAudio();
        if (audioContext && audioContext.state === 'suspended') await audioContext.resume();
        audio.paused ? audio.play() : audio.pause();
    });

    btnShuffle.addEventListener('click', () => {
        isShuffle = !isShuffle;
        btnShuffle.classList.toggle('active', isShuffle);
    });

    btnLoop.addEventListener('click', () => {
        isLooping = !isLooping;
        audio.loop = isLooping;
        btnLoop.classList.toggle('active', isLooping);
    });

    audio.addEventListener('ended', () => {
        if (!isLooping) playNext();
    });

    audio.addEventListener('play', () => {
        const cleanTitle = currentTrackName.replace(/\.[^/.]+$/, "");
        
        btnPlay.innerText = "PAUSE";
        btnPlay.classList.add('active');
        nowPlayingTitle.innerText = `Voyage_Data_Stream // ${currentTrackName} [ACTIVE]`;
        vrSongTitle.innerText = `[ ${cleanTitle} ]`; // Update VR Overlay Title
        
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    });

    audio.addEventListener('pause', () => {
        btnPlay.innerText = "PLAY";
        btnPlay.classList.remove('active');
        nowPlayingTitle.innerText = `Voyage_Data_Stream // ${currentTrackName} [PAUSED]`;
        document.documentElement.style.setProperty('--bass-glow', '0');
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    });


    // --- 6. PROGRESS SLIDER ---
    function formatTime(s) {
        if (isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${m}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateSliderFill(slider) {
        if (!slider.max || slider.max === "0") return;
        slider.style.setProperty('--slider-progress', `${(slider.value / slider.max) * 100}%`);
    }

    progressBar.addEventListener('mousedown', () => isDragging = true);
    progressBar.addEventListener('touchstart', () => isDragging = true, { passive: true });

    progressBar.addEventListener('input', () => {
        timeCurrent.innerText = formatTime(progressBar.value);
        updateSliderFill(progressBar);
    });

    progressBar.addEventListener('mouseup', () => { isDragging = false; audio.currentTime = progressBar.value; });
    progressBar.addEventListener('touchend', () => { isDragging = false; audio.currentTime = progressBar.value; });
    progressBar.addEventListener('touchcancel', () => { isDragging = false; });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isDragging) {
            progressBar.max = audio.duration;
            progressBar.value = audio.currentTime;
            timeCurrent.innerText = formatTime(audio.currentTime);
            timeTotal.innerText = formatTime(audio.duration);
            updateSliderFill(progressBar);

            if ('mediaSession' in navigator && !isNaN(audio.duration)) {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: audio.currentTime
                });
            }
        }
    });

    audio.addEventListener('loadedmetadata', () => timeTotal.innerText = formatTime(audio.duration));

    volumeBar.addEventListener('input', () => {
        audio.volume = volumeBar.value / 100;
        volumeBar.style.setProperty('--slider-progress', `${volumeBar.value}%`);
    });
    volumeBar.style.setProperty('--slider-progress', `${volumeBar.value}%`);


    // --- 7. AUDIO VISUALIZER (CANVAS DUO-RENDER) ---
    function setupWebAudio() {
        if (contextInitialized) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256; 
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            contextInitialized = true;
            drawVisualizer();
        } catch (error) { console.error("Web Audio API failed:", error); }
    }

    function drawVisualizer() {
        if (!analyser) return;
        requestAnimationFrame(drawVisualizer);
        analyser.getByteFrequencyData(dataArray);
        
        // MAIN TERMINAL CANVAS RENDERING
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let bassSum = 0;
        for (let i = 0; i < 10; i++) bassSum += dataArray[i];
        const bassLevel = (bassSum / 10) / 255; 
        document.documentElement.style.setProperty('--bass-glow', bassLevel.toFixed(2));

        const barWidth = (canvas.width / analyser.frequencyBinCount) * 1.5;
        let x = canvas.width / 2; 
        ctx.shadowBlur = 10;
        
        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            const r = (barHeight + 100) * (i / analyser.frequencyBinCount);
            const g = 255 - (i * 2);
            const b = 255;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            ctx.fillRect(canvas.width - x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
        ctx.shadowBlur = 0; 

        // SECONDARY VR HUD CANVAS RENDERING (Only draws if 3D is active to save resources)
        if (is3DActive) {
            vrCtx.clearRect(0, 0, vrCanvas.width, vrCanvas.height);
            const vrBarWidth = (vrCanvas.width / analyser.frequencyBinCount) * 1.5;
            let vrX = vrCanvas.width / 2;
            vrCtx.shadowBlur = 15;

            for (let i = 0; i < analyser.frequencyBinCount; i++) {
                const vrBarHeight = (dataArray[i] / 255) * vrCanvas.height;
                const r = (vrBarHeight + 100) * (i / analyser.frequencyBinCount);
                const g = 255 - (i * 2);
                
                vrCtx.fillStyle = `rgb(${r}, ${g}, 255)`;
                vrCtx.shadowColor = `rgb(${r}, ${g}, 255)`;
                
                vrCtx.fillRect(vrX, vrCanvas.height - vrBarHeight, vrBarWidth - 1, vrBarHeight);
                vrCtx.fillRect(vrCanvas.width - vrX, vrCanvas.height - vrBarHeight, vrBarWidth - 1, vrBarHeight);
                vrX += vrBarWidth;
            }
            vrCtx.shadowBlur = 0;
        }
    }


    // --- 8. EPIC 3D CYBERPUNK VISUALIZER (THREE.JS) ---
    let threeContainer = null;
    let threeScene, threeCamera, threeRenderer, wireframeTerrain, audioSphere;
    let is3DActive = false;
    let threeAnimationFrameId = null;

    function init3DVisualizer() {
        if (threeRenderer) return; 

        threeContainer = document.getElementById('three-container');
        threeScene = new THREE.Scene();
        threeScene.fog = new THREE.FogExp2(0x000000, 0.035);

        threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        threeCamera.position.set(0, 15, 40);
        threeCamera.lookAt(0, 0, 0);

        threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeContainer.appendChild(threeRenderer.domElement);

        const geometry = new THREE.PlaneGeometry(120, 120, 40, 40);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.4 });
        wireframeTerrain = new THREE.Mesh(geometry, material);
        wireframeTerrain.rotation.x = -Math.PI / 2;
        wireframeTerrain.position.y = -5;
        threeScene.add(wireframeTerrain);

        const sphereGeometry = new THREE.SphereGeometry(6, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
        audioSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        audioSphere.position.set(0, 5, 0);
        threeScene.add(audioSphere);

        window.addEventListener('resize', () => {
            if (!is3DActive) return;
            threeCamera.aspect = window.innerWidth / window.innerHeight;
            threeCamera.updateProjectionMatrix();
            threeRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    function render3DFrame() {
        if (!is3DActive) return;
        threeAnimationFrameId = requestAnimationFrame(render3DFrame);

        if (analyser && dataArray) {
            let bassSum = 0;
            for (let i = 0; i < 15; i++) bassSum += dataArray[i];
            let bassFactor = (bassSum / 15) / 255;

            const scale = 1 + (bassFactor * 0.8);
            audioSphere.scale.set(scale, scale, scale);
            audioSphere.rotation.y += 0.01;
            audioSphere.rotation.x += 0.005;

            const positionAttribute = wireframeTerrain.geometry.attributes.position;
            const vertexCount = positionAttribute.count;
            for (let i = 0; i < vertexCount; i++) {
                const dataIndex = i % (dataArray.length / 2);
                const wave = (dataArray[dataIndex] / 255) * 4;
                if (i > 40 && i < vertexCount - 40) positionAttribute.setZ(i, wave);
            }
            positionAttribute.needsUpdate = true;
        }

        wireframeTerrain.position.z += 0.2;
        if (wireframeTerrain.position.z > 6) wireframeTerrain.position.z = 0;
        threeRenderer.render(threeScene, threeCamera);
    }

    const btn3DToggle = document.getElementById('btn-3d-toggle');
    const vrOverlay = document.getElementById('vr-overlay');
    const btnVrClose = document.getElementById('btn-vr-close');

    btn3DToggle.addEventListener('click', () => {
        if (!contextInitialized) { alert("Initialize audio playback first before launching 3D Matrix."); return; }
        is3DActive = true;
        vrOverlay.style.display = "block";
        init3DVisualizer();
        render3DFrame();
    });

    btnVrClose.addEventListener('click', () => {
        is3DActive = false;
        vrOverlay.style.display = "none";
        if (threeAnimationFrameId) cancelAnimationFrame(threeAnimationFrameId);
    });

});