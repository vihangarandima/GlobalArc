import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = resolve('public/projects/ransiri-grand');
const URL = 'https://weddinghall-eight.vercel.app/';

async function main() {
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
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));

  // Celebrations grid
  console.log('Capturing celebrations...');
  await page.evaluate(() => {
    const el = document.querySelector('#celebrations');
    if (el && window.lenis) window.lenis.scrollTo(el, { offset: -60, immediate: true });
    else el?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUT_DIR}/celebrations.png` });

  // Booking calendar
  console.log('Capturing booking...');
  await page.evaluate(() => {
    const el = document.querySelector('#book');
    if (el && window.lenis) window.lenis.scrollTo(el, { offset: -60, immediate: true });
    else el?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUT_DIR}/book.png` });

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
