// src/components/common/ErrorDisplay.jsx
import { useEffect, useState } from "react";

const ErrorDisplay = ({ message, onDismiss }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="error-display">
      <div className="error-content">
        <span className="error-message">{message}</span>
        <div className="error-progress"></div>
      </div>
    </div>
  );
};

export const useError = () => {
  const [errorMessage, setErrorMessage] = useState(null);

  const showError = (msg) => {
    if (msg == null) return;

    // ✅ ALWAYS convert to string (so React never tries to render an object)
    let text = "";

    if (typeof msg === "string") {
      text = msg;
    } else if (msg instanceof Error) {
      text = msg.message;
    } else {
      try {
        text = JSON.stringify(msg);
      } catch (e) {
        text = String(msg);
      }
    }

    if (text.trim() === "") return;
    setErrorMessage(text);
  };

  const dismissError = () => setErrorMessage(null);

  const ErrorComponent = () => (
    <ErrorDisplay message={errorMessage} onDismiss={dismissError} />
  );

  return {
    ErrorDisplay: ErrorComponent,
    showError,
    dismissError,
  };
};

export default ErrorDisplay;