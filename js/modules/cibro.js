/**
 * Cibro (Daily Reflection) Module
 * Enhanced with cinematic GSAP animations
 */

import { getCurrentRamadanDay, isRamadan } from './ramadan.js';
import { typewriterEffect, wordByWordReveal, setupScrollTrigger } from './animations.js';

let reflectionsData = null;

/**
 * Load reflections data
 */
async function loadReflections() {
    if (reflectionsData) return reflectionsData;

    try {
        const response = await fetch('./data/reflections.json');
        reflectionsData = await response.json();
        return reflectionsData;
    } catch (error) {
        console.error('Failed to load reflections:', error);
        return null;
    }
}

/**
 * Get daily reflection based on current Ramadan day
 * @param {number} day - Day number (1-30), optional
 * @returns {Object|null} Reflection object
 */
export async function getDailyReflection(day = null) {
    const data = await loadReflections();
    if (!data) return null;

    // If day not specified, get current day
    if (day === null) {
        day = getCurrentRamadanDay();
    }

    // If not Ramadan or day is null, return preparation
    if (!day || !isRamadan()) {
        return {
            type: 'preparation',
            ...data.preparation
        };
    }

    // Find daily reflection
    const reflection = data.daily.find(r => r.day === day);

    if (reflection) {
        return {
            type: 'daily',
            ...reflection
        };
    }

    return null;
}

/**
 * Render Cibro section with enhanced animations
 * @param {Object} containers - DOM element containers
 */
export async function renderCibro(containers) {
    const { ayahEl, referenceEl, reflectionEl, duaEl } = containers;

    const reflection = await getDailyReflection();

    if (!reflection) {
        ayahEl.textContent = 'Unable to load reflection';
        return;
    }

    // Set initial content (hidden)
    ayahEl.textContent = reflection.ayah;
    referenceEl.textContent = `— ${reflection.surah}`;

    // Split reflection into paragraphs for scroll animation
    const sentences = reflection.reflection.split('. ').filter(s => s.trim());
    reflectionEl.innerHTML = sentences.map((sentence, i) =>
        `<p class="reflection-paragraph" data-index="${i}">${sentence.trim()}${i < sentences.length - 1 ? '.' : ''}</p>`
    ).join('');

    // Store dua for word-by-word animation
    duaEl.dataset.dua = reflection.dua;
    duaEl.textContent = '';

    // Trigger cinematic animations
    animateCibro(containers, reflection);
}

/**
 * Animate Cibro section with cinematic effects
 * @param {Object} containers - DOM containers
 * @param {Object} reflection - Reflection data
 */
function animateCibro(containers, reflection) {
    const { ayahEl, referenceEl, reflectionEl, duaEl } = containers;

    // Create master timeline
    const tl = gsap.timeline({
        defaults: { ease: 'power2.out' }
    });

    // 1. Ayah: Slow blur-to-focus reveal
    tl.fromTo(ayahEl,
        {
            opacity: 0,
            y: 40,
            filter: 'blur(15px)',
            scale: 0.95
        },
        {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            duration: 2,
            ease: 'power2.out'
        }
    )
        // 2. Reference: Subtle fade
        .fromTo(referenceEl,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.8'
        )
        // 3. Reflection paragraphs: Staggered reveal
        .add(() => {
            const paragraphs = reflectionEl.querySelectorAll('.reflection-paragraph');
            gsap.fromTo(paragraphs,
                {
                    opacity: 0,
                    y: 30,
                    filter: 'blur(4px)'
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1,
                    stagger: 0.4,
                    ease: 'power2.out'
                }
            );

            // Setup ScrollTrigger for cinematic focus
            setTimeout(() => {
                setupCibroScrollTrigger(paragraphs);
            }, 1500);
        }, '+=0.5')
        // 4. Dua: Word-by-word breathing reveal
        .add(() => {
            if (duaEl.dataset.dua) {
                wordByWordReveal(duaEl, duaEl.dataset.dua, {
                    wordDelay: 0.3,
                    duration: 0.6,
                    blur: 6
                });
            }
        }, '+=2')
        // 5. Dua container reveal
        .fromTo(duaEl.parentElement,
            { opacity: 0, y: 20, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 1 },
            '-=1'
        );
}

/**
 * Setup ScrollTrigger for Cibro paragraphs
 * Creates cinematic focus effect on scroll
 * @param {NodeList} paragraphs - Paragraph elements
 */
function setupCibroScrollTrigger(paragraphs) {
    paragraphs.forEach((para, index) => {
        // Fade in on scroll
        gsap.to(para, {
            scrollTrigger: {
                trigger: para,
                start: 'top 75%',
                end: 'top 40%',
                scrub: 0.8,
                toggleActions: 'play reverse play reverse'
            },
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            color: '#f5f5f5',
            ease: 'power2.inOut'
        });

        // Fade out as it scrolls past
        gsap.to(para, {
            scrollTrigger: {
                trigger: para,
                start: 'top 25%',
                end: 'top 5%',
                scrub: 0.8
            },
            opacity: 0.4,
            filter: 'blur(2px)',
            scale: 0.98,
            color: '#6b7280',
            ease: 'power2.inOut'
        });
    });
}

/**
 * Initialize Cibro section
 */
export async function initCibro() {
    const ayahEl = document.getElementById('cibro-ayah');
    const referenceEl = document.getElementById('cibro-reference');
    const reflectionEl = document.getElementById('cibro-reflection');
    const duaEl = document.getElementById('dua-arabic');

    if (!ayahEl || !referenceEl || !reflectionEl || !duaEl) {
        console.error('Cibro elements not found');
        return;
    }

    await renderCibro({
        ayahEl,
        referenceEl,
        reflectionEl,
        duaEl
    });
}

export default {
    getDailyReflection,
    renderCibro,
    initCibro
};

