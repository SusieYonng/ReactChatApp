import { useEffect, useState } from "react";
import { fetchSession, fetchLogout } from "../services/auth";
import { LOGIN_STATUS } from "../utils/constants";

export default function useAuth() {
  const [loginStatus, setLoginStatus] = useState(LOGIN_STATUS.PENDING);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState({});

  const getUserInfo = () => {
    fetchSession()
      .then((data) => {
        setUser(data);
        setUsername(data.username);
        setLoginStatus(LOGIN_STATUS.IS_LOGGED_IN);
      })
      .catch(() => {
        setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
      });
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const onLogin = (user) => {
    setUsername(user);
    setLoginStatus(LOGIN_STATUS.IS_LOGGED_IN);
  };

  const onLoginFailure = () => {
    setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
  };

  const onLogout = () => {
    setLoginStatus(LOGIN_STATUS.LOGGING_OUT);
    fetchLogout()
      .then(() => {
        setUsername("");
        setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
      })
      .catch(() => {
        setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN); // fallback
      });
  };

  const handleAuthError = (err) => {
    if (err?.status === 401 || err?.error === 'auth-missing') {
      setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
      return true;
    }
    return false;
  };

  return {
    loginStatus,
    username,
    user,
    onLogin,
    onLoginFailure,
    onLogout,
    getUserInfo,
    handleAuthError,
  };
}
