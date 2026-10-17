import "./ErrorState.css";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this healthcare module.",
  onRetry,
  className = "",
}: ErrorStateProps) => {
  return (
    <div className={`careflow-error-state ${className}`}>
      <div className="error-state-icon">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
      <h4 className="error-state-title">{title}</h4>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="error-state-retry-btn"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
