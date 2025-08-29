import express from "express";
import { getSessionBySid } from "../models/sessions.js";
import { getUserByUsername } from "../models/users.js";
import {
  getAllMessagesForUser,
  sendPrivateMessage,
  getPrivateMessages,
  getUnreadOverview,
  markMessagesAsRead,
} from "../models/messages.js";

const router = express.Router();

// Middleware to check for authenticated user
const isAuthenticated = async (req, res, next) => {
  const session = await getSessionBySid(req.cookies.sid);
  if (!session) {
    return res.status(401).json({ error: "auth-missing" });
  }
  req.username = session.username;
  next();
};

router.get("/messages/conversations", isAuthenticated, async (req, res) => {
  try {
    const messageMap = await getAllMessagesForUser(req.username);
    
    const conversations = await Promise.all(
      Object.keys(messageMap).map(async (otherUser) => {
        const conversation = messageMap[otherUser];
        if (conversation.length === 0) return null;

        const last = conversation[conversation.length - 1];
        const friend = await getUserByUsername(otherUser);
        
        return {
          username: otherUser,
          nickname: friend?.nickname || otherUser,
          avatar: friend?.avatar || "",
          lastMsg: last.text,
          lastMsgTime: last.time,
        };
      })
    );

    const validConversations = conversations.filter(c => c !== null);
    validConversations.sort((a, b) => b.lastMsgTime - a.lastMsgTime);

    res.json({ conversations: validConversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.post("/messages/private", isAuthenticated, async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message || typeof message !== "string") {
      return res.status(400).json({ error: "invalid-message" });
    }

    const recipient = await getUserByUsername(to);
    if (!recipient) {
      return res.status(404).json({ error: "user-not-found" });
    }

    const savedMessage = await sendPrivateMessage(req.username, to, message);
    
    const wsManager = req.app.get('wsManager');
    if (wsManager) {
      wsManager.sendNewMessageNotification(req.username, to, savedMessage);
    }
    
    res.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Error sending private message:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.get("/messages/private/:username", isAuthenticated, async (req, res) => {
  try {
    const otherUser = req.params.username;

    const friend = await getUserByUsername(otherUser);
    if (!friend) {
      return res.status(404).json({ error: "user-not-found" });
    }

    const messages = await getPrivateMessages(req.username, otherUser);
    res.json({ messages });
  } catch (error) {
    console.error('Error getting private messages:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.get("/messages/unread-overview", isAuthenticated, async (req, res) => {
  try {
    const overview = await getUnreadOverview(req.username);
    res.json({ overview });
  } catch (error) {
    console.error('Error getting unread overview:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.post("/messages/mark-read", isAuthenticated, async (req, res) => {
  try {
    const { contact } = req.body;
    if (!contact) {
      return res.status(400).json({ error: "missing-contact" });
    }

    await markMessagesAsRead(req.username, contact);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

export default router;
