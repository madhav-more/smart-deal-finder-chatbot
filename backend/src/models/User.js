import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // This already creates an index
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
        type: String,
        required: true,
        select: false, // Don't include password in queries by default
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    searchHistory: [{
        query: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }],
    priceAlerts: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        targetPrice: Number,
        platform: String,
        active: {
            type: Boolean,
            default: true,
        },
    }],
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('passwordHash')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.passwordHash);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to add to search history (limit to last 50 searches)
userSchema.methods.addSearchHistory = async function (query) {
    this.searchHistory.unshift({ query, timestamp: new Date() });

    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
        this.searchHistory = this.searchHistory.slice(0, 50);
    }

    await this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = async function (email) {
    return await this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

const User = mongoose.model('User', userSchema);

export default User;
