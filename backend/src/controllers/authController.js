import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import logger from '../config/logger.js';

// Validation schemas
const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    try {
        // Validate input
        const { error, value } = signupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                message: error.details[0].message,
            });
        }

        const { email, password, name } = value;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'An account with this email already exists',
            });
        }

        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            passwordHash: password, // Will be hashed by pre-save hook
            name,
        });

        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error('Signup error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create user',
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                message: error.details[0].message,
            });
        }

        const { email, password } = value;

        // Find user by email with password
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Incorrect email or password',
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Incorrect email or password',
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        logger.info(`User logged in: ${email}`);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to login',
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token required',
                message: 'Refresh token is required',
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.status(200).json({
            accessToken,
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Refresh token is invalid or expired',
            });
        }

        logger.error('Refresh token error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to refresh token',
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-passwordHash')
            .populate('favorites', 'name brand imageUrl');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile not found',
            });
        }

        res.status(200).json({
            user,
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to get user profile',
        });
    }
};

export default {
    signup,
    login,
    refreshToken,
    getMe,
};
