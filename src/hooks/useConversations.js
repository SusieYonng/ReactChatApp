import { useState, useReducer, useEffect, useMemo, useContext, useCallback, useRef } from "react";
import {
  fetchConversationList,
  fetchUnreadOverview,
} from "../services/messages";
import { NetworkStatusContext } from "..//NetworkStatusContext";
import useWebSocket from "./useWebSocket.js";

const conversationReducer = (state, action) => {
  switch (action.type) {
    case "SET_ALL":
      return action.payload;
    case "ADD":
      if (state.some((c) => c.username === action.payload.username)) {
        return state;
      }
      return [...state, action.payload];
    case "UPDATE_LAST_MSG":
      return state.map((conv) =>
        conv.username === action.payload.username
          ? {
              ...conv,
              lastMsg: action.payload.lastMsg,
              lastMsgTime: action.payload.lastMsgTime,
            }
          : conv
      );
    case "UPDATE_UNREAD_COUNT":
      return state.map((conv) =>
        conv.username === action.payload.username
          ? {
              ...conv,
              unreadCount: action.payload.count,
            }
          : conv
      );
    default:
      return state;
  }
};

export default function useConversations(friends, handleAuthError) {
  const [unreadMap, setUnreadMap] = useState({});
  const [conversations, dispatch] = useReducer(conversationReducer, []);
  const { setIsOnline } = useContext(NetworkStatusContext);
  const { isConnected } = useWebSocket();
  
  // Use ref to access latest conversations state without causing re-renders
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const loadConversations = useCallback(() => {
    fetchConversationList()
      .then((data) => {
        // Get current local conversations that don't exist on server
        const currentConversations = conversationsRef.current;
        const serverConversations = data.conversations;
        
        // Find local conversations that don't exist on server
        const localOnlyConversations = currentConversations.filter(localConv => 
          !serverConversations.some(serverConv => serverConv.username === localConv.username)
        );
        
        // Merge server conversations with local-only conversations
        const mergedConversations = [...serverConversations, ...localOnlyConversations];
        
        // Only log if there are local conversations to preserve
        if (import.meta.env.DEV && localOnlyConversations.length > 0) {
          console.log('Preserving local conversations:', localOnlyConversations.map(c => c.username));
        }
        
        dispatch({ type: "SET_ALL", payload: mergedConversations });
      })
      .catch((err) => {
        console.warn("Failed to load conversations", err);
        // Don't clear conversations on error, keep local ones
      });
  }, []); // Remove conversations dependency

  useEffect(() => {
    function loadUnreadOverview() {
      fetchUnreadOverview()
        .then((data) => {
          setIsOnline(true);
          setUnreadMap(data.overview);
        })
        .catch((err) => {
          if (handleAuthError && handleAuthError(err)) return;
          // Only set network offline for actual network errors, not auth errors
          if (err?.error === "networkError") {
            console.warn("Network error detected, setting offline status");
            setIsOnline(false);
          } else {
            console.warn("Failed to load unread overview (non-network error):", err);
          }
          setUnreadMap({});
        });
    }

    // Always load conversations and unread overview on mount
    loadConversations();
    loadUnreadOverview();

    // Set up polling for both conversations and unread overview
    // This ensures data stays fresh even when WebSocket is working
    const conversationsInterval = setInterval(loadConversations, 15000); // 15 seconds
    const unreadInterval = setInterval(loadUnreadOverview, 10000); // 10 seconds

    return () => {
      clearInterval(conversationsInterval);
      clearInterval(unreadInterval);
    };
  }, [handleAuthError, setIsOnline, loadConversations]);

  // Listen for WebSocket message events
  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = event.detail;
  if (import.meta.env.DEV) console.log('WebSocket new message received:', message);
      
      // Determine the other user in the conversation
      // If message.from is the current user, then otherUser is message.to
      // If message.from is someone else, then otherUser is message.from
      const currentUsername = friends.find(f => f.username === message.from)?.username;
      const otherUser = message.from === currentUsername ? message.to : message.from;
      if (import.meta.env.DEV) {
        console.log('Current user from friends:', currentUsername);
        console.log('Message from:', message.from);
        console.log('Message to:', message.to);
        console.log('Other user in conversation:', otherUser);
      }
      
      // Update conversation last message immediately
      dispatch({
        type: "UPDATE_LAST_MSG",
        payload: {
          username: otherUser,
          lastMsg: message.text,
          lastMsgTime: message.time,
        },
      });

      // Update unread count immediately if message is from someone else
      if (message.from !== currentUsername) {
  if (import.meta.env.DEV) console.log('Updating unread count for:', message.from);
        setUnreadMap(prev => ({
          ...prev,
          [message.from]: {
            count: (prev[message.from]?.count || 0) + 1,
            lastMsg: message.text,
            lastMsgTime: message.time,
          }
        }));
      }
    };

    const handleFriendRequest = () => {
      // Refresh conversations when friend request is received
      loadConversations();
    };

    const handleFriendRequestResponse = () => {
      // Refresh conversations when friend request is responded to
      loadConversations();
    };

    // Add event listeners
    window.addEventListener('newMessageReceived', handleNewMessage);
    window.addEventListener('friendRequestReceived', handleFriendRequest);
    window.addEventListener('friendRequestResponse', handleFriendRequestResponse);

    return () => {
      // Remove event listeners
      window.removeEventListener('newMessageReceived', handleNewMessage);
      window.removeEventListener('friendRequestReceived', handleFriendRequest);
      window.removeEventListener('friendRequestResponse', handleFriendRequestResponse);
    };
  }, [friends, loadConversations]);

  const mergedConversations = useMemo(() => {
    const convoMap = {};

    // Add all conversations (both from server and locally added)
    conversations.forEach((c) => {
      const friend = friends.find((f) => f.username === c.username);
      convoMap[c.username] = {
        username: c.username,
        nickname: friend?.nickname || c.nickname || c.username,
        lastMsg: c.lastMsg || "",
        lastMsgTime: c.lastMsgTime || null,
      };
    });

    // Then, merge unread messages
    for (const username in unreadMap) {
      const { count, lastMsg, lastMsgTime } = unreadMap[username];

      if (!convoMap[username]) {
        // Only create conversation entry if there's an actual message
        if (lastMsg && lastMsgTime) {
          const friend = friends.find((f) => f.username === username);
          convoMap[username] = {
            username,
            nickname: friend?.nickname || username,
            lastMsg: lastMsg,
            lastMsgTime: lastMsgTime,
          };
        }
      } else {
        // Update existing conversation if unread message is newer
        const oldTime = convoMap[username].lastMsgTime || 0;
        if (lastMsgTime && lastMsgTime > oldTime) {
          convoMap[username].lastMsg = lastMsg;
          convoMap[username].lastMsgTime = lastMsgTime;
        }
      }

      // Always update unread count for existing conversations
      if (convoMap[username]) {
        convoMap[username].unreadCount = count;
      }
    }

    const result = Object.values(convoMap).sort(
      (a, b) => (b.lastMsgTime || 0) - (a.lastMsgTime || 0)
    );
    
    return result;
  }, [conversations, friends, unreadMap]);

  return {
    mergedConversations,
    unreadMap,
    setUnreadMap,
    dispatch,
    isWebSocketConnected: isConnected,
  };
}
