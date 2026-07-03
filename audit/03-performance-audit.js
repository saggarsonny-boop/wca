/**
 * WCA Core Web Vitals & Performance Audit
 * Run in browser console on live site
 */

const performanceAudit = {
  coreWebVitals: {
    'LCP < 2.5s': () => {
      const lcp = performance.getEntriesByType('largest-contentful-paint');
      if (!lcp || !lcp.length) return true;
      return lcp[0].startTime < 2500;
    },
    'CLS < 0.1': () => {
      const cls = performance.getEntriesByType('layout-shift');
      if (!cls || !cls.length) return true;
      const score = cls.reduce((sum, entry) => sum + entry.value, 0);
      return score < 0.1;
    },
    'FCP < 1.8s': () => {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      if (!fcp) return true;
      return fcp.startTime < 1800;
    },
    'TTFB < 600ms': () => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return true;
      return nav.responseStart - nav.requestStart < 600;
    },
  },

  resources: {
    'Total page weight < 2MB': () => {
      const resources = performance.getEntriesByType('resource');
      const total = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      return total < 2 * 1024 * 1024;
    },
    'Number of requests < 50': () => {
      const resources = performance.getEntriesByType('resource');
      return resources.length < 50;
    },
  },

  optimization: {
    'External scripts use defer or async': () => {
      const scripts = document.querySelectorAll('script[src]');
      let allDeferred = true;
      scripts.forEach(script => {
        if (!script.defer && !script.async && script.getAttribute('type') !== 'module') {
          allDeferred = false;
        }
      });
      return allDeferred || scripts.length === 0;
    },
    'CSS loaded in head, not body': () => {
      const bodyCSS = document.querySelectorAll('body link[rel="stylesheet"]');
      return bodyCSS.length === 0;
    },
  },
};

function runPerformanceAudit() {
  console.log('⚡ PERFORMANCE AUDIT (Core Web Vitals)');
  console.log('=======================================');

  let totalPassed = 0, totalFailed = 0;

  Object.entries(performanceAudit).forEach(([category, checks]) => {
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

  console.log(`\n📊 PERFORMANCE TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  return { passed: totalPassed, failed: totalFailed };
}
