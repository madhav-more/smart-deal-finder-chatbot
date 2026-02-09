import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const analyzeGoogleDOM = async () => {
    const query = 'Iphone 15 pro';
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to Google Shopping for query: ${query}`);
        await page.goto(`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });

        const html = await page.content();
        const outputPath = path.join(process.cwd(), 'google_shopping_dump.html');
        fs.writeFileSync(outputPath, html);
        console.log(`DOM dumped to ${outputPath}`);

        // Initial quick check for common classes
        const classes = await page.evaluate(() => {
            const potentialProductContainers = document.querySelectorAll('div');
            const classCounts = {};

            potentialProductContainers.forEach(div => {
                if (div.innerText.includes('$') && div.innerText.length < 300) {
                    div.classList.forEach(cls => {
                        classCounts[cls] = (classCounts[cls] || 0) + 1;
                    });
                }
            });

            return Object.entries(classCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10);
        });

        console.log('Top classes in potential product cards:', classes);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
};

analyzeGoogleDOM();
