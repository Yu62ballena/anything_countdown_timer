import { isHoliday } from 'japanese-holidays';

/**
 * Check if a specific date is a weekend (Saturday or Sunday) or a holiday.
 */
export function isWeekendOrHoliday(date) {
    const day = date.getDay();
    // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6 || !!isHoliday(date);
}

/**
 * Get the start date of the next 3-day (or more) weekend from the given date.
 * A "3-day weekend" is defined as a sequence of 3 or more consecutive days
 * where each day is either a Saturday, Sunday, or a National Holiday.
 */
export function getNext3DayWeekend(fromDate) {
    // Limit search to 2 years to avoid infinite loops in weird edge cases
    const limitDate = new Date(fromDate);
    limitDate.setFullYear(limitDate.getFullYear() + 2);

    let current = new Date(fromDate);
    // Reset time to 00:00:00 for calculation
    current.setHours(0, 0, 0, 0);

    // If we start in the middle of a holiday streak, we want to find the NEXT one,
    // unless we want to "count down" to the current one?
    // Use case: "Until next 3-day weekend".
    // If we are currently IN a 3-day weekend, usually we want to see the NEXT one strictly?
    // Or if today is Friday and tomorrow starts a 3-day weekend.
    // Let's assume we search forward from tomorrow if today is already "inside" or we search from today.
    // Specification says "Most close 3-day weekend start day".
    // Let's search day by day.

    while (current < limitDate) {
        if (isWeekendOrHoliday(current)) {
            // Found a holiday/weekend. Check if it's the start of a streak >= 3 days.
            let streak = 0;
            let temp = new Date(current);

            while (isWeekendOrHoliday(temp)) {
                streak++;
                temp.setDate(temp.getDate() + 1);
            }

            if (streak >= 3) {
                return new Date(current);
            } else {
                // Skip ahead locally
                current = temp; // `temp` is the first non-holiday day
                continue;
            }
        }

        // Move to next day
        current.setDate(current.getDate() + 1);
    }

    return null;
}
