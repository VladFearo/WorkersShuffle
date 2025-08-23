import { useState, useEffect } from "react";
import WorkersTable from "./components/WorkersTable";
import WorkerSettings from "./components/WorkerSettings";
import HebrewGreeting from "./components/HebrewGreeting";
import { defaultWorkers } from "./data/defaultWorkers";
import { smartShuffle } from "./utils/shuffle";
import { loadWorkers, saveWorkers, clearWorkers } from "./utils/localStorage";
import {
  getTechnicalWorkingToday,
  getServiceWorkingToday,
  hasWorkersToShuffle,
  hasShuffledResults,
  generateNextId,
} from "./utils/workerHelpers";
import { formatForWhatsApp } from "./utils/whatsappFormatter";

function App() {
  // Load workers from localStorage or use defaults, ensure all workers have isHeld property
  const [workers, setWorkers] = useState(() => {
    const loadedWorkers = loadWorkers(defaultWorkers);
    // Ensure all workers have isHeld property (for backward compatibility)
    return loadedWorkers.map((worker) => ({
      ...worker,
      isHeld: worker.isHeld ?? false,
    }));
  });

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

  // Smart shuffle function for both groups
  const shuffleBothGroups = () => {
    const technical = getTechnicalWorkingToday(workers);
    const service = getServiceWorkingToday(workers);

    if (technical.length > 0) {
      setShuffledTechnical(smartShuffle(shuffledTechnical, technical));
    }
    if (service.length > 0) {
      setShuffledService(smartShuffle(shuffledService, service));
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

  // Toggle hold status for a worker
  const toggleWorkerHold = (workerId) => {
    setWorkers((prevWorkers) =>
      prevWorkers.map((worker) =>
        worker.id === workerId ? { ...worker, isHeld: !worker.isHeld } : worker
      )
    );

    // Update shuffled arrays if they exist
    setShuffledTechnical((prev) =>
      prev.map((worker) =>
        worker.id === workerId ? { ...worker, isHeld: !worker.isHeld } : worker
      )
    );

    setShuffledService((prev) =>
      prev.map((worker) =>
        worker.id === workerId ? { ...worker, isHeld: !worker.isHeld } : worker
      )
    );
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
      isHeld: false, // New workers start unheld
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

  // Count held workers for display
  const heldTechnicalCount = getTechnicalWorkingToday(workers).filter(
    (w) => w.isHeld
  ).length;
  const heldServiceCount = getServiceWorkingToday(workers).filter(
    (w) => w.isHeld
  ).length;

  return (
    <div className="app-container">
      <HebrewGreeting />
      <h1 className="app-title">הגרלת הפסקות עובדים</h1>

      {/* Hold status indicator */}
      {(heldTechnicalCount > 0 || heldServiceCount > 0) && (
        <div className="hold-status-indicator">
          <p className="hold-status-text">
            🔒 עובדים נעולים:
            {heldTechnicalCount > 0 && ` טכני (${heldTechnicalCount})`}
            {heldTechnicalCount > 0 && heldServiceCount > 0 && " • "}
            {heldServiceCount > 0 && ` שירות (${heldServiceCount})`}
          </p>
        </div>
      )}

      {/* Manual Edit Button - Always visible */}
      <div className="edit-button-container">
        <button
          className={`edit-toggle-btn ${isEditing ? "editing" : ""}`}
          onClick={toggleEditMode}
          disabled={!hasWorkersToShuffle(workers)}
        >
          {isEditing ? "שמור" : "עריכה ידנית"}
        </button>
      </div>

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
        onToggleHold={toggleWorkerHold}
      />

      <WorkersTable
        title="הפסקות שירות"
        workers={getServiceWorkingToday(workers)}
        type="service"
        shuffledWorkers={shuffledService}
        isEditing={isEditing}
        onUpdateOrder={updateServiceOrder}
        onToggleHold={toggleWorkerHold}
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
          <span className="version-text">גרסה 1.3.0</span>
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
              <h4>🆕 מה חדש בגרסה 1.3.0:</h4>

              <div className="changelog-section">
                <h5>⏰ זיהוי זמן חכם:</h5>
                <ul>
                  <li>הוספת כותרות אוטומטיות לוואטסאפ לפי זמן</li>
                  <li>בוקר (9:00-12:00): "הפסקות בוקר החל מ־10:00"</li>
                  <li>צהריים (12:01-17:00): "הפסקות צהריים החל מ־14:00"</li>
                  <li>זיהוי לפי שעון ישראל אוטומטית</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>🔒 גרסה 1.2.0 - נעילת עובדים:</h5>
                <ul>
                  <li>כפתור נעילה חדש בכל שורת עובד</li>
                  <li>עובדים נעולים נשארים במקום בזמן הגרלה</li>
                  <li>מחוון עובדים נעולים למעלה</li>
                  <li>עובדים נעולים לא ניתנים לגרירה בעריכה</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>✨ גרסה 1.1.2 - שיפורים:</h5>
                <ul>
                  <li>כפתור "עריכה ידנית" זמין תמיד</li>
                  <li>ניתן לערוך סדר גם ללא הגרלה</li>
                  <li>חוויית משתמש משופרת</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>📋 גרסה 1.1.0 - תכונות עיקריות:</h5>
                <ul>
                  <li>עריכה ידנית של סדר ההפסקות</li>
                  <li>גרירה ושחרור במחשב</li>
                  <li>חצים במכשירים ניידים</li>
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
