/**
 * Ramadan Module - Handles countdown and day tracking
 * Ramadan 2026: February 18 - March 19 (approximate)
 */

// Ramadan 2026 dates (adjust as needed for actual moon sighting)
const RAMADAN_START = new Date('2026-02-18T00:00:00');
const RAMADAN_END = new Date('2026-03-19T23:59:59');

/**
 * Check if current date is during Ramadan
 * @returns {boolean}
 */
export function isRamadan() {
    const now = new Date();
    return now >= RAMADAN_START && now <= RAMADAN_END;
}

/**
 * Get days until Ramadan starts
 * @returns {number} Days remaining, 0 if Ramadan has started
 */
export function getDaysUntilRamadan() {
    const now = new Date();
    if (now >= RAMADAN_START) return 0;

    const diff = RAMADAN_START - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get current Ramadan day (1-30)
 * @returns {number|null} Day number or null if not Ramadan
 */
export function getCurrentRamadanDay() {
    if (!isRamadan()) return null;

    const now = new Date();
    const diff = now - RAMADAN_START;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

    return Math.min(day, 30);
}

/**
 * Get time remaining until Ramadan
 * @returns {Object} { days, hours, minutes, seconds }
 */
export function getCountdown() {
    const now = new Date();

    if (now >= RAMADAN_START) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const diff = RAMADAN_START - now;

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
}

/**
 * Get comprehensive Ramadan status
 * @returns {Object} Status object with all relevant info
 */
export function getRamadanStatus() {
    const inRamadan = isRamadan();
    const day = getCurrentRamadanDay();
    const countdown = getCountdown();
    const daysUntil = getDaysUntilRamadan();

    // Determine phase
    let phase = 'before';
    if (inRamadan) {
        if (day <= 10) phase = 'mercy';      // First 10 days - Mercy
        else if (day <= 20) phase = 'forgiveness'; // Second 10 days - Forgiveness
        else phase = 'salvation';             // Last 10 days - Salvation from Hellfire
    }

    return {
        isRamadan: inRamadan,
        currentDay: day,
        daysUntil,
        countdown,
        phase,
        totalDays: 30,
        progress: day ? (day / 30) * 100 : 0
    };
}

/**
 * Format countdown for display
 * @param {Object} countdown 
 * @returns {string}
 */
export function formatCountdown(countdown) {
    const { days, hours, minutes, seconds } = countdown;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Render Ramadan status to DOM
 * @param {HTMLElement} container 
 */
export function renderRamadanStatus(container) {
    const status = getRamadanStatus();

    if (status.isRamadan) {
        // During Ramadan - show day tracker
        const phaseLabels = {
            mercy: 'Tobankaas Naxariista',
            forgiveness: 'Tobankaas Dambi Dhaafka',
            salvation: 'Tobankaas Badbaadinta'
        };

        container.innerHTML = `
            <span class="ramadan-label">${phaseLabels[status.phase]}</span>
            <h1 class="ramadan-title">رَمَضَان مُبَارَك</h1>
            <div class="ramadan-day">
                Maalinta
                <span class="day-number">${status.currentDay}</span>
                ka mid ah 30
            </div>
            <div class="ramadan-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${status.progress}%"></div>
                </div>
            </div>
        `;
    } else {
        // Before Ramadan - show countdown
        const { days, hours, minutes, seconds } = status.countdown;

        container.innerHTML = `
            <span class="ramadan-label">Ramadaan waa imanaysaa</span>
            <h1 class="ramadan-title">رَمَضَان كَرِيم</h1>
            <div class="ramadan-countdown">
                <div class="countdown-item">
                    <span class="countdown-value" id="days">${days}</span>
                    <span class="countdown-label">Maalin</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value" id="hours">${hours}</span>
                    <span class="countdown-label">Saacad</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value" id="minutes">${minutes}</span>
                    <span class="countdown-label">Daqiiqo</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value" id="seconds">${seconds}</span>
                    <span class="countdown-label">Ilbiriqsi</span>
                </div>
            </div>
        `;

        // Start countdown timer
        startCountdownTimer();
    }
}

/**
 * Start live countdown timer
 */
function startCountdownTimer() {
    setInterval(() => {
        const countdown = getCountdown();

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = countdown.days;
        if (hoursEl) hoursEl.textContent = countdown.hours;
        if (minutesEl) minutesEl.textContent = countdown.minutes;
        if (secondsEl) secondsEl.textContent = countdown.seconds;

    }, 1000);
}

export default {
    isRamadan,
    getDaysUntilRamadan,
    getCurrentRamadanDay,
    getCountdown,
    getRamadanStatus,
    renderRamadanStatus
};
