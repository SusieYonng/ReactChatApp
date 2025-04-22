import "./FriendProfile.css";

export default function FriendProfile({ user, onStartChat }) {
  if (!user) {
    return (
      <div className="right-pane empty">Select a friend to view profile</div>
    );
  }

  return (
    <div className="right-pane profile-pane">
      <h3>{user.nickname || user.username}'s Profile</h3>
      <p className="username">
        <strong>Username: </strong>
        {user.username}
      </p>
      <p className="nickname">
        <strong>Nickname: </strong>
        <span className={user.nickname ? "desc" : "none"}>
          {user.nickname || "No nickname set"}
        </span>
      </p>
      <p className="bio">
        <strong>Bio: </strong>
        <span className={user.bio ? "desc" : "none"}>
          {user.bio || "This user has not set a bio"}
        </span>
      </p>
      <div className="separate-line"></div>
      <button className="start-chat-btn" onClick={() => onStartChat(user)}>
        Send Message
      </button>
    </div>
  );
}
