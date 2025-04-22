import "./SidebarNav.css";
import { useState } from "react";
import UserProfileModal from "./UserProfileModal";
import useAuth from "../hooks/useAuth";
import chatIcon from "../assets/icons/chat.svg";
import chatActiveIcon from "../assets/icons/chat_active.svg";
import contactsIcon from "../assets/icons/contacts.svg";
import contactsActiveIcon from "../assets/icons/contacts_active.svg";
import logoutIcon from "../assets/icons/logout.svg";

export default function SidebarNav({ onLogout, activeView, onChangeView }) {
  const { user, username, getUserInfo } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="sidebar-nav">
      <div
        className="sidebar-avatar"
        onClick={() => {
          setShowProfile(true);
        }}
      >
        {username[0]?.toUpperCase()}
      </div>
      <div className="sidebar-buttons">
        <button
          className={activeView === "chat" ? "active" : ""}
          onClick={() => onChangeView("chat")}
        >
          <img
            src={activeView === "chat" ? chatActiveIcon : chatIcon}
            alt="Chat"
            className="icon"
          />
        </button>
        <p className="sidebar-text">Chats</p>
        <button
          className={activeView === "friends" ? "active" : ""}
          onClick={() => onChangeView("friends")}
        >
          <img
            src={activeView === "friends" ? contactsActiveIcon : contactsIcon}
            alt="Contacts"
            className="icon"
          />
        </button>
        <p className="sidebar-text">Contacts</p>
      </div>
      <div className="sidebar-logout">
        <button onClick={onLogout}>
          <img src={logoutIcon} alt="Logout" className="icon" />
        </button>
        <p className="sidebar-text">Logout</p>
      </div>
      <UserProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUpdate={getUserInfo}
      />
    </div>
  );
}
