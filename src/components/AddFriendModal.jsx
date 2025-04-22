import "./AddFriendModal.css";

export default function AddFriendModal({ user, visible, onClose, onAdd }) {
  if (!visible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        {user ? (
          <>
            <h3 className="title">User Found</h3>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Nickname:</strong> {user.nickname}
            </p>
            <button className="add-btn" onClick={() => onAdd(user.username)}>
              Add Friend
            </button>
          </>
        ) : (
          <p>No user found.</p>
        )}
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
