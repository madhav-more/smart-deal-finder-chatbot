import scraperService from './src/services/scraperService.js';

const testScrape = async () => {
    console.log('Starting test scrape...');
    try {
        const query = 'iphone 15 pro';
        const results = await scraperService.searchProducts(query);

        console.log('--------------------------------------------------');
        console.log(`Scrape Results for "${query}":`);
        console.log('--------------------------------------------------');
        console.log(JSON.stringify(results, null, 2));
        console.log('--------------------------------------------------');

        if (results.length > 0 && !results[0].isFallback) {
            console.log('✅ SUCCESS: Real data scraped!');
        } else if (results.length > 0 && results[0].isFallback) {
            console.log('⚠️ WARNING: Fallback data returned (Scraping failed).');
        } else {
            console.log('❌ FAILURE: No results found.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
};

testScrape();
