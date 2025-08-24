import express from "express";
import { getSessionUser } from "../models/sessions.js";
import {
  addFriend,
  getFriends,
  getUserByUsername,
  addFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
} from "../models/users.js";

const router = express.Router();

// POST /api/v1/friends - Add friend directly
router.post("/friends", (req, res) => {
  const sid = req.cookies.sid;
  const currentUser = getSessionUser(sid);

  if (!currentUser) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const { friendUsername } = req.body;

  if (!friendUsername || !getUserByUsername(friendUsername)) {
    return res.status(404).json({ error: "user-not-found" });
  }

  const success = addFriend(currentUser, friendUsername);
  if (!success) {
    return res.status(400).json({ error: "cannot-add-friend" });
  }

  res.json({ success: true });
});

// GET /api/v1/friends - Get current user's friends
router.get("/friends", (req, res) => {
  const sid = req.cookies.sid;
  const currentUser = getSessionUser(sid);

  if (!currentUser) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const friends = getFriends(currentUser).map((username) => {
    const user = getUserByUsername(username);
    return {
      username: user.username,
      nickname: user.nickname,
      bio: user.bio,
      avatar: user.avatar,
    };
  });

  res.json({ friends });
});

// POST /api/v1/friends/request - Send friend request
router.post("/friends/request", (req, res) => {
  const from = getSessionUser(req.cookies.sid);
  if (!from) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const { friendUsername } = req.body;
  if (!friendUsername || from === friendUsername) {
    return res.status(400).json({ error: "invalid-request" });
  }

  try {
    addFriendRequest(from, friendUsername);
    
    // Send WebSocket notification to the recipient
    const wsManager = req.app.get('wsManager');
    if (wsManager) {
      console.log(`Sending friend request notification: from=${from}, to=${friendUsername}`);
      wsManager.sendFriendRequestNotification(friendUsername, from);
    } else {
      console.log('WebSocket manager not found for friend request notification');
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/v1/friends/requests - Get friend requests received by current user
router.get("/friends/requests", (req, res) => {
  const username = getSessionUser(req.cookies.sid);
  if (!username) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const requests = getFriendRequests(username).map((fromUsername) => {
    const fromUser = getUserByUsername(fromUsername);
    return {
      username: fromUser.username,
      nickname: fromUser.nickname,
      avatar: fromUser.avatar,
    };
  });

  res.json(requests);
});

// POST /api/v1/friends/requests/respond - Accept or reject a friend request
router.post("/friends/requests/respond", (req, res) => {
  const username = getSessionUser(req.cookies.sid);
  if (!username) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const { from, action } = req.body;
  if (!from || !["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "invalid-request" });
  }

  console.log(`Friend request response: ${username} ${action}s request from ${from}`);

  try {
    respondToFriendRequest(username, from, action);
    console.log(`Friend request response processed successfully`);
    
    // Send WebSocket notification to the person who sent the request
    const wsManager = req.app.get('wsManager');
    if (wsManager) {
      console.log(`Sending friend request response notification: from=${username}, to=${from}, action=${action}`);
      console.log(`Connected users:`, wsManager.getConnectedUsernames());
      wsManager.sendFriendRequestResponseNotification(from, username, action);
    } else {
      console.log('WebSocket manager not found for friend request response notification');
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error responding to friend request:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
