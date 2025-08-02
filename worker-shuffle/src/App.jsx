import { useState, useEffect } from "react";
import WorkersTable from "./components/WorkersTable";
import WorkerSettings from "./components/WorkerSettings";
import { defaultWorkers } from "./data/defaultWorkers";
import { shuffleArray } from "./utils/shuffle";
import { loadWorkers, saveWorkers, clearWorkers } from "./utils/localStorage";
import {
  getTechnicalWorkingToday,
  getServiceWorkingToday,
  hasWorkersToShuffle,
  hasShuffledResults,
  generateNextId,
} from "./utils/workerHelpers";
import { formatForWhatsApp } from "./utils/whatsappFormatter";
import { WORKER_TYPES } from "./constants/workerTypes";

function App() {
  // Load workers from localStorage or use defaults
  const [workers, setWorkers] = useState(() => loadWorkers(defaultWorkers));

  // Shuffle states
  const [shuffledTechnical, setShuffledTechnical] = useState([]);
  const [shuffledService, setShuffledService] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Manual editing state
  const [isEditing, setIsEditing] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  // Save to localStorage whenever workers change
  useEffect(() => {
    saveWorkers(workers);
  }, [workers]);

  const resetWorkers = () => {
    clearWorkers();
    setWorkers(defaultWorkers);
    setShuffledTechnical([]);
    setShuffledService([]);
  };

  // Single shuffle function for both groups
  const shuffleBothGroups = () => {
    const technical = getTechnicalWorkingToday(workers);
    const service = getServiceWorkingToday(workers);

    if (technical.length > 0) {
      setShuffledTechnical(shuffleArray(technical));
    }
    if (service.length > 0) {
      setShuffledService(shuffleArray(service));
    }
  };

  // Toggle editing mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Update shuffled order for technical workers
  const updateTechnicalOrder = (newOrder) => {
    setShuffledTechnical(newOrder);
  };

  // Update shuffled order for service workers
  const updateServiceOrder = (newOrder) => {
    setShuffledService(newOrder);
  };

  // Copy to clipboard function
  const copyToWhatsApp = async () => {
    const text = formatForWhatsApp(shuffledTechnical, shuffledService);

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Worker management functions
  const addWorker = (name, group) => {
    const newWorker = {
      id: generateNextId(workers),
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

      {/* Manual Edit Button */}
      {hasShuffledResults(shuffledTechnical, shuffledService) && (
        <div className="edit-button-container">
          <button
            className={`edit-toggle-btn ${isEditing ? "editing" : ""}`}
            onClick={toggleEditMode}
          >
            {isEditing ? "שמור" : "עריכה ידנית"}
          </button>
        </div>
      )}

      {/*
      for debugging purposes, you can uncomment the button below to reset workers
      <button className="clear-cache-btn" onClick={resetWorkers}>
        נקה מטמון
      </button>*/}

      <WorkersTable
        title="הפסקות טכני"
        workers={getTechnicalWorkingToday(workers)}
        type="technical"
        shuffledWorkers={shuffledTechnical}
        isEditing={isEditing}
        onUpdateOrder={updateTechnicalOrder}
      />

      <WorkersTable
        title="הפסקות שירות"
        workers={getServiceWorkingToday(workers)}
        type="service"
        shuffledWorkers={shuffledService}
        isEditing={isEditing}
        onUpdateOrder={updateServiceOrder}
      />

      {/* Main action buttons */}
      <div className="main-actions">
        <button
          className="main-shuffle-btn"
          onClick={shuffleBothGroups}
          disabled={!hasWorkersToShuffle(workers)}
        >
          🎲 הגרל הפסקות לכולם
        </button>

        {hasShuffledResults(shuffledTechnical, shuffledService) && (
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

      {/* Version footer */}
      <div className="version-footer">
        <div className="version-info">
          <span className="version-text">גרסה 1.1.0</span>
          <button
            className="changelog-btn"
            onClick={() => setShowChangelog(!showChangelog)}
          >
            {showChangelog ? "סגור ▲" : "מה חדש? ▼"}
          </button>
        </div>

        {showChangelog && (
          <div className="changelog-container">
            <div className="changelog-content">
              <h4>🆕 מה חדש בגרסה 1.1.0:</h4>

              <div className="changelog-section">
                <h5>✨ עריכה ידנית:</h5>
                <ul>
                  <li>לחצו על "עריכה ידנית" לשינוי סדר ההפסקות</li>
                  <li>גרירה ושחרור במחשב</li>
                  <li>חצים במכשירים ניידים</li>
                  <li>עריכת שמות עובדים בלחיצה</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>🎨 שיפורים:</h5>
                <ul>
                  <li>ממשק משתמש משופר במצב עריכה</li>
                  <li>הוראות ברורות לכל מכשיר</li>
                  <li>אנימציות חלקות</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>📱 תמיכה טובה יותר במובייל:</h5>
                <ul>
                  <li>כפתורי חצים גדולים וידידותיים למגע</li>
                  <li>מניעת התנגשות עם גלילה</li>
                  <li>ממשק מותאם לכל גודל מסך</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
