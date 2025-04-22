import { useState, useEffect, useRef } from "react";
import SidebarNav from "../components/SidebarNav";
import FriendList from "../components/FriendList";
import MessageList from "../components/MessageList";
import FriendProfile from "../components/FriendProfile";
import ChatSession from "../components/ChatSession";
import { markMessagesAsRead } from "../services/messages";
import "./MainChatPage.css";
import useConversations from "../hooks/useConversations";
import useFriends from "../hooks/useFriends";

export default function MainChatPage({ currentUser, onLogout, handleAuthError }) {
  const [view, setView] = useState("chat"); // 'chat' or 'friends'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const { friends, loadFriends } = useFriends(view, handleAuthError);
  const { mergedConversations, unreadMap, setUnreadMap, dispatch, } =
    useConversations(friends, handleAuthError);

  const draftMessagesRef = useRef({});

  useEffect(() => {
    if (!selectedUser) return;
    const latestUser = friends.find(
      (f) => f.username === selectedUser.username
    );
    if (
      latestUser &&
      (latestUser.nickname !== selectedUser.nickname ||
        latestUser.avatar !== selectedUser.avatar)
    ) {
      setSelectedUser(latestUser);
    }
  }, [friends, selectedUser, setSelectedUser]);

  const startChatWithUser = (user) => {
    setSelectedUser(user);
    setView("chat");

    dispatch({
      type: "ADD",
      payload: {
        username: user.username,
        nickname: user.nickname,
        lastMsg: "",
        lastMsgTime: null,
      },
    });
  };

  const handleSelectUser = (user) => {
    markMessagesAsRead(user.username);
    setSelectedUser(user);
  };

  const renderMiddlePane = () => {
    return view === "chat" ? (
      <MessageList
        onSelectUser={(user) => handleSelectUser(user)}
        selectedUser={selectedUser}
        conversations={mergedConversations}
        dispatch={dispatch}
        friends={friends}
      />
    ) : (
      <FriendList
        friends={friends}
        loadFriends={loadFriends}
        onSelectUser={setSelectedFriend}
        selectedUser={selectedFriend}
      />
    );
  };

  const renderRightPane = () => {
    return view === "chat" ? (
      <ChatSession
        currentUser={currentUser}
        chatWith={selectedUser}
        dispatch={dispatch}
        unreadMap={unreadMap}
        setUnreadMap={setUnreadMap}
        draftMessagesRef={draftMessagesRef}
        handleAuthError={handleAuthError}
      />
    ) : (
      <FriendProfile user={selectedFriend} onStartChat={startChatWithUser} />
    );
  };

  return (
    <div className="chat-layout">
      <SidebarNav
        onLogout={onLogout}
        activeView={view}
        onChangeView={setView}
      />
      {renderMiddlePane()}
      {renderRightPane()}
    </div>
  );
}
