/**
 * Calculate the difference between target and current time.
 * Returns detailed breakdown and state flags.
 */
export function calculateCountdown(targetDate, currentDate) {
    const diff = targetDate.getTime() - currentDate.getTime();
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

    // Total hours for "Total Time" mode
    const totalHours = Math.floor(absDiff / (1000 * 60 * 60));

    return {
        diff, // raw difference
        days,
        hours,
        minutes,
        seconds,
        totalHours,
        isPast: diff < 0
    };
}

/**
 * Calculate progress percentage (0-100) between start and end dates.
 */
export function calculateProgress(startDate, endDate, currentDate) {
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();

    if (totalDuration <= 0) return 0; // Prevent division by zero

    let percent = (elapsed / totalDuration) * 100;

    // Clamp between 0 and 100
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    return Math.floor(percent); // Integer percentage
}

/**
 * Get the nearest Saturday (00:00:00).
 * If today is Saturday, returns NEXT Saturday (or today? Spec says "Until next saturday 0:00").
 * Typically "Until Weekend" implies waiting for Saturday.
 * If today is Saturday, "Until Weekend" is 0 or we look to next week?
 * Specification: "Saturday 0:00 as criteria. If it becomes Saturday, update to NEXT Saturday."
 */
export function getNextWeekend(currentDate) {
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0); // Reset time part

    const day = d.getDay(); // 0=Sun, ..., 6=Sat
    // Days until next Saturday (6)
    // If Today is Sun(0), need 6 days.
    // If Today is Mon(1), need 5 days.
    // ...
    // If Today is Fri(5), need 1 day.
    // If Today is Sat(6), need 7 days (next week).

    let daysToAdd = 6 - day;
    if (daysToAdd <= 0) {
        daysToAdd += 7;
    }

    d.setDate(d.getDate() + daysToAdd);
    return d;
}
