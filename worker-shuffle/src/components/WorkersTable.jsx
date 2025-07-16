import React from "react";

const WorkersTable = ({ title, workers, type }) => (
  <div className="workers-table-container">
    <h2 className="table-title">{title}</h2>
    <table className={`workers-table ${type}`}>
      <thead>
        <tr>
          <th>שם</th>
        </tr>
      </thead>
      <tbody>
        {workers.map((worker) => (
          <tr key={worker.id}>
            <td>{worker.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {workers.length === 0 && <p className="empty-state">אין עובדים היום</p>}
  </div>
);

export default WorkersTable;
