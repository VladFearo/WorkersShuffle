export const loadWorkers = (defaultWorkers) => {
  try {
    const saved = localStorage.getItem('workers');
    return saved ? JSON.parse(saved) : defaultWorkers;
  } catch {
    return defaultWorkers;
  }
};

export const saveWorkers = (workers) => {
  localStorage.setItem('workers', JSON.stringify(workers));
};

export const clearWorkers = () => {
  localStorage.removeItem('workers');
};