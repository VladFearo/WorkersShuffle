// Function to determine if it's morning or afternoon break time
const getBreakType = () => {
  // Get current time in Israeli timezone (Asia/Jerusalem)
  const now = new Date();
  const israelTime = new Date('2024-01-15T12:01:00+02:00') //new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jerusalem"}));
  
  
  const hour = israelTime.getHours();
  const minutes = israelTime.getMinutes();
  const currentTime = hour * 60 + minutes; // Convert to minutes since midnight
  
  // Morning break: 9:00 AM (540 minutes) to 12:00 PM (720 minutes)
  const morningStart = 9 * 60; // 9:00 AM
  const morningEnd = 12 * 60; // 12:00 PM (noon)
  
  // Afternoon break: 12:01 PM (721 minutes) to 5:00 PM (1020 minutes)
  const afternoonStart = 12 * 60 + 1; // 12:01 PM
  const afternoonEnd = 17 * 60; // 5:00 PM
  
  // If it's between 9:00 AM and 12:00 PM, it's morning break
  if (currentTime >= morningStart && currentTime <= morningEnd) {
    return 'morning';
  }
  // If it's between 12:01 PM and 5:00 PM, it's afternoon break
  else if (currentTime >= afternoonStart && currentTime <= afternoonEnd) {
    return 'afternoon';
  }
  // Default to morning if outside normal hours (early morning, late evening)
  else {
    return 'morning';
  }
};

export const formatForWhatsApp = (shuffledTechnical, shuffledService) => {
  const breakType = getBreakType();
  
  let text = "";
  
  // Add time-based header
  if (breakType === 'morning') {
    text += "🌅 הפסקות בוקר החל מ־10:00\n\n";
  } else {
    text += "🌞 הפסקות צהריים החל מ־14:00\n\n";
  }
  
  // Technical workers
  if (shuffledTechnical.length > 0) {
    text += "🔧 הפסקות טכני:\n";
    shuffledTechnical.forEach((worker, index) => {
      text += `${index + 1}. ${worker.name}\n`;
    });
    text += "\n";
  }
  
  // Service workers
  if (shuffledService.length > 0) {
    text += "🛎️ הפסקות שירות:\n";
    shuffledService.forEach((worker, index) => {
      text += `${index + 1}. ${worker.name}\n`;
    });
  }
  
  return text.trim();
};