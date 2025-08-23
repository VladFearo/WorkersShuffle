// Loading skeleton components
export const TableSkeleton = ({ title, rowCount = 4 }) => {
  return (
    <div className="workers-table-container">
      <h2 className="table-title">{title}</h2>
      <div className="skeleton-table">
        <div className="skeleton-header">
          <div className="skeleton-cell skeleton-shimmer"></div>
          <div className="skeleton-cell skeleton-shimmer"></div>
          <div className="skeleton-cell skeleton-shimmer"></div>
        </div>
        {Array.from({ length: rowCount }).map((_, index) => (
          <div key={index} className="skeleton-row">
            <div className="skeleton-cell skeleton-shimmer"></div>
            <div className="skeleton-cell skeleton-shimmer"></div>
            <div className="skeleton-cell skeleton-shimmer"></div>
          </div>
        ))}
      </div>
      <p className="skeleton-instructions">טוען...</p>
    </div>
  );
};

export const GreetingSkeleton = () => {
  return (
    <div className="hebrew-greeting-container">
      <div className="skeleton-greeting">
        <div className="skeleton-emoji skeleton-shimmer"></div>
        <div className="skeleton-text skeleton-shimmer"></div>
      </div>
      <div className="skeleton-date skeleton-shimmer"></div>
    </div>
  );
};

export const ActionsSkeleton = () => {
  return (
    <div className="main-actions">
      <div className="skeleton-button skeleton-shimmer">
        <span className="skeleton-button-text">טוען...</span>
      </div>
    </div>
  );
};

export const EditButtonSkeleton = () => {
  return (
    <div className="edit-button-container">
      <div className="skeleton-edit-btn skeleton-shimmer">
        <span className="skeleton-button-text">טוען...</span>
      </div>
    </div>
  );
};
