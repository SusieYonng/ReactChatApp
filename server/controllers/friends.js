import express from "express";
import { getSessionBySid } from "../models/sessions.js";
import {
  addFriend,
  getFriends,
  getUserByUsername,
  addFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
} from "../models/users.js";

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

// This endpoint is less common with a request system, but kept for now.
router.post("/friends", isAuthenticated, async (req, res) => {
  const { friendUsername } = req.body;

  try {
    const friend = await getUserByUsername(friendUsername);
    if (!friend) {
      return res.status(404).json({ error: "user-not-found" });
    }

    const success = await addFriend(req.username, friendUsername);
    if (!success) {
      return res.status(400).json({ error: "cannot-add-friend" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

router.get("/friends", isAuthenticated, async (req, res) => {
  try {
    const friendUsernames = await getFriends(req.username);
    const friends = await Promise.all(
      friendUsernames.map(async (username) => {
        const user = await getUserByUsername(username);
        return {
          username: user.username,
          nickname: user.nickname,
          bio: user.bio,
          avatar: user.avatar,
        };
      })
    );
    res.json({ friends });
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

router.post("/friends/request", isAuthenticated, async (req, res) => {
  const { friendUsername } = req.body;
  if (!friendUsername || req.username === friendUsername) {
    return res.status(400).json({ error: "invalid-request" });
  }

  try {
    await addFriendRequest(req.username, friendUsername);
    
    const wsManager = req.app.get('wsManager');
    if (wsManager) {
      wsManager.sendFriendRequestNotification(friendUsername, req.username);
    }
    
    res.json({ success: true });
  } catch (err) {
    // Handle specific, known errors
    if (err.message === 'user-not-found' || err.message === 'already-friends' || err.message === 'request-already-sent') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error sending friend request:', err);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

router.get("/friends/requests", isAuthenticated, async (req, res) => {
  try {
    const requestUsernames = await getFriendRequests(req.username);
    const requests = await Promise.all(
      requestUsernames.map(async (fromUsername) => {
        const fromUser = await getUserByUsername(fromUsername);
        return {
          username: fromUser.username,
          nickname: fromUser.nickname,
          avatar: fromUser.avatar,
        };
      })
    );
    res.json(requests);
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

router.post("/friends/requests/respond", isAuthenticated, async (req, res) => {
  const { from, action } = req.body;
  if (!from || !["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "invalid-request" });
  }

  try {
    await respondToFriendRequest(req.username, from, action);
    
    const wsManager = req.app.get('wsManager');
    if (wsManager) {
      wsManager.sendFriendRequestResponseNotification(from, req.username, action);
    }
    
    res.json({ success: true });
  } catch (err) {
    if (err.message === 'user-not-found' || err.message === 'no-request-found') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error responding to friend request:', err);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

export default router;
