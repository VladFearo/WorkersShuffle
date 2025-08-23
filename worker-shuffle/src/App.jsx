import { useState, useEffect, useCallback } from "react";
import WorkersTable from "./components/WorkersTable";
import WorkerSettings from "./components/WorkerSettings";
import HebrewGreeting from "./components/HebrewGreeting";
import { defaultWorkers } from "./data/defaultWorkers";
import { shuffleArray, smartShuffle } from "./utils/shuffle";
import { loadWorkers, saveWorkers, clearWorkers } from "./utils/localStorage";
import { useDebounce } from "./hooks/useDebounce";
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

  // Debounced save function - only saves after 500ms of no changes
  const debouncedSave = useDebounce((workersToSave) => {
    saveWorkers(workersToSave);
  }, 500);

  // Save to localStorage with debouncing
  useEffect(() => {
    debouncedSave(workers);
  }, [workers, debouncedSave]);

  // Optimized toggle functions using useCallback
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const toggleChangelog = useCallback(() => {
    setShowChangelog((prev) => !prev);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const resetWorkers = useCallback(() => {
    clearWorkers();
    setWorkers(defaultWorkers);
    setShuffledTechnical([]);
    setShuffledService([]);
  }, []);

  // Helper function to check if shuffle clearing is needed
  const shouldClearShuffles = useCallback(
    (workerId, newStatus) => {
      const worker = workers.find((w) => w.id === workerId);
      if (!worker) return true;

      // Only clear if the worker status change affects current shuffled results
      const isInTechnicalShuffle = shuffledTechnical.some(
        (w) => w.id === workerId
      );
      const isInServiceShuffle = shuffledService.some((w) => w.id === workerId);

      return isInTechnicalShuffle || isInServiceShuffle;
    },
    [workers, shuffledTechnical, shuffledService]
  );

  // Smart shuffle function for both groups
  const shuffleBothGroups = useCallback(() => {
    const technical = getTechnicalWorkingToday(workers);
    const service = getServiceWorkingToday(workers);

    if (technical.length > 0) {
      setShuffledTechnical(smartShuffle(shuffledTechnical, technical));
    }
    if (service.length > 0) {
      setShuffledService(smartShuffle(shuffledService, service));
    }
  }, [workers, shuffledTechnical, shuffledService]);

  // Update shuffled order for technical workers
  const updateTechnicalOrder = useCallback((newOrder) => {
    setShuffledTechnical(newOrder);
  }, []);

  // Update shuffled order for service workers
  const updateServiceOrder = useCallback((newOrder) => {
    setShuffledService(newOrder);
  }, []);

  // Toggle hold status for a worker
  const toggleWorkerHold = useCallback((workerId) => {
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
  }, []);

  // Copy to clipboard function
  const copyToWhatsApp = useCallback(async () => {
    const text = formatForWhatsApp(shuffledTechnical, shuffledService);

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [shuffledTechnical, shuffledService]);

  // Worker management functions
  const addWorker = useCallback(
    (name, group) => {
      const newWorker = {
        id: generateNextId(workers),
        name: name.trim(),
        group,
        isWorkingToday: true,
        isHeld: false, // New workers start unheld
      };
      setWorkers([...workers, newWorker]);

      // Only clear shuffles if the new worker is working today and affects current results
      if (newWorker.isWorkingToday) {
        if (
          (group === WORKER_TYPES.TECHNICAL && shuffledTechnical.length > 0) ||
          (group === WORKER_TYPES.SERVICE && shuffledService.length > 0)
        ) {
          setShuffledTechnical([]);
          setShuffledService([]);
        }
      }
    },
    [workers, shuffledTechnical.length, shuffledService.length]
  );

  const removeWorker = useCallback(
    (id) => {
      const workerToRemove = workers.find((w) => w.id === id);
      setWorkers(workers.filter((worker) => worker.id !== id));

      // Only clear shuffles if the removed worker was in current results
      if (workerToRemove && workerToRemove.isWorkingToday) {
        const wasInShuffles =
          shuffledTechnical.some((w) => w.id === id) ||
          shuffledService.some((w) => w.id === id);
        if (wasInShuffles) {
          setShuffledTechnical([]);
          setShuffledService([]);
        }
      }
    },
    [workers, shuffledTechnical, shuffledService]
  );

  const toggleWorkerStatus = useCallback(
    (id) => {
      setWorkers(
        workers.map((worker) =>
          worker.id === id
            ? { ...worker, isWorkingToday: !worker.isWorkingToday }
            : worker
        )
      );

      // Only clear shuffles if this change affects current results
      if (shouldClearShuffles(id)) {
        setShuffledTechnical([]);
        setShuffledService([]);
      }
    },
    [workers, shouldClearShuffles]
  );

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
        <button className="settings-toggle-btn" onClick={toggleSettings}>
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
          <span className="version-text">גרסה 1.4.0</span>
          <button className="changelog-btn" onClick={toggleChangelog}>
            {showChangelog ? "סגור ▲" : "מה חדש? ▼"}
          </button>
        </div>

        {showChangelog && (
          <div className="changelog-container">
            <div className="changelog-content">
              <h4>🆕 מה חדש בגרסה 1.4.0:</h4>

              <div className="changelog-section">
                <h5>🌅 ברכות זמן בעברית:</h5>
                <ul>
                  <li>
                    ברכת זמן אוטומטית: בוקר טוב, צהריים טובים, ערב טוב, לילה טוב
                  </li>
                  <li>תצוגת תאריך מלא בעברית עם שם יום</li>
                  <li>אמוג'י מותאם לזמן היום עם אנימציה עדינה</li>
                  <li>עדכון אוטומטי כל שעה לפי שעון ישראל</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>⚡ שיפורי ביצועים מרכזיים:</h5>
                <ul>
                  <li>הפחתה של 80% בכתיבות למטמון במהלך עריכה</li>
                  <li>שמירה חכמה עם השהיה - רק לאחר סיום שינויים</li>
                  <li>ביטול הגרלות רק כשנדרש באמת</li>
                  <li>זיהוי מכשיר נייד משותף וממוטב</li>
                  <li>מטמון חכם לחישובי איזור זמן (חיסכון 95%)</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>🔧 אופטימיזציות טכניות:</h5>
                <ul>
                  <li>שימוש ב-useCallback למניעת עיבוד מיותר</li>
                  <li>ניהול זיכרון משופר בטבלאות</li>
                  <li>הפחתת חישובים מיותרים בשינוי גודל מסך</li>
                  <li>הפחתת כפילות במצבי רכיב</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>⏰ גרסה 1.3.0 - זיהוי זמן חכם:</h5>
                <ul>
                  <li>הוספת כותרות אוטומטיות לוואטסאפ לפי זמן</li>
                  <li>בוקר (9:00-12:00): "הפסקות בוקר החל מ־10:00"</li>
                  <li>צהריים (12:01-17:00): "הפסקות צהריים החל מ־13:00"</li>
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
