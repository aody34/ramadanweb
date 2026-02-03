/**
 * Cibro (Daily Reflection) Module
 */

import { getCurrentRamadanDay, isRamadan } from './ramadan.js';
import { typewriterEffect, blurToFocusReveal, createCibroTimeline } from './animations.js';

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
 * Render Cibro section
 * @param {Object} containers - DOM element containers
 */
export async function renderCibro(containers) {
    const { ayahEl, referenceEl, reflectionEl, duaEl } = containers;

    const reflection = await getDailyReflection();

    if (!reflection) {
        ayahEl.textContent = 'Unable to load reflection';
        return;
    }

    // Set content
    ayahEl.textContent = reflection.ayah;
    referenceEl.textContent = `— ${reflection.surah}`;

    // Store reflection text for typewriter
    reflectionEl.dataset.text = reflection.reflection;
    reflectionEl.textContent = '';

    // Set dua
    duaEl.textContent = reflection.dua;

    // Trigger animations
    animateCibro(containers, reflection);
}

/**
 * Animate Cibro section
 * @param {Object} containers - DOM containers
 * @param {Object} reflection - Reflection data
 */
function animateCibro(containers, reflection) {
    const { ayahEl, referenceEl, reflectionEl, duaEl } = containers;

    // Create timeline
    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' }
    });

    // Ayah blur to focus
    tl.fromTo(ayahEl,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5 }
    )
        // Reference fade
        .fromTo(referenceEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            '-=0.5'
        )
        // Typewriter for reflection
        .add(() => {
            typewriterEffect(reflectionEl, reflection.reflection, {
                speed: 0.025,
                showCursor: true
            });
        }, '+=0.5')
        // Dua reveal
        .fromTo(duaEl.parentElement,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1 },
            '+=3'
        );
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
