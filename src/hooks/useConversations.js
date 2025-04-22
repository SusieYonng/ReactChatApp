import { useState, useReducer, useEffect, useMemo, useContext } from "react";
import {
  fetchConversationList,
  fetchUnreadOverview,
} from "../services/messages";
import { NetworkStatusContext } from "..//NetworkStatusContext";

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
    default:
      return state;
  }
};

export default function useConversations(friends, handleAuthError) {
  const [unreadMap, setUnreadMap] = useState({});
  const [conversations, dispatch] = useReducer(conversationReducer, []);
  const { setIsOnline } = useContext(NetworkStatusContext);

  useEffect(() => {
    function loadConversations() {
      fetchConversationList()
        .then((data) => {
          dispatch({ type: "SET_ALL", payload: data.conversations });
        })
        .catch((err) => {
          console.warn("Failed to load conversations", err);
          dispatch({ type: "SET_ALL", payload: [] });
        });
    }

    function loadUnreadOverview() {
      fetchUnreadOverview()
        .then((data) => {
          setIsOnline(true);
          setUnreadMap(data.overview);
        })
        .catch((err) => {
          if (handleAuthError && handleAuthError(err)) return;
          if (err?.error === "networkError") {
            setIsOnline(false);
          }
          console.warn("Failed to load unread overview", err);
          setUnreadMap({});
        });
    }

    loadConversations();
    loadUnreadOverview();

    const intervalId = setInterval(() => {
      loadUnreadOverview();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const mergedConversations = useMemo(() => {
    const convoMap = {};

    conversations.forEach((c) => {
      const friend = friends.find((f) => f.username === c.username);
      convoMap[c.username] = {
        username: c.username,
        nickname: friend?.nickname || c.nickname || c.username,
        lastMsg: c.lastMsg,
        lastMsgTime: c.lastMsgTime,
      };
    });

    // Merge unread messages
    for (const username in unreadMap) {
      const { count, lastMsg, lastMsgTime } = unreadMap[username];

      const friend = friends.find((f) => f.username === username);

      if (!convoMap[username]) {
        convoMap[username] = {
          username,
          nickname: friend?.nickname || username,
          lastMsg: lastMsg || "",
          lastMsgTime: lastMsgTime || null,
        };
      } else {
        const oldTime = convoMap[username].lastMsgTime || 0;
        if (lastMsgTime && lastMsgTime > oldTime) {
          convoMap[username].lastMsg = lastMsg;
          convoMap[username].lastMsgTime = lastMsgTime;
        }
      }

      convoMap[username].unreadCount = count;
    }

    return Object.values(convoMap).sort(
      (a, b) => (b.lastMsgTime || 0) - (a.lastMsgTime || 0)
    );
  }, [conversations, friends, unreadMap]);

  return {
    mergedConversations,
    unreadMap,
    setUnreadMap,
    dispatch,
  };
}
