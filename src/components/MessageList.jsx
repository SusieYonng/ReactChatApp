import "./MessageList.css";
import { useState, useEffect } from "react";
import ConversationSearchBar from "./ConversationSearchBar";
import { formatLastMsgTime } from "../utils/format";
import { getRandomColor } from "../utils/color";

export default function MessageList({
  onSelectUser,
  selectedUser,
  conversations,
  dispatch,
  friends = [],
}) {
  const [localConvs, setLocalConvs] = useState(conversations);

  useEffect(() => {
    setLocalConvs(conversations);
  }, [conversations]);

  const handleSelect = (user) => {
    onSelectUser(user);
  };

  const handleSearchSelect = (username) => {
    const existing = localConvs.find((c) => c.username === username);
    if (existing) {
      const reordered = [
        existing,
        ...localConvs.filter((c) => c.username !== username),
      ];
      setLocalConvs(reordered);
      handleSelect(existing);
    } else {
      const friend = friends.find((f) => f.username === username);
      if (friend) {
        const newConv = {
          username: friend.username,
          nickname: friend.nickname,
          lastMsg: "",
          lastMsgTime: Date.now(),
        };
        const updated = [newConv, ...localConvs];
        setLocalConvs(updated);
        dispatch({ type: "ADD", payload: newConv });
        handleSelect(newConv);
      }
    }
  };

  return (
    <div className="middle-pane">
      <ConversationSearchBar
        conversations={localConvs}
        onSelectUser={handleSearchSelect}
      />
      <p className="title">Recent Chats</p>
      <ul className="conversation-list">
        {localConvs.map((conv) => (
          <li
            key={conv.username}
            className={
              "conversation-item " +
              (selectedUser?.username === conv.username ? "selected" : "")
            }
            onClick={() => handleSelect(conv)}
          >
            <div
              className="conversation-avatar"
              style={{ backgroundColor: getRandomColor(conv.username) }}
            >
              {conv.username.charAt(0).toUpperCase()}
              {conv.unreadCount > 0 &&
                selectedUser?.username !== conv.username && (
                  <div className="unread-badge">{conv.unreadCount}</div>
                )}
            </div>
            <div className="conversation-info">
              <div className="conversation-header">
                <span className="conversation-name">{conv.nickname}</span>
                <span className="conversation-time">
                  {conv.lastMsg && conv.lastMsgTime
                    ? formatLastMsgTime(conv.lastMsgTime)
                    : ""}
                </span>
              </div>
              <p className="conversation-preview">{conv.lastMsg}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
