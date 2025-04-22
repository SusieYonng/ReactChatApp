import { API_BASE } from "./config";

export function fetchSession() {
  return fetch(`${API_BASE}/session`)
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res
          .json()
          .then((err) => Promise.reject({ ...err, status: res.status }));
      }
      return res.json();
    });
}

export function fetchLogin(username) {
  return fetch(`${API_BASE}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  })
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res
          .json()
          .then((err) => Promise.reject({ ...err, status: res.status }));
      }
      return res.json();
    });
}

export function fetchLogout() {
  return fetch(`${API_BASE}/session`, {
    method: "DELETE",
  })
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => Promise.reject(err));
      }
      return res.json();
    });
}

export function fetchRegister(username) {
  return fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  })
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res
          .json()
          .then((err) => Promise.reject({ ...err, status: res.status }));
      }
      return res.json();
    });
}
