import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system'],
    },
    content: {
        type: String,
        required: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        // Can store: search results, product IDs, function calls, etc.
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: 'New Conversation',
        trim: true,
    },
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index for finding user's conversations
conversationSchema.index({ userId: 1, isActive: 1 });

// Index for sorting by last message
conversationSchema.index({ lastMessageAt: -1 });

// Instance method to add a message
conversationSchema.methods.addMessage = async function (role, content, metadata = {}) {
    this.messages.push({
        role,
        content,
        metadata,
        timestamp: new Date(),
    });

    this.lastMessageAt = new Date();

    // Auto-generate title from first user message if still default
    if (this.title === 'New Conversation' && role === 'user' && this.messages.length === 1) {
        // Take first 50 chars of first user message as title
        this.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    await this.save();
    return this;
};

// Instance method to get context for AI (last N messages)
conversationSchema.methods.getContext = function (messageCount = 10) {
    const recentMessages = this.messages.slice(-messageCount);

    return recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
    }));
};

// Static method to get user's conversations
conversationSchema.statics.getUserConversations = async function (userId, limit = 20) {
    return await this.find({ userId, isActive: true })
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .select('title lastMessageAt createdAt')
        .lean();
};

// Static method to create new conversation
conversationSchema.statics.createConversation = async function (userId, initialMessage = null) {
    const conversation = new this({ userId });

    if (initialMessage) {
        conversation.messages.push({
            role: 'user',
            content: initialMessage,
            timestamp: new Date(),
        });
        conversation.title = initialMessage.substring(0, 50) + (initialMessage.length > 50 ? '...' : '');
    }

    await conversation.save();
    return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
