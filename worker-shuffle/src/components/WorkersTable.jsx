import { useState, useEffect, useCallback } from "react";
import { useMobileDetection } from "../hooks/useMobileDetection";

const WorkersTable = ({
  title,
  workers,
  type,
  shuffledWorkers,
  isEditing = false,
  isShuffling = false,
  onUpdateOrder,
  onToggleHold,
}) => {
  // Use optimized mobile detection hook
  const isMobile = useMobileDetection();

  // Use shuffled workers if available, otherwise use original order
  const displayWorkers = shuffledWorkers.length > 0 ? shuffledWorkers : workers;

  // Local state for editing - ONLY used during drag and drop editing
  const [editingOrder, setEditingOrder] = useState([]);
  const [isCurrentlyEditing, setIsCurrentlyEditing] = useState(false);

  // State to track if component has loaded (to prevent color shift)
  const [isLoaded, setIsLoaded] = useState(false);

  // When editing starts, initialize the editing order
  useEffect(() => {
    if (isEditing && !isCurrentlyEditing) {
      setEditingOrder(displayWorkers.map((worker) => worker.id));
      setIsCurrentlyEditing(true);
    } else if (!isEditing) {
      setIsCurrentlyEditing(false);
      setEditingOrder([]);
    }
  }, [isEditing, displayWorkers, isCurrentlyEditing]);

  // Mark component as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Get the workers to display - use editing order only when actively editing
  const workersToShow =
    isCurrentlyEditing && editingOrder.length > 0
      ? editingOrder
          .map((id) => displayWorkers.find((w) => w.id === id))
          .filter(Boolean)
      : displayWorkers;

  // === DRAG AND DROP HANDLERS (Desktop) ===
  const handleDragStart = useCallback(
    (e, index) => {
      if (!isEditing || isMobile) return;
      e.dataTransfer.setData("text/plain", index);
      e.target.style.opacity = "0.5";
    },
    [isEditing, isMobile]
  );

  const handleDragEnd = useCallback(
    (e) => {
      if (!isEditing || isMobile) return;
      e.target.style.opacity = "1";
    },
    [isEditing, isMobile]
  );

  const handleDragOver = useCallback(
    (e) => {
      if (!isEditing || isMobile) return;
      e.preventDefault();
    },
    [isEditing, isMobile]
  );

  const handleDrop = useCallback(
    (e, dropIndex) => {
      if (!isEditing || isMobile) return;
      e.preventDefault();

      const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
      if (dragIndex === dropIndex) return;

      const newOrder = [...editingOrder];
      const draggedId = newOrder[dragIndex];

      // Remove the dragged worker ID
      newOrder.splice(dragIndex, 1);
      // Insert at the new position
      newOrder.splice(dropIndex, 0, draggedId);

      setEditingOrder(newOrder);

      // Update parent component with actual worker objects
      const newWorkerOrder = newOrder
        .map((id) => displayWorkers.find((worker) => worker.id === id))
        .filter(Boolean);

      if (onUpdateOrder) {
        onUpdateOrder(newWorkerOrder);
      }
    },
    [isEditing, isMobile, editingOrder, displayWorkers, onUpdateOrder]
  );

  // === ARROW BUTTON HANDLERS (Mobile) ===
  const moveWorkerUp = useCallback(
    (index) => {
      if (index === 0) return;

      const newOrder = [...editingOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;

      setEditingOrder(newOrder);

      const newWorkerOrder = newOrder
        .map((id) => displayWorkers.find((worker) => worker.id === id))
        .filter(Boolean);

      if (onUpdateOrder) {
        onUpdateOrder(newWorkerOrder);
      }
    },
    [editingOrder, displayWorkers, onUpdateOrder]
  );

  const moveWorkerDown = useCallback(
    (index) => {
      if (index === workersToShow.length - 1) return;

      const newOrder = [...editingOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;

      setEditingOrder(newOrder);

      const newWorkerOrder = newOrder
        .map((id) => displayWorkers.find((worker) => worker.id === id))
        .filter(Boolean);

      if (onUpdateOrder) {
        onUpdateOrder(newWorkerOrder);
      }
    },
    [editingOrder, displayWorkers, onUpdateOrder, workersToShow.length]
  );

  // === HOLD TOGGLE HANDLER ===
  const handleToggleHold = useCallback(
    (workerId) => {
      if (onToggleHold) {
        onToggleHold(workerId);
      }
    },
    [onToggleHold]
  );

  return (
    <div
      className={`workers-table-container ${isShuffling ? "shuffling" : ""}`}
    >
      <h2 className="table-title">{title}</h2>

      <table
        className={`workers-table ${type} ${isEditing ? "editing" : ""} ${
          isMobile ? "mobile" : "desktop"
        } ${isShuffling ? "shuffle-success" : ""} ${isLoaded ? "loaded" : ""}`}
      >
        <thead>
          <tr>
            <th>סדר</th>
            <th>שם</th>
            <th>נעל</th>
            {isEditing && isMobile && <th>הזז</th>}
            {isEditing && !isMobile && <th>גרור</th>}
          </tr>
        </thead>
        <tbody>
          {workersToShow.map((worker, index) => (
            <tr
              key={worker.id}
              draggable={isEditing && !isMobile && !worker.isHeld}
              onDragStart={
                !isMobile && !worker.isHeld
                  ? (e) => handleDragStart(e, index)
                  : undefined
              }
              onDragEnd={
                !isMobile && !worker.isHeld ? handleDragEnd : undefined
              }
              onDragOver={!isMobile ? handleDragOver : undefined}
              onDrop={!isMobile ? (e) => handleDrop(e, index) : undefined}
              className={`
                ${
                  isEditing
                    ? isMobile
                      ? "editable mobile-editable"
                      : "editable draggable"
                    : ""
                }
                ${worker.isHeld ? "held-worker" : ""}
                ${isShuffling ? "shuffle-moving" : ""}
              `.trim()}
            >
              <td className="shuffle-order">{index + 1}</td>
              <td className={`worker-name-cell ${worker.isHeld ? "held" : ""}`}>
                {worker.name}
                {worker.isHeld && <span className="held-indicator"> 🔒</span>}
              </td>
              <td className="hold-control">
                <button
                  onClick={() => handleToggleHold(worker.id)}
                  className={`hold-btn ${worker.isHeld ? "held" : "unheld"}`}
                  title={worker.isHeld ? "בטל נעילה" : "נעל במקום"}
                >
                  {worker.isHeld ? "🔒" : "🔓"}
                </button>
              </td>

              {/* Mobile: Arrow buttons */}
              {isEditing && isMobile && (
                <td className="move-controls">
                  <div className="move-buttons">
                    <button
                      onClick={() => moveWorkerUp(index)}
                      disabled={index === 0 || worker.isHeld}
                      className="move-btn move-up"
                      aria-label="הזז למעלה"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveWorkerDown(index)}
                      disabled={
                        index === workersToShow.length - 1 || worker.isHeld
                      }
                      className="move-btn move-down"
                      aria-label="הזז למטה"
                    >
                      ↓
                    </button>
                  </div>
                </td>
              )}

              {/* Desktop: Drag handle */}
              {isEditing && !isMobile && (
                <td className="drag-handle">
                  <span
                    className={`drag-icon ${worker.isHeld ? "disabled" : ""}`}
                  >
                    {worker.isHeld ? "🔒" : "⋮⋮"}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {workers.length === 0 && <p className="empty-state">אין עובדים היום</p>}

      {isEditing && workersToShow.length > 0 && (
        <p className="edit-instructions">
          {isMobile
            ? "📱 השתמש בחצים כדי לשנות סדר • 🔒 לחץ על המנעול כדי לנעול עובד במקום"
            : "🖱️ גרור ושחרר כדי לשנות סדר • 🔒 לחץ על המנעול כדי לנעול עובד במקום"}
        </p>
      )}

      {!isEditing && workersToShow.length > 0 && (
        <p className="hold-instructions">
          🔒 לחץ על המנעול כדי לנעול עובד במקום בהגרלה הבאה
        </p>
      )}
    </div>
  );
};

export default WorkersTable;
