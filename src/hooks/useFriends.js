import { useEffect, useState } from "react";
import { fetchFriends } from "../services/friends";

export default function useFriends(view, handleAuthError) {
  const [friends, setFriends] = useState([]);

  const loadFriends = () => {
    fetchFriends()
      .then((data) => {
        setFriends(data.friends);
      })
      .catch((err) => {
        if (handleAuthError && handleAuthError(err)) {
          handleAuthError(err);
        }
        setFriends([]);
      });
  };

  useEffect(() => {
    if (view === "friends") {
      loadFriends();
    }
  }, [view]);

  return {
    friends,
    loadFriends,
  };
}
