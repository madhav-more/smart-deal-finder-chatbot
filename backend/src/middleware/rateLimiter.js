import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/signup attempts per windowMs
    message: {
        error: 'Too many authentication attempts',
        message: 'Please try again after 15 minutes'
    },
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for chat endpoints
export const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 chat messages per hour
    message: {
        error: 'Chat limit exceeded',
        message: 'You have reached the maximum number of messages per hour'
    },
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.userId ? req.userId.toString() : req.ip;
    },
});

// Rate limiter for scraping/search endpoints (more restrictive)
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 searches per minute
    message: {
        error: 'Search limit exceeded',
        message: 'Please wait before searching again'
    },
    keyGenerator: (req) => {
        return req.userId ? req.userId.toString() : req.ip;
    },
});

export default {
    apiLimiter,
    authLimiter,
    chatLimiter,
    searchLimiter,
};
