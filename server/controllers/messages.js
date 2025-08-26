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
  try {
    const username = getSessionUser(req.cookies.sid);
    if (!username) {
      return res.status(401).json({ error: "auth-missing" });
    }

    // console.log(`Getting conversations for user: ${username}`);
    
    const result = [];
    const messageMap = getAllMessagesForUser(username);

    Object.keys(messageMap).forEach((otherUser) => {
      const conversation = messageMap[otherUser];
      
      if (conversation.length > 0) {
        const last = conversation[conversation.length - 1];
        const friend = getUserByUsername(otherUser);
        
        const conversationEntry = {
          username: otherUser,
          nickname: friend?.nickname || otherUser,
          avatar: friend?.avatar || "",
          lastMsg: last.text,
          lastMsgTime: last.time,
        };
        
        // console.log(`Adding conversation entry:`, conversationEntry);
        result.push(conversationEntry);
      }
    });

    result.sort((a, b) => b.lastMsgTime - a.lastMsgTime);
    // console.log('Final conversations result:', result);

    res.json({ conversations: result });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.post("/messages/private", (req, res) => {
  try {
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

    const savedMessage = sendPrivateMessage(sender, to, message);
    
    // Send WebSocket notification
    const wsManager = req.app.get('wsManager');
    if (wsManager) {
      console.log('WebSocket manager found, sending notification');
      wsManager.sendNewMessageNotification(sender, to, {
        id: Date.now(), // Generate a simple ID
        from: savedMessage.from,
        to: savedMessage.to,
        text: savedMessage.text,
        time: savedMessage.time
      });
    } else {
      console.log('WebSocket manager not found');
    }
    
    res.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Error sending private message:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.get("/messages/private/:username", (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error getting private messages:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.get("/messages/unread-overview", (req, res) => {
  try {
    const sid = req.cookies.sid;
    const username = getSessionUser(sid);
    if (!username) {
      return res.status(401).json({ error: "auth-missing" });
    }

    const overview = getUnreadOverview(username);
    const result = {};

    for (const contact in overview) {
      const unreadCount = overview[contact];
      
      result[contact] = {
        count: unreadCount.count,
        lastMsg: unreadCount.lastMsg || "",
        lastMsgTime: unreadCount.lastMsgTime || null,
      };
    }

    res.json({ overview: result });
  } catch (error) {
    console.error('Error getting unread overview:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

router.post("/messages/mark-read", (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: "internal-server-error" });
  }
});

export default router;
