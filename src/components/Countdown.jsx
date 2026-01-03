import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './Countdown.css';

const Countdown = () => {
  const [timeState, setTimeState] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    centiseconds: 0,
    isNewYear: false
  });

  // Track the last second we announced to avoid repeating in the same second
  const lastAnnouncedSecond = useRef(null);
  const checkInterval = useRef(null);

  const speak = (text) => {
    // Basic browser TTS
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'ja-JP'; // Set language to Japanese
      window.speechSynthesis.speak(msg);
    }
  };

  const triggerConfetti = () => {
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  useEffect(() => {
    // Determine target date: Next Jan 1st
    const now = new Date();
    let targetYear = now.getFullYear() + 1;

    // If today is Jan 1st, we assume the target was THIS year's Jan 1st (for count up)
    if (now.getMonth() === 0 && now.getDate() === 1) {
      targetYear = now.getFullYear();
    }

    const targetDate = new Date(targetYear, 0, 1, 0, 0, 0).getTime();

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      let diff = targetDate - currentTime;
      let isNewYear = false;

      // --- Audio & Effect Triggers ---
      // We process these BEFORE resetting diff (for count up), but only if it's POSITIVE (still countdown)
      if (diff > 0) {
        const totalSeconds = Math.floor(diff / 1000);

        if (lastAnnouncedSecond.current !== totalSeconds) {
          lastAnnouncedSecond.current = totalSeconds;

          if (totalSeconds === 3600) { // 1 hour
            speak("年明けまで、あと1時間です");
          } else if (totalSeconds === 1800) { // 30 mins
            speak("年明けまで、あと30分です");
          } else if (totalSeconds === 600) { // 10 mins
            speak("年明けまで、あと10分です");
          } else if (totalSeconds === 60) { // 1 min
            speak("年明けまで、あと1分です");
          } else if (totalSeconds <= 10 && totalSeconds >= 1) { // 10s countdown
            speak(String(totalSeconds));
          }
        }
      } else if (diff <= 0) {
        // Just crossed zero
        // Check if we already handled the exact "0" moment or transition
        // With 10ms interval, `diff` will quickly be < 0.
        // We can use a ref or state to ensure we only trigger ONCE.

        // Actually, let's look at `isNewYear` logic.
        // If we haven't flagged it as new year yet, this is the first moment.
      }
      // -------------------------------

      if (diff <= 0) {
        // Time has passed, switch to count up
        if (!checkInterval.current) { // Ensure we only trigger this block once precisely at transition
          checkInterval.current = true;
          triggerConfetti();
          speak("明けましておめでとうございます！");
        }
        diff = Math.abs(diff);
        isNewYear = true;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const centiseconds = Math.floor((diff % 1000) / 10);

      const nowTime = new Date();
      const currentDisplayTime = nowTime.toLocaleTimeString('ja-JP', { hour12: false });

      setTimeState({ hours, minutes, seconds, centiseconds, isNewYear, currentDisplayTime });
    }, 10);

    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds, centiseconds, isNewYear, currentDisplayTime } = timeState;

  // Formatting helper
  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="countdown-container">
      <div className="current-time">現在時刻: {currentDisplayTime}</div>
      <div className="countdown-title">
        {isNewYear ? "HAPPY NEW YEAR!" : "NEW YEAR COUNTDOWN"}
      </div>

      {isNewYear && (
        <div className="message">
          A NEW YEAR HAS STARTED!
        </div>
      )}

      <div className="timer-display">
        <div className="time-unit hours">
          <span className="number">{hours}</span>
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

export default Countdown;

