const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  console.log('Navigating to http://localhost:3000/jobs/27bef96d-df08-4cc1-a1d0-70346c903724');
  try {
    await page.goto('http://localhost:3000/jobs/27bef96d-df08-4cc1-a1d0-70346c903724', { waitUntil: 'networkidle0' });
  } catch (err) {
    console.error('Failed to navigate:', err);
  }

  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
