const puppeteer = require('puppeteer');
const path = require('path');

async function compareBothPages() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    // Extract styles from original
    const originalStyles = await extractStyles(browser, `file://${path.resolve('Original/index.html')}`, 'original');
    
    // Extract styles from our build
    const buildStyles = await extractStyles(browser, `file://${path.resolve('index.html')}`, 'build');
    
    console.log('=== COMPREHENSIVE STYLE COMPARISON ===\n');
    
    // Compare each element
    const elements = [
      'Logo', 'Nav Link', 'Clock', 'Hero Main', 'Hero Subtitle',
      'Works Heading', 'See All Works', 'Work Title', 'Work Category',
      'About Heading', 'About Section Title', 'About Item',
      'Footer CTA', 'Footer Email', 'Footer Phone'
    ];
    
    for (const name of elements) {
      const orig = originalStyles[name];
      const build = buildStyles[name];
      
      if (orig && build) {
        console.log(`\n${name}:`);
        let hasDiff = false;
        
        for (const [prop, origVal] of Object.entries(orig)) {
          const buildVal = build[prop];
          if (origVal !== buildVal) {
            console.log(`  ${prop}: "${origVal}" → "${buildVal}"`);
            hasDiff = true;
          }
        }
        
        if (!hasDiff) {
          console.log('  ✅ All properties match');
        }
      } else {
        console.log(`\n${name}:`);
        if (!orig) console.log('  Original: Not found');
        if (!build) console.log('  Build: Not found');
      }
    }
    
    // Compare container padding
    console.log('\n\n=== CONTAINER PADDING ===\n');
    console.log('Nav Container:');
    console.log(`  Original: ${originalStyles['Nav Container']?.padding || 'N/A'}`);
    console.log(`  Build: ${buildStyles['Nav Container']?.padding || 'N/A'}`);
    
    console.log('\nWorks Section:');
    console.log(`  Original: ${originalStyles['Works Section']?.padding || 'N/A'}`);
    console.log(`  Build: ${buildStyles['Works Section']?.padding || 'N/A'}`);
    
    console.log('\nAbout Section:');
    console.log(`  Original: ${originalStyles['About Section']?.padding || 'N/A'}`);
    console.log(`  Build: ${buildStyles['About Section']?.padding || 'N/A'}`);
    
    console.log('\nFooter:');
    console.log(`  Original: ${originalStyles['Footer']?.padding || 'N/A'}`);
    console.log(`  Build: ${buildStyles['Footer']?.padding || 'N/A'}`);
    
  } finally {
    await browser.close();
  }
}

async function extractStyles(browser, url, type) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    if (type === 'original') {
      // Wait for Framer runtime to render
      await page.waitForSelector('.framer-KBSaa, .framer-lJI3A', { timeout: 10000 }).catch(() => {});
    } else {
      // Wait for our build to render
      await page.waitForSelector('.nav-logo, .hero-primary', { timeout: 10000 }).catch(() => {});
    }
    
    const styles = await page.evaluate((pageType) => {
      const result = {};
      
      if (pageType === 'original') {
        // Original Framer selectors
        const logo = document.querySelector('.framer-KBSaa');
        if (logo) {
          const c = window.getComputedStyle(logo);
          result['Logo'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, textTransform: c.textTransform };
        }
        
        const navLink = document.querySelector('.framer-lJI3A');
        if (navLink) {
          const c = window.getComputedStyle(navLink);
          result['Nav Link'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, textTransform: c.textTransform };
        }
        
        const clock = document.querySelector('.framer-cn6Va');
        if (clock) {
          const c = window.getComputedStyle(clock);
          result['Clock'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        // Hero - look for the large heading
        const heroMain = document.querySelector('[data-framer-name="Section - Hero"] h1, .framer-XHxZH');
        if (heroMain) {
          const c = window.getComputedStyle(heroMain);
          result['Hero Main'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, lineHeight: c.lineHeight };
        }
        
        const worksHeading = document.querySelector('[data-framer-name="Section - Works"] h2');
        if (worksHeading) {
          const c = window.getComputedStyle(worksHeading);
          result['Works Heading'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const seeAll = document.querySelector('.framer-HbvMp');
        if (seeAll) {
          const c = window.getComputedStyle(seeAll);
          result['See All Works'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const workTitle = document.querySelector('.framer-1nmkmq');
        if (workTitle) {
          const c = window.getComputedStyle(workTitle);
          result['Work Title'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const workCategory = document.querySelector('.framer-9kb0zu');
        if (workCategory) {
          const c = window.getComputedStyle(workCategory);
          result['Work Category'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, color: c.color };
        }
        
        const aboutHeading = document.querySelector('#about h2');
        if (aboutHeading) {
          const c = window.getComputedStyle(aboutHeading);
          result['About Heading'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const aboutSectionTitle = document.querySelector('#about h3');
        if (aboutSectionTitle) {
          const c = window.getComputedStyle(aboutSectionTitle);
          result['About Section Title'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const aboutItem = document.querySelector('#about p');
        if (aboutItem) {
          const c = window.getComputedStyle(aboutItem);
          result['About Item'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, color: c.color };
        }
        
        const footerCTA = document.querySelector('.footer a, .framer-wm5425 a');
        if (footerCTA) {
          const c = window.getComputedStyle(footerCTA);
          result['Footer CTA'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const footerEmail = document.querySelector('.footer-email, .framer-lqhj6j');
        if (footerEmail) {
          const c = window.getComputedStyle(footerEmail);
          result['Footer Email'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const footerPhone = document.querySelector('.footer-phone, .framer-15jvf87');
        if (footerPhone) {
          const c = window.getComputedStyle(footerPhone);
          result['Footer Phone'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        // Container padding
        const navContainer = document.querySelector('.framer-ouh0y8');
        if (navContainer) {
          const c = window.getComputedStyle(navContainer);
          result['Nav Container'] = { padding: c.padding };
        }
        
        const worksSection = document.querySelector('[data-framer-name="Section - Works"]');
        if (worksSection) {
          const c = window.getComputedStyle(worksSection);
          result['Works Section'] = { padding: c.padding };
        }
        
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
          const c = window.getComputedStyle(aboutSection);
          result['About Section'] = { padding: c.padding };
        }
        
        const footer = document.querySelector('.footer, .framer-tc28hr');
        if (footer) {
          const c = window.getComputedStyle(footer);
          result['Footer'] = { padding: c.padding };
        }
        
      } else {
        // Our build selectors
        const logo = document.querySelector('.nav-logo');
        if (logo) {
          const c = window.getComputedStyle(logo);
          result['Logo'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, textTransform: c.textTransform };
        }
        
        const navLink = document.querySelector('.nav-link');
        if (navLink) {
          const c = window.getComputedStyle(navLink);
          result['Nav Link'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, textTransform: c.textTransform };
        }
        
        const clock = document.querySelector('.nav-clock');
        if (clock) {
          const c = window.getComputedStyle(clock);
          result['Clock'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const heroMain = document.querySelector('.hero-primary');
        if (heroMain) {
          const c = window.getComputedStyle(heroMain);
          result['Hero Main'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, lineHeight: c.lineHeight };
        }
        
        const heroSub = document.querySelector('.hero-secondary');
        if (heroSub) {
          const c = window.getComputedStyle(heroSub);
          result['Hero Subtitle'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const worksHeading = document.querySelector('.works-heading');
        if (worksHeading) {
          const c = window.getComputedStyle(worksHeading);
          result['Works Heading'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const seeAll = document.querySelector('.see-all-works');
        if (seeAll) {
          const c = window.getComputedStyle(seeAll);
          result['See All Works'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const workTitle = document.querySelector('.work-title');
        if (workTitle) {
          const c = window.getComputedStyle(workTitle);
          result['Work Title'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const workCategory = document.querySelector('.work-category');
        if (workCategory) {
          const c = window.getComputedStyle(workCategory);
          result['Work Category'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, color: c.color };
        }
        
        const aboutHeading = document.querySelector('.about-heading');
        if (aboutHeading) {
          const c = window.getComputedStyle(aboutHeading);
          result['About Heading'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const aboutSectionTitle = document.querySelector('.about-section-title');
        if (aboutSectionTitle) {
          const c = window.getComputedStyle(aboutSectionTitle);
          result['About Section Title'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const aboutItem = document.querySelector('.about-item');
        if (aboutItem) {
          const c = window.getComputedStyle(aboutItem);
          result['About Item'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing, color: c.color };
        }
        
        const footerCTA = document.querySelector('.footer-cta-link');
        if (footerCTA) {
          const c = window.getComputedStyle(footerCTA);
          result['Footer CTA'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const footerEmail = document.querySelector('.footer-email');
        if (footerEmail) {
          const c = window.getComputedStyle(footerEmail);
          result['Footer Email'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        const footerPhone = document.querySelector('.footer-phone');
        if (footerPhone) {
          const c = window.getComputedStyle(footerPhone);
          result['Footer Phone'] = { fontSize: c.fontSize, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing };
        }
        
        // Container padding
        const nav = document.querySelector('.nav');
        if (nav) {
          const c = window.getComputedStyle(nav);
          result['Nav Container'] = { padding: c.padding };
        }
        
        const worksSection = document.querySelector('.works');
        if (worksSection) {
          const c = window.getComputedStyle(worksSection);
          result['Works Section'] = { padding: c.padding };
        }
        
        const aboutSection = document.querySelector('.about');
        if (aboutSection) {
          const c = window.getComputedStyle(aboutSection);
          result['About Section'] = { padding: c.padding };
        }
        
        const footer = document.querySelector('.footer');
        if (footer) {
          const c = window.getComputedStyle(footer);
          result['Footer'] = { padding: c.padding };
        }
      }
      
      return result;
    }, type);
    
    return styles;
    
  } catch (error) {
    console.error(`Error extracting styles from ${type}:`, error.message);
    return {};
  } finally {
    await page.close();
  }
}

compareBothPages().catch(console.error);
