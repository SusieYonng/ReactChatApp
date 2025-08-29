import express from "express";
import { getUserByUsername, updateUserProfile } from "../models/users.js";
import { getSessionBySid } from "../models/sessions.js";

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

// GET /api/v1/users/search?query=xxx
router.get("/users/search", isAuthenticated, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "missing-query" });
  }

  try {
    const user = await getUserByUsername(query);
    if (!user) {
      return res.status(404).json({ error: "user-not-found" });
    }

    res.json({
      username: user.username,
      nickname: user.nickname,
      bio: user.bio,
      avatar: user.avatar || null,
    });
  } catch (error) {
    console.error('Error searching for user:', error);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

router.put("/users/profile", isAuthenticated, async (req, res) => {
  const { nickname, bio } = req.body;
  
  try {
    const success = await updateUserProfile(req.username, { nickname, bio });
    if (!success) {
      return res.status(400).json({ error: "update-failed" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'internal-server-error' });
  }
});

export default router;
