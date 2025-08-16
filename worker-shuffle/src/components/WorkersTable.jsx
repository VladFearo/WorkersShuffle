import { useState, useEffect } from "react";

const WorkersTable = ({
  title,
  workers,
  type,
  shuffledWorkers,
  isEditing = false,
  onUpdateOrder,
  onToggleHold, // New prop for toggling hold status
}) => {
  // Use shuffled workers if available, otherwise use original order
  const displayWorkers = shuffledWorkers.length > 0 ? shuffledWorkers : workers;

  // Local state for editing
  const [editableWorkers, setEditableWorkers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Update editable workers when displayWorkers or isEditing changes
  useEffect(() => {
    setEditableWorkers([...displayWorkers]);
  }, [displayWorkers, isEditing]);

  // === DRAG AND DROP HANDLERS (Desktop) ===
  const handleDragStart = (e, index) => {
    if (!isEditing || isMobile) return;
    e.dataTransfer.setData("text/plain", index);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    if (!isEditing || isMobile) return;
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    if (!isEditing || isMobile) return;
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    if (!isEditing || isMobile) return;
    e.preventDefault();

    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (dragIndex === dropIndex) return;

    const newWorkers = [...editableWorkers];
    const draggedWorker = newWorkers[dragIndex];

    // Remove the dragged worker
    newWorkers.splice(dragIndex, 1);

    // Insert at the new position
    newWorkers.splice(dropIndex, 0, draggedWorker);

    setEditableWorkers(newWorkers);

    // Update parent component
    if (onUpdateOrder) {
      onUpdateOrder(newWorkers);
    }
  };

  // === ARROW BUTTON HANDLERS (Mobile) ===
  const moveWorkerUp = (index) => {
    if (index === 0) return; // Already at top

    const newWorkers = [...editableWorkers];
    const temp = newWorkers[index];
    newWorkers[index] = newWorkers[index - 1];
    newWorkers[index - 1] = temp;

    setEditableWorkers(newWorkers);

    if (onUpdateOrder) {
      onUpdateOrder(newWorkers);
    }
  };

  const moveWorkerDown = (index) => {
    if (index === editableWorkers.length - 1) return; // Already at bottom

    const newWorkers = [...editableWorkers];
    const temp = newWorkers[index];
    newWorkers[index] = newWorkers[index + 1];
    newWorkers[index + 1] = temp;

    setEditableWorkers(newWorkers);

    if (onUpdateOrder) {
      onUpdateOrder(newWorkers);
    }
  };

  // === HOLD TOGGLE HANDLER ===
  const handleToggleHold = (workerId) => {
    if (onToggleHold) {
      onToggleHold(workerId);
    }
  };

  return (
    <div className="workers-table-container">
      <h2 className="table-title">{title}</h2>

      <table
        className={`workers-table ${type} ${isEditing ? "editing" : ""} ${
          isMobile ? "mobile" : "desktop"
        }`}
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
          {editableWorkers.map((worker, index) => (
            <tr
              key={worker.id}
              // Drag and drop props for desktop
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
                        index === editableWorkers.length - 1 || worker.isHeld
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

      {isEditing && editableWorkers.length > 0 && (
        <p className="edit-instructions">
          {isMobile
            ? "📱 השתמש בחצים כדי לשנות סדר • 🔒 לחץ על המנעול כדי לנעול עובד במקום"
            : "🖱️ גרור ושחרר כדי לשנות סדר • 🔒 לחץ על המנעול כדי לנעול עובד במקום"}
        </p>
      )}

      {!isEditing && editableWorkers.length > 0 && (
        <p className="hold-instructions">
          🔒 לחץ על המנעול כדי לנעול עובד במקום בהגרלה הבאה
        </p>
      )}
    </div>
  );
};

export default WorkersTable;
