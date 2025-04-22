import { useState, useEffect } from "react";
import "./AuthForm.css";
import { isValidUsername } from "../utils/valid";
import { MESSAGES, CLIENT } from "../utils/constants";

export default function AuthForm({
  mode,
  username,
  error,
  loading,
  onChange,
  onSubmit,
}) {
  const [localError, setLocalError] = useState(error || "");

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleChange = (e) => {
    const value = e.target.value;
    onChange(value);

    if (!isValidUsername(value)) {
      setLocalError(CLIENT.INVALID_USERNAME);
    } else {
      setLocalError("");
    }
  };

  const buttonText = loading
    ? mode === "login"
      ? "Logging in..."
      : "Registering..."
    : mode === "login"
    ? "Log In"
    : "Register";

  return (
    <div className="auth-form">
      <h1 className="title">{mode === "login" ? "Login" : "Register"}</h1>
      <form onSubmit={onSubmit} className="auth-form-body">
        <label htmlFor="username" className="auth-label">
          Username
          <input
            id="username"
            className="auth-input"
            type="text"
            placeholder="3-16 letters, numbers or underscores"
            value={username}
            onChange={handleChange}
          />
        </label>
        {localError && (
          <div className="auth-error">
            {MESSAGES[localError] || "Invalid input"}
          </div>
        )}
        <button
          type="submit"
          className="auth-button"
          disabled={!!localError || loading}
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}
