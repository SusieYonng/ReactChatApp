import "./SearchResultDropdown.css";

export default function SearchResultDropdown({
  results,
  keyword,
  onSelect,
  onSearchNetwork,
  hideNetworkOption = false,
  isSearching = false,
}) {
  return (
    <div className="search-dropdown">
      {results.length > 0 ? (
        results.map((user) => (
          <div
            key={user.username}
            className="search-item"
            onClick={() => onSelect(user)}
          >
            {user.nickname} ({user.username})
          </div>
        ))
      ) : (
        <div className="search-item disabled">No local match</div>
      )}
      {!hideNetworkOption && (
        <div
          className={`search-item network ${isSearching ? "disabled" : ""}`}
          onClick={!isSearching ? onSearchNetwork : undefined}
        >
          {isSearching
            ? `Searching for account: "${keyword}"...`
            : `Search network for account: "${keyword}"`}
        </div>
      )}
    </div>
  );
}
