import express from "express";
import {
  registerUser,
  isValidUsername,
  isForbiddenName,
  getUserByUsername,
} from "../models/users.js";
import {
  addSession,
  getSessionUser,
  deleteSession,
} from "../models/sessions.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username } = req.body;

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "invalid-username" });
  }
  if (isForbiddenName(username)) {
    return res.status(403).json({ error: "auth-insufficient" });
  }
  if (getUserByUsername(username)) {
    return res.status(409).json({ error: "user-exists" });
  }

  registerUser(username);
  res.status(201).json({ success: true });
});

router.post("/session", (req, res) => {
  const { username } = req.body;

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "invalid-username" });
  }
  if (isForbiddenName(username)) {
    return res.status(403).json({ error: "auth-insufficient" });
  }

  const user = getUserByUsername(username);
  if (!user) {
    return res.status(403).json({ error: "auth-insufficient" });
  }

  const sid = addSession(username);
  res.cookie("sid", sid, { httpOnly: true });
  res.json({ username });
});

router.get("/session", (req, res) => {
  const username = getSessionUser(req.cookies.sid);
  if (!username) {
    return res.status(401).json({ error: "auth-missing" });
  }

  const user = getUserByUsername(username);
  if (!user) {
    return res.status(403).json({ error: "auth-insufficient" });
  }

  res.json({
    username: user.username,
    nickname: user.nickname,
    bio: user.bio,
  });
});

router.delete("/session", (req, res) => {
  deleteSession(req.cookies.sid);
  res.clearCookie("sid");
  res.json({ success: true });
});

export default router;
