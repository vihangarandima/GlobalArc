import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = resolve('public/projects/ransiri-grand');
const URL = 'https://weddinghall-eight.vercel.app/';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: {
      width: 1600,
      height: 1050,
      deviceScaleFactor: 1.5,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Force all lazy images to load
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((img) => {
      img.loading = 'eager';
      img.decoding = 'sync';
    });
    // Trigger scroll through page to trigger any lazy loaders/observers
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1000));
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 3000));

  // Helper to scroll with Lenis or native
  const scrollTo = async (selector) => {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (window.lenis) {
        window.lenis.scrollTo(el, { offset: -60, immediate: true });
      } else {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, selector);
    await new Promise((r) => setTimeout(r, 2000));
  };

  // 1. Hero
  console.log('Capturing hero...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUT_DIR}/hero.png` });

  // 2. Spaces coverflow
  console.log('Capturing spaces...');
  await scrollTo('#spaces');
  await page.screenshot({ path: `${OUT_DIR}/spaces.png` });

  // 3. Traditions tab panel
  console.log('Capturing traditions...');
  await scrollTo('#traditions');
  await page.screenshot({ path: `${OUT_DIR}/traditions.png` });

  // 4. Moments / Gallery - scroll to show the photo masonry & films
  console.log('Capturing moments...');
  await scrollTo('#gallery');
  await page.evaluate(() => {
    const el = document.querySelector('#gallery .mgrid') || document.querySelector('#gallery');
    if (el && window.lenis) {
      window.lenis.scrollTo(el, { offset: -120, immediate: true });
    }
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUT_DIR}/moments.png` });

  // 5. Packages & Pricing Calculator
  console.log('Capturing packages...');
  await scrollTo('#packages');
  await page.screenshot({ path: `${OUT_DIR}/packages.png` });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
