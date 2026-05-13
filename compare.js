const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function comparePages() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    // Take screenshot of original page
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1920, height: 1080 });
    await page1.goto(`file://${path.resolve('Original/index.html')}`, { waitUntil: 'networkidle0' });
    await page1.screenshot({ path: 'original-screenshot.png', fullPage: true });
    await page1.close();
    
    // Take screenshot of our build
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1920, height: 1080 });
    await page2.goto(`file://${path.resolve('index.html')}`, { waitUntil: 'networkidle0' });
    await page2.screenshot({ path: 'build-screenshot.png', fullPage: true });
    await page2.close();
    
    console.log('Screenshots saved:');
    console.log('- original-screenshot.png');
    console.log('- build-screenshot.png');
    
    // Extract computed styles for key elements from both pages
    const originalStyles = await extractStyles(browser, `file://${path.resolve('Original/index.html')}`);
    const buildStyles = await extractStyles(browser, `file://${path.resolve('index.html')}`);
    
    console.log('\n=== STYLE COMPARISON ===\n');
    console.log('Original vs Build:\n');
    
    for (const [selector, styles] of Object.entries(originalStyles)) {
      const buildSel = buildStyles[selector];
      if (buildSel) {
        console.log(`\n${selector}:`);
        for (const [prop, origVal] of Object.entries(styles)) {
          const buildVal = buildSel[prop];
          if (origVal !== buildVal) {
            console.log(`  ${prop}: "${origVal}" → "${buildVal}"`);
          }
        }
      }
    }
    
  } finally {
    await browser.close();
  }
}

async function extractStyles(browser, url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  const styles = await page.evaluate(() => {
    const elements = [
      { selector: '.nav-logo', props: ['fontSize', 'fontWeight', 'letterSpacing', 'textTransform'] },
      { selector: '.nav-link', props: ['fontSize', 'fontWeight', 'letterSpacing', 'textTransform'] },
      { selector: '.nav-clock', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.hero-primary', props: ['fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'] },
      { selector: '.hero-secondary', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.works-heading', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.see-all-works', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.work-title', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.work-category', props: ['fontSize', 'fontWeight', 'letterSpacing', 'color'] },
      { selector: '.about-heading', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.about-section-title', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.about-item', props: ['fontSize', 'fontWeight', 'letterSpacing', 'color'] },
      { selector: '.footer-cta-link', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.footer-email', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      { selector: '.footer-phone', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
    ];
    
    const result = {};
    for (const { selector, props } of elements) {
      const el = document.querySelector(selector);
      if (el) {
        const computed = window.getComputedStyle(el);
        result[selector] = {};
        for (const prop of props) {
          result[selector][prop] = computed[prop];
        }
      }
    }
    return result;
  });
  
  await page.close();
  return styles;
}

comparePages().catch(console.error);
