import React, { useState, useEffect } from "react";
import WorkersTable from "./components/WorkersTable";

function App() {
  // Default workers organized by groups
  const defaultWorkers = [
    // Technical group
    { id: 1, name: "אליס", group: "טכני", isWorkingToday: true },
    { id: 2, name: "בוב", group: "טכני", isWorkingToday: true },
    { id: 3, name: "צ'רלי", group: "טכני", isWorkingToday: false },
    { id: 4, name: "דוד", group: "טכני", isWorkingToday: true },

    // Service group
    { id: 5, name: "דיאנה", group: "שרות", isWorkingToday: true },
    { id: 6, name: "איב", group: "שרות", isWorkingToday: true },
    { id: 7, name: "פרנק", group: "שרות", isWorkingToday: false },
    { id: 8, name: "גרייס", group: "שרות", isWorkingToday: true },
  ];

  // Load workers from localStorage or use defaults
  const [workers, setWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem("workers");
      return saved ? JSON.parse(saved) : defaultWorkers;
    } catch {
      return defaultWorkers;
    }
  });

  // Save to localStorage whenever workers change
  useEffect(() => {
    localStorage.setItem("workers", JSON.stringify(workers));
  }, [workers]);

  // Helper functions to get workers by group
  const getTechnicalWorkingToday = () =>
    workers.filter(
      (worker) => worker.group === "טכני" && worker.isWorkingToday
    );
  const getServiceWorkingToday = () =>
    workers.filter(
      (worker) => worker.group === "שרות" && worker.isWorkingToday
    );

  return (
    <div className="app-container">
      <h1 className="app-title">הגרלת הפסקות עובדים</h1>

      <button
        className="clear-cache-btn"
        onClick={() => {
          localStorage.removeItem("workers");
          setWorkers(defaultWorkers);
        }}
      >
        נקה מטמון
      </button>

      <WorkersTable
        title="הפסקות טכני"
        workers={getTechnicalWorkingToday()}
        type="technical"
      />

      <WorkersTable
        title="הפסקות שרות"
        workers={getServiceWorkingToday()}
        type="service"
      />
    </div>
  );
}

export default App;
