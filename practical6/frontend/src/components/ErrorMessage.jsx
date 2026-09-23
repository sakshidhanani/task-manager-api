function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box">
      <p>⚠ {message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
