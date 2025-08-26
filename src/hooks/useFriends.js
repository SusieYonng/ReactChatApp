import { useEffect, useState, useCallback } from "react";
import { fetchFriends } from "../services/friends";

export default function useFriends(view, handleAuthError) {
  const [friends, setFriends] = useState([]);

  const loadFriends = useCallback(() => {
    console.log('Loading friends...');
    fetchFriends()
      .then((data) => {
        console.log('Friends loaded:', data.friends);
        setFriends(data.friends);
      })
      .catch((err) => {
        if (handleAuthError && handleAuthError(err)) {
          handleAuthError(err);
        }
        console.warn('Failed to load friends:', err);
        setFriends([]);
      });
  }, [handleAuthError]);

  // Load friends when view changes to friends
  useEffect(() => {
    if (view === "friends") {
      loadFriends();
    }
  }, [view, loadFriends]);

  // Set up periodic refresh when in friends view
  useEffect(() => {
    let interval;
    if (view === "friends") {
      // Refresh friends list every 30 seconds when in friends view
      interval = setInterval(() => {
        console.log('Periodic friends list refresh');
        loadFriends();
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [view, loadFriends]);

  // Listen for WebSocket events to update friends list
  useEffect(() => {
    const handleFriendRequestResponse = (event) => {
      console.log('Friend request response received, refreshing friends list');
      console.log('Event detail:', event.detail);
      loadFriends();
    };

    const handleFriendRequest = (event) => {
      console.log('Friend request received, refreshing friends list');
      console.log('Event detail:', event.detail);
      loadFriends();
    };

    console.log('Setting up WebSocket event listeners for friends list');

    // Add event listeners
    window.addEventListener('friendRequestResponse', handleFriendRequestResponse);
    window.addEventListener('friendRequestReceived', handleFriendRequest);

    // Add test function to window for debugging
    window.testFriendRequestResponse = () => {
      console.log('Testing friend request response event...');
      window.dispatchEvent(new CustomEvent('friendRequestResponse', {
        detail: { from: 'test', status: 'accept' }
      }));
    };

    return () => {
      console.log('Cleaning up WebSocket event listeners for friends list');
      // Remove event listeners
      window.removeEventListener('friendRequestResponse', handleFriendRequestResponse);
      window.removeEventListener('friendRequestReceived', handleFriendRequest);
      // Remove test function
      delete window.testFriendRequestResponse;
    };
  }, [loadFriends]);

  return {
    friends,
    loadFriends,
  };
}
