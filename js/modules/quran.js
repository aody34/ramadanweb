/**
 * Quran Module - Surah navigation and display
 */

import { ayahStaggerReveal } from './animations.js';

let surahsData = null;

/**
 * Load Surahs data
 */
async function loadSurahs() {
    if (surahsData) return surahsData;

    try {
        const response = await fetch('./data/surahs.json');
        surahsData = await response.json();
        return surahsData;
    } catch (error) {
        console.error('Failed to load surahs:', error);
        return null;
    }
}

/**
 * Get all Surahs
 * @returns {Array} Array of Surah objects
 */
export async function getAllSurahs() {
    const data = await loadSurahs();
    return data?.surahs || [];
}

/**
 * Get single Surah by number
 * @param {number} number - Surah number (1-114)
 * @returns {Object|null} Surah object
 */
export async function getSurah(number) {
    const data = await loadSurahs();
    if (!data) return null;

    return data.surahs.find(s => s.n === number);
}

/**
 * Search Surahs by name
 * @param {string} query - Search query
 * @returns {Array} Matching Surahs
 */
export async function searchSurahs(query) {
    const data = await loadSurahs();
    if (!data || !query) return data?.surahs || [];

    const lowerQuery = query.toLowerCase();

    return data.surahs.filter(surah =>
        surah.name.includes(query) ||
        String(surah.n).includes(query)
    );
}

/**
 * Render Surah grid
 * @param {HTMLElement} container - Grid container
 */
export async function renderSurahGrid(container) {
    const surahs = await getAllSurahs();

    container.innerHTML = surahs.map(surah => `
        <div class="surah-card" data-surah="${surah.n}">
            <span class="surah-number">${surah.n}</span>
            <span class="surah-name">${surah.name}</span>
            <span class="surah-verses-count">${surah.c} آية</span>
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.surah-card').forEach(card => {
        card.addEventListener('click', () => {
            const surahNum = parseInt(card.dataset.surah);
            openSurahViewer(surahNum);
        });
    });

    // Animate cards
    gsap.fromTo(container.querySelectorAll('.surah-card'),
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.02,
            ease: 'power2.out'
        }
    );
}

/**
 * Open Surah viewer modal
 * @param {number} surahNumber - Surah number
 */
export async function openSurahViewer(surahNumber) {
    const viewer = document.getElementById('surah-viewer');
    const titleEl = document.getElementById('surah-title');
    const versesEl = document.getElementById('surah-verses');

    const surah = await getSurah(surahNumber);

    if (!surah) {
        console.error('Surah not found:', surahNumber);
        return;
    }

    // Set title
    titleEl.textContent = `سورة ${surah.name}`;

    // Render verses
    versesEl.innerHTML = surah.v.map((verse, i) => `
        <span class="verse">${verse}</span>
        <span class="verse-number">${i + 1}</span>
    `).join(' ');

    // Show viewer
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Animate verses
    setTimeout(() => {
        ayahStaggerReveal(versesEl.querySelectorAll('.verse'), {
            stagger: 0.05,
            duration: 0.6,
            scroller: '.surah-viewer-content'
        });
    }, 300);
}

/**
 * Close Surah viewer
 */
export function closeSurahViewer() {
    const viewer = document.getElementById('surah-viewer');
    viewer.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Initialize Quran section
 */
export async function initQuran() {
    const grid = document.getElementById('surah-grid');
    const closeBtn = document.getElementById('surah-close');
    const searchInput = document.getElementById('surah-search');
    const viewer = document.getElementById('surah-viewer');

    if (grid) {
        await renderSurahGrid(grid);
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSurahViewer);
    }

    // Click outside to close
    if (viewer) {
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                closeSurahViewer();
            }
        });
    }

    // Search functionality
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const results = await searchSurahs(e.target.value);
                grid.innerHTML = '';

                results.forEach(surah => {
                    const card = document.createElement('div');
                    card.className = 'surah-card';
                    card.dataset.surah = surah.n;
                    card.innerHTML = `
                        <span class="surah-number">${surah.n}</span>
                        <span class="surah-name">${surah.name}</span>
                        <span class="surah-verses-count">${surah.c} آية</span>
                    `;
                    card.addEventListener('click', () => openSurahViewer(surah.n));
                    grid.appendChild(card);
                });
            }, 200);
        });
    }

    // Keyboard close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSurahViewer();
        }
    });
}

export default {
    getAllSurahs,
    getSurah,
    searchSurahs,
    renderSurahGrid,
    openSurahViewer,
    closeSurahViewer,
    initQuran
};
