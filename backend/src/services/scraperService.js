import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
import logger from '../config/logger.js';

const BLOCKED_RESOURCES = ['font', 'stylesheet', 'media', 'other'];

/**
 * Configure page for stealth
 */
const configurePage = async (page) => {
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.google.co.in/',
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (BLOCKED_RESOURCES.includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    // Capture browser console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Found') || text.includes('items')) {
            logger.info(`Browser Log: ${text}`);
        }
    });
};

/**
 * Autoscroll to trigger lazy loading
 */
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight > 3000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};

/**
 * Scrape Google Shopping
 */
const scrapeGoogleShopping = async (page, query) => {
    try {
        logger.info(`Attempting Google Shopping scrape for: ${query}`);
        const searchUrl = `https://www.google.co.in/search?tbm=shop&q=${encodeURIComponent(query)}&hl=en-IN&gl=in`;
        await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 });

        // Check for captcha
        const title = await page.title();
        if (title.includes('Sorry') || title.includes('Captcha')) {
            throw new Error('Google Captcha detected');
        }

        await autoScroll(page);

        // Try multiple selector patterns for Google Shopping
        return await page.evaluate(() => {
            const products = [];
            
            const getBestImage = (el) => {
                if (!el) return null;
                return el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('src') || el.getAttribute('srcset')?.split(' ')[0];
            };

            // Pattern 1: Standard Grid
            const items = document.querySelectorAll('.i0X6df, .sh-dgr__content, .sh-dlr__content, .sh-pr__product-results-grid tr, .Lq5Ohm, .translate-content, div[data-docid]');
            console.log(`Google Shopping: Found ${items.length} raw items`);

            items.forEach(item => {
                if (products.length >= 8) return;

                // Selectors can vary, try multiple
                const title = item.querySelector('h3, .tAxDx, .Lq5Ohm, .mRLS6c, .EI11be, .q39_id, .B19id, .sh-np__product-title')?.innerText;
                const price = item.querySelector('.a8Pemb, .aSection span.offscreen, .UbUdz, .OFFNJ, .Pr437, .Xr87id, .hn9id, .sh-np__price, b')?.innerText;
                const vendor = item.querySelector('.aULzUe, .IuHnof, .Ej7Ybe, .i967Ad, .E57id, .sh-np__seller-container')?.innerText;
                const link = item.querySelector('a.Lq5Ohm, a.sh-dgr__content, a.XNoYid, a.shntl, a')?.href;
                const imgEl = item.querySelector('div.ArOc1c img, .zg-pla-li-image img, .mR9u3 img, .TL9id img, img');
                const img = getBestImage(imgEl);

                if (title && price) {
                    products.push({
                        title: title.trim(),
                        price: price.trim(),
                        platform: vendor ? vendor.trim() : 'Google Shopping',
                        url: link || '#',
                        image: img || 'https://via.placeholder.com/150?text=No+Image',
                        isFallback: false
                    });
                }
            });
            console.log(`Google Shopping: Successfully extracted ${products.length} products`);
            return products;
        });
    } catch (error) {
        logger.warn(`Google Shopping scrape failed: ${error.message}`);
        return [];
    }
};

/**
 * Scrape Amazon India (Fallback)
 */
const scrapeAmazonIndia = async (page, query) => {
    try {
        logger.info(`Attempting Amazon.in fallback scrape for: ${query}`);
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        // Wait for the results container
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        try {
            await page.waitForSelector('.s-result-item', { timeout: 5000 });
        } catch (e) {
            logger.warn('Amazon selector .s-result-item not found');
        }

        await autoScroll(page);

        return await page.evaluate(() => {
            const products = [];
            
            const getBestImage = (el) => {
                if (!el) return null;
                return el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('src');
            };

            // Select all items
            const items = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"], .s-result-item');
            console.log(`Amazon India: Found ${items.length} raw items`);

            items.forEach(item => {
                if (products.length >= 8) return;

                const titleEl = item.querySelector('h2 a span, h2 span, .a-size-medium, .a-size-base-plus');
                const priceEl = item.querySelector('.a-price-whole, .a-price .a-offscreen');
                const linkEl = item.querySelector('h2 a, .a-link-normal');
                const imgEl = item.querySelector('.s-image');

                const title = titleEl?.innerText;
                const price = priceEl?.innerText;
                const link = linkEl?.href;
                const img = getBestImage(imgEl);

                if (title && price && !title.toLowerCase().includes('sponsored')) {
                    products.push({
                        title: title.trim(),
                        price: price.includes('₹') ? price.trim() : `₹${price.trim()}`,
                        platform: 'Amazon.in',
                        url: link || '#',
                        image: img || 'https://via.placeholder.com/150?text=No+Image',
                        isFallback: false
                    });
                }
            });
            console.log(`Amazon India: Successfully extracted ${products.length} products`);
            return products;
        });
    } catch (error) {
        logger.warn(`Amazon.in scrape failed: ${error.message}`);
        return [];
    }
};

/**
 * Scrape Flipkart India
 */
const scrapeFlipkart = async (page, query) => {
    try {
        logger.info(`Attempting Flipkart scrape for: ${query}`);
        const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        // Use 'load' for more completeness and a long timeout for Flipkart
        await page.goto(searchUrl, { waitUntil: 'load', timeout: 45000 });

        try {
            await page.waitForSelector('a.k7wcnx, div.cPHD_L, div._1AtVbE', { timeout: 15000 });
        } catch (e) {
            logger.warn('Flipkart primary selector not found within 15s');
        }

        await autoScroll(page);

        return await page.evaluate(() => {
            const products = [];
            
            // 1. Try Specific Selectors First (List/Grid)
            let items = document.querySelectorAll('a.k7wcnx, div.cPHD_L, div._1AtVbE, div._2k0uS1, div._4ddWXP, div._13oc-S');
            
            // 2. If no items, try a very broad generic search for anything that looks like a product card
            if (items.length === 0) {
                // Look for elements that contain a price and a title
                items = Array.from(document.querySelectorAll('div, a')).filter(el => {
                    const text = el.innerText;
                    return text.includes('₹') && text.length > 50 && text.length < 500;
                });
            }

            console.log(`Flipkart: Found ${items.length} potential items`);

            items.forEach(item => {
                if (products.length >= 8) return;

                // Title: Longest text element that isn't the price
                let title = item.querySelector('div.KzDlHZ, div.w_076P, a.pIpigb, div._4rR01T, ._2Wk9S9, ._2B099V')?.innerText;
                
                // Price: Element with ₹
                let price = item.querySelector('div.Nx9bqj, div._30jeq3, ._1vC4OE, ._3I9_wc')?.innerText;
                
                // Link: Closest A
                let link = (item.closest('a') || item.querySelector('a') || (item.tagName === 'A' ? item : null))?.href;
                
                // Image: First img
                let img = item.querySelector('img')?.src;

                // SAFETY: If specific selectors failed but we have a text-heavy element with a price
                if (!title || !price) {
                    const text = item.innerText || "";
                    const priceMatch = text.match(/₹[0-9,]+/);
                    if (priceMatch) {
                        price = priceMatch[0];
                        // Try to guess title from first few words or lines
                        title = text.split('\n')[0].substring(0, 100);
                    }
                }

                if (title && price && title.length > 5) {
                    products.push({
                        title: title.trim(),
                        price: price.includes('₹') ? price.trim() : `₹${price.trim()}`,
                        platform: 'Flipkart',
                        url: link || window.location.href,
                        image: img || 'https://via.placeholder.com/150?text=No+Image',
                        isFallback: false
                    });
                }
            });
            console.log(`Flipkart: Successfully extracted ${products.length} products`);
            return products;
        });
    } catch (error) {
        logger.warn(`Flipkart scrape failed: ${error.message}`);
        return [];
    }
};

/**
 * Get High-Quality Mock Data (Last Resort)
 */
const getMockData = (query) => {
    logger.info(`Generating premium Indian mock data for: ${query}`);
    const q = query.toLowerCase();

    const mockImages = {
        'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
        'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80',
        'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
        'iphone': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80',
        'headphone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        'audio': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80',
        'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        'sneaker': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&q=80',
        'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
        'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
        'clothing': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80',
        'generic': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80'
    };

    let imageKey = 'generic';
    if (q.includes('macbook')) imageKey = 'macbook';
    else if (q.includes('laptop')) imageKey = 'laptop';
    else if (q.includes('iphone')) imageKey = 'iphone';
    else if (q.includes('phone') || q.includes('android')) imageKey = 'phone';
    else if (q.includes('headphone') || q.includes('sony') || q.includes('bose')) imageKey = 'headphone';
    else if (q.includes('speaker') || q.includes('audio')) imageKey = 'audio';
    else if (q.includes('watch')) imageKey = 'watch';
    else if (q.includes('shoe') || q.includes('nike') || q.includes('adidas')) imageKey = 'shoe';
    else if (q.includes('camera') || q.includes('canon') || q.includes('nikon')) imageKey = 'camera';
    else if (q.includes('chair') || q.includes('table') || q.includes('sofa')) imageKey = 'furniture';
    else if (q.includes('shirt') || q.includes('dress') || q.includes('hoodie')) imageKey = 'clothing';

    return [
        {
            title: `${query} - Premium New Condition`,
            price: "₹79,999.00",
            platform: "Amazon India",
            url: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
            image: mockImages[imageKey],
            isFallback: true
        },
        {
            title: `${query} (Best Value)`,
            price: "₹72,499.00",
            platform: "Flipkart",
            url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
            image: mockImages[imageKey],
            isFallback: true
        },
        {
            title: `${query} - Official Store`,
            price: "₹84,900.00",
            platform: "Reliance Digital",
            url: `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}`,
            image: mockImages[imageKey],
            isFallback: true
        },
        {
            title: `${query} - Local Dealer`,
            price: "₹75,000.00",
            platform: "Croma",
            url: `https://www.croma.com/searchB?text=${encodeURIComponent(query)}`,
            image: mockImages[imageKey],
            isFallback: true
        }
    ];
};

/**
 * Main Search Function (Parallel)
 */
export const searchProducts = async (query) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080'
            ]
        });

        // Search Workers
        const scrapeTask = async (scrapeFn) => {
            const page = await browser.newPage();
            await configurePage(page);
            try {
                // Add a source-specific timeout
                const sourceResults = await Promise.race([
                    scrapeFn(page, query),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Source timeout')), 60000))
                ]);
                return sourceResults;
            } catch (err) {
                logger.warn(`Individual scrape task failed: ${err.message}`);
                return [];
            } finally {
                await page.close();
            }
        };

        logger.info(`Starting PARALLEL search for: ${query}`);
        
        // Execute all scraping tasks in parallel
        const startTime = Date.now();
        const resultsArray = await Promise.all([
            scrapeTask(scrapeGoogleShopping),
            scrapeTask(scrapeAmazonIndia),
            scrapeTask(scrapeFlipkart)
        ]);
        
        const duration = Date.now() - startTime;
        logger.info(`Parallel search completed in ${duration}ms`);

        // Flatten results from all sources
        let results = resultsArray.flat();

        // Strategy 3: Premium Mock Data (Only if BOTH sources fail or are blocked)
        if (results.length === 0) {
            results = getMockData(query);
        }

        return results;

    } catch (error) {
        logger.error('Scraping workflow error:', error);
        return getMockData(query); // Fail safe
    } finally {
        if (browser) await browser.close();
    }
};

export default {
    searchProducts
};
