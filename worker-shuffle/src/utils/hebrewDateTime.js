// Hebrew day names
const HEBREW_DAYS = {
  0: "יום ראשון",
  1: "יום שני", 
  2: "יום שלישי",
  3: "יום רביעי",
  4: "יום חמישי",
  5: "יום שישי",
  6: "יום שבת"
};

// Hebrew month names
const HEBREW_MONTHS = {
  0: "ינואר",
  1: "פברואר",
  2: "מרץ",
  3: "אפריל",
  4: "מאי",
  5: "יוני",
  6: "יולי",
  7: "אוגוסט",
  8: "ספטמבר",
  9: "אוקטובר",
  10: "נובמבר",
  11: "דצמבר"
};

// Get Israeli time from any date
const getIsraeliTime = (date) => {
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
};

// Get time-based greeting in Hebrew
export const getTimeBasedGreeting = (currentTime) => {
  const israelTime = getIsraeliTime(currentTime);
  const hour = israelTime.getHours();

  if (hour >= 6 && hour < 12) {
    return "בוקר טוב";
  } else if (hour >= 12 && hour < 17) {
    return "צהריים טובים";
  } else if (hour >= 17 && hour < 20) {
    return "ערב טוב";
  } else {
    return "לילה טוב";
  }
};

// Get appropriate emoji for the time of day
export const getGreetingEmoji = (currentTime) => {
  const israelTime = getIsraeliTime(currentTime);
  const hour = israelTime.getHours();

  if (hour >= 6 && hour < 12) {
    return "🌅";
  } else if (hour >= 12 && hour < 17) {
    return "☀️";
  } else if (hour >= 17 && hour < 20) {
    return "🌅";
  } else {
    return "🌙";
  }
};

// Get formatted Hebrew date
export const getHebrewDate = (currentTime) => {
  const israelTime = getIsraeliTime(currentTime);
  
  const dayName = HEBREW_DAYS[israelTime.getDay()];
  const day = israelTime.getDate();
  const month = HEBREW_MONTHS[israelTime.getMonth()];
  const year = israelTime.getFullYear();

  return `היום הוא ${dayName}, ${day} ב${month} ${year}`;
};