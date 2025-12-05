document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Reveal on scroll
    const revealItems = document.querySelectorAll('.reveal');
    if (revealItems.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        revealItems.forEach(item => observer.observe(item));
    }

    // Visit counter and location
    const visitCountEl = document.querySelector('[data-visit-count]');
    const visitLocationEl = document.querySelector('[data-visit-location]');
    const mapDots = document.querySelectorAll('[data-continent-dot]');
    const continentCounters = document.querySelectorAll('[data-continent-count]');
    const countNamespace = 'abhineet-pandey.github.io';
    const continentNames = {
        NA: 'North America',
        SA: 'South America',
        EU: 'Europe',
        AF: 'Africa',
        AS: 'Asia',
        OC: 'Oceania'
    };

    const ipInfoPromise = fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .catch(() => null);

    if (visitCountEl) {
        fetch(`https://api.countapi.xyz/hit/${countNamespace}/homepage`)
            .then(res => res.json())
            .then(data => {
                const count = data?.value;
                visitCountEl.textContent = typeof count === 'number' ? count.toLocaleString() : '—';
            })
            .catch(() => {
                visitCountEl.textContent = '—';
            });
    }

    if (visitLocationEl) {
        ipInfoPromise
            .then(data => {
                const city = data?.city;
                const region = data?.region;
                const country = data?.country_name;
                const parts = [city, region, country].filter(Boolean);
                visitLocationEl.textContent = parts.length ? parts.join(', ') : 'Location unavailable';
            })
            .catch(() => {
                visitLocationEl.textContent = 'Location unavailable';
            });
    }

    const updateContinentDots = (code, count) => {
        const dot = document.querySelector(`[data-continent-dot="${code}"]`);
        if (!dot) return;
        const size = Math.min(12 + Math.log((count || 0) + 1) * 6, 28);
        dot.style.setProperty('--dot-size', `${size}px`);
        dot.title = `${continentNames[code]}: ${typeof count === 'number' ? count.toLocaleString() : '—'}`;
    };

    const updateContinentCounts = () => {
        if (!continentCounters.length && !mapDots.length) return;
        const codes = Object.keys(continentNames);

        Promise.all(codes.map(code =>
            fetch(`https://api.countapi.xyz/get/${countNamespace}/visits-${code}`)
                .then(res => res.json())
                .then(data => ({ code, count: data?.value ?? 0 }))
                .catch(() => ({ code, count: null }))
        )).then(results => {
            results.forEach(({ code, count }) => {
                const el = document.querySelector(`[data-continent-count="${code}"]`);
                if (el) {
                    el.textContent = typeof count === 'number' ? count.toLocaleString() : '—';
                }
                updateContinentDots(code, count || 0);
            });
        });
    };

    if (mapDots.length || continentCounters.length) {
        ipInfoPromise.then(data => {
            const continentCode = data?.continent_code;
            if (continentCode && continentNames[continentCode]) {
                fetch(`https://api.countapi.xyz/hit/${countNamespace}/visits-${continentCode}`).catch(() => { });
            }
        }).finally(updateContinentCounts);

        if (!visitLocationEl) {
            ipInfoPromise.catch(() => null);
        }
    }

    // Lightbox for hobby gallery
    const lightbox = document.querySelector('[data-lightbox]');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const thumbImages = document.querySelectorAll('[data-lightbox-src]');

    const closeLightbox = () => {
        if (lightbox) {
            lightbox.classList.remove('is-open');
        }
    };

    const openLightbox = (src, alt, caption) => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        if (lightboxCaption) {
            lightboxCaption.textContent = caption || alt || '';
        }
        lightbox.classList.add('is-open');
    };

    thumbImages.forEach(img => {
        img.setAttribute('tabindex', '0');
        img.addEventListener('click', () => {
            openLightbox(
                img.dataset.lightboxSrc || img.src,
                img.alt,
                img.dataset.lightboxCaption
            );
        });
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(
                    img.dataset.lightboxSrc || img.src,
                    img.alt,
                    img.dataset.lightboxCaption
                );
            }
        });
    });

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
});
