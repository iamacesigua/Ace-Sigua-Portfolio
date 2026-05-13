const puppeteer = require('puppeteer');
const path = require('path');

async function extractHeroStyles() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`file://${path.resolve('Original/index.html')}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for Framer to render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot to see what's rendered
    await page.screenshot({ path: 'original-hero-check.png', fullPage: true });
    
    // Try to find hero text
    const heroInfo = await page.evaluate(() => {
      // Look for any large text
      const allText = [];
      const elements = document.querySelectorAll('h1, h2, p, span');
      
      for (const el of elements) {
        const text = el.textContent.trim();
        if (text.length > 10 && text.length < 100) {
          const computed = window.getComputedStyle(el);
          if (parseInt(computed.fontSize) > 20) {
            allText.push({
              text: text.substring(0, 50),
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              letterSpacing: computed.letterSpacing,
              lineHeight: computed.lineHeight,
              textTransform: computed.textTransform,
              tagName: el.tagName,
              className: el.className.substring(0, 50)
            });
          }
        }
      }
      
      return allText;
    });
    
    console.log('=== LARGE TEXT ELEMENTS IN ORIGINAL ===\n');
    for (const item of heroInfo) {
      console.log(`Text: "${item.text}"`);
      console.log(`  Tag: ${item.tagName}, Class: ${item.className}`);
      console.log(`  Font Size: ${item.fontSize}`);
      console.log(`  Font Weight: ${item.fontWeight}`);
      console.log(`  Letter Spacing: ${item.letterSpacing}`);
      console.log(`  Line Height: ${item.lineHeight}`);
      console.log(`  Text Transform: ${item.textTransform}`);
      console.log('');
    }
    
  } finally {
    await browser.close();
  }
}

extractHeroStyles().catch(console.error);
