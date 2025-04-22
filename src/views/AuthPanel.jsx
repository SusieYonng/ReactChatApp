import React, { useState } from "react";
import { fetchLogin, fetchRegister } from "../services/auth";
import AuthForm from "../components/AuthForm";
import "./AuthPanel.css";
import { SERVER, CLIENT } from "../utils/constants";

export default function AuthPanel({ onLogin, onLoginFailure }) {
  const [mode, setMode] = useState("login"); // or 'register'
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setError(CLIENT.INVALID_USERNAME);
      return;
    }

    setLoading(true);
    const action = mode === "login" ? fetchLogin : fetchRegister;
    action(trimmed)
      .then((data) => {
        setLoading(false);
        if (mode === "register") {
          return fetchLogin(trimmed);
        }
        return data;
      })
      .then((data) => {
        onLogin(data.username);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.error || CLIENT.UNKNOWN_ERROR);
        if (
          mode == "register" &&
          err.status === 403 &&
          err.error === "auth-insufficient"
        ) {
          setError(SERVER.FORBIDDEN_NAME);
        }
        onLoginFailure();
      });
  }

  const handleChange = (value) => {
    setMode(value);
    setError(null);
    setUsername(username); // re-trigger validation
  };

  return (
    <div className="auth-panel">
      <AuthForm
        mode={mode}
        username={username}
        error={error}
        loading={loading}
        onChange={setUsername}
        onSubmit={handleSubmit}
      />
      <p>
        {mode === "login" ? (
          <>
            Don’t have an account?{" "}
            <button
              className="tab-button to-register"
              onClick={() => {
                handleChange("register");
              }}
            >
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              className="tab-button to-login"
              onClick={() => {
                handleChange("login");
              }}
            >
              Login
            </button>
          </>
        )}
      </p>
    </div>
  );
}
