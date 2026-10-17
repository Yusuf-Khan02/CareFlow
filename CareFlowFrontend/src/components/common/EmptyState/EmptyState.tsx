import type { ReactNode } from "react";
import "./EmptyState.css";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  title = "No records found",
  description = "There are no entries currently available in this section.",
  icon,
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) => {
  return (
    <div className={`careflow-empty-state ${className}`}>
      <div className="empty-state-icon">
        {icon || (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        )}
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          className="empty-state-btn"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
