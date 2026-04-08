import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

dotenv.config({ path: '.env' });

async function testSetup() {
    console.log('--- Testing Puppeteer Launch ---');
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });
        console.log('SUCCESS: Puppeteer launched successfully.');
        await browser.close();
    } catch (err) {
        console.error('FAILURE: Puppeteer launch failed:', err.message);
    }

    console.log('\n--- Testing AI Configuration ---');
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (geminiKey) {
        console.log('Gemini API Key: Found');
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log('Gemini Service: Initialized');
        } catch (err) {
            console.error('Gemini Service: Initialization failed:', err.message);
        }
    } else {
        console.log('Gemini API Key: NOT FOUND (This is fine if using Groq)');
    }

    if (groqKey) {
        console.log('Groq API Key: Found');
        try {
            const groq = new Groq({ apiKey: groqKey });
            console.log('Groq Service: Initialized');
        } catch (err) {
            console.error('Groq Service: Initialization failed:', err.message);
        }
    } else {
        console.log('Groq API Key: NOT FOUND');
    }
}

testSetup();
