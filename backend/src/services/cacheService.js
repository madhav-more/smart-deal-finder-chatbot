import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

class CacheService {
    constructor() {
        this.client = null;
    }

    getClient() {
        if (!this.client) {
            this.client = getRedisClient();
        }
        return this.client;
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any>} - Parsed value or null
     */
    async get(key) {
        try {
            const client = this.getClient();
            if (!client) return null;

            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>} - Success status
     */
    async set(key, value, ttl = 3600) {
        try {
            const client = this.getClient();
            if (!client) return false;

            await client.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete value from cache
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} - Success status
     */
    async del(key) {
        try {
            const client = this.getClient();
            if (!client) return false;

            await client.del(key);
            return true;
        } catch (error) {
            logger.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete all keys matching a pattern
     * @param {string} pattern - Pattern to match (e.g., 'user:*')
     * @returns {Promise<number>} - Number of keys deleted
     */
    async delPattern(pattern) {
        try {
            const client = this.getClient();
            if (!client) return 0;

            const keys = await client.keys(pattern);
            if (keys.length === 0) return 0;

            await client.del(...keys);
            return keys.length;
        } catch (error) {
            logger.error(`Cache delete pattern error for ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Cache key
     * @returns {Promise<boolean>}
     */
    async exists(key) {
        try {
            const client = this.getClient();
            if (!client) return false;

            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Set expiry on existing key
     * @param {string} key - Cache key
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async expire(key, ttl) {
        try {
            const client = this.getClient();
            if (!client) return false;

            await client.expire(key, ttl);
            return true;
        } catch (error) {
            logger.error(`Cache expire error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Get multiple values from cache
     * @param {string[]} keys - Array of cache keys
     * @returns {Promise<object>} - Object with key-value pairs
     */
    async mget(keys) {
        try {
            const client = this.getClient();
            if (!client) return {};

            const values = await client.mget(...keys);
            const result = {};

            keys.forEach((key, index) => {
                result[key] = values[index] ? JSON.parse(values[index]) : null;
            });

            return result;
        } catch (error) {
            logger.error('Cache mget error:', error);
            return {};
        }
    }

    /**
     * Increment a counter
     * @param {string} key - Cache key
     * @returns {Promise<number>} - New value
     */
    async incr(key) {
        try {
            const client = this.getClient();
            if (!client) return 0;

            return await client.incr(key);
        } catch (error) {
            logger.error(`Cache incr error for key ${key}:`, error);
            return 0;
        }
    }

    /**
     * Generate cache key with prefix
     * @param {string} prefix - Key prefix
     * @param {string|number} id - Identifier
     * @returns {string} - Full cache key
     */
    generateKey(prefix, id) {
        return `${prefix}:${id}`;
    }
}

// Export singleton instance
const cacheService = new CacheService();
export default cacheService;
