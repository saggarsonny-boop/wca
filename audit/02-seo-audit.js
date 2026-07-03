/**
 * WCA Complete SEO Audit
 * Run in browser console on live site
 */

const seoAudit = {
  metaTags: {
    'Title tag exists': () => document.querySelector('title') !== null,
    'Title length 30-70 characters': () => {
      const title = document.querySelector('title');
      if (!title) return false;
      const len = title.textContent.length;
      return len >= 30 && len <= 70;
    },
    'Meta description exists': () => document.querySelector('meta[name="description"]') !== null,
    'Meta description length 120-170 characters': () => {
      const meta = document.querySelector('meta[name="description"]');
      if (!meta) return false;
      const len = meta.content.length;
      return len >= 120 && len <= 170;
    },
    'Open Graph tags present': () => {
      return document.querySelector('meta[property="og:title"]') !== null &&
             document.querySelector('meta[property="og:description"]') !== null;
    },
    'Twitter Card tags present': () => document.querySelector('meta[name="twitter:card"]') !== null,
    'Canonical URL set': () => document.querySelector('link[rel="canonical"]') !== null,
    'Language attribute set': () => document.documentElement.lang !== '',
  },

  headings: {
    'H1 exists on page': () => document.querySelector('h1') !== null,
    'Only one H1 per page': () => document.querySelectorAll('h1').length <= 1,
    'Heading hierarchy logical (no skipping)': () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      let valid = true;
      headings.forEach(h => {
        const level = parseInt(h.tagName[1]);
        if (previousLevel > 0 && level > previousLevel + 1) {
          valid = false;
        }
        previousLevel = level;
      });
      return valid || headings.length === 0;
    },
  },

  content: {
    'Page has at least 200 words': () => {
      const text = document.body.textContent;
      const words = text.split(/\s+/).length;
      return words >= 200;
    },
    'No placeholder text left in': () => {
      const text = document.body.textContent.toLowerCase();
      const placeholders = ['lorem ipsum', 'dolor sit amet', 'placeholder', 'coming soon', 'under construction'];
      return !placeholders.some(p => text.includes(p));
    },
  },

  structuredData: {
    'JSON-LD present': () => document.querySelector('script[type="application/ld+json"]') !== null,
    'JSON-LD parses without error': () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      let allValid = true;
      scripts.forEach(script => {
        try { JSON.parse(script.textContent); } catch (e) { allValid = false; }
      });
      return allValid || scripts.length === 0;
    },
  },

  internalLinks: {
    'Nav links use descriptive anchor text': () => {
      const links = document.querySelectorAll('nav a, .nav a, .sidebar a, .org-sidebar a');
      let allDescriptive = true;
      links.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        if (text === 'click here' || text === 'link' || text === 'more' || text === '') {
          allDescriptive = false;
        }
      });
      return allDescriptive || links.length === 0;
    },
    'No empty href anchors': () => {
      const links = document.querySelectorAll('a[href="#"], a[href=""]');
      return links.length === 0;
    },
    'Robots.txt is accessible': async () => {
      try {
        const res = await fetch('/robots.txt');
        return res.ok;
      } catch (e) {
        return false;
      }
    },
  },
};

function runSEOAudit() {
  console.log('🔍 SEO AUDIT');
  console.log('============');

  let totalPassed = 0, totalFailed = 0;

  Object.entries(seoAudit).forEach(([category, checks]) => {
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

  console.log(`\n📊 SEO TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  return { passed: totalPassed, failed: totalFailed };
}
