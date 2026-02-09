import express from 'express';
import { sendMessage, getConversations, getConversation } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Chat routes with rate limiting
router.post('/message', chatLimiter, sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);

export default router;
