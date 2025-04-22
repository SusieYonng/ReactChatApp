import { API_BASE } from "./config";

export function fetchSearchUser(query) {
  return fetch(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`)
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => Promise.reject(err));
      }
      return res.json();
    });
}

export function updateProfile(profile) {
  return fetch(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  })
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) =>
      res.ok ? res.json() : res.json().then((err) => Promise.reject(err))
    );
}
