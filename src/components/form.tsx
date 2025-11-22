"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select";
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  step?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  children?: ReactNode;
}

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  step,
  rows = 4,
  options,
  children,
}: FormFieldProps) {
  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #babcbeff",
    borderRadius: "6px",
    fontSize: "1rem",
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        htmlFor={name}
        style={{
          display: "block",
          marginBottom: "0.5rem",
          fontWeight: "500",
          color: "#f6f1f1ff",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue as string}
          rows={rows}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : type === "checkbox" ? (
        <input
          id={name}
          type="checkbox"
          name={name}
          defaultChecked={defaultValue as boolean}
          style={{ marginLeft: "0.5rem", width: "auto" }}
        />
      ) : type === "select" ? (
        <select id={name} name={name} required={required} style={inputStyle}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue as string | number}
          step={step}
          style={inputStyle}
        />
      )}
      {children}
    </div>
  );
}

interface FormButtonsProps {
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
}

export function FormButtons({
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  isSubmitting = false,
}: FormButtonsProps) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          flex: 1,
          padding: "0.75rem",
          backgroundColor: isSubmitting ? "#9ca3af" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          fontSize: "1rem",
          fontWeight: "500",
        }}
      >
        {isSubmitting ? "Submitting..." : submitText}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        style={{
          flex: 1,
          padding: "0.75rem",
          backgroundColor: "#e5e7eb",
          color: "#374151",
          border: "none",
          borderRadius: "6px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          fontSize: "1rem",
          fontWeight: "500",
        }}
      >
        {cancelText}
      </button>
    </div>
  );
}
