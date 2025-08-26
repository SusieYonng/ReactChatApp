import { useState, useEffect, useRef } from "react";
import SidebarNav from "../components/SidebarNav";
import FriendList from "../components/FriendList";
import MessageList from "../components/MessageList";
import FriendProfile from "../components/FriendProfile";
import ChatSession from "../components/ChatSession";
import WebSocketStatus from "../components/WebSocketStatus";
import WebSocketDebug from "../components/WebSocketDebug";
import { markMessagesAsRead } from "../services/messages";
import "./MainChatPage.css";
import useConversations from "../hooks/useConversations";
import useFriends from "../hooks/useFriends";

export default function MainChatPage({ currentUser, onLogout, handleAuthError }) {
  const [view, setView] = useState("chat"); // 'chat' or 'friends'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  const { friends, loadFriends } = useFriends(view, handleAuthError);
  const { mergedConversations, unreadMap, setUnreadMap, dispatch, isWebSocketConnected } =
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
    console.log('Starting chat with user:', user);
    setSelectedUser(user);
    setView("chat");

    const newConversation = {
      username: user.username,
      nickname: user.nickname,
      lastMsg: "",
      lastMsgTime: null,
    };
    
    console.log('Adding new conversation:', newConversation);
    dispatch({
      type: "ADD",
      payload: newConversation,
    });
  };

  const handleSelectUser = (user) => {
    markMessagesAsRead(user.username);
    setSelectedUser(user);
  };

  const renderMiddlePane = () => {
    return view === "chat" ? (
      <div className="middle-pane">
        <WebSocketStatus />
        {showDebug && <WebSocketDebug />}
        <div className="debug-toggle">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="debug-toggle-btn"
          >
            {showDebug ? '🔽 Hide Debug' : '🔽 Show Debug'}
          </button>
        </div>
        <MessageList
          onSelectUser={(user) => handleSelectUser(user)}
          selectedUser={selectedUser}
          conversations={mergedConversations}
          dispatch={dispatch}
          friends={friends}
        />
      </div>
    ) : (
      <div className="middle-pane">
        <WebSocketStatus />
        {showDebug && <WebSocketDebug />}
        <div className="debug-toggle">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="debug-toggle-btn"
          >
            {showDebug ? '🔽 Hide Debug' : '🔽 Show Debug'}
          </button>
        </div>
        <FriendList
          friends={friends}
          loadFriends={loadFriends}
          onSelectUser={setSelectedFriend}
          selectedUser={selectedFriend}
        />
      </div>
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
