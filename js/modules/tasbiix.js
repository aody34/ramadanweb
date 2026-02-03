/**
 * Tasbiix (Digital Counter) Module
 */

import { pulseAnimation, animateNumber, animateProgressRing } from './animations.js';

// Storage key
const STORAGE_KEY = 'hadiye_tasbiix';

// State
let state = {
    count: 0,
    target: 33,
    dhikr: 'سبحان الله',
    totalToday: 0,
    lastReset: new Date().toDateString()
};

/**
 * Load state from localStorage
 */
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);

            // Reset if new day
            if (parsed.lastReset !== new Date().toDateString()) {
                parsed.count = 0;
                parsed.lastReset = new Date().toDateString();
            }

            state = { ...state, ...parsed };
        }
    } catch (error) {
        console.error('Failed to load tasbiix state:', error);
    }
}

/**
 * Save state to localStorage
 */
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save tasbiix state:', error);
    }
}

/**
 * Get current state
 * @returns {Object} Current state
 */
export function getState() {
    return { ...state };
}

/**
 * Increment counter
 * @returns {Object} Updated state
 */
export function increment() {
    const oldCount = state.count;
    state.count++;
    state.totalToday++;

    // Check if target reached
    const targetReached = state.count >= state.target;

    if (targetReached) {
        // Reset after reaching target
        setTimeout(() => {
            state.count = 0;
            updateUI();
            saveState();
        }, 1000);
    }

    saveState();
    updateUI(oldCount);

    return {
        ...state,
        targetReached
    };
}

/**
 * Reset counter
 */
export function reset() {
    state.count = 0;
    saveState();
    updateUI();
}

/**
 * Set target
 * @param {number} target - New target
 */
export function setTarget(target) {
    state.target = target;
    state.count = 0;
    saveState();
    updateUI();
}

/**
 * Set dhikr
 * @param {string} dhikr - New dhikr text
 */
export function setDhikr(dhikr) {
    state.dhikr = dhikr;
    saveState();
    updateDhikrUI();
}

/**
 * Update UI elements
 * @param {number} oldCount - Previous count for animation
 */
function updateUI(oldCount = 0) {
    const counterValue = document.getElementById('counter-value');
    const progressFill = document.getElementById('progress-fill');
    const tasbiixBtn = document.getElementById('tasbiix-btn');

    if (counterValue) {
        // Animate number change
        animateNumber(counterValue, oldCount, state.count);
    }

    if (progressFill) {
        // Update progress ring
        const progress = (state.count / state.target) * 100;
        animateProgressRing(progressFill, progress);
    }

    // Pulse animation on button
    if (tasbiixBtn && oldCount !== state.count) {
        pulseAnimation(tasbiixBtn);
    }

    // Celebration on target
    if (state.count >= state.target && tasbiixBtn) {
        tasbiixBtn.classList.add('tasbiix-complete');
        setTimeout(() => {
            tasbiixBtn.classList.remove('tasbiix-complete');
        }, 600);
    }
}

/**
 * Update dhikr text in UI
 */
function updateDhikrUI() {
    const btnText = document.querySelector('.btn-text');
    if (btnText) {
        btnText.textContent = state.dhikr;
    }
}

/**
 * Initialize Tasbiix
 */
export function initTasbiix() {
    // Load saved state
    loadState();

    // Get DOM elements
    const tasbiixBtn = document.getElementById('tasbiix-btn');
    const resetBtn = document.getElementById('tasbiix-reset');
    const targetBtns = document.querySelectorAll('.target-btn');
    const dhikrBtns = document.querySelectorAll('.dhikr-btn');
    const progressFill = document.getElementById('progress-fill');

    // Set initial progress ring
    if (progressFill) {
        const circumference = 2 * Math.PI * 90;
        progressFill.style.strokeDasharray = circumference;
        progressFill.style.strokeDashoffset = circumference;
    }

    // Main button click
    if (tasbiixBtn) {
        tasbiixBtn.addEventListener('click', () => {
            increment();

            // Haptic feedback (if supported)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    increment();
                }
            }
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Ma hubtaa inaad dib u bilowdo?')) {
                reset();
            }
        });
    }

    // Target buttons
    targetBtns.forEach(btn => {
        if (parseInt(btn.dataset.target) === state.target) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            targetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setTarget(parseInt(btn.dataset.target));
        });
    });

    // Dhikr buttons
    dhikrBtns.forEach(btn => {
        if (btn.dataset.dhikr === state.dhikr) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            dhikrBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setDhikr(btn.dataset.dhikr);
        });
    });

    // Initial UI update
    updateUI();
    updateDhikrUI();
}

export default {
    getState,
    increment,
    reset,
    setTarget,
    setDhikr,
    initTasbiix
};
