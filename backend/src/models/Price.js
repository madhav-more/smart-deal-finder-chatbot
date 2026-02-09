import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    platform: {
        type: String,
        required: true,
        enum: ['amazon', 'flipkart', 'ebay', 'snapdeal', 'myntra', 'croma'],
        index: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    availability: {
        type: Boolean,
        required: true,
        default: true,
    },
    productUrl: {
        type: String,
        required: true,
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0,
    },
    deliveryDays: {
        type: Number,
        default: null,
    },
    scrapedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
});

// Compound index for efficient lookups
priceSchema.index({ productId: 1, platform: 1 });

// TTL index to automatically delete old price data (30 days)
priceSchema.index({ scrapedAt: 1 }, { expireAfterSeconds: 2592000 });

// Virtual for total cost
priceSchema.virtual('totalCost').get(function () {
    return this.price + (this.shippingCost || 0);
});

// Ensure virtuals are included in JSON
priceSchema.set('toJSON', { virtuals: true });
priceSchema.set('toObject', { virtuals: true });

// Static method to get latest prices for a product
priceSchema.statics.getLatestPrices = async function (productId) {
    const pipeline = [
        { $match: { productId: mongoose.Types.ObjectId(productId) } },
        { $sort: { scrapedAt: -1 } },
        {
            $group: {
                _id: '$platform',
                latestPrice: { $first: '$$ROOT' },
            },
        },
        { $replaceRoot: { newRoot: '$latestPrice' } },
    ];

    return await this.aggregate(pipeline);
};

// Static method to find best deal
priceSchema.statics.findBestDeal = async function (productId) {
    const prices = await this.getLatestPrices(productId);

    if (!prices || prices.length === 0) {
        return null;
    }

    // Sort by total cost (price + shipping)
    prices.sort((a, b) => {
        const aTotalCost = a.price + (a.shippingCost || 0);
        const bTotalCost = b.price + (b.shippingCost || 0);
        return aTotalCost - bTotalCost;
    });

    return prices[0];
};

const Price = mongoose.model('Price', priceSchema);

export default Price;
