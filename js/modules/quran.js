/**
 * Quran Module - Surah navigation and display
 * Dynamic rendering with GSAP animations for full Surah reading
 */

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

    // Animate cards entrance
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
 * Render all ayahs into the viewer using chunked rendering
 * This ensures 60fps even for long Surahs like Al-Baqarah (286 ayahs)
 * @param {HTMLElement} container - Verses container element
 * @param {Array} verses - Array of verse strings
 */
function renderVerses(container, verses) {
    // Clear previous content
    container.innerHTML = '';

    // Build all verse elements in a DocumentFragment for performance
    const fragment = document.createDocumentFragment();

    verses.forEach((verse, i) => {
        // Verse text
        const verseSpan = document.createElement('span');
        verseSpan.className = 'verse';
        verseSpan.textContent = verse;

        // Verse number badge
        const numSpan = document.createElement('span');
        numSpan.className = 'verse-number';
        numSpan.textContent = i + 1;

        // Space between verses
        const space = document.createTextNode(' ');

        fragment.appendChild(verseSpan);
        fragment.appendChild(numSpan);
        fragment.appendChild(space);
    });

    // Single DOM write
    container.appendChild(fragment);
}

/**
 * Animate visible verses with GSAP ScrollTrigger
 * Uses IntersectionObserver for reliable detection inside modal
 * @param {HTMLElement} scrollContainer - The scrollable container
 * @param {NodeList} verseElements - All verse elements
 */
function animateVersesOnScroll(scrollContainer, verseElements) {
    // Animate first batch immediately (above the fold)
    const firstBatch = Array.from(verseElements).slice(0, 15);
    gsap.fromTo(firstBatch,
        { opacity: 0, y: 15 },
        {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power2.out'
        }
    );

    // Use IntersectionObserver for remaining verses (works inside modals)
    const remaining = Array.from(verseElements).slice(15);

    if (remaining.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: scrollContainer,
        rootMargin: '100px',
        threshold: 0.1
    });

    remaining.forEach(verse => {
        // Set initial hidden state
        gsap.set(verse, { opacity: 0, y: 15 });
        observer.observe(verse);
    });

    // Store observer reference for cleanup
    scrollContainer._verseObserver = observer;
}

/**
 * Open Surah viewer modal
 * @param {number} surahNumber - Surah number
 */
export async function openSurahViewer(surahNumber) {
    const viewer = document.getElementById('surah-viewer');
    const titleEl = document.getElementById('surah-title');
    const versesEl = document.getElementById('surah-verses');
    const contentEl = viewer.querySelector('.surah-viewer-content');

    const surah = await getSurah(surahNumber);

    if (!surah) {
        console.error('Surah not found:', surahNumber);
        return;
    }

    // Clean up any previous observer
    if (contentEl._verseObserver) {
        contentEl._verseObserver.disconnect();
        contentEl._verseObserver = null;
    }

    // Set title
    titleEl.textContent = `سورة ${surah.name}`;

    // Render all verses into the DOM
    renderVerses(versesEl, surah.v);

    // Show viewer
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Scroll to top of content
    contentEl.scrollTop = 0;

    // Animate verses after modal is visible
    requestAnimationFrame(() => {
        const verseElements = versesEl.querySelectorAll('.verse');
        animateVersesOnScroll(contentEl, verseElements);
    });
}

/**
 * Close Surah viewer
 */
export function closeSurahViewer() {
    const viewer = document.getElementById('surah-viewer');
    const contentEl = viewer.querySelector('.surah-viewer-content');

    // Clean up observer
    if (contentEl && contentEl._verseObserver) {
        contentEl._verseObserver.disconnect();
        contentEl._verseObserver = null;
    }

    viewer.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Initialize Quran section
 */
export async function initQuran() {
    const grid = document.getElementById('surah-grid');
    const closeBtn = document.getElementById('surah-close');
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
