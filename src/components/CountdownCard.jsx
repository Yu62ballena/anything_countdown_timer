import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { calculateCountdown, calculateProgress } from '../lib/dateCalculations';
import ProgressBar from './ProgressBar';

const CountdownCard = ({ event, displayMode }) => {
    const [timeState, setTimeState] = useState(null);
    const [currentTargetDate, setCurrentTargetDate] = useState(null);
    const [currentStartDate, setCurrentStartDate] = useState(null);
    const [isCountUp, setIsCountUp] = useState(false); // If true, we are in the "1 day after" period

    const effectTriggered = useRef(false);

    // --- Effect Logic ---
    const triggerConfetti = () => {
        if (effectTriggered.current) return;
        effectTriggered.current = true;

        var duration = 15 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            var particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'ja-JP';
            // prevent multiple calls stacking too much, though basic here
            window.speechSynthesis.speak(msg);
        }
    };

    // --- Initialization & Logic ---
    useEffect(() => {
        const initEventData = () => {
            const now = new Date();
            let target, start;

            if (event.isDynamic) {
                // Dynamic events (weekend, etc.)
                target = event.getDynamicTarget(now);
                // For dynamic events, start date is basically "previous cycle".
                // For "Weekend", previous cycle was Last Saturday.
                // Simplified: Start = Target - 7 days (approx).
                start = new Date(target);
                start.setDate(start.getDate() - 7);
            } else {
                // Fixed date events
                const currentYear = now.getFullYear();
                // Try THIS year's event
                let t1 = event.getTargetDate(currentYear);

                // Define "Count Up Period" as 24 hours after target
                const oneDayMs = 24 * 60 * 60 * 1000;

                if (now.getTime() > t1.getTime() + oneDayMs) {
                    // Already passed more than 1 day => Target is NEXT year
                    target = event.getTargetDate(currentYear + 1);
                    start = t1; // Start is this year's event
                } else if (now.getTime() >= t1.getTime()) {
                    // Within 24 hours AFTER event => Count Up Mode
                    target = t1; // "Target" is the one we just passed (for reference)
                    // But actually we are counting UP from it.
                    // Start was... previous year? Or usage of `calculateProgress` might be weird here.
                    // Specification says: "Count up display".
                    // Let's set a flag.
                    start = event.getTargetDate(currentYear - 1);
                } else {
                    // Before this year's event
                    target = t1;
                    start = event.getTargetDate(currentYear - 1);
                }
            }

            if (!target) {
                // Fallback if dynamic target returns null
                return;
            }

            setCurrentTargetDate(target);
            setCurrentStartDate(start);
        };

        initEventData();
    }, [event]);

    useEffect(() => {
        if (!currentTargetDate) return;

        const interval = setInterval(() => {
            const now = new Date();

            // Determine if we are in "Count Up" mode (within 24 hours after target)
            // Note: currentTargetDate is set to the event instance we are tracking.
            // If we are tracking New Year 2026, and today is Jan 1 2026 10AM, 
            // init logic should have set target to Jan 1 2026.

            const diffRaw = currentTargetDate.getTime() - now.getTime();
            const isPast = diffRaw <= 0;
            const oneDayMs = 24 * 60 * 60 * 1000;

            // Count Up logic: If Past AND within 1 day (approximated conceptually)
            // Actually, if we are in "Count Up", `calculateCountdown` will return isPast=true.
            // If `isPast` is true and abs(diff) < 24h, we show count up.
            // If abs(diff) > 24h, we should have switched target. 
            // (The init logic handles the switch on mount, but dynamic switch requires reload or smart interval. 
            // For now, simpler implementation: reload required for day switch logic is acceptable per specs "App startup time updated holiday info")

            const calc = calculateCountdown(currentTargetDate, now);

            // Special logic for confetti/sound on New Year
            if (event.hasSpecialEffect && isPast && Math.abs(diffRaw) < oneDayMs) {
                if (!effectTriggered.current) {
                    triggerConfetti();
                    speak("明けましておめでとうございます！");
                }
            }

            const progress = calculateProgress(currentStartDate, currentTargetDate, now);

            setTimeState({ ...calc, progress, isCountUp: isPast });

        }, 1000);

        return () => clearInterval(interval);
    }, [currentTargetDate, event, currentStartDate]);


    if (!timeState || !currentTargetDate) return <div className="loading-card">Loading...</div>;

    const { days, hours, minutes, seconds, totalHours, isPast, isCountUp: isCountUpState, progress } = timeState;

    // Render Logic
    const dateStr = currentTargetDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    const timeStr = currentTargetDate.toLocaleTimeString('ja-JP', { hour12: false });

    // Format based on mode
    let mainText = "";
    if (displayMode === 'total') {
        mainText = `あと ${(isCountUpState ? totalHours : totalHours).toLocaleString()}時間 ${minutes}分 ${seconds}秒`;
        if (isCountUpState) mainText = `経過して ${totalHours.toLocaleString()}時間 ${minutes}分 ${seconds}秒`;
    } else {
        // Standard mode
        if (days > 0) {
            mainText = `あと ${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
        } else {
            mainText = `あと ${hours}時間 ${minutes}分 ${seconds}秒`;
        }

        if (isCountUpState) {
            mainText = `経過して ${days > 0 ? days + '日 ' : ''}${hours}時間 ${minutes}分 ${seconds}秒`;
        }
    }

    // Title Modification
    let title = `${event.emoji} ${event.name}まで`;
    if (isCountUpState) {
        if (event.id === 'new-year') {
            title = "HAPPY NEW YEAR!";
        } else {
            title = `${event.emoji} ${event.name}から`;
        }
    } else {
        if (event.id === 'weekend' || event.id === '3-day-weekend') {
            title = `${event.emoji} ${event.name}まで`;
        }
    }

    // Border Style
    const borderStyle = { borderLeft: `8px solid ${event.color || '#ccc'}` };

    return (
        <div className="countdown-card" style={borderStyle}>
            <div className="card-header">
                <h2 className="card-title">{title}</h2>
                <span className="card-date">（{dateStr}）</span>
            </div>

            <div className="card-main-display">
                {mainText}
            </div>

            {!isCountUpState && (
                <ProgressBar percent={progress} color={event.color} />
            )}
        </div>
    );
};

export default CountdownCard;
