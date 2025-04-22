import express from 'express';
import authRoutes from './controllers/auth.js';
import friendsRoutes from './controllers/friends.js';
import messagesRoutes from './controllers/messages.js';
import usersRouter from './controllers/users.js';

const router = express.Router();

router.use(authRoutes);
router.use(friendsRoutes);
router.use(messagesRoutes);
router.use(usersRouter);

export default router;