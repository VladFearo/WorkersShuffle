import { useState } from "react";

const WorkerSettings = ({
  workers,
  onAddWorker,
  onRemoveWorker,
  onToggleWorkerStatus,
}) => {
  const [newWorkerName, setNewWorkerName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("טכני");

  const handleAddWorker = () => {
    if (newWorkerName.trim()) {
      onAddWorker(newWorkerName, selectedGroup);
      setNewWorkerName("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddWorker();
    }
  };

  return (
    <div className="settings-panel">
      <h3>ניהול עובדים</h3>

      {/* Add Worker Section */}
      <div className="add-worker-section">
        <h4>הוסף עובד חדש</h4>
        <div className="add-worker-form">
          <input
            type="text"
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="שם העובד"
            className="worker-name-input"
          />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="group-select"
          >
            <option value="טכני">טכני</option>
            <option value="שרות">שרות</option>
          </select>
          <button onClick={handleAddWorker} className="add-btn">
            הוסף
          </button>
        </div>
      </div>

      {/* Workers List */}
      <div className="workers-management">
        <div className="workers-group technical">
          <h5>טכני</h5>
          {workers
            .filter((w) => w.group === "טכני")
            .map((worker) => (
              <div
                key={worker.id}
                className={`worker-item ${
                  worker.isWorkingToday ? "working" : ""
                }`}
              >
                <div className="worker-status">
                  <input
                    type="checkbox"
                    checked={worker.isWorkingToday}
                    onChange={() => onToggleWorkerStatus(worker.id)}
                    className="worker-checkbox"
                  />
                  <span
                    className={`status-text ${
                      worker.isWorkingToday ? "working" : "not-working"
                    }`}
                  >
                    {worker.isWorkingToday ? "עובד היום" : "לא עובד"}
                  </span>
                </div>
                <span
                  className={`worker-name ${
                    worker.isWorkingToday ? "working" : "not-working"
                  }`}
                >
                  {worker.name}
                </span>
                <button
                  onClick={() => onRemoveWorker(worker.id)}
                  className="remove-btn"
                >
                  הסר
                </button>
              </div>
            ))}
        </div>

        <div className="workers-group service">
          <h5>שרות</h5>
          {workers
            .filter((w) => w.group === "שרות")
            .map((worker) => (
              <div
                key={worker.id}
                className={`worker-item ${
                  worker.isWorkingToday ? "working" : ""
                }`}
              >
                <div className="worker-status">
                  <input
                    type="checkbox"
                    checked={worker.isWorkingToday}
                    onChange={() => onToggleWorkerStatus(worker.id)}
                    className="worker-checkbox"
                  />
                  <span
                    className={`status-text ${
                      worker.isWorkingToday ? "working" : "not-working"
                    }`}
                  >
                    {worker.isWorkingToday ? "עובד היום" : "לא עובד"}
                  </span>
                </div>
                <span
                  className={`worker-name ${
                    worker.isWorkingToday ? "working" : "not-working"
                  }`}
                >
                  {worker.name}
                </span>
                <button
                  onClick={() => onRemoveWorker(worker.id)}
                  className="remove-btn"
                >
                  הסר
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerSettings;
