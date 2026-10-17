import { useEffect } from "react";
import "./ConfirmationDialog.css";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="dialog-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`dialog-icon-wrapper dialog-icon-${variant}`}>
          {variant === "danger" && "⚠️"}
          {variant === "warning" && "⚡"}
          {variant === "primary" && "ℹ️"}
        </div>
        <div className="dialog-content">
          <h3 className="dialog-title">{title}</h3>
          <p className="dialog-message">{message}</p>
        </div>
        <div className="dialog-actions">
          <button
            type="button"
            className="dialog-btn dialog-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`dialog-btn dialog-btn-${variant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
