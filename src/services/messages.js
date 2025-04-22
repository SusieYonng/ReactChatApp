import { API_BASE } from "./config";

export function fetchPrivateMessages(withUser) {
  return fetch(`${API_BASE}/messages/private/${withUser}`)
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

export function sendPrivateMessage(to, message) {
  return fetch(`${API_BASE}/messages/private`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, message }),
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

export function fetchConversationList() {
  return fetch("/api/v1/messages/conversations")
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

export function fetchUnreadOverview() {
  return fetch(`${API_BASE}/messages/unread-overview`)
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

export function markMessagesAsRead(contact) {
  return fetch(`${API_BASE}/messages/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact }),
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
