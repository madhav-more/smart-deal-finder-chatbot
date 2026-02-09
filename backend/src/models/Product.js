import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    normalizedName: {
        type: String,
        required: true,
        lowercase: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        default: null,
    },
    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    embedding: {
        type: [Number],
        default: null,
        // For MongoDB Atlas Vector Search
    },
}, {
    timestamps: true,
});

// Text index for search
productSchema.index({ normalizedName: 'text', brand: 'text' });

// Compound index for category + brand filtering
productSchema.index({ category: 1, brand: 1 });

// Pre-save hook to generate normalized name
productSchema.pre('save', function (next) {
    if (this.name) {
        // Normalize: lowercase, remove special chars, trim spaces
        this.normalizedName = this.name
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }
    next();
});

// Instance method to generate embedding (will be implemented in AI service)
productSchema.methods.generateEmbedding = async function () {
    // This will be called from the AI service
    // const embeddingService = require('../services/ai/embeddings');
    // this.embedding = await embeddingService.generateEmbedding(this);
    // await this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;
