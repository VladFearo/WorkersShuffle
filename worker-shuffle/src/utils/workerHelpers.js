export const getTechnicalWorkingToday = (workers) => 
  workers.filter(worker => worker.group === "טכני" && worker.isWorkingToday);

export const getServiceWorkingToday = (workers) => 
  workers.filter(worker => worker.group === "שרות" && worker.isWorkingToday);

export const hasWorkersToShuffle = (workers) => {
  return getTechnicalWorkingToday(workers).length > 0 || 
         getServiceWorkingToday(workers).length > 0;
};

export const hasShuffledResults = (shuffledTechnical, shuffledService) => {
  return shuffledTechnical.length > 0 || shuffledService.length > 0;
};

export const generateNextId = (workers) => {
  const maxId = Math.max(...workers.map(w => w.id), 0);
  return maxId + 1;
};