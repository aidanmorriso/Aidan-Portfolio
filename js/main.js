// AIDAN.V2 — shared shell: nav, starfield, boot, tabs, skills, last.fm
(() => {
    const PAGES = [
        ['index.html', 'Home'],
        ['index.html#about', 'About'],
        ['index.html#skills', 'Skills'],
        ['index.html#experience', 'Log'],
        ['cars.html', 'Garage'],
        ['connections.html', 'Connect'],
        { label: 'Opinions', items: [['anime.html', 'Anime'], ['recipes.html', 'Recipes']] },
        { label: 'Art', items: [['music.html', 'Music'], ['gallery.html', 'Gallery']] },
    ];
    const here = location.pathname.split('/').pop() || 'index.html';
    const link = ([href, label]) =>
        `<li><a href="${href}"${href === here ? ' class="current"' : ''}>${label}</a></li>`;

    function buildShell() {
        // background layers
        const bg = document.createElement('div');
        bg.innerHTML = `
            <video class="video-bg" autoplay muted loop playsinline poster="assets/poster.jpg">
                <source src="assets/bg-loop.mp4" type="video/mp4">
            </video>
            <div class="nebula"></div>
            <canvas id="starfield"></canvas>`;
        document.body.prepend(...bg.children);

        // header
        const header = document.createElement('header');
        header.innerHTML = `
            <div class="marquee" aria-hidden="true"><span>${
                ' ✦ NO GODS NO MASTERS JUST HARDWARE ✦ TRANSMITTING FROM TITAHI BAY // AOTEAROA ✦ DIY OR DIE ✦ SIGNAL STRENGTH: LOUD ✦ ALL SYSTEMS FEEDBACK '.repeat(4)
            }</span></div>
            <nav>
                <a class="logo" href="index.html">AIDAN<small>v2</small></a>
                <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links">MENU ☰</button>
                <ul class="nav-links" id="nav-links">
                    ${PAGES.map(p => Array.isArray(p) ? link(p) : `
                        <li class="has-submenu">
                            <a href="#" class="submenu-trigger">${p.label} ▾</a>
                            <ul class="sub-menu">${p.items.map(link).join('')}</ul>
                        </li>`).join('')}
                </ul>
            </nav>`;
        document.querySelector('.video-bg + .nebula + canvas').after(header);

        // footer + last.fm
        const foot = document.createElement('div');
        foot.innerHTML = `
            <footer class="footer">
                <span class="scrawl">made by hand, broken on purpose.</span>
                &copy; ${new Date().getFullYear()} Aidan Morrison // signal ends here ✦
            </footer>
            <div id="lastfm-widget" class="lastfm-widget hidden">
                <img id="lastfm-art" class="lastfm-art" src="" alt="">
                <div class="lastfm-info">
                    <span id="lastfm-status" class="lastfm-status">Tuning…</span>
                    <span id="lastfm-song" class="lastfm-song">—</span>
                    <span id="lastfm-artist" class="lastfm-artist"></span>
                </div>
            </div>`;
        document.body.append(...foot.children);
    }

    function wireNav() {
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');
        toggle.addEventListener('click', e => {
            e.stopPropagation();
            const open = links.classList.toggle('show');
            toggle.setAttribute('aria-expanded', open);
        });
        document.querySelectorAll('.submenu-trigger').forEach(t => t.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            const li = t.closest('.has-submenu');
            document.querySelectorAll('.has-submenu').forEach(o => o !== li && o.classList.remove('active'));
            li.classList.toggle('active');
        }));
        document.addEventListener('click', e => {
            if (!e.target.closest('nav')) {
                links.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
                document.querySelectorAll('.has-submenu').forEach(o => o.classList.remove('active'));
            }
        });
    }

    function starfield() {
        const c = document.getElementById('starfield');
        const ctx = c.getContext('2d');
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let stars = [], w, h, shooting = null;
        const resize = () => {
            w = c.width = innerWidth * devicePixelRatio;
            h = c.height = innerHeight * devicePixelRatio;
            c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
            const n = Math.min(420, Math.floor(innerWidth * innerHeight / 3500));
            stars = Array.from({ length: n }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                z: Math.random() * .8 + .2,
                tw: Math.random() * Math.PI * 2,
                hue: [0, 0, 0, 300, 185, 75][Math.floor(Math.random() * 6)],
            }));
        };
        resize(); addEventListener('resize', resize);
        let scrollY = 0; addEventListener('scroll', () => scrollY = window.scrollY, { passive: true });
        const frame = t => {
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                const y = (s.y - scrollY * s.z * .35 * devicePixelRatio) % h;
                const a = .5 + .5 * Math.sin(t / 700 * s.z + s.tw);
                ctx.fillStyle = s.hue ? `hsla(${s.hue},100%,75%,${a})` : `rgba(255,255,255,${a})`;
                const r = s.z * 1.6 * devicePixelRatio;
                ctx.fillRect(s.x, y < 0 ? y + h : y, r, r);
            }
            if (!shooting && Math.random() < .004) {
                shooting = { x: Math.random() * w * .7, y: Math.random() * h * .4, life: 1 };
            }
            if (shooting) {
                const s = shooting, len = 160 * devicePixelRatio;
                const g = ctx.createLinearGradient(s.x, s.y, s.x - len, s.y - len * .4);
                g.addColorStop(0, `rgba(198,255,0,${s.life})`); g.addColorStop(1, 'transparent');
                ctx.strokeStyle = g; ctx.lineWidth = 2 * devicePixelRatio;
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - len, s.y - len * .4); ctx.stroke();
                s.x += 14 * devicePixelRatio; s.y += 5.6 * devicePixelRatio; s.life -= .02;
                if (s.life <= 0) shooting = null;
            }
            if (!reduce) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    function boot() {
        if (sessionStorage.getItem('v2-booted')) return;
        sessionStorage.setItem('v2-booted', '1');
        const lines = [
            '> POWER ON .................. OK',
            '> SPINNING UP GALAXY.DRV .... OK',
            '> LOADING ATTITUDE .......... 110%',
            '> CHECKING FOR RULES ........ NONE FOUND',
            '> TUNING TO 88.8 FM ......... LOCKED',
            '> WELCOME TO THE UNDERGROUND.',
        ];
        const el = document.createElement('div');
        el.id = 'boot';
        document.body.append(el);
        let i = 0;
        const next = () => {
            if (i < lines.length) {
                const d = document.createElement('div');
                d.className = 'line' + (lines[i].includes('NONE') ? ' err' : '');
                d.textContent = lines[i++];
                el.append(d);
                setTimeout(next, 230);
            } else {
                setTimeout(() => { el.classList.add('gone'); setTimeout(() => el.remove(), 700); }, 450);
            }
        };
        el.addEventListener('click', () => { i = lines.length; el.classList.add('gone'); setTimeout(() => el.remove(), 700); });
        next();
    }

    function wireWidgets() {
        // tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === btn.dataset.target));
        }));
        // skills
        document.querySelectorAll('.skill').forEach(s => s.addEventListener('click', () => {
            s.classList.toggle('active');
            s.querySelector('.expand-btn')?.setAttribute('aria-expanded', s.classList.contains('active'));
        }));
        // anime cards (click to expand/collapse)
        document.querySelectorAll('.anime-card').forEach(card => {
            card.addEventListener('click', () => {
                const isOpen = card.classList.toggle('open');
                card.setAttribute('aria-expanded', isOpen);
            });
        });
        // vehicle cards (click to expand/collapse specs)
        document.querySelectorAll('.vehicle-card').forEach(card => {
            card.addEventListener('click', () => {
                const isOpen = card.classList.toggle('open');
                card.setAttribute('aria-expanded', isOpen);
            });
        });
        // gallery lightbox
        const box = document.querySelector('.lightbox');
        if (box) {
            const img = box.querySelector('img');
            document.querySelectorAll('.gallery-grid figure').forEach(f => f.addEventListener('click', () => {
                img.src = f.dataset.full; img.alt = f.querySelector('img').alt; box.classList.add('open');
            }));
            box.addEventListener('click', () => box.classList.remove('open'));
            addEventListener('keydown', e => e.key === 'Escape' && box.classList.remove('open'));
        }
    }

    // --- Last.fm ---
    const LASTFM_USER = 'geesycharlic';
    const LASTFM_KEY = '5a5838b1bc7fd21c53f5b3433ae6a777';
    async function lastfm() {
        try {
            const r = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=1`);
            const t = (await r.json()).recenttracks?.track?.[0];
            if (!t) return;
            const now = t['@attr']?.nowplaying === 'true';
            document.getElementById('lastfm-status').textContent = now ? '● on air' : 'last transmission';
            document.getElementById('lastfm-song').textContent = t.name;
            document.getElementById('lastfm-artist').textContent = t.artist['#text'];
            document.getElementById('lastfm-art').src = (t.image.find(i => i.size === 'large') || {})['#text'] || '';
            document.getElementById('lastfm-widget').classList.remove('hidden');
        } catch (e) { /* offline, stay hidden */ }
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildShell();
        wireNav();
        starfield();
        boot();
        wireWidgets();
        lastfm();
        setInterval(lastfm, 30000);
    });
})();
