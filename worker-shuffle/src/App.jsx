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
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Single shuffle function for both groups
  const shuffleBothGroups = () => {
    const technical = getTechnicalWorkingToday();
    const service = getServiceWorkingToday();

    if (technical.length > 0) {
      setShuffledTechnical(shuffleArray(technical));
    }
    if (service.length > 0) {
      setShuffledService(shuffleArray(service));
    }
  };

  // Copy to clipboard function
  const copyToWhatsApp = async () => {
    let text = "";

    // Technical workers
    if (shuffledTechnical.length > 0) {
      text += "הפסקות טכני:\n";
      shuffledTechnical.forEach((worker) => {
        text += `${worker.name}\n`;
      });
      text += "\n";
    }

    // Service workers
    if (shuffledService.length > 0) {
      text += "הפסקות שירות:\n";
      shuffledService.forEach((worker) => {
        text += `${worker.name}\n`;
      });
    }

    // Remove trailing newline
    text = text.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Check if we have workers to shuffle
  const hasWorkersToShuffle =
    getTechnicalWorkingToday().length > 0 ||
    getServiceWorkingToday().length > 0;

  // Check if we have any shuffled results
  const hasShuffledResults =
    shuffledTechnical.length > 0 || shuffledService.length > 0;

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
        shuffledWorkers={shuffledTechnical}
      />

      <WorkersTable
        title="הפסקות שירות"
        workers={getServiceWorkingToday()}
        type="service"
        shuffledWorkers={shuffledService}
      />

      {/* Main action buttons */}
      <div className="main-actions">
        <button
          className="main-shuffle-btn"
          onClick={shuffleBothGroups}
          disabled={!hasWorkersToShuffle}
        >
          🎲 הגרל הפסקות לכולם
        </button>

        {hasShuffledResults && (
          <button
            className={`main-copy-btn ${copySuccess ? "success" : ""}`}
            onClick={copyToWhatsApp}
          >
            {copySuccess ? "הועתק! ✓" : "📱 העתק לוואטסאפ"}
          </button>
        )}
      </div>

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
