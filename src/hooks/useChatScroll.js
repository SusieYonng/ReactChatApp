import { useState, useEffect, useRef } from "react";

export default function useChatScroll(currentUser, chatWith, messages) {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const scrollToBottom = (type = "") => {
    messagesEndRef.current?.scrollIntoView({ behavior: type || "smooth" });
    setHasNewMessage(false);
  };

  useEffect(() => {
    scrollToBottom("instant");
  }, [chatWith?.username]);

  useEffect(() => {
    if (!chatWith?.username) return;
    let attempts = 0;
    const maxAttempts = 10;
    const retryDelay = 100;

    const tryBindScroll = () => {
      const container = chatContainerRef.current;
      if (!container) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryBindScroll, retryDelay);
        } else {
          console.warn(
            "[useChatScroll] chatContainerRef is still null after max retries."
          );
        }
        return;
      }

      const handleScroll = () => {
        const nearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          50;
        setAtBottom(nearBottom);
        if (nearBottom) {
          setHasNewMessage(false);
        }
      };

      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Initialize on mount

      return () => container.removeEventListener("scroll", handleScroll);
    };

    tryBindScroll();
  }, [chatContainerRef, chatWith?.username]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const isNewMessage = messages.length > prevMsgCountRef.current;

    if (isNewMessage) {
      prevMsgCountRef.current = messages.length;
      // If the last message is from the current user, show the newest message immediately
      if (currentUser === messages[messages.length - 1].from) {
        scrollToBottom("instant");
        return;
      }
      // If the user is browsing history messages (not near the bottom of the chat),
      // scroll to the bottom. Otherwise, show new message tip.
      if (atBottom) {
        scrollToBottom();
      } else {
        setHasNewMessage(true);
      }
    }
  }, [currentUser, atBottom, messages]);

  useEffect(() => {
    prevMsgCountRef.current = 0;
    setHasNewMessage(false);
  }, [chatWith]);

  return {
    atBottom,
    chatContainerRef,
    messagesEndRef,
    hasNewMessage,
    scrollToBottom,
  };
}
