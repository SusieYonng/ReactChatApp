import { useEffect, useState } from "react";
import "./FriendSearchBar.css";
import SearchResultDropdown from "./SearchResultDropdown";

export default function ConversationSearchBar({ conversations = [], onSelectUser }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      setDropdownVisible(false);
      return;
    }
    const q = query.toLowerCase();
    const matched = conversations.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        (c.nickname && c.nickname.toLowerCase().includes(q))
    );
    setFiltered(matched);
    setDropdownVisible(true);
  }, [query, conversations]);

  const clearInput = () => {
    setQuery("");
    setDropdownVisible(false);
  };

  return (
    <div className="friend-search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chats"
      />
      {query && (
        <button
          type="button"
          className="clear-btn"
          onClick={clearInput}
          aria-label="Clear"
        >
          x
        </button>
      )}
      {dropdownVisible && (
        <SearchResultDropdown
          results={filtered}
          keyword={query}
          onSelect={(user) => {
            onSelectUser(user.username);
            setQuery("");
            setDropdownVisible(false);
          }}
          hideNetworkOption={true}
        />
      )}
    </div>
  );
}
