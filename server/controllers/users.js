import express from "express";
import { getUserByUsername, updateUserProfile } from "../models/users.js";
import { getSessionUser } from "../models/sessions.js";

const router = express.Router();

// GET /api/v1/users/search?query=xxx
router.get("/users/search", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "missing-query" });
  }

  const user = getUserByUsername(query);
  if (!user) {
    return res.status(404).json({ error: "user-not-found" });
  }

  res.json({
    username: user.username,
    nickname: user.nickname,
    bio: user.bio,
    avatar: user.avatar || null,
  });
});

router.put("/users/profile", (req, res) => {
  const sid = req.cookies.sid;
  const currentUser = getSessionUser(sid);
  if (!currentUser) return res.status(401).json({ error: "auth-missing" });

  const { nickname, bio } = req.body;
  const success = updateUserProfile(currentUser, { nickname, bio });
  if (!success) return res.status(400).json({ error: "update-failed" });

  res.json({ success: true });
});

export default router;
