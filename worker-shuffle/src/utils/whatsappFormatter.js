export const formatForWhatsApp = (shuffledTechnical, shuffledService) => {
  let text = "";
  
  // Technical workers
  if (shuffledTechnical.length > 0) {
    text += "הפסקות טכני:\n";
    shuffledTechnical.forEach(worker => {
      text += `${worker.name}\n`;
    });
    text += "\n";
  }
  
  // Service workers
  if (shuffledService.length > 0) {
    text += "הפסקות שירות:\n";
    shuffledService.forEach(worker => {
      text += `${worker.name}\n`;
    });
  }
  
  return text.trim();
};