import express from "express";
import { getSessionUser } from "../models/sessions.js";
import { getUserByUsername } from "../models/users.js";
import {
  getAllMessagesForUser,
  sendPrivateMessage,
  getPrivateMessages,
  getUnreadOverview,
  markMessagesAsRead,
} from "../models/messages.js";

const router = express.Router();

router.get("/messages/conversations", (req, res) => {
  const username = getSessionUser(req.cookies.sid);
  if (!username) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const result = [];
  const messageMap = getAllMessagesForUser(username);

  Object.keys(messageMap).forEach((otherUser) => {
    const conversation = messageMap[otherUser];
    if (conversation.length > 0) {
      const last = conversation[conversation.length - 1];
      const friend = getUserByUsername(otherUser);

      result.push({
        username: otherUser,
        nickname: friend?.nickname || otherUser,
        avatar: friend?.avatar || "",
        lastMsg: last.text,
        lastMsgTime: last.time,
      });
    }
  });

  result.sort((a, b) => b.lastMsgTime - a.lastMsgTime);

  res.json({ conversations: result });
});

router.post("/messages/private", (req, res) => {
  const sid = req.cookies.sid;
  const sender = getSessionUser(sid);

  if (!sender) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const { to, message } = req.body;

  if (!to || !message || typeof message !== "string") {
    return res.status(400).json({ error: "invalid-message" });
  }

  if (!getUserByUsername(to)) {
    return res.status(404).json({ error: "user-not-found" });
  }

  sendPrivateMessage(sender, to, message);
  res.json({ success: true });
});

router.get("/messages/private/:username", (req, res) => {
  const sid = req.cookies.sid;
  const currentUser = getSessionUser(sid);
  const otherUser = req.params.username;

  if (!currentUser) {
    return res.status(401).json({ error: "auth-missing" });
  }

  if (!getUserByUsername(otherUser)) {
    return res.status(404).json({ error: "user-not-found" });
  }

  const messages = getPrivateMessages(currentUser, otherUser);
  res.json({ messages });
});

router.get("/messages/unread-overview", (req, res) => {
  const sid = req.cookies.sid;
  const username = getSessionUser(sid);
  if (!username) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const overview = getUnreadOverview(username);
  const result = {};

  for (const contact in overview) {
    const unreadCount = overview[contact];
    const allMessages = getPrivateMessages(contact, username); // messages from contact to user
    const lastUnread = allMessages.filter((msg) => msg.from === contact).pop();

    result[contact] = {
      count: unreadCount,
      lastMsg: lastUnread?.text || "",
      lastMsgTime: lastUnread?.time || null,
    };
  }

  res.json({ overview: result });
});

router.post("/messages/mark-read", (req, res) => {
  const sid = req.cookies.sid;
  const username = getSessionUser(sid);
  const { contact } = req.body;
  if (!username) {
    return res.status(401).json({ error: "auth-missing" });
  }
  if (!contact) {
    return res.status(400).json({ error: "missing-contact" });
  }

  markMessagesAsRead(username, contact);
  res.json({ success: true });
});

export default router;
