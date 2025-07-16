import { WORKER_TYPES } from '../constants/workerTypes';

export const defaultWorkers = [
  // Technical group
  { id: 1, name: "אבי", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 2, name: "ולד", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 3, name: "דימטרי", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 4, name: "אריאל", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 5, name: "דניאל", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 6, name: "חן", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  
  // Service group
  { id: 7, name: "מירי", group: WORKER_TYPES.SERVICE, isWorkingToday: true },
  { id: 8, name: "ארץ", group: WORKER_TYPES.SERVICE, isWorkingToday: true },
  { id: 9, name: "מירב", group: WORKER_TYPES.SERVICE, isWorkingToday: true },
  { id: 10, name: "תמר", group: WORKER_TYPES.SERVICE, isWorkingToday: true }
];