/**
 * Hadiye - Main Application Entry
 * Islamic PWA for spiritual focus and reflection
 */

import { renderRamadanStatus } from './modules/ramadan.js';
import { initCibro } from './modules/cibro.js';
import { initQuran } from './modules/quran.js';
import { initTasbiix } from './modules/tasbiix.js';
import { loaderExit, setupScrollTrigger, sectionEntrance } from './modules/animations.js';

/**
 * Initialize the application
 */
async function init() {
    // Register Service Worker for PWA
    registerServiceWorker();

    // Wait for DOM
    await domReady();

    // Initialize components with slight delay for smooth loading
    setTimeout(async () => {
        try {
            // Exit loader animation
            const loader = document.getElementById('loader');
            const app = document.getElementById('app');

            if (loader && app) {
                loaderExit(loader, app);
            }

            // Render Ramadan status
            const ramadanStatus = document.getElementById('ramadan-status');
            if (ramadanStatus) {
                renderRamadanStatus(ramadanStatus);
            }

            // Initialize Cibro (Daily Reflection)
            await initCibro();

            // Initialize Quran section
            await initQuran();

            // Initialize Tasbiix
            initTasbiix();

            // Setup navigation
            setupNavigation();

            // Setup scroll animations
            setupScrollAnimations();

            // Slide header in
            animateHeader();

            // Wire up PWA install button
            setupInstallPrompt();

            console.log('Hadiye initialized successfully ✨');

        } catch (error) {
            console.error('Initialization error:', error);
        }
    }, 500);
}

/**
 * Wait for DOM to be ready
 */
function domReady() {
    return new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * Register Service Worker for PWA
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registered:', registration.scope);

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
    if (confirm('Version cusub ayaa diyaar ah. Ma dib u cusbooneysiinaysaa?')) {
        window.location.reload();
    }
}

/**
 * Setup navigation
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Scroll to section
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetTop = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active nav on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.section');
        const navHeight = document.querySelector('.nav').offsetHeight;
        const scrollPos = window.scrollY + navHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                const id = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

/**
 * Setup scroll animations
 */
function setupScrollAnimations() {
    // Animate sections on scroll
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
        sectionEntrance(section);
    });

    // Cinematic paragraph focus for reflections
    setupScrollTrigger('.reflection-paragraph');
}

/**
 * Animate header slide-down with GSAP
 */
function animateHeader() {
    const header = document.getElementById('app-header');
    if (!header) return;

    gsap.to(header, {
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3
    });
}

/**
 * PWA Install Prompt Handler
 * Captures the beforeinstallprompt event and wires up the install button
 */
let deferredPrompt = null;

function setupInstallPrompt() {
    const installBtn = document.getElementById('install-btn');
    if (!installBtn) return;

    // Capture the install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default mini-infobar
        e.preventDefault();
        deferredPrompt = e;

        // Show the install button with GSAP animation
        installBtn.style.display = 'flex';
        gsap.fromTo(installBtn,
            { opacity: 0, scale: 0.8, x: 20 },
            {
                opacity: 1,
                scale: 1,
                x: 0,
                duration: 0.6,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    // Add pulse class after entrance
                    installBtn.classList.add('pulse');
                }
            }
        );
    });

    // Handle install button click
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // Stop the pulse
        installBtn.classList.remove('pulse');

        // Show the install prompt
        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Install choice: ${outcome}`);

        // Reset - prompt can only be used once
        deferredPrompt = null;

        // Hide button with animation
        gsap.to(installBtn, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                installBtn.style.display = 'none';
            }
        });
    });

    // Hide button if app is already installed
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        installBtn.style.display = 'none';
        console.log('Hadiye installed successfully ✨');
    });
}

// Initialize app
init();
