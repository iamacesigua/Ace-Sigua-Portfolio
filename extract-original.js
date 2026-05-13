const puppeteer = require('puppeteer');
const path = require('path');

async function extractOriginalStyles() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`file://${path.resolve('Original/index.html')}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for Framer runtime to render
    await page.waitForSelector('.framer-KBSaa', { timeout: 10000 }).catch(() => console.log('Framer classes not found'));
    
    const originalStyles = await page.evaluate(() => {
      // Original Framer class names
      const elements = [
        { selector: '.framer-KBSaa', name: 'Logo', props: ['fontSize', 'fontWeight', 'letterSpacing', 'textTransform'] },
        { selector: '.framer-lJI3A', name: 'Nav Link', props: ['fontSize', 'fontWeight', 'letterSpacing', 'textTransform'] },
        { selector: '.framer-cn6Va', name: 'Clock', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-XHxZH', name: 'Hero Main', props: ['fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'] },
        { selector: '.framer-tHo9F', name: 'Works Section', props: ['padding', 'maxWidth'] },
        { selector: '.framer-HbvMp', name: 'See All Works', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-edCgP', name: 'Work Card', props: ['width', 'height'] },
        { selector: '.framer-1nmkmq', name: 'Work Title', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-9kb0zu', name: 'Work Category', props: ['fontSize', 'fontWeight', 'letterSpacing', 'color'] },
        { selector: '.framer-16moik4', name: 'About Section', props: ['padding', 'minHeight'] },
        { selector: '.framer-1nx4ecl', name: 'About Heading', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-1louvmh', name: 'About Section Title', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-1mrw14k', name: 'About Item', props: ['fontSize', 'fontWeight', 'letterSpacing', 'color'] },
        { selector: '.framer-tc28hr', name: 'Footer', props: ['padding', 'gap'] },
        { selector: '.framer-wm5425', name: 'Footer CTA', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-lqhj6j', name: 'Footer Email', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
        { selector: '.framer-15jvf87', name: 'Footer Phone', props: ['fontSize', 'fontWeight', 'letterSpacing'] },
      ];
      
      const result = {};
      for (const { selector, name, props } of elements) {
        const el = document.querySelector(selector);
        if (el) {
          const computed = window.getComputedStyle(el);
          result[name] = {};
          for (const prop of props) {
            result[name][prop] = computed[prop];
          }
        } else {
          result[name] = { error: 'Element not found' };
        }
      }
      return result;
    });
    
    console.log('=== ORIGINAL FRAMER STYLES ===\n');
    for (const [name, stls] of Object.entries(originalStyles)) {
      console.log(`${name}:`);
      if (stls.error) {
        console.log(`  ${stls.error}`);
      } else {
        for (const [prop, val] of Object.entries(stls)) {
          console.log(`  ${prop}: ${val}`);
        }
      }
      console.log('');
    }
    
    // Also get the nav container padding
    const navPadding = await page.evaluate(() => {
      const nav = document.querySelector('.framer-ouh0y8');
      if (nav) {
        const computed = window.getComputedStyle(nav);
        return {
          padding: computed.padding,
          gap: computed.gap,
        };
      }
      return { error: 'Nav container not found' };
    });
    console.log('Nav Container:', navPadding);
    
    // Get works grid gap
    const worksGap = await page.evaluate(() => {
      const grid = document.querySelector('.framer-tHo9F');
      if (grid) {
        const computed = window.getComputedStyle(grid);
        return {
          gap: computed.gap,
          padding: computed.padding,
          maxWidth: computed.maxWidth,
        };
      }
      return { error: 'Works grid not found' };
    });
    console.log('Works Grid:', worksGap);
    
  } finally {
    await browser.close();
  }
}

extractOriginalStyles().catch(console.error);
