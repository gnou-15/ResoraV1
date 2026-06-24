import React, { createContext, useContext, useState } from "react";

const DialogContext = createContext(null);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: "alert", // "alert" | "confirm"
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (message, title = "Notice") => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: "alert",
        title,
        message,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  };

  const showConfirm = (message, title = "Confirm Action") => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: "confirm",
        title,
        message,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {dialogState.isOpen && (
        <div className="custom-dialog-overlay" onClick={dialogState.type === "alert" ? dialogState.onConfirm : undefined}>
          <div className="custom-dialog-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="custom-dialog-header">
              <h3>{dialogState.title}</h3>
            </div>
            <div className="custom-dialog-body">
              <p>{dialogState.message}</p>
            </div>
            <div className="custom-dialog-actions">
              {dialogState.type === "confirm" && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={dialogState.onCancel}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={dialogState.onConfirm}
                autoFocus
              >
                {dialogState.type === "confirm" ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
