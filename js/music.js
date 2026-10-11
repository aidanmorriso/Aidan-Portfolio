// AIDAN.V2 — pirate radio deck (reads library.json, plays from music/<folder>/)
document.addEventListener('DOMContentLoaded', async () => {
    const $ = id => document.getElementById(id);
    const audio = $('audio'), list = $('playlist'), canvas = $('visualizer'), ctx = canvas.getContext('2d');
    let tracks = [], order = [], idx = -1, shuffle = false, actx, analyser, data;

    try {
        const lib = await (await fetch('library.json')).json();
        for (const [folder, files] of Object.entries(lib))
            files.forEach(f => tracks.push({ src: `music/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`, name: f.replace(/\.(m4a|mp3|wav|ogg)$/i, '') }));
    } catch (e) {
        list.innerHTML = '<li style="color:var(--blood)">ERR: library.json offline</li>'; return;
    }
    order = tracks.map((_, i) => i);

    const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';
    function render(filter = '') {
        const f = filter.toLowerCase();
        list.innerHTML = '';
        tracks.forEach((t, i) => {
            if (f && !t.name.toLowerCase().includes(f)) return;
            const li = document.createElement('li');
            li.dataset.i = i;
            li.className = i === idx ? 'playing' : '';
            li.innerHTML = `<span class="n">${String(i + 1).padStart(3, '0')}</span><span></span>`;
            li.lastChild.textContent = t.name;
            li.onclick = () => play(i);
            list.append(li);
        });
    }
    function initAudio() {
        if (actx) return;
        actx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = actx.createAnalyser(); analyser.fftSize = 256;
        actx.createMediaElementSource(audio).connect(analyser);
        analyser.connect(actx.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
        draw();
    }
    function play(i) {
        initAudio(); actx.resume();
        idx = i; audio.src = tracks[i].src; audio.play();
        $('now-playing').textContent = `◉ ON AIR — ${tracks[i].name}`;
        list.querySelectorAll('li').forEach(li => li.classList.toggle('playing', +li.dataset.i === i));
        list.querySelector('li.playing')?.scrollIntoView({ block: 'nearest' });
    }
    const step = d => {
        if (!tracks.length) return;
        if (shuffle) return play(Math.floor(Math.random() * tracks.length));
        const pos = order.indexOf(idx);
        play(order[(pos + d + order.length) % order.length]);
    };
    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(data);
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, w, h);
        const n = data.length, bw = w / n;
        for (let i = 0; i < n; i++) {
            const v = data[i] / 255, bh = v * h;
            ctx.fillStyle = `hsl(${300 - v * 220}, 100%, ${45 + v * 25}%)`;
            ctx.fillRect(i * bw, h - bh, bw - 1, bh);
            if (v > .82) { ctx.fillStyle = '#c6ff00'; ctx.fillRect(i * bw, h - bh - 6, bw - 1, 2); }
        }
    }

    $('b-play').onclick = () => {
        if (idx < 0) return play(0);
        if (audio.paused) { actx.resume(); audio.play(); } else audio.pause();
    };
    $('b-next').onclick = () => step(1);
    $('b-prev').onclick = () => (audio.currentTime > 3 ? (audio.currentTime = 0) : step(-1));
    $('b-shuf').onclick = e => { shuffle = !shuffle; e.target.textContent = `SHUF: ${shuffle ? 'ON' : 'OFF'}`; };
    $('vol').oninput = e => audio.volume = e.target.value;
    $('filter').oninput = e => render(e.target.value);
    $('seek').oninput = e => audio.duration && (audio.currentTime = e.target.value / 100 * audio.duration);
    audio.volume = .8;
    audio.onplay = () => $('b-play').textContent = 'PAUSE';
    audio.onpause = () => $('b-play').textContent = 'PLAY';
    audio.onended = () => step(1);
    audio.ontimeupdate = () => {
        $('t-cur').textContent = fmt(audio.currentTime); $('t-tot').textContent = fmt(audio.duration);
        if (audio.duration) $('seek').value = audio.currentTime / audio.duration * 100;
    };
    render();
});
