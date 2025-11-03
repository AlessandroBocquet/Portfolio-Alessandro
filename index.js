// Idle warmup of case-study assets (no loading screen)
(function warmupCaseStudyAssets() {
    const urls = [
        // InStay critical images
        '/assets/InstayAssets/tvanimation/Try.png',
        '/assets/InstayAssets/beforeafter/after.png',
        '/assets/InstayAssets/beforeafter/after2.png',
        '/assets/InstayAssets/beforeafter/before.png',
        '/assets/InstayAssets/beforeafter/before2.png',
        '/assets/InstayAssets/scrollanimation/Home%20Screen.png',
        '/assets/InstayAssets/scrollanimation/House%20Details.png',
        '/assets/InstayAssets/scrollanimation/Profile.png',
        '/assets/InstayAssets/scrollanimation/12.png',
        '/assets/InstayAssets/scrollanimation/13.png',
        '/assets/InstayAssets/scrollanimation/15.png',
        '/assets/InstayAssets/scrollanimation/19.png',
        // Soltar animation frames
        '/assets/SoltarAssets/soltaranimation/1.png',
        '/assets/SoltarAssets/soltaranimation/2.png',
        '/assets/SoltarAssets/soltaranimation/3.png',
        '/assets/SoltarAssets/soltaranimation/4.png',
        '/assets/SoltarAssets/soltaranimation/5.png',
        '/assets/SoltarAssets/soltaranimation/11.png'
    ];
    const glbs = [
        '/assets/InstayAssets/remotebase.glb',
        '/assets/InstayAssets/remotewebsite.glb'
    ];

    function warmImages(list) {
        list.forEach((u) => {
            const i = new Image();
            i.decoding = 'async';
            i.loading = 'eager';
            i.src = u;
        });
    }
    function warmFetch(list) {
        list.forEach((u) => {
            fetch(u, { method: 'GET', mode: 'cors', credentials: 'same-origin' }).catch(() => {});
        });
    }

    const runWarmup = () => {
        warmImages(urls);
        warmFetch(glbs);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(runWarmup, { timeout: 2000 });
    } else {
        setTimeout(runWarmup, 500);
    }
})();

document.addEventListener('DOMContentLoaded', function() {

    function initTypewriter() {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (!typewriterElement) return;
        
        const texts = [
            'UX & UI Designer',
            'Visual Designer',
            'Interaction Designer', 
            'Product Designer',
            'Creative Developer',
            'Digital Artist'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;
        
        function typeWriter() {
            const currentText = texts[textIndex];
            
            if (isPaused) {
                setTimeout(typeWriter, 400);
                isPaused = false;
                return;
            }
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                
                if (charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    setTimeout(typeWriter, 500);
                    return;
                }
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                
                if (charIndex === currentText.length) {
                    isDeleting = true;
                    isPaused = true;
                    setTimeout(typeWriter, 20);
                    return;
                }
            }
            
            const speed = isDeleting ? 50 : 100;
            setTimeout(typeWriter, speed);
        }
        
        setTimeout(() => {
            typeWriter();
        }, 250);
    }
    
    initTypewriter();
    
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const btn = document.querySelector('.btn');
    const menu = document.getElementById('menu');
    const menuLinks = document.querySelectorAll('#menu a[href^="#"]');
    function initGlassSkillsDisplay() {
        const skillTags = document.querySelectorAll('.skill-tag');
        const glassCards = document.querySelectorAll('.glass-skill-card');
    }
    setTimeout(initGlassSkillsDisplay, 500);
    function initAnimatedStats() {
        const statsContainer = document.querySelector('.stats-professional');
        if (statsContainer) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateStats();
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            statsObserver.observe(statsContainer);
        }
    }
    function animateStats() {
        const statElements = document.querySelectorAll('.stat-professional');
        statElements.forEach(stat => {
            const numberElement = stat.querySelector('.stat-number-professional');
            const target = stat.getAttribute('data-target');
            if (target === '∞') {
                let count = 0;
                const infinityInterval = setInterval(() => {
                    count++;
                    if (count <= 20) {
                        numberElement.textContent = count;
                    } else {
                        numberElement.textContent = '∞';
                        clearInterval(infinityInterval);
                    }
                }, 100);
            } else {
                const targetNum = parseInt(target);
                let current = 0;
                const increment = targetNum / 30;
                const counter = setInterval(() => {
                    current += increment;
                    if (current >= targetNum) {
                        numberElement.textContent = targetNum + '+';
                        clearInterval(counter);
                    } else {
                        numberElement.textContent = Math.floor(current);
                    }
                }, 50);
            }
        });
    }
    setTimeout(initAnimatedStats, 500);
    function createNavCursor() {
        const navLinksContainer = document.querySelector('.nav-links');
        if (navLinksContainer && !document.querySelector('.nav-cursor')) {
            const cursor = document.createElement('div');
            cursor.classList.add('nav-cursor');
            navLinksContainer.appendChild(cursor);
            return cursor;
        }
        return document.querySelector('.nav-cursor');
    }
    function updateCursorPosition(activeLink) {
        const cursor = document.querySelector('.nav-cursor');
        const navLinksContainer = document.querySelector('.nav-links');
        if (cursor && activeLink && navLinksContainer) {
            const containerRect = navLinksContainer.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            const leftPosition = linkRect.left - containerRect.left;
            cursor.style.left = `${leftPosition}px`;
        }
    }
    window.updateCursorPosition = updateCursorPosition;
    if (menuLinks.length > 0) {
        setTimeout(() => {
            createNavCursor();
        }, 100);
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    menuLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    updateCursorPosition(this);
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        const sections = document.querySelectorAll('#about, #work, #contact');
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
        };
        const observer = new IntersectionObserver((entries) => {
            let mostVisibleSection = null;
            let highestRatio = 0;
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
                    highestRatio = entry.intersectionRatio;
                    mostVisibleSection = entry.target;
                }
            });
            if (mostVisibleSection && highestRatio > 0.25) {
                const targetId = `#${mostVisibleSection.id}`;
                const correspondingLink = document.querySelector(`#menu a[href="${targetId}"]`);
                const currentlyActive = document.querySelector('#menu a.active');
                if (correspondingLink && correspondingLink !== currentlyActive) {
                    menuLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                    updateCursorPosition(correspondingLink);
                }
            }
        }, observerOptions);
        sections.forEach(section => {
            observer.observe(section);
        });
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPosition = window.scrollY + window.innerHeight / 3;
                let currentSection = null;
                let bestMatch = null;
                let smallestDistance = Infinity;
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionMiddle = sectionTop + (section.offsetHeight / 2);
                    const distance = Math.abs(scrollPosition - sectionMiddle);
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        bestMatch = section;
                    }
                    const sectionBottom = sectionTop + section.offsetHeight;
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        currentSection = section;
                    }
                });
                const targetSection = currentSection || bestMatch;
                if (targetSection) {
                    const targetId = `#${targetSection.id}`;
                    const correspondingLink = document.querySelector(`#menu a[href="${targetId}"]`);
                    const currentlyActive = document.querySelector('#menu a.active');
                    if (correspondingLink && correspondingLink !== currentlyActive) {
                        menuLinks.forEach(link => link.classList.remove('active'));
                        correspondingLink.classList.add('active');
                        updateCursorPosition(correspondingLink);
                    }
                }
            }, 100); 
        });
        setTimeout(() => {
            const hash = window.location.hash;
            let targetSection = null;
            let targetLink = null;
            if (hash && hash.length > 1) {
                targetSection = document.querySelector(hash);
                if (targetSection) {
                    targetLink = document.querySelector(`#menu a[href="${hash}"]`);
                }
            }
            if (!targetSection || !targetLink) {
                targetSection = document.querySelector('#about');
                targetLink = document.querySelector('#menu a[href="#about"]');
            }
            if (targetLink) {
                menuLinks.forEach(link => link.classList.remove('active'));
                targetLink.classList.add('active');
                updateCursorPosition(targetLink);
                if (targetSection && hash) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }, 200);
        window.addEventListener('resize', () => {
            const activeLink = document.querySelector('#menu a.active');
            if (activeLink) {
                updateCursorPosition(activeLink);
            }
        });
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash && hash.length > 1) {
                const targetSection = document.querySelector(hash);
                const targetLink = document.querySelector(`#menu a[href="${hash}"]`);
                if (targetSection && targetLink) {
                    menuLinks.forEach(link => link.classList.remove('active'));
                    targetLink.classList.add('active');
                    updateCursorPosition(targetLink);
                }
            }
        });
    }
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    if (dropbtn) {
        dropbtn.addEventListener('click', function() {
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });
    }
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            if (dropdownContent) dropdownContent.style.display = 'none';
        }
    });
    if (btn) {
        btn.addEventListener('mousemove', function(e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.setProperty('--x', '50%');
            btn.style.setProperty('--y', '50%');
        });
    }
    const dropdown = document.querySelector('.dropdown');
    let timeout;
    if (dropdown) {
        dropdown.addEventListener('mouseover', () => {
            clearTimeout(timeout);
            if (dropdownContent) {
                dropdownContent.style.display = 'block';
                dropdownContent.style.opacity = '1';
                dropdownContent.style.visibility = 'visible';
            }
        });
        dropdown.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                if (dropdownContent) {
                    dropdownContent.style.display = 'none';
                    dropdownContent.style.opacity = '0';
                    dropdownContent.style.visibility = 'hidden';
                }
            }, 300);
        });
    }

    // InStay horizontal scroll gallery
    (function initInStayScrollGallery() {
        const section = document.querySelector('.instay-scroll-gallery');
        const pin = section?.querySelector('.instay-scroll-pin');
        const track = section?.querySelector('.instay-scroll-track');
        if (!section || !pin || !track) return;
        const screens = Array.from(section.querySelectorAll('.instay-screen'));

        let totalScroll = 0; 
        let maxTranslate = 0; 
        let sectionTop = 0;   
        let endLock = false; 
        let rafId = null;    

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stickySupported = (() => {
            const el = document.createElement('div');
            try {
                el.style.position = 'sticky';
                return el.style.position.includes('sticky');
            } catch { return false; }
        })();
        const useFallback = prefersReduced || !stickySupported;
        if (useFallback) {
            section.classList.add('instay-fallback');
        }

        function computeMetrics() {
            const trackWidth = track.scrollWidth;
            const vw = window.innerWidth;
            maxTranslate = Math.max(0, trackWidth - vw);
            const vh = window.innerHeight;
            totalScroll = Math.max(vh, maxTranslate + vh * 0.35);
            sectionTop = section.getBoundingClientRect().top + window.scrollY;
            section.style.setProperty('--instay-scroll-length', `${totalScroll}px`);
        }

        function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

        let depthRaf = null;
        let lastCenterIdx = -1;
        const applyDepthEffect = () => {
            depthRaf = null;
            if (!screens.length) return;
            const centerX = window.innerWidth / 2;
            const influence = Math.max(240, Math.min(window.innerWidth * 0.35, 520));
            let bestIdx = -1;
            let bestScore = -Infinity;
            for (let i = 0; i < screens.length; i++) {
                const rect = screens[i].getBoundingClientRect();
                const imgCenter = rect.left + rect.width / 2;
                const dx = Math.abs(imgCenter - centerX);
                const t = Math.max(0, 1 - dx / influence); // 0..1
                if (t > bestScore) { bestScore = t; bestIdx = i; }
            }
            if (bestIdx !== lastCenterIdx) {
                if (lastCenterIdx >= 0) screens[lastCenterIdx].classList.remove('is-center');
                if (bestIdx >= 0) screens[bestIdx].classList.add('is-center');
                lastCenterIdx = bestIdx;
            }
        };

        function scheduleDepthUpdate() {
            if (depthRaf) return;
            depthRaf = requestAnimationFrame(applyDepthEffect);
        }

        function applyScroll() {
            rafId = null;
            const y = window.scrollY;
            const progress = clamp((y - sectionTop) / (totalScroll || 1), 0, 1);
            const translate = -maxTranslate * progress; // move left
            track.style.transform = `translate3d(${translate}px,0,0)`;

            if (progress >= 1 && !endLock) {
                endLock = true;
                track.style.transform = `translate3d(${-maxTranslate}px,0,0)`;
            } else if (progress < 1 && endLock) {
                endLock = false;
            }
            scheduleDepthUpdate();
        }

        function onScroll() {
            if (useFallback) return;
            if (rafId) return;
            rafId = requestAnimationFrame(applyScroll);
        }

        const ro = new ResizeObserver(() => {
            computeMetrics();
            applyScroll();
        });
        ro.observe(track);
        const recompute = () => { computeMetrics(); applyScroll(); scheduleDepthUpdate(); };
        window.addEventListener('resize', recompute);
        window.addEventListener('load', recompute);
        if (window.visualViewport) {
            visualViewport.addEventListener('resize', recompute);
        }
        window.addEventListener('orientationchange', () => setTimeout(recompute, 250));
        window.addEventListener('scroll', onScroll, { passive: true });
        computeMetrics();
        applyScroll();
        scheduleDepthUpdate();
    })();

    // InStay zoom section
    (function initInStayZoomSection() {
        const stage = document.querySelector('.instay-zoom-stage');
        const pin = stage?.querySelector('.instay-zoom-pin');
        const canvas = stage?.querySelector('.instay-zoom-canvas');
        const img = stage?.querySelector('.instay-zoom-image');
        if (!stage || !pin || !canvas || !img) return;

        let zoomLength = 0; 
        let stageTop = 0;    
        let startScale = 1.0;
        let endScale = 1.0;
        let rafId = null;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stickySupported = (() => {
            const el = document.createElement('div');
            try {
                el.style.position = 'sticky';
                return el.style.position.includes('sticky');
            } catch { return false; }
        })();
        const isCoarse = window.matchMedia('(pointer: coarse)').matches;
        const isSmall = window.matchMedia('(max-width: 900px)').matches;
        const useFallback = prefersReduced || !stickySupported || isCoarse || isSmall;
        if (useFallback) {
            stage.classList.add('instay-zoom-fallback');
        }

        function computeZoomMetrics() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const toutMax = 950; 
            const canvasRect = canvas.getBoundingClientRect();
            const canvasWidth = Math.min(toutMax, vw);
                const startTarget = Math.max(vw, vh) * 1.4;
            endScale = 1.0;
                startScale = Math.max(1.45, startTarget / canvasWidth); 
                zoomLength = Math.max(vh * 1.6, (startScale - endScale) * 1100 + vh * 0.25);
            stage.style.setProperty('--instay-zoom-length', `${Math.round(zoomLength)}px`);
            stageTop = stage.getBoundingClientRect().top + window.scrollY;
        }

        function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

        function applyZoomScroll() {
            rafId = null;
            const y = window.scrollY;
            const progress = clamp((y - stageTop) / (zoomLength || 1), 0, 1);
            const scale = startScale + (endScale - startScale) * progress;
            img.style.transform = `translateZ(0) scale(${scale})`;
        }
        function onZoomScroll() {
            if (useFallback) return; 
            if (rafId) return;
            rafId = requestAnimationFrame(applyZoomScroll);
        }

        const ro = new ResizeObserver(() => { computeZoomMetrics(); applyZoomScroll(); });
        ro.observe(canvas);
        const recomputeZoom = () => { computeZoomMetrics(); applyZoomScroll(); };
        window.addEventListener('resize', recomputeZoom);
        window.addEventListener('load', recomputeZoom);
        if (window.visualViewport) {
            visualViewport.addEventListener('resize', recomputeZoom);
        }
        window.addEventListener('orientationchange', () => setTimeout(recomputeZoom, 250));
        window.addEventListener('scroll', onZoomScroll, { passive: true });
        computeZoomMetrics();
        applyZoomScroll();
    })();

    (function initInStayCrossfades() {
        const stages = Array.from(document.querySelectorAll('.instay-crossfade-stage'));
        if (!stages.length) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stickySupported = (() => { const el = document.createElement('div'); try { el.style.position = 'sticky'; return el.style.position.includes('sticky'); } catch { return false; } })();
        const isCoarse = window.matchMedia('(pointer: coarse)').matches;
        const isSmall = window.matchMedia('(max-width: 900px)').matches;
        const useFallback = prefersReduced || !stickySupported || isCoarse || isSmall;

        const sections = stages.map(stage => {
            const wrapper = stage.querySelector('.instay-crossfade-wrapper');
            const pin = stage.querySelector('.instay-crossfade-pin');
            const beforeImg = stage.querySelector('.instay-before');
            if (!wrapper || !pin || !beforeImg) return null;
            return { stage, beforeImg, scrollLength: 0, stageTop: 0, rafId: null };
        }).filter(Boolean);
        if (!sections.length) return;

        function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

        function computeMetrics(sec) {
            const vh = window.innerHeight;
            sec.scrollLength = Math.max(vh * 1.1, 700);
            sec.stage.style.setProperty('--instay-crossfade-length', `${Math.round(sec.scrollLength)}px`);
            sec.stageTop = sec.stage.getBoundingClientRect().top + window.scrollY;
        }

        function computeAll() { sections.forEach(computeMetrics); }

        function applyScroll(sec) {
            sec.rafId = null;
            const y = window.scrollY;
            const progress = clamp((y - sec.stageTop) / (sec.scrollLength || 1), 0, 1);
            const opacity = 1 - progress;
            sec.beforeImg.style.setProperty('--instay-before-opacity', String(opacity));
            sec.beforeImg.style.opacity = opacity;
        }

        function onScroll() {
            if (useFallback) return;
            sections.forEach(sec => {
                if (sec.rafId) return;
                sec.rafId = requestAnimationFrame(() => applyScroll(sec));
            });
        }

        const recompute = () => { computeAll(); sections.forEach(applyScroll); };
        window.addEventListener('resize', recompute);
        window.addEventListener('load', recompute);
        if (window.visualViewport) visualViewport.addEventListener('resize', recompute);
        window.addEventListener('orientationchange', () => setTimeout(recompute, 250));
        window.addEventListener('scroll', onScroll, { passive: true });

        computeAll();
        sections.forEach(applyScroll);

        if (useFallback) {
            sections.forEach(sec => { sec.beforeImg.style.opacity = '0'; });
        }
    })();

    const heroMain = document.querySelector('.hero-main');
    let patternIndex = -1;
    let patterns = null;
    
    const pageLoadSeed = Date.now() * Math.random() * (window.innerWidth + window.innerHeight);
    
    function shuffleArray(array, extraEntropy = 0) {
        const shuffled = [...array]; 
        
        let randomFunc = Math.random;
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array32 = new Uint32Array(1);
            randomFunc = () => {
                crypto.getRandomValues(array32);
                return array32[0] / (0xFFFFFFFF + 1);
            };
        }
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const entropy = Date.now() + performance.now() + Math.random() * 1000000 + extraEntropy;
            const randomValue = randomFunc() * entropy;
            const j = Math.floor(randomValue % (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Hero pattern initialization
    function initializePatterns() {
        if (!heroMain) return;
        
        const screenEntropy = window.screen.width * window.screen.height;
        const browserEntropy = navigator.userAgent.length + navigator.language.charCodeAt(0);
        const timingEntropy = Date.now() + performance.now();
        const randomEntropy = Math.random() * 10000000;
        const documentEntropy = document.readyState.charCodeAt(0) * document.title.length;
        
        const baseArray = ['pattern-1', 'pattern-2', 'pattern-3', 'pattern-5'];
        const combinedEntropy = screenEntropy + browserEntropy + timingEntropy + randomEntropy + documentEntropy + pageLoadSeed;
        patterns = shuffleArray(baseArray, combinedEntropy);
        
        let randomValue = Math.random();
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array32 = new Uint32Array(1);
            crypto.getRandomValues(array32);
            randomValue = array32[0] / (0xFFFFFFFF + 1);
        }
        
        const randomInitialIndex = Math.floor(randomValue * patterns.length);
        patternIndex = randomInitialIndex;
        
        setTimeout(() => {
            heroMain.classList.add(patterns[patternIndex]);
        }, 50);
    }

    if (heroMain) {
        initializePatterns();
        
        let mouseEntropy = 0;
        document.addEventListener('mousemove', (e) => {
            mouseEntropy += e.clientX + e.clientY;
        });
        
        heroMain.addEventListener('mouseenter', () => {
            const baseArray = ['pattern-1', 'pattern-2', 'pattern-3', 'pattern-5'];
            patterns = shuffleArray(baseArray, mouseEntropy + Date.now());
            
            heroMain.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            baseArray.forEach(pattern => heroMain.classList.remove(pattern));
            
            patternIndex = (patternIndex + 1) % patterns.length;
            heroMain.classList.add(patterns[patternIndex]);
            
            setTimeout(() => {
                heroMain.style.transition = '';
            }, 800);
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('current-year');
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
    
    // Hero card zoom effect
    const heroCards = document.querySelectorAll('.hero-card');
    heroCards.forEach(card => {
        const bgImage = window.getComputedStyle(card).backgroundImage;
        if (bgImage && bgImage !== 'none') {
            card.style.setProperty('--bg-image', bgImage);
        }
    });
    
    
    // Language switching - Remove this duplicate handler as it's already handled by TranslationManager
    // The TranslationManager.setupLanguageSwitcher() already handles all [data-lang] clicks
});
