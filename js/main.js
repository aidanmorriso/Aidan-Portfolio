document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // --- System Boot-up Sequence ---
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
});
