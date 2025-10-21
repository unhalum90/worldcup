const puppeteer = require('puppeteer');
const fs = require('fs');

async function capture(url, path, width, height) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  // give any dynamic client JS a moment
  await page.waitForTimeout(500);
  await page.screenshot({ path, fullPage: false });
  await browser.close();
}

(async () => {
  const base = process.env.WEB_URL || 'http://localhost:3000';
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');
  console.log('Capturing index desktop...');
  await capture(`${base}/forums`, './screenshots/index-desktop.png', 1440, 900);
  console.log('Capturing index mobile...');
  await capture(`${base}/forums`, './screenshots/index-mobile.png', 393, 852);
  console.log('Capturing city desktop...');
  await capture(`${base}/forums/boston`, './screenshots/boston-desktop.png', 1440, 900);
  console.log('Capturing city mobile...');
  await capture(`${base}/forums/boston`, './screenshots/boston-mobile.png', 393, 852);
  console.log('Done');
})();
