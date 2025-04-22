import { useEffect, useState } from "react";
import SearchResultDropdown from "./SearchResultDropdown";
import { fetchSearchUser } from "../services/users";
import "./FriendSearchBar.css";

export default function FriendSearchBar({
  friends = [],
  onSelectUser,
  onShowModal,
}) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      setDropdownVisible(false);
      return;
    }

    const q = query.toLowerCase();
    const matched = friends.filter(
      (f) =>
        f.username.toLowerCase().includes(q) ||
        f.nickname.toLowerCase().includes(q)
    );
    setFiltered(matched);
    setDropdownVisible(true);
  }, [query, friends]);

  const handleNetworkSearch = () => {
    setIsSearching(true);
    fetchSearchUser(query)
      .then((user) => onShowModal(user))
      .catch(() => onShowModal(null))
      .finally(() => {
        setIsSearching(false);
        setDropdownVisible(false);
      });
  };

  const clearInput = () => {
    setQuery("");
    setDropdownVisible(false);
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setDropdownVisible(true);
    }
  };

  return (
    <div className="friend-search-bar">
      <input
        type="text"
        value={query}
        onFocus={handleInputFocus}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search friends or other users"
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
            onSelectUser(user);
            setQuery("");
            setDropdownVisible(false);
          }}
          onSearchNetwork={handleNetworkSearch}
          isSearching={isSearching}
        />
      )}
    </div>
  );
}
