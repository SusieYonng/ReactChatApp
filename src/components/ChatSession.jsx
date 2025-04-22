import { useEffect, useState, useRef } from "react";
import { fetchPrivateMessages, sendPrivateMessage } from "../services/messages";
import "./ChatSession.css";
import useChatScroll from "../hooks/useChatScroll";
import { markMessagesAsRead } from "../services/messages";

export default function ChatSession({
  currentUser,
  chatWith,
  dispatch,
  unreadMap,
  setUnreadMap,
  draftMessagesRef,
  handleAuthError,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const prevUsernameRef = useRef(chatWith?.username);

  const {
    atBottom,
    chatContainerRef,
    messagesEndRef,
    hasNewMessage,
    scrollToBottom,
  } = useChatScroll(currentUser, chatWith, messages);

  useEffect(() => {
    if (!chatWith?.username) return;
    setText(draftMessagesRef.current[chatWith.username] || "");
  }, [chatWith, draftMessagesRef]);

  useEffect(() => {
    prevUsernameRef.current = chatWith?.username;
  }, [chatWith?.username]);

  useEffect(() => {
    if (!prevUsernameRef.current || !atBottom) return;
    const prevUsername = prevUsernameRef.current;

    const unread = unreadMap[prevUsername];
    if (unread && unread.count > 0) {
      markMessagesAsRead(prevUsername);
      setUnreadMap((prev) => ({
        ...prev,
        [prevUsername]: {
          ...(prev[prevUsername] || {}),
          count: 0,
        },
      }));
    }
  }, [atBottom, chatWith, setUnreadMap, unreadMap]);

  useEffect(() => {
    if (!chatWith?.username) return;

    const loadMessages = () => {
      fetchPrivateMessages(chatWith.username)
        .then((data) => {
          setMessages(data.messages);
          if (data.messages.length > messages.length) {
            const lastMsg = data.messages[data.messages.length - 1];
            dispatch({
              type: "UPDATE_LAST_MSG",
              payload: {
                username: chatWith.username,
                lastMsg: lastMsg.text,
                lastMsgTime: lastMsg.time,
              },
            });
          }
        })
        .catch((err) => {
          if (handleAuthError && handleAuthError(err)) {
            handleAuthError(err);
          }
        });
    };
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [chatWith, dispatch, handleAuthError, messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSending(true);

    sendPrivateMessage(chatWith?.username, text)
      .then(() => {
        setText("");
        draftMessagesRef.current[chatWith.username] = "";
        return fetchPrivateMessages(chatWith?.username);
      })
      .then((data) => {
        setMessages(data.messages);
        const lastMsg = data.messages[data.messages.length - 1];
        dispatch({
          type: "UPDATE_LAST_MSG",
          payload: {
            username: chatWith.username,
            lastMsg: text,
            lastMsgTime: lastMsg.time,
          },
        });
      })
      .catch((err) => {
        if (handleAuthError && handleAuthError(err)) {
          handleAuthError(err);
        }
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  if (!chatWith) {
    return <div className="right-pane empty">Select a conversation</div>;
  }

  return (
    <div className="right-pane chat-pane">
      {hasNewMessage && !atBottom && (
        <button
          className="new-message-tip"
          onClick={() => scrollToBottom("smooth")}
        >
          New messages ↓
        </button>
      )}
      <h3 className="chat-title">
        Chat with {chatWith?.nickname || chatWith?.username}
      </h3>
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg) => (
          <div
            key={msg.time}
            className={`chat-message ${
              msg.from === currentUser ? "me" : "other"
            }`}
          >
            <p className="chat-text">{msg.text}</p>
            <p className="chat-time">{new Date(msg.time).toLocaleString()}</p>
          </div>
        ))}
        <div className="chat-end" ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            draftMessagesRef.current[chatWith.username] = e.target.value;
          }}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={isSending}
          className={isSending ? "send-disabled" : ""}
        >
          {isSending ? "Sending..." : "Send"}
        </button>{" "}
      </form>
    </div>
  );
}
