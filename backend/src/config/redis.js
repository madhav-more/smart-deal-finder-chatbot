import Redis from 'ioredis';
import { config } from 'dotenv';

config();

let redisClient = null;

const connectRedis = () => {
    try {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            retryStrategy: (times) => {
                // If it fails more than 3 times, stop retrying
                if (times > 3) {
                    console.warn('⚠️  Redis connection failed too many times. Disabling Redis.');
                    return null;
                }
                return Math.min(times * 50, 2000);
            },
            maxRetriesPerRequest: 1,
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis connection error:', err.message);
        });

        redisClient.on('close', () => {
            console.warn('⚠️  Redis connection closed');
        });

        return redisClient;
    } catch (error) {
        console.error('❌ Failed to initialize Redis:', error.message);
        return null;
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        redisClient = connectRedis();
    }
    return redisClient;
};

export { connectRedis, getRedisClient };
export default { connectRedis, getRedisClient };
