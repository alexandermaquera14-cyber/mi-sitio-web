document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Lenis Smooth Scroll Setup
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);

    // 2. Custom Cursor & Magnet Effect
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (window.innerWidth > 768 && cursor) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.3 });
        });
    }

    // 3. Preloader & Conditional Animation
    const preloaderSpans = document.querySelectorAll(".preloader-text span");
    const tl = gsap.timeline();

    if (preloaderSpans.length > 0) {
        // Full animation for index.html
        tl.to(".preloader-text span", { y: 0, stagger: 0.05, duration: 0.8, ease: "power3.out" })
          .to(".preloader-text span", { y: "-100%", stagger: 0.05, duration: 0.6, ease: "power3.in", delay: 0.5 })
          .to(".preloader", { y: "-100%", duration: 0.8, ease: "expo.inOut" });
    } else {
        // Fast fade for other pages
        tl.to(".preloader", { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
        }});
    }

    // Trigger hero animations after preloader
    tl.to(".hero-slide-bg", { scale: 1, duration: 1.5, ease: "power3.out" }, "-=0.5")
      .to(".hero-title", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=1")
      .to(".hero-subtitle", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8")
      .to(".hero-buttons, .scroll-indicator", { opacity: 1, duration: 1, ease: "power3.out" }, "-=0.5");

    // 4. Hero Slider (Swiper) & Cursor Light
    if (document.querySelector('.hero-swiper')) {
        new Swiper('.hero-swiper', {
            loop: true,
            effect: 'fade',
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.hero-swiper-pagination', clickable: true },
            on: {
                slideChangeTransitionStart: function () {
                    gsap.fromTo(this.slides[this.activeIndex].querySelector('.hero-title'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.8});
                    gsap.fromTo(this.slides[this.activeIndex].querySelector('.hero-subtitle'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, delay: 0.2});
                    gsap.fromTo(this.slides[this.activeIndex].querySelector('.hero-buttons'), {opacity: 0}, {opacity: 1, duration: 0.8, delay: 0.4});
                }
            }
        });

        const heroContainer = document.querySelector('.hero-slider-container');
        const heroLight = document.querySelector('.hero-cursor-light');
        if (heroContainer && heroLight) {
            heroContainer.addEventListener('mousemove', (e) => {
                const rect = heroContainer.getBoundingClientRect();
                gsap.to(heroLight, { x: e.clientX - rect.left, y: e.clientY - rect.top, duration: 0.5 });
            });
        }
    }

    // 5. Scroll Reveals
    const revealUps = document.querySelectorAll('.reveal-up');
    revealUps.forEach(element => {
        gsap.from(element, {
            scrollTrigger: { trigger: element, start: "top 85%" },
            y: 50, opacity: 0, duration: 1, ease: "power3.out"
        });
    });

    gsap.from(".reveal-left", { scrollTrigger: { trigger: ".historia", start: "top 70%" }, x: -50, opacity: 0, duration: 1.2, ease: "power3.out" });
    gsap.from(".reveal-right", { scrollTrigger: { trigger: ".historia", start: "top 70%" }, x: 50, opacity: 0, duration: 1.2, ease: "power3.out" });

    // 6. Number Counters
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        ScrollTrigger.create({
            trigger: stat,
            start: "top 80%",
            onEnter: () => gsap.to(stat, { innerHTML: target, duration: 2, snap: { innerHTML: 1 }, ease: "power1.out" }),
            once: true
        });
    });

    // 7. Advanced Catalog Logic
    const catalogGrid = document.getElementById('catalog-grid');
    if (catalogGrid && typeof products !== 'undefined') {
        let currentFilter = 'all';
        let currentSort = 'default';
        let searchQuery = '';

        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const filterBtns = document.querySelectorAll('.filter-chips .chip');

        function renderProducts() {
            let filtered = products.filter(p => {
                const matchFilter = currentFilter === 'all' || p.target === currentFilter || p.category === currentFilter;
                const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchFilter && matchSearch;
            });

            if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
            else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
            else if (currentSort === 'new') filtered.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);

            catalogGrid.innerHTML = '';
            
            if(filtered.length === 0) {
                catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">No se encontraron productos.</p>';
                return;
            }

            filtered.forEach((p, i) => {
                let colorHtml = p.colors.map(c => `<div class="color-swatch" style="background-color: ${c}"></div>`).join('');
                let badgesHtml = '';
                if(p.isNew) badgesHtml += '<span class="badge new">Nuevo</span>';
                if(p.isBestSeller) badgesHtml += '<span class="badge best">Más Vendido</span>';

                const el = document.createElement('div');
                el.className = 'product-card reveal-up';
                el.innerHTML = `
                    <div class="product-img-wrapper" style="position: relative;">
                        <div class="product-badges">${badgesHtml}</div>
                        <img src="${p.image}" alt="${p.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <span class="product-meta">${p.target} • Talla ${p.size}</span>
                        <h3 class="product-title">${p.name}</h3>
                        <p class="product-desc">${p.description}</p>
                        <div class="product-colors">${colorHtml}</div>
                        <div class="product-footer">
                            <span class="product-price" style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-primary);">Bs. ${p.price}</span>
                        </div>
                        <div class="product-actions">
                            <a href="#" class="btn btn-sm btn-outline-dark" style="border: 1px solid var(--color-primary); color: var(--color-primary);">Ver Detalles</a>
                            <a href="https://wa.me/59176277410?text=Hola, me interesa el producto: ${p.name}" target="_blank" class="btn btn-sm btn-primary">WhatsApp</a>
                        </div>
                    </div>
                `;
                catalogGrid.appendChild(el);
                
                // Animate entry
                gsap.fromTo(el, {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, delay: i * 0.05, ease: "power2.out"});
            });
            setTimeout(() => ScrollTrigger.refresh(), 200);
        }

        if (searchInput) searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderProducts(); });
        if (sortSelect) sortSelect.addEventListener('change', (e) => { currentSort = e.target.value; renderProducts(); });
        if (filterBtns) filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.getAttribute('data-filter');
                renderProducts();
            });
        });

        renderProducts();
    }

    // 8. Testimonials Swiper
    if (document.querySelector('.testimonials-slider')) {
        new Swiper('.testimonials-slider', {
            loop: true,
            autoplay: { delay: 4000, disableOnInteraction: false },
            slidesPerView: 1,
            spaceBetween: 30,
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });
    }

    // 9. SVG Timeline drawing
    const drawPath = document.querySelector('.draw-path');
    if (drawPath) {
        const length = drawPath.getTotalLength();
        gsap.set(drawPath, { strokeDasharray: length, strokeDashoffset: length });
        
        gsap.to(drawPath, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: ".process-timeline", start: "top 60%", end: "bottom 80%", scrub: 1 }
        });
    }

    // 10. Smooth Anchor Links & Active State Update
    const vLinks = document.querySelectorAll('.v-nav-links a');
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId !== '#' && targetId.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) lenis.scrollTo(target);
            }
        });
    });

    // Update active class in vertical navbar based on scroll
    if (vLinks.length > 0) {
        const sections = Array.from(vLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(s => s);
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 200) current = section.getAttribute('id');
            });
            vLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
            });
        });
    }

    // Horizontal navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar && !document.body.classList.contains('has-v-nav')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    // Lookbook Lightbox Export
    window.openLightbox = function(src) {
        const modal = document.getElementById('lightbox-modal');
        const img = document.getElementById('lightbox-img');
        if (modal && img) {
            img.src = src;
            modal.classList.add('active');
            lenis.stop();
        }
    }
    window.closeLightbox = function() {
        const modal = document.getElementById('lightbox-modal');
        if (modal) {
            modal.classList.remove('active');
            lenis.start();
        }
    }
});
