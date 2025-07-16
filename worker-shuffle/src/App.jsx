import { useState, useEffect } from "react";
import WorkersTable from "./components/WorkersTable";
import WorkerSettings from "./components/WorkerSettings";
import { defaultWorkers } from "./data/defaultWorkers";
import { shuffleArray } from "./utils/shuffle";

function App() {
  // Load workers from localStorage or use defaults
  const [workers, setWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem("workers");
      return saved ? JSON.parse(saved) : defaultWorkers;
    } catch {
      return defaultWorkers;
    }
  });

  // Shuffle states
  const [shuffledTechnical, setShuffledTechnical] = useState([]);
  const [shuffledService, setShuffledService] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Save to localStorage whenever workers change
  useEffect(() => {
    localStorage.setItem("workers", JSON.stringify(workers));
  }, [workers]);

  // Helper functions
  const getTechnicalWorkingToday = () =>
    workers.filter(
      (worker) => worker.group === "טכני" && worker.isWorkingToday
    );
  const getServiceWorkingToday = () =>
    workers.filter(
      (worker) => worker.group === "שרות" && worker.isWorkingToday
    );

  const resetWorkers = () => {
    localStorage.removeItem("workers");
    setWorkers(defaultWorkers);
    setShuffledTechnical([]);
    setShuffledService([]);
  };

  // Shuffle functions
  const shuffleTechnical = () => {
    const technical = getTechnicalWorkingToday();
    setShuffledTechnical(shuffleArray(technical));
  };

  const shuffleService = () => {
    const service = getServiceWorkingToday();
    setShuffledService(shuffleArray(service));
  };

  // Worker management functions
  const addWorker = (name, group) => {
    const newWorker = {
      id: Date.now(),
      name: name.trim(),
      group,
      isWorkingToday: true,
    };
    setWorkers([...workers, newWorker]);
    // Clear shuffles when workers change
    setShuffledTechnical([]);
    setShuffledService([]);
  };

  const removeWorker = (id) => {
    setWorkers(workers.filter((worker) => worker.id !== id));
    // Clear shuffles when workers change
    setShuffledTechnical([]);
    setShuffledService([]);
  };

  const toggleWorkerStatus = (id) => {
    setWorkers(
      workers.map((worker) =>
        worker.id === id
          ? { ...worker, isWorkingToday: !worker.isWorkingToday }
          : worker
      )
    );
    // Clear shuffles when worker status changes
    setShuffledTechnical([]);
    setShuffledService([]);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">הגרלת הפסקות עובדים</h1>

      <button className="clear-cache-btn" onClick={resetWorkers}>
        נקה מטמון
      </button>

      <WorkersTable
        title="הפסקות טכני"
        workers={getTechnicalWorkingToday()}
        type="technical"
        onShuffle={shuffleTechnical}
        shuffledWorkers={shuffledTechnical}
      />

      <WorkersTable
        title="הפסקות שרות"
        workers={getServiceWorkingToday()}
        type="service"
        onShuffle={shuffleService}
        shuffledWorkers={shuffledService}
      />

      {/* Settings at the bottom */}
      <div className="settings-section">
        <button
          className="settings-toggle-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? "סגור הגדרות ▲" : "נהל עובדים ▼"}
        </button>

        <div className={`settings-container ${showSettings ? "open" : ""}`}>
          <WorkerSettings
            workers={workers}
            onAddWorker={addWorker}
            onRemoveWorker={removeWorker}
            onToggleWorkerStatus={toggleWorkerStatus}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
