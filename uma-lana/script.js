// Data for Catalog
const products = [
    { id: 1, name: "Chompa Clásica Verde", price: "Bs. 250", category: "adultos", image: "assets/images/adults.png" },
    { id: 2, name: "Suéter Marfil Cálido", price: "Bs. 280", category: "adultos", image: "assets/images/editorial.png" },
    { id: 3, name: "Chompa Bebé Verde", price: "Bs. 120", category: "ninos", image: "assets/images/kids.png" },
    { id: 4, name: "Poncho Andino", price: "Bs. 350", category: "adultos", image: "assets/images/adults.png" },
    { id: 5, name: "Gorro y Bufanda", price: "Bs. 90", category: "ninos", image: "assets/images/kids.png" },
    { id: 6, name: "Suéter Tejido Artesanal", price: "Bs. 400", category: "adultos", image: "assets/images/texture.png" }
];

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

    // Integrate Lenis with GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 2. Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.3 });
        });
    }

    // 3. Preloader & Hero Animation Timeline
    const tl = gsap.timeline();

    tl.to(".preloader-text span", {
        y: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out"
    })
    .to(".preloader-text span", {
        y: "-100%",
        stagger: 0.05,
        duration: 0.6,
        ease: "power3.in",
        delay: 0.5
    })
    .to(".preloader", {
        y: "-100%",
        duration: 0.8,
        ease: "expo.inOut"
    })
    .to(".hero-bg", {
        scale: 1,
        duration: 1.5,
        ease: "power3.out"
    }, "-=0.5")
    .to(".hero-title", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=1")
    .to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8")
    .to(".hero-buttons, .scroll-indicator", {
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    }, "-=0.5");

    // Parallax on Hero bg
    gsap.to(".hero-bg", {
        y: "30%",
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // 4. Navbar Change on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 5. Scroll Reveals (GSAP)
    const revealUps = document.querySelectorAll('.reveal-up');
    revealUps.forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    gsap.from(".reveal-left", {
        scrollTrigger: { trigger: ".historia", start: "top 70%" },
        x: -50, opacity: 0, duration: 1.2, ease: "power3.out"
    });

    gsap.from(".reveal-right", {
        scrollTrigger: { trigger: ".historia", start: "top 70%" },
        x: 50, opacity: 0, duration: 1.2, ease: "power3.out"
    });

    // 6. Number Counter Animation
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        ScrollTrigger.create({
            trigger: stat,
            start: "top 80%",
            onEnter: () => {
                gsap.to(stat, {
                    innerHTML: target,
                    duration: 2,
                    snap: { innerHTML: 1 },
                    ease: "power1.out"
                });
            },
            once: true
        });
    });

    // 7. Render Catalog dynamically
    const catalogGrid = document.getElementById('catalog-grid');
    
    function renderProducts(filter) {
        catalogGrid.innerHTML = '';
        const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
        
        filtered.forEach((product, i) => {
            const el = document.createElement('div');
            el.className = 'product-card reveal-up';
            el.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <span class="product-price">${product.price}</span>
                </div>
            `;
            catalogGrid.appendChild(el);
            
            // Trigger animation for dynamically added elements if in view
            gsap.from(el, {
                y: 50, opacity: 0, duration: 0.8, delay: i * 0.1, ease: "power3.out"
            });
        });
    }
    
    renderProducts('all');

    // Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderProducts(e.target.getAttribute('data-filter'));
            // Refresh ScrollTrigger after DOM change
            setTimeout(() => ScrollTrigger.refresh(), 100);
        });
    });

    // 8. Testimonials Swiper
    new Swiper('.testimonials-slider', {
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        slidesPerView: 1,
        spaceBetween: 30,
        breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });

    // 9. SVG Timeline drawing
    const drawPath = document.querySelector('.draw-path');
    if (drawPath) {
        const length = drawPath.getTotalLength();
        gsap.set(drawPath, { strokeDasharray: length, strokeDashoffset: length });
        
        gsap.to(drawPath, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".process-timeline",
                start: "top 60%",
                end: "bottom 80%",
                scrub: 1
            }
        });
    }

    // 10. Smooth Anchor Links (lenis instead of native)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    lenis.scrollTo(target);
                }
            }
        });
    });

});
