import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './Countdown.css'; // Re-use the nice CSS from original countdown

const HeroCountdown = ({ event }) => {
    const [timeState, setTimeState] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        centiseconds: 0,
        isArrived: false
    });

    const lastAnnouncedSecond = useRef(null);
    const checkInterval = useRef(false);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel previous
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'ja-JP';
            window.speechSynthesis.speak(msg);
        }
    };

    const triggerConfetti = () => {
        var duration = 5 * 1000;
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

    useEffect(() => {
        if (!event) return;

        // Reset state on event change
        checkInterval.current = false;
        lastAnnouncedSecond.current = null;

        const interval = setInterval(() => {
            const now = new Date();
            const targetDate = event.getTargetDate();

            // If target date is dynamic (like "next year"), getTargetDate() usually returns the correct next instance.
            // But if it's already passed, some logic might return next year. 
            // We assume getTargetDate returns a valid FUTURE date if possible, or past date if event is over.

            let diff = targetDate.getTime() - now.getTime();
            let isArrived = false;

            // Audio Announcements (only for positive diff)
            if (diff > 0) {
                const totalSeconds = Math.floor(diff / 1000);

                if (lastAnnouncedSecond.current !== totalSeconds) {
                    lastAnnouncedSecond.current = totalSeconds;

                    const eventName = event.name || "イベント";

                    if (totalSeconds === 3600) {
                        speak(`${eventName}まで、あと1時間です`);
                    } else if (totalSeconds === 600) {
                        speak(`${eventName}まで、あと10分です`);
                    } else if (totalSeconds === 60) {
                        speak(`${eventName}まで、あと1分です`);
                    } else if (totalSeconds <= 10 && totalSeconds >= 1) {
                        speak(String(totalSeconds));
                    }
                }
            }

            if (diff <= 0) {
                // Arrived!
                if (!checkInterval.current) {
                    checkInterval.current = true;
                    triggerConfetti();
                    speak(`${event.name}、おめでとうございます！`);
                }
                diff = Math.abs(diff); // Count up
                isArrived = true;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            const centiseconds = Math.floor((diff % 1000) / 10);

            setTimeState({ days, hours, minutes, seconds, centiseconds, isArrived });
        }, 20);

        return () => clearInterval(interval);
    }, [event]); // Re-run if event object changes

    if (!event) return null;

    const { days, hours, minutes, seconds, centiseconds, isArrived } = timeState;
    const pad = (num) => String(num).padStart(2, '0');

    return (
        <div className={`countdown-container hero-countdown ${isArrived ? 'arrived' : ''}`} style={{ marginBottom: '2rem' }}>
            <div className="countdown-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {event.emoji} {isArrived ? `${event.name} START!` : `${event.name}まで`}
            </div>

            <div className="target-date-display" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                ({event.getTargetDate().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })})
            </div>

            <div className="timer-display" style={{ transform: 'scale(0.9)' }}>
                {/* Show Days if > 0 */}
                {days > 0 && (
                    <div className="time-unit days">
                        <span className="number">{days}</span>
                        <span className="label">DAYS</span>
                    </div>
                )}

                <div className="time-unit hours">
                    <span className="number">{pad(hours)}</span>
                    <span className="label">HOURS</span>
                </div>

                <div className="time-unit minutes">
                    <span className="number">{pad(minutes)}</span>
                    <span className="label">MINS</span>
                </div>

                <div className="time-unit seconds">
                    <span className="number">{pad(seconds)}</span>
                    <span className="label">SECS</span>
                </div>

                <div className="milliseconds">
                    .{pad(centiseconds)}
                </div>
            </div>
        </div>
    );
};

export default HeroCountdown;
