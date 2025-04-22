import { useEffect, useState } from "react";
import { sendFriendRequest } from "../services/friends";
import FriendSearchBar from "./FriendSearchBar";
import AddFriendModal from "./AddFriendModal";
import FriendRequestList from "./FriendRequestList";
import "./FriendList.css";
import { MESSAGES } from "../utils/constants";

export default function FriendList({
  onSelectUser,
  selectedUser,
  friends,
  loadFriends,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchUser, setSearchUser] = useState(null);
  const [message, setMessage] = useState(null); //{ type: "info"/"warning", text: "" }

  const sortedFriends = [...friends].sort((a, b) =>
    (a.nickname || a.username).localeCompare(b.nickname || b.username)
  );

  useEffect(() => {
    const updated = sortedFriends.find(
      (friend) => friend.username === selectedUser?.username
    );
    if (updated) {
      onSelectUser(updated);
    }
  }, [onSelectUser, selectedUser, sortedFriends]);

  const handleShowModal = (user) => {
    setSearchUser(user);
    setModalVisible(true);
  };

  const handleAddFriend = (username) => {
    sendFriendRequest(username)
      .then(() => {
        setMessage({ type: "info", text: "Friend request sent!" });
      })
      .catch((err) => {
        if (
          err.error === "already-friends" ||
          err.error === "request-already-sent"
        ) {
          setMessage({ type: "warning", text: MESSAGES[err.error] });
        } else {
          setMessage({ type: "error", text: "Failed to send request." });
        }
      });
    setModalVisible(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="middle-pane friend-list-pane">
      <FriendSearchBar
        friends={friends}
        onSelectUser={onSelectUser}
        onShowModal={handleShowModal}
      />
      {message?.text && (
        <div className={"feedback-message " + message?.type}>
          {message?.text}
        </div>
      )}
      <FriendRequestList onAdd={loadFriends} />
      <p className="title">All Friends</p>
      <ul className="friend-list">
        {sortedFriends.map((friend) => (
          <li
            key={friend.username}
            className={
              selectedUser?.username === friend.username ? "selected" : ""
            }
            onClick={() => onSelectUser(friend)}
          >
            <div className="friend-nickname">
              {friend.nickname || friend.username}
            </div>
          </li>
        ))}
      </ul>

      <AddFriendModal
        visible={modalVisible}
        user={searchUser}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddFriend}
      />
    </div>
  );
}
