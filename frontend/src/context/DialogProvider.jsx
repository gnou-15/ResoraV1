import { useState, useRef, useEffect } from "react";
import { DialogContext } from "./DialogContext";

export function DialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: "alert", // "alert" | "confirm"
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    countdownSeconds: 0,
  });

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const showAlert = (message, title = "Notice") => {
    clearTimer();
    setIsCountingDown(false);
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: "alert",
        title,
        message,
        countdownSeconds: 0,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  };

  const showConfirm = (message, title = "Confirm Action", options = {}) => {
    clearTimer();
    setIsCountingDown(false);
    const countdownSecs = typeof options === 'number' ? options : (options?.countdownSeconds || 0);

    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: "confirm",
        title,
        message,
        countdownSeconds: countdownSecs,
        onConfirm: (startCountdown = true) => {
          if (countdownSecs > 0 && startCountdown) {
            setIsCountingDown(true);
            setRemainingTime(countdownSecs);
            clearTimer();

            let currentSec = countdownSecs;
            timerRef.current = setInterval(() => {
              currentSec -= 1;
              if (currentSec <= 0) {
                clearTimer();
                setIsCountingDown(false);
                setDialogState((prev) => ({ ...prev, isOpen: false }));
                resolve(true);
              } else {
                setRemainingTime(currentSec);
              }
            }, 1000);
          } else {
            clearTimer();
            setIsCountingDown(false);
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          }
        },
        onCancel: () => {
          clearTimer();
          setIsCountingDown(false);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  const totalCountdown = dialogState.countdownSeconds || 5;
  const fillPercentage = isCountingDown
    ? ((totalCountdown - remainingTime) / totalCountdown) * 100
    : 0;

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {dialogState.isOpen && (
        <div
          className="custom-dialog-overlay"
          onClick={dialogState.type === "alert" ? dialogState.onConfirm : undefined}
        >
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
                className={`btn btn-secondary btn-progress-confirm ${isCountingDown ? "is-filling" : ""}`}
                onClick={() => dialogState.onConfirm(!isCountingDown)}
                autoFocus
              >
                {isCountingDown && (
                  <span
                    className="btn-progress-fill"
                    style={{ width: `${fillPercentage}%` }}
                  />
                )}
                <span className="btn-progress-text">
                  {isCountingDown
                    ? `Confirm (${remainingTime}s)`
                    : dialogState.type === "confirm"
                    ? "Confirm"
                    : "OK"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
