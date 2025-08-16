import { WORKER_TYPES } from '../constants/workerTypes';

export const defaultWorkers = [
  // Technical group
  { id: 1, name: "ולד", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true, isHeld: false },
  { id: 2, name: "דימטרי", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true, isHeld: false },
  { id: 3, name: "אריאל", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true, isHeld: false },
  { id: 4, name: "דניאל", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true, isHeld: false },
  { id: 5, name: "חן", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true, isHeld: false },
  { id: 6, name: "ליהי", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true, isHeld: false },
  
  // Service group
  { id: 7, name: "מירי", group: WORKER_TYPES.SERVICE, isWorkingToday: true, isHeld: false },
  { id: 8, name: "ארץ", group: WORKER_TYPES.SERVICE, isWorkingToday: true, isHeld: false },
  { id: 9, name: "מירב", group: WORKER_TYPES.SERVICE, isWorkingToday: true, isHeld: false },
  { id: 10, name: "תמר", group: WORKER_TYPES.SERVICE, isWorkingToday: true, isHeld: false },
  { id: 11, name: "אלחנן", group: WORKER_TYPES.SERVICE, isWorkingToday: true, isHeld: false }
];