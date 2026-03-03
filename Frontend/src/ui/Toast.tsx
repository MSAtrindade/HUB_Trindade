import React from "react";

export function Alert({ type, title, message }: { type: "info" | "success" | "warning" | "danger"; title?: string; message: string }) {
  const icon =
    type === "success" ? "bi-check-circle" :
    type === "warning" ? "bi-exclamation-triangle" :
    type === "danger" ? "bi-x-circle" :
    "bi-info-circle";

  return (
    <div className={`alert alert-${type} d-flex align-items-start gap-2`} role="alert">
      <i className={`bi ${icon} mt-1`} />
      <div>
        {title && <div className="fw-semibold">{title}</div>}
        <div>{message}</div>
      </div>
    </div>
  );
}
