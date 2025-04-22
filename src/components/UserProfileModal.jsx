import { useState, useEffect } from "react";
import { updateProfile } from "../services/users";
import "./UserProfileModal.css";
import { MESSAGES, SERVER, CLIENT } from "../utils/constants";

export default function UserProfileModal({ visible, onClose, user, onUpdate }) {
  const [nickname, setNickname] = useState(user.nickname || "");
  const [bio, setBio] = useState(user.bio || "");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setNickname(user.nickname || "");
    setBio(user.bio || "");
  }, [user]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ nickname, bio })
      .then((data) => {
        if (data.success) {
          setMessage({
            type: "success",
            text: MESSAGES[SERVER.PROFILE_UPDATED_SUCCESS],
          });
          onUpdate(); // refresh user data
        }
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 1000);
      })
      .catch((err) => {
        if (err.error === CLIENT.NETWORK_ERROR) {
          setMessage({
            type: "error",
            text: MESSAGES[CLIENT.NETWORK_ERROR],
          });
        } else {
          setMessage({
            type: "error",
            text: MESSAGES[SERVER.PROFILE_UPDATED_FAILED],
          });
        }
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="title">Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={user.username} disabled />
          </div>
          <div>
            <label htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something..."
            />
          </div>
          {message?.text && (
            <p className={"feedback " + message.type}>{message.text}</p>
          )}
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
