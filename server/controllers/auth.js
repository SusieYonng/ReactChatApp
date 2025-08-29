import express from "express";
import {
  registerUser,
  isValidUsername,
  isForbiddenName,
  getUserByUsername,
} from "../models/users.js";
import {
  addSession,
  getSessionBySid,
  deleteSession,
} from "../models/sessions.js";

const router = express.Router();

// Use async functions for route handlers to work with await
router.post("/register", async (req, res) => {
  const { username } = req.body;

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "invalid-username" });
  }
  if (isForbiddenName(username)) {
    return res.status(403).json({ error: "auth-insufficient" });
  }
  
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return res.status(409).json({ error: "user-exists" });
  }

  // We pass a placeholder for the password as discussed
  await registerUser(username, 'password_placeholder');
  res.status(201).json({ success: true });
});

router.post("/session", async (req, res) => {
  const { username } = req.body;

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "invalid-username" });
  }
  if (isForbiddenName(username)) {
    return res.status(403).json({ error: "auth-insufficient" });
  }

  const user = await getUserByUsername(username);
  if (!user) {
    // For security, don't reveal if the user exists.
    // In a real app with passwords, you'd check the password here.
    return res.status(403).json({ error: "auth-insufficient" });
  }

  const sid = await addSession(username);
  res.cookie("sid", sid, { httpOnly: true });
  res.json({ username });
});

router.get("/session", async (req, res) => {
  const session = await getSessionBySid(req.cookies.sid);
  if (!session) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const user = await getUserByUsername(session.username);
  if (!user) {
    // This case is unlikely if session exists, but good for safety
    return res.status(403).json({ error: "auth-insufficient" });
  }

  res.json({
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar, // Added avatar
    // bio is not in the schema, so we remove it
  });
});

router.delete("/session", async (req, res) => {
  await deleteSession(req.cookies.sid);
  res.clearCookie("sid");
  res.json({ success: true });
});

export default router;
