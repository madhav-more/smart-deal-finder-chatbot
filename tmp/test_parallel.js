import dotenv from 'dotenv';
import scraperService from '../backend/src/services/scraperService.js';
import logger from '../backend/src/config/logger.js';

dotenv.config({ path: './backend/.env' });

async function runTest() {
    const query = "iphone 15";
    console.log(`Testing parallel scraping for: ${query}`);
    
    const start = Date.now();
    try {
        const results = await scraperService.searchProducts(query);
        const end = Date.now();
        
        console.log(`\n--- Test Results ---`);
        console.log(`Found ${results.length} products`);
        console.log(`Total Time Taken: ${end - start}ms`);
        
        if (results.length > 0) {
            console.log(`First Result: ${results[0].title} - ${results[0].price} (${results[0].platform})`);
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();
