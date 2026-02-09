import Joi from 'joi';
import Conversation from '../models/Conversation.js';
import logger from '../config/logger.js';
import aiService from '../services/aiService.js';
import scraperService from '../services/scraperService.js';

// Validation schemas
const messageSchema = Joi.object({
    message: Joi.string().required().min(1).max(1000),
    conversationId: Joi.string().allow(null, ''),
});

// @desc    Send message to chatbot
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        // Validate input
        const { error, value } = messageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                message: error.details[0].message,
            });
        }

        const { message, conversationId } = value;
        const userId = req.userId;

        let conversation;

        // Get or create conversation
        if (conversationId) {
            conversation = await Conversation.findOne({
                _id: conversationId,
                userId,
            });

            if (!conversation) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Conversation not found',
                });
            }
        } else {
            // Create new conversation
            conversation = await Conversation.createConversation(userId, message);
        }

        // Add user message if not already added
        if (!conversationId || conversation.messages[conversation.messages.length - 1]?.content !== message) {
            await conversation.addMessage('user', message);
        }

        // 1. Analyze Intent
        const intent = await aiService.parseIntent(message);
        logger.info(`User intent: ${JSON.stringify(intent)}`);

        let aiReplyContent = "";
        let metadata = {};

        if (intent.isSearch && intent.query) {
            // 2. Perform Search
            // Notify user we are searching (optional, handled by frontend loading state usually)

            const searchResults = await scraperService.searchProducts(intent.query);

            // 3. Generate Summary Response
            aiReplyContent = await aiService.generateResponse(message, searchResults);

            metadata = {
                type: 'product_search',
                query: intent.query,
                results: searchResults
            };
        } else {
            // Conversational Reply
            aiReplyContent = intent.conversationalReply || "I'm not sure how to help with that, could you try asking for a product price?";
            metadata = {
                type: 'chat'
            };
        }

        // Add AI response to conversation
        await conversation.addMessage('assistant', aiReplyContent, metadata);

        logger.info(`Chat message processed for user ${userId}`);

        res.status(200).json({
            conversationId: conversation._id,
            reply: aiReplyContent,
            results: metadata,
        });
    } catch (error) {
        logger.error('Send message error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to process message',
        });
    }
};

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const conversations = await Conversation.getUserConversations(userId);

        res.status(200).json({
            conversations,
        });
    } catch (error) {
        logger.error('Get conversations error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to get conversations',
        });
    }
};

// @desc    Get specific conversation
// @route   GET /api/chat/conversations/:id
// @access  Private
export const getConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const conversationId = req.params.id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId,
        });

        if (!conversation) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Conversation not found',
            });
        }

        res.status(200).json({
            conversation,
        });
    } catch (error) {
        logger.error('Get conversation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to get conversation',
        });
    }
};

export default {
    sendMessage,
    getConversations,
    getConversation,
};
