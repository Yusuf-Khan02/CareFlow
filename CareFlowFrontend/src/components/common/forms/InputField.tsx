import React from "react";
import "./FormControls.css";

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const InputField = ({
  label,
  error,
  helperText,
  leftIcon,
  id,
  className = "",
  ...props
}: InputFieldProps) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`careflow-form-group ${error ? "has-error" : ""} ${className}`}>
      <label htmlFor={inputId} className="careflow-form-label">
        {label} {props.required && <span className="required-star">*</span>}
      </label>
      <div className="careflow-input-wrapper">
        {leftIcon && <span className="careflow-input-icon">{leftIcon}</span>}
        <input
          id={inputId}
          className={`careflow-input ${leftIcon ? "has-left-icon" : ""}`}
          {...props}
        />
      </div>
      {error && <span className="careflow-field-error">{error}</span>}
      {!error && helperText && (
        <span className="careflow-field-helper">{helperText}</span>
      )}
    </div>
  );
};

export default InputField;
