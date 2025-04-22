import { API_BASE } from "./config";

export function fetchFriends() {
  return fetch(`${API_BASE}/friends`)
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => Promise.reject(err));
      }
      return res.json();
    });
}

export function sendFriendRequest(friendUsername) {
  return fetch(`${API_BASE}/friends/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ friendUsername }),
  })
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => Promise.reject(err));
      }
      return res.json();
    });
}

export function fetchFriendRequests() {
  return fetch(`${API_BASE}/friends/requests`)
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => Promise.reject(err));
      }
      return res.json();
    });
}

export function respondToRequest(fromUsername, action) {
  return fetch(`${API_BASE}/friends/requests/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromUsername, action }), // action: 'accept' or 'reject'
  })
    .catch(() => Promise.reject({ error: "networkError" }))
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => Promise.reject(err));
      }
      return res.json();
    });
}
