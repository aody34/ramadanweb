/**
 * GSAP Animations Module - Cinematic effects for Hadiye
 */

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Typewriter effect for meditative text reveal
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to reveal
 * @param {Object} options - Animation options
 */
export function typewriterEffect(element, text, options = {}) {
    const {
        speed = 0.03,
        delay = 0,
        onComplete = null,
        showCursor = true
    } = options;

    // Clear existing content
    element.innerHTML = '';
    element.style.opacity = '1';

    // Create character spans
    const chars = text.split('');
    chars.forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(span);
    });

    // Add cursor if enabled
    if (showCursor) {
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        element.appendChild(cursor);
    }

    // Animate characters
    const charElements = element.querySelectorAll('.char');
    const tl = gsap.timeline({
        delay,
        onComplete: () => {
            // Remove cursor after completion
            const cursor = element.querySelector('.typewriter-cursor');
            if (cursor) {
                gsap.to(cursor, {
                    opacity: 0,
                    duration: 0.3,
                    delay: 1
                });
            }
            if (onComplete) onComplete();
        }
    });

    tl.to(charElements, {
        opacity: 1,
        duration: 0.05,
        stagger: speed,
        ease: 'none'
    });

    return tl;
}

/**
 * Blur to focus reveal effect
 * @param {HTMLElement} element - Target element
 * @param {Object} options - Animation options
 */
export function blurToFocusReveal(element, options = {}) {
    const {
        duration = 1.2,
        delay = 0,
        blur = 10,
        y = 20
    } = options;

    gsap.set(element, {
        opacity: 0,
        filter: `blur(${blur}px)`,
        y
    });

    return gsap.to(element, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration,
        delay,
        ease: 'power2.out'
    });
}

/**
 * Staggered reveal for Ayahs
 * @param {NodeList|Array} elements - Elements to animate
 * @param {Object} options - Animation options
 */
export function ayahStaggerReveal(elements, options = {}) {
    const {
        stagger = 0.3,
        duration = 0.8,
        delay = 0,
        y = 30
    } = options;

    gsap.set(elements, {
        opacity: 0,
        y
    });

    return gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out'
    });
}

/**
 * Setup ScrollTrigger for cinematic paragraph focus
 * @param {string} selector - CSS selector for paragraphs
 */
export function setupScrollTrigger(selector) {
    const paragraphs = document.querySelectorAll(selector);

    paragraphs.forEach((para, index) => {
        // Initial state
        gsap.set(para, {
            opacity: 0.3,
            filter: 'blur(2px)',
            scale: 0.98
        });

        // ScrollTrigger animation
        gsap.to(para, {
            scrollTrigger: {
                trigger: para,
                start: 'top 70%',
                end: 'top 30%',
                scrub: 0.5,
                toggleActions: 'play reverse play reverse'
            },
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            ease: 'power2.inOut'
        });

        // Fade out as it scrolls past
        gsap.to(para, {
            scrollTrigger: {
                trigger: para,
                start: 'top 20%',
                end: 'top -10%',
                scrub: 0.5
            },
            opacity: 0.3,
            filter: 'blur(2px)',
            scale: 0.98,
            ease: 'power2.inOut'
        });
    });
}

/**
 * Pulse animation for Tasbiix counter
 * @param {HTMLElement} element - Element to pulse
 */
export function pulseAnimation(element) {
    return gsap.timeline()
        .to(element, {
            scale: 1.05,
            boxShadow: '0 0 60px rgba(212, 175, 55, 0.6)',
            duration: 0.15,
            ease: 'power2.out'
        })
        .to(element, {
            scale: 1,
            boxShadow: '0 10px 40px rgba(6, 78, 59, 0.4)',
            duration: 0.3,
            ease: 'power2.inOut'
        });
}

/**
 * Number increment animation
 * @param {HTMLElement} element - Element containing number
 * @param {number} from - Start number
 * @param {number} to - End number
 */
export function animateNumber(element, from, to) {
    const obj = { value: from };

    return gsap.to(obj, {
        value: to,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
            element.textContent = Math.round(obj.value);
        }
    });
}

/**
 * Progress ring animation for Tasbiix
 * @param {SVGElement} circle - Progress circle element
 * @param {number} progress - Progress percentage (0-100)
 */
export function animateProgressRing(circle, progress) {
    const circumference = 2 * Math.PI * 90; // r = 90
    const offset = circumference - (progress / 100) * circumference;

    return gsap.to(circle, {
        strokeDashoffset: offset,
        duration: 0.3,
        ease: 'power2.out'
    });
}

/**
 * Create Cibro section reveal timeline
 * @param {Object} elements - DOM elements
 */
export function createCibroTimeline(elements) {
    const { ayah, reference, reflection, dua } = elements;

    const tl = gsap.timeline({
        defaults: {
            ease: 'power3.out'
        }
    });

    // Ayah reveal with blur
    tl.fromTo(ayah,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2 }
    )
        // Reference fade in
        .fromTo(reference,
            { opacity: 0 },
            { opacity: 1, duration: 0.6 },
            '-=0.3'
        )
        // Reflection typewriter (handled separately)
        .add(() => {
            if (reflection.dataset.text) {
                typewriterEffect(reflection, reflection.dataset.text, { speed: 0.02 });
            }
        }, '+=0.3')
        // Dua reveal
        .fromTo(dua,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8 },
            '+=2'
        );

    return tl;
}

/**
 * Section entrance animation
 * @param {HTMLElement} section - Section element
 */
export function sectionEntrance(section) {
    const children = section.querySelectorAll('.animate-in');

    gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );
}

/**
 * Loader exit animation
 * @param {HTMLElement} loader - Loader element
 * @param {HTMLElement} app - App container
 */
export function loaderExit(loader, app) {
    const tl = gsap.timeline();

    tl.to(loader, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
            loader.classList.add('hidden');
        }
    })
        .to(app, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.3')
        .add(() => {
            app.classList.add('visible');
        });

    return tl;
}

export default {
    typewriterEffect,
    blurToFocusReveal,
    ayahStaggerReveal,
    setupScrollTrigger,
    pulseAnimation,
    animateNumber,
    animateProgressRing,
    createCibroTimeline,
    sectionEntrance,
    loaderExit
};
