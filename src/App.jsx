import { useState, useEffect } from "react";
import AuthPanel from "./views/AuthPanel";
import MainChatPage from "./views/MainChatPage";
import "./App.css";
import useAuth from "./hooks/useAuth";
import Loading from "./components/Loading";
import { LOGIN_STATUS } from "./utils/constants";
import { NetworkStatusContext } from "./NetworkStatusContext";

export default function App() {
  const { username, loginStatus, onLogin, onLoginFailure, onLogout, handleAuthError } =
    useAuth();
  const [isOnline, setIsOnline] = useState(true);

  // Check network status on mount and when network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial network status
    setIsOnline(navigator.onLine);

    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show network banner when network is offline, regardless of login status
  const shouldShowNetworkBanner = !isOnline;

  return (
    <NetworkStatusContext.Provider value={{ isOnline, setIsOnline }}>
      <main className="app-container">
        {shouldShowNetworkBanner && (
          <div className="network-banner">
            ⚠️ Network disconnected. Please check your connection.
          </div>
        )}

        {loginStatus === LOGIN_STATUS.PENDING && <Loading />}
        {(loginStatus === LOGIN_STATUS.NOT_LOGGED_IN ||
          loginStatus === LOGIN_STATUS.LOGGING_IN) && (
          <>
            <AuthPanel onLogin={onLogin} onLoginFailure={onLoginFailure} />
            {loginStatus === LOGIN_STATUS.LOGGING_IN && <Loading overlay />}
          </>
        )}

        {(loginStatus === LOGIN_STATUS.IS_LOGGED_IN ||
          loginStatus === LOGIN_STATUS.LOGGING_OUT) && (
          <>
            <MainChatPage
              currentUser={username}
              onLogout={onLogout}
              handleAuthError={handleAuthError}
            />
            {loginStatus === LOGIN_STATUS.LOGGING_OUT && <Loading overlay />}
          </>
        )}
      </main>
    </NetworkStatusContext.Provider>
  );
}
