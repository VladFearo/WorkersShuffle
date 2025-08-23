// Cache for break type to avoid repeated timezone calculations
let breakTypeCache = {
  type: null,
  timestamp: 0,
  cacheValidMinutes: 30 // Cache for 30 minutes
};

// Function to determine if it's morning or afternoon break time
const getBreakType = () => {
  const now = Date.now();
  
  // Check if cache is still valid (within 30 minutes)
  if (breakTypeCache.type && (now - breakTypeCache.timestamp) < breakTypeCache.cacheValidMinutes * 60 * 1000) {
    return breakTypeCache.type;
  }

  // Get current time in Israeli timezone (Asia/Jerusalem)
  const israelTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
  const date = new Date(israelTime);
  
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const currentTime = hour * 60 + minutes; // Convert to minutes since midnight

  // Morning break: 9:00 AM (540 minutes) to 12:00 PM (720 minutes)
  const morningStart = 9 * 60; // 9:00 AM
  const morningEnd = 12 * 60; // 12:00 PM (noon)

  // Afternoon break: 12:01 PM (721 minutes) to 5:00 PM (1020 minutes)
  const afternoonStart = 12 * 60 + 1; // 12:01 PM
  const afternoonEnd = 17 * 60; // 5:00 PM

  let breakType;
  // If it's between 9:00 AM and 12:00 PM, it's morning break
  if (currentTime >= morningStart && currentTime <= morningEnd) {
    breakType = 'morning';
  }
  // If it's between 12:01 PM and 5:00 PM, it's afternoon break
  else if (currentTime >= afternoonStart && currentTime <= afternoonEnd) {
    breakType = 'afternoon';
  }
  // Default to morning if outside normal hours (early morning, late evening)
  else {
    breakType = 'morning';
  }

  // Update cache
  breakTypeCache = {
    type: breakType,
    timestamp: now,
    cacheValidMinutes: 30
  };

  return breakType;
};

export const formatForWhatsApp = (shuffledTechnical, shuffledService) => {
  const breakType = getBreakType();

  let text = "";

  // Add time-based header
  if (breakType === 'morning') {
    text += "🌅 הפסקות בוקר החל מ־10:00\n\n";
  } else {
    text += "🌞 הפסקות צהריים החל מ־13:00\n\n";
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
    text += "📞 הפסקות שירות:\n";
    shuffledService.forEach((worker, index) => {
      text += `${index + 1}. ${worker.name}\n`;
    });
  }

  return text.trim();
};

// Export function to clear cache if needed (for testing or manual refresh)
export const clearBreakTypeCache = () => {
  breakTypeCache = {
    type: null,
    timestamp: 0,
    cacheValidMinutes: 30
  };
};