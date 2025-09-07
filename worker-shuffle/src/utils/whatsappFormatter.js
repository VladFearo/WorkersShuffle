// Cache for break type to avoid repeated timezone calculations
let breakTypeCache = {
  type: null,
  timestamp: 0,
  cacheValidMinutes: 30 // Cache for 30 minutes
};

// Function to determine if it's morning or afternoon break time
const getBreakType = () => {
  const now = Date.now();

  // Use cached value if still valid
  if (
    breakTypeCache.type &&
    now - breakTypeCache.timestamp <
      breakTypeCache.cacheValidMinutes * 60 * 1000
  ) {
    return breakTypeCache.type;
  }

  // Get Israel time
  const israelTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jerusalem",
  });
  const date = new Date(israelTime);

  const hour = date.getHours();
  const minutes = date.getMinutes();
  const currentTime = hour * 60 + minutes; // minutes since midnight

  // Morning: 09:00–11:59
  const morningStart = 9 * 60;         // 09:00
  const morningEnd   = 11 * 60 + 59;   // 11:59

  // Afternoon: 12:00–17:00
  const afternoonStart = 12 * 60;      // 12:00
  const afternoonEnd   = 17 * 60;      // 17:00

  let breakType;
  if (currentTime >= morningStart && currentTime <= morningEnd) {
    breakType = "morning";
  } else if (currentTime >= afternoonStart && currentTime <= afternoonEnd) {
    breakType = "afternoon";
  } else {
    breakType = "morning"; // default outside hours
  }

  // Update cache
  breakTypeCache = {
    type: breakType,
    timestamp: now,
    cacheValidMinutes: 30,
  };

  return breakType;
};

// Format WhatsApp message (שירות shown first)
export const formatForWhatsApp = (shuffledTechnical, shuffledService) => {
  const breakType = getBreakType();
  let text = "";

  if (breakType === "morning") {
    text += "🌅 הפסקות בוקר\n\n";

    // Service first — 09:30
    if (shuffledService.length > 0) {
      text += "📞 הפסקות שירות החל מ־09:30:\n";
      shuffledService.forEach((worker, index) => {
        text += `${index + 1}. ${worker.name}\n`;
      });
      text += "\n";
    }

    // Technical — 10:00
    if (shuffledTechnical.length > 0) {
      text += "🔧 הפסקות טכני החל מ־10:00:\n";
      shuffledTechnical.forEach((worker, index) => {
        text += `${index + 1}. ${worker.name}\n`;
      });
    }
  } else {
    text += "🌞 הפסקות צהריים\n\n";

    // Service first — 12:30
    if (shuffledService.length > 0) {
      text += "📞 הפסקות שירות החל מ־12:30:\n";
      shuffledService.forEach((worker, index) => {
        text += `${index + 1}. ${worker.name}\n`;
      });
      text += "\n";
    }

    // Technical — 13:00
    if (shuffledTechnical.length > 0) {
      text += "🔧 הפסקות טכני החל מ־13:00:\n";
      shuffledTechnical.forEach((worker, index) => {
        text += `${index + 1}. ${worker.name}\n`;
      });
    }
  }

  return text.trim();
};

// Export function to clear cache if needed (for testing or manual refresh)
export const clearBreakTypeCache = () => {
  breakTypeCache = {
    type: null,
    timestamp: 0,
    cacheValidMinutes: 30,
  };
};
