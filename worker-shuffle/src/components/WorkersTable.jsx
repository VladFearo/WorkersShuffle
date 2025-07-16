const WorkersTable = ({ title, workers, type, onShuffle, shuffledWorkers }) => {
  // Use shuffled workers if available, otherwise use original order
  const displayWorkers = shuffledWorkers.length > 0 ? shuffledWorkers : workers;

  return (
    <div className="workers-table-container">
      <h2 className="table-title">{title}</h2>

      <button
        className={`shuffle-btn ${type}`}
        onClick={onShuffle}
        disabled={workers.length === 0}
      >
        הגרל סדר הפסקות
      </button>

      <table className={`workers-table ${type}`}>
        <thead>
          <tr>
            <th>סדר</th>
            <th>שם</th>
          </tr>
        </thead>
        <tbody>
          {displayWorkers.map((worker, index) => (
            <tr key={worker.id}>
              <td className="shuffle-order">{index + 1}</td>
              <td>{worker.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {workers.length === 0 && <p className="empty-state">אין עובדים היום</p>}
    </div>
  );
};

export default WorkersTable;
