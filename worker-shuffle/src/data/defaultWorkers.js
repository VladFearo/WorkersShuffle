import { WORKER_TYPES } from '../constants/workerTypes';

export const defaultWorkers = [
  // Technical group
  { id: 1, name: "אליס", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 2, name: "בוב", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  { id: 3, name: "צ'רלי", group: WORKER_TYPES.TECHNICAL, isWorkingToday: false },
  { id: 4, name: "דוד", group: WORKER_TYPES.TECHNICAL, isWorkingToday: true },
  
  // Service group
  { id: 5, name: "דיאנה", group: WORKER_TYPES.SERVICE, isWorkingToday: true },
  { id: 6, name: "איב", group: WORKER_TYPES.SERVICE, isWorkingToday: true },
  { id: 7, name: "פרנק", group: WORKER_TYPES.SERVICE, isWorkingToday: false },
  { id: 8, name: "גרייס", group: WORKER_TYPES.SERVICE, isWorkingToday: true }
];