/**
 * WCA Mobile-First Complete Audit
 * Run in browser console on live site
 */

const mobileFirstAudit = {
  // ----- VIEWPORT & RESPONSIVE -----
  viewport: {
    'Meta viewport set': () => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta && meta.content.includes('width=device-width');
    },
    'Initial scale set': () => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta && meta.content.includes('initial-scale=1');
    },
    'Maximum scale not restricted': () => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !meta || !meta.content.includes('maximum-scale=');
    },
    'User scalable allowed': () => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !meta || !meta.content.includes('user-scalable=no');
    },
    'No horizontal scroll on mobile': () => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    },
    'Content reflows properly': () => {
      const main = document.querySelector('.org-main, main, .container');
      if (!main) return false;
      const styles = getComputedStyle(main);
      return styles.maxWidth !== 'none' || styles.width !== '100vw';
    },
  },

  // ----- TOUCH TARGETS (Critical) -----
  touchTargets: {
    'All buttons ≥44px on mobile': () => {
      const buttons = document.querySelectorAll('.btn, .org-btn, button, [role="button"]');
      let allValid = true;
      const width = window.innerWidth;
      if (width > 768) return true; // Only check on mobile
      buttons.forEach(el => {
        const styles = getComputedStyle(el);
        const height = parseFloat(styles.minHeight) || parseFloat(styles.height);
        const w = parseFloat(styles.minWidth) || parseFloat(styles.width);
        if ((height < 44 || w < 44) && el.textContent.trim()) {
          allValid = false;
        }
      });
      return allValid || buttons.length === 0;
    },
    'All nav links ≥44px': () => {
      const links = document.querySelectorAll('.org-sidebar a, nav a, .nav-link');
      let allValid = true;
      const width = window.innerWidth;
      if (width > 768) return true;
      links.forEach(el => {
        const styles = getComputedStyle(el);
        const height = parseFloat(styles.minHeight) || parseFloat(styles.height);
        const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        if ((height + padding) < 44 && el.textContent.trim()) {
          allValid = false;
        }
      });
      return allValid || links.length === 0;
    },
    'Form inputs have 16px font (no zoom)': () => {
      const inputs = document.querySelectorAll('input, select, textarea');
      let allValid = true;
      inputs.forEach(el => {
        const styles = getComputedStyle(el);
        if (parseFloat(styles.fontSize) < 16) {
          allValid = false;
        }
      });
      return allValid || inputs.length === 0;
    },
    'Tap spacing between interactive elements': () => {
      const interactives = document.querySelectorAll('button, .btn, a, input, select');
      let allHaveSpace = true;
      for (let i = 0; i < interactives.length - 1; i++) {
        const rect1 = interactives[i].getBoundingClientRect();
        const rect2 = interactives[i + 1].getBoundingClientRect();
        const gap = rect2.top - rect1.bottom;
        if (gap > 0 && gap < 8) {
          allHaveSpace = false;
        }
      }
      return allHaveSpace || interactives.length < 2;
    },
  },

  // ----- TYPOGRAPHY & READABILITY -----
  typography: {
    'Base font size ≥16px on mobile': () => {
      const styles = getComputedStyle(document.body);
      return parseFloat(styles.fontSize) >= 16;
    },
    'Line height ≥1.5 on body': () => {
      const styles = getComputedStyle(document.body);
      return parseFloat(styles.lineHeight) >= 1.5;
    },
    'Paragraphs have adequate max-width': () => {
      const p = document.querySelector('p');
      if (!p) return true;
      const styles = getComputedStyle(p);
      const width = parseFloat(styles.maxWidth) || parseFloat(styles.width);
      return width <= 800 || width === 0;
    },
    'Headings scale appropriately': () => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      if (!h1 || !h2) return true;
      const size1 = parseFloat(getComputedStyle(h1).fontSize);
      const size2 = parseFloat(getComputedStyle(h2).fontSize);
      return size1 > size2;
    },
    'Contrast ratio ≥4.5:1 for text (simplified)': () => {
      const bodyText = document.querySelector('body');
      const color = getComputedStyle(bodyText).color;
      const bg = getComputedStyle(bodyText).backgroundColor;
      return color !== bg && color !== 'rgb(255, 255, 255)';
    },
  },

  // ----- HAMBURGER MENU -----
  hamburgerMenu: {
    'Hamburger icon present': () => {
      return document.querySelector('.org-hamburger, .hamburger, .menu-toggle, [aria-label="Toggle menu"]') !== null;
    },
    'Menu icon is visible on mobile': () => {
      const width = window.innerWidth;
      if (width > 768) return true;
      const icon = document.querySelector('.org-hamburger, .hamburger, .menu-toggle');
      if (!icon) return false;
      const styles = getComputedStyle(icon);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    },
  },

  // ----- IMAGES & MEDIA -----
  images: {
    'Images are responsive': () => {
      const images = document.querySelectorAll('img');
      let allResponsive = true;
      images.forEach(img => {
        const styles = getComputedStyle(img);
        if (styles.maxWidth !== '100%' && styles.width !== '100%' && styles.width !== 'auto') {
          allResponsive = false;
        }
      });
      return allResponsive || images.length === 0;
    },
    'Images have alt text': () => {
      const images = document.querySelectorAll('img:not([role="presentation"])');
      let allHaveAlt = true;
      images.forEach(img => {
        if (!img.alt || img.alt.trim() === '') {
          allHaveAlt = false;
        }
      });
      return allHaveAlt || images.length === 0;
    },
    'Images have width/height attributes (layout stability)': () => {
      const images = document.querySelectorAll('img');
      let allHaveDimensions = true;
      images.forEach(img => {
        if (!img.width || !img.height) {
          allHaveDimensions = false;
        }
      });
      return allHaveDimensions || images.length === 0;
    },
  },

  // ----- FORMS -----
  forms: {
    'Labels associated with inputs': () => {
      const inputs = document.querySelectorAll('input, select, textarea');
      let allLabeled = true;
      inputs.forEach(input => {
        if (!input.id) return;
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && !input.getAttribute('aria-label')) {
          allLabeled = false;
        }
      });
      return allLabeled || inputs.length === 0;
    },
  },
};

function runMobileFirstAudit() {
  console.log('📱 MOBILE-FIRST AUDIT');
  console.log('=====================');
  console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`);

  let totalPassed = 0, totalFailed = 0;

  Object.entries(mobileFirstAudit).forEach(([category, checks]) => {
    console.log(`\n📂 ${category.replace(/([A-Z])/g, ' $1').trim()}:`);
    let passed = 0, failed = 0;
    Object.entries(checks).forEach(([name, fn]) => {
      try {
        const result = fn();
        if (result) {
          console.log(`  ✅ ${name}`);
          passed++;
        } else {
          console.log(`  ❌ ${name}`);
          failed++;
        }
      } catch (e) {
        console.log(`  💥 ${name}: ${e.message}`);
        failed++;
      }
    });
    totalPassed += passed;
    totalFailed += failed;
    console.log(`  → ${passed} passed, ${failed} failed`);
  });

  console.log(`\n📊 MOBILE-FIRST TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  return { passed: totalPassed, failed: totalFailed };
}
