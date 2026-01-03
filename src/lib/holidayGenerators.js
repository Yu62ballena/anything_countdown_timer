import * as JH from 'japanese-holidays';
import * as DH from 'date-holidays';

// Helper to handle CJS/ESM interop issues
const JapaneseHolidays = JH.default || JH;
// DateHolidays might be a named export or default depending on environment
const DateHolidays = DH.default || DH;

/**
 * Generate holiday events for Japan dynamically.
 * It looks for upcoming holidays in the current year and next year.
 */
export function generateJapanHolidays() {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const nextYear = currentYear + 1;

        // Defensive check
        if (!JapaneseHolidays || typeof JapaneseHolidays.getHolidaysOf !== 'function') {
            console.error("JapaneseHolidays library not correctly loaded", JapaneseHolidays);
            return [];
        }

        const h1 = JapaneseHolidays.getHolidaysOf(currentYear) || [];
        const h2 = JapaneseHolidays.getHolidaysOf(nextYear) || [];

        // Combine and format
        const all = [
            ...h1.map(h => ({ ...h, year: currentYear })),
            ...h2.map(h => ({ ...h, year: nextYear }))
        ];

        // Unique names to identify specific holidays
        const holidayMap = new Map();

        all.forEach(h => {
            // Construct date object
            const d = new Date(h.year, h.month - 1, h.date);

            // Skip past events (keep today's event until tomorrow)
            if (d.getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
                return;
            }

            // Simple deduplication by name (prefer nearest)
            if (!holidayMap.has(h.name)) {
                holidayMap.set(h.name, {
                    id: `jp-${h.name}`,
                    name: h.name,
                    emoji: '🇯🇵',
                    date: d
                });
            }
        });

        return Array.from(holidayMap.values()).map(h => ({
            id: h.id,
            name: h.name,
            emoji: '🎌',
            getTargetDate: () => h.date,
            hasSpecialEffect: false,
            color: '#ff7675' // Light red
        }));
    } catch (error) {
        console.error("Error generating Japan holidays:", error);
        return [];
    }
}

/**
 * Generate holidays for a specific country using date-holidays.
 * @param {string} countryCode 'US', 'GB', etc.
 */
export function generateCountryHolidays(countryCode, emoji) {
    try {
        // Ensure constructor works
        if (typeof DateHolidays !== 'function') {
            console.error("DateHolidays library not correctly loaded", DateHolidays);
            return [];
        }

        const hd = new DateHolidays(countryCode);
        const today = new Date();

        // Get holidays for current and next year
        const h1 = hd.getHolidays(today.getFullYear()) || [];
        const h2 = hd.getHolidays(today.getFullYear() + 1) || [];

        const all = [...h1, ...h2];
        const holidayMap = new Map();

        all.forEach(h => {
            if (!['public', 'bank'].includes(h.type)) return; // Filter for major holidays

            const d = new Date(h.date);
            // reset time to 00:00 local
            const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

            if (localDate.getTime() < today.getTime() - 24 * 60 * 60 * 1000) return;

            if (!holidayMap.has(h.name)) {
                holidayMap.set(h.name, {
                    id: `${countryCode}-${h.rule}`, // Rule string is usually stable ID
                    name: h.name,
                    date: localDate
                });
            }
        });

        return Array.from(holidayMap.values()).slice(0, 20).map(h => ({
            id: h.id,
            name: h.name,
            emoji: emoji,
            getTargetDate: () => h.date,
            hasSpecialEffect: false,
            color: '#74b9ff'
        }));
    } catch (error) {
        console.error("Error generating country holidays:", error);
        return [];
    }
}

// Preset Definitions
export const PRESETS = {
    'JP': { name: '🇯🇵 日本の祝日', generator: generateJapanHolidays },
    'US': { name: '🇺🇸 アメリカの祝日', generator: () => generateCountryHolidays('US', '🇺🇸') },
    'GB': { name: '🇬🇧 イギリスの祝日', generator: () => generateCountryHolidays('GB', '🇬🇧') },
    'GLOBAL': { name: '🌎 世界の主な行事', generator: null } // Placeholder 
};
