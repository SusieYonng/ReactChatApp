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
    console.log(`Responding to friend request: from=${from}, action=${action}`);
    respondToRequest(from, action).then(() => {
      console.log(`Friend request response successful: ${action} from ${from}`);
      if (onAdd) {
        console.log('Calling onAdd callback to refresh friends list');
        onAdd();
      }
      setRequests((reqs) => reqs.filter((r) => r.username !== from));
    }).catch((error) => {
      console.error('Error responding to friend request:', error);
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
