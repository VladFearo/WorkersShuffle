import { useState, useEffect } from "react";
import {
  getTimeBasedGreeting,
  getGreetingEmoji,
  getHebrewDate,
} from "../utils/hebrewDateTime";

const HebrewGreeting = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update every hour since greetings only change a few times per day
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hebrew-greeting-container">
      <h1 className="hebrew-greeting">
        <span className="greeting-emoji">{getGreetingEmoji(currentTime)}</span>
        <span className="greeting-text">
          {getTimeBasedGreeting(currentTime)}
        </span>
      </h1>
      <p className="hebrew-date">{getHebrewDate(currentTime)}</p>
    </div>
  );
};

export default HebrewGreeting;
