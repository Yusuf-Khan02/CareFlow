import React from "react";
import "./FormControls.css";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const SelectField = ({
  label,
  options,
  error,
  helperText,
  id,
  className = "",
  ...props
}: SelectFieldProps) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`careflow-form-group ${error ? "has-error" : ""} ${className}`}>
      <label htmlFor={selectId} className="careflow-form-label">
        {label} {props.required && <span className="required-star">*</span>}
      </label>
      <div className="careflow-select-wrapper">
        <select id={selectId} className="careflow-select" {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="careflow-select-arrow">▾</span>
      </div>
      {error && <span className="careflow-field-error">{error}</span>}
      {!error && helperText && (
        <span className="careflow-field-helper">{helperText}</span>
      )}
    </div>
  );
};

export default SelectField;
