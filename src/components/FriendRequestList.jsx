import { useEffect, useState } from "react";
import { fetchFriendRequests, respondToRequest } from "../services/friends";
import "./FriendRequestList.css";

export default function FriendRequestList({ onAdd }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchFriendRequests()
      .then(setRequests)
      .catch(() => setRequests([]));
  }, []);

  function handleResponse(from, action) {
    respondToRequest(from, action).then(() => {
      if (onAdd) {
        onAdd();
      }
      setRequests((reqs) => reqs.filter((r) => r.username !== from));
    });
  }

  if (!requests.length) return null;

  return (
    <div className="friend-request-list">
      <h4>New Friend Requests</h4>
      {requests.map((req) => (
        <div key={req.username} className="request-item">
          <span className="request-user">
            {req.nickname} ({req.username})
          </span>
          <div className="button-wrapper">
            <button onClick={() => handleResponse(req.username, "accept")}>
              Accept
            </button>
            <button onClick={() => handleResponse(req.username, "reject")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
