import { useState, useEffect, useCallback } from "react";
import WorkersTable from "./components/WorkersTable";
import WorkerSettings from "./components/WorkerSettings";
import HebrewGreeting from "./components/HebrewGreeting";
import {
  TableSkeleton,
  GreetingSkeleton,
  ActionsSkeleton,
  EditButtonSkeleton,
} from "./components/LoadingSkeleton";
import { defaultWorkers } from "./data/defaultWorkers";
import { smartShuffle } from "./utils/shuffle";
import { loadWorkers, saveWorkers, clearWorkers } from "./utils/localStorage";
import { useDebounce } from "./hooks/useDebounce";
import { useShuffleAnimation } from "./hooks/useShuffleAnimation";
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
  const [isLoading, setIsLoading] = useState(true);

  // Load workers from localStorage or use defaults, ensure all workers have isHeld property
  const [workers, setWorkers] = useState(() => {
    const loadedWorkers = loadWorkers(defaultWorkers);
    // Ensure all workers have isHeld property AND clear all locks on page load
    return loadedWorkers.map((worker) => ({
      ...worker,
      isHeld: false, // Always start with no locks on page load
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

  // Shuffle animation hook
  const { isShuffling, animatedShuffle } = useShuffleAnimation();

  // Simulate loading time and hide loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Enable transitions after loading is complete
      document.body.classList.add("transitions-enabled");
    }, 800); // Show skeleton for 800ms

    return () => {
      clearTimeout(timer);
      // Cleanup - remove the class on unmount
      document.body.classList.remove("transitions-enabled");
    };
  }, []);

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

  // Smart shuffle function for both groups with simple animation
  const shuffleBothGroups = useCallback(async () => {
    const technical = getTechnicalWorkingToday(workers);
    const service = getServiceWorkingToday(workers);

    // Use simple animated shuffle
    await animatedShuffle(() => {
      if (technical.length > 0) {
        setShuffledTechnical(smartShuffle(shuffledTechnical, technical));
      }
      if (service.length > 0) {
        setShuffledService(smartShuffle(shuffledService, service));
      }
    });
  }, [workers, shuffledTechnical, shuffledService, animatedShuffle]);

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

    // Update shuffled arrays only if worker exists in them
    setShuffledTechnical((prev) =>
      prev.some((w) => w.id === workerId)
        ? prev.map((w) => (w.id === workerId ? { ...w, isHeld: !w.isHeld } : w))
        : prev
    );

    setShuffledService((prev) =>
      prev.some((w) => w.id === workerId)
        ? prev.map((w) => (w.id === workerId ? { ...w, isHeld: !w.isHeld } : w))
        : prev
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

      // Add to shuffled arrays if they exist
      if (group === WORKER_TYPES.TECHNICAL && shuffledTechnical.length > 0) {
        setShuffledTechnical((prev) => [...prev, newWorker]);
      } else if (group === WORKER_TYPES.SERVICE && shuffledService.length > 0) {
        setShuffledService((prev) => [...prev, newWorker]);
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
      const worker = workers.find((w) => w.id === id);
      const isBecomingWorking = worker && !worker.isWorkingToday;

      setWorkers(
        workers.map((w) =>
          w.id === id ? { ...w, isWorkingToday: !w.isWorkingToday } : w
        )
      );

      // If worker is becoming working and there are shuffled results, add them
      if (isBecomingWorking && worker) {
        if (
          worker.group === WORKER_TYPES.TECHNICAL &&
          shuffledTechnical.length > 0
        ) {
          setShuffledTechnical((prev) => [
            ...prev,
            { ...worker, isWorkingToday: true },
          ]);
        } else if (
          worker.group === WORKER_TYPES.SERVICE &&
          shuffledService.length > 0
        ) {
          setShuffledService((prev) => [
            ...prev,
            { ...worker, isWorkingToday: true },
          ]);
        }
      }

      // If worker is stopping work, remove them from shuffled arrays
      if (!isBecomingWorking && worker) {
        setShuffledTechnical((prev) => prev.filter((w) => w.id !== id));
        setShuffledService((prev) => prev.filter((w) => w.id !== id));
      }
    },
    [workers, shuffledTechnical, shuffledService]
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
      <div className="app-header">
        {isLoading ? <GreetingSkeleton /> : <HebrewGreeting />}

        <div className="main-title-section">
          <h1 className="app-title">
            <span className="title-icon">🎲</span>
            <span className="title-text">הגרלת הפסקות עובדים</span>
          </h1>
          <p className="app-subtitle">ניהול וחלוקה חכמה של הפסקות עבודה</p>
        </div>
      </div>

      {/* Hold status indicator */}
      {!isLoading && (heldTechnicalCount > 0 || heldServiceCount > 0) && (
        <div className="hold-status-indicator">
          <p className="hold-status-text">
            🔒 עובדים נעולים:
            {heldTechnicalCount > 0 && ` טכני (${heldTechnicalCount})`}
            {heldTechnicalCount > 0 && heldServiceCount > 0 && " • "}
            {heldServiceCount > 0 && ` שירות (${heldServiceCount})`}
          </p>
        </div>
      )}

      {/* Manual Edit Button */}
      {isLoading ? (
        <EditButtonSkeleton />
      ) : (
        <div className="edit-button-container">
          <button
            className={`edit-toggle-btn ${isEditing ? "editing" : ""}`}
            onClick={toggleEditMode}
            disabled={!hasWorkersToShuffle(workers)}
          >
            {isEditing ? "שמור" : "עריכה ידנית"}
          </button>
        </div>
      )}

      {isLoading ? (
        <>
          <TableSkeleton title="הפסקות טכני" rowCount={3} />
          <TableSkeleton title="הפסקות שירות" rowCount={4} />
          <ActionsSkeleton />
        </>
      ) : (
        <>
          <WorkersTable
            title="הפסקות טכני"
            workers={getTechnicalWorkingToday(workers)}
            type="technical"
            shuffledWorkers={shuffledTechnical}
            isEditing={isEditing}
            isShuffling={isShuffling}
            onUpdateOrder={updateTechnicalOrder}
            onToggleHold={toggleWorkerHold}
          />

          <WorkersTable
            title="הפסקות שירות"
            workers={getServiceWorkingToday(workers)}
            type="service"
            shuffledWorkers={shuffledService}
            isEditing={isEditing}
            isShuffling={isShuffling}
            onUpdateOrder={updateServiceOrder}
            onToggleHold={toggleWorkerHold}
          />

          {/* Main action buttons */}
          <div className="main-actions">
            <button
              className={`main-shuffle-btn ${isShuffling ? "shuffling" : ""}`}
              onClick={shuffleBothGroups}
              disabled={!hasWorkersToShuffle(workers) || isShuffling}
            >
              {isShuffling ? "🎲 מערבב..." : "🎲 הגרל הפסקות לכולם"}
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
        </>
      )}

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
          <span className="version-text">גרסה 1.7.0</span>
          <button className="changelog-btn" onClick={toggleChangelog}>
            {showChangelog ? "סגור ▲" : "מה חדש? ▼"}
          </button>
        </div>

        {showChangelog && (
          <div className="changelog-container">
            <div className="changelog-content">
              <h4>🆕 מה חדש בגרסה 1.7.0:</h4>

              <div className="changelog-section">
                <h5>🐛 תיקוני באגים קריטיים:</h5>
                <ul>
                  <li>🔒 עובדים נעולים נשארים במקום גם בהגרלה הראשונה</li>
                  <li>⚡ עובדים שנוספים למשמרת מופיעים מיד ללא רענון דף</li>
                  <li>🔄 סנכרון משופר בין מצב עובדים ורשימות מעורבבות</li>
                  <li>💾 תיקון דליפת זיכרון בזיהוי מכשירים ניידים</li>
                </ul>
              </div>

              <div className="changelog-section">
                <h5>✨ גרסה 1.6.0 - עיצוב מחודש:</h5>
                <ul>
                  <li>🎨 רקע מדורג עם דוגמאות עדינות</li>
                  <li>🌅 ברכות זמן אוטומטיות בעברית</li>
                  <li>⚡ שיפורי ביצועים - הפחתה של 80% בכתיבות למטמון</li>
                  <li>🔧 אופטימיזציות טכניות עם useCallback</li>
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
                <h5>📋 גרסה 1.1.0 - עריכה ידנית:</h5>
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
