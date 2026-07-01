module.exports = {
  ci: {
    collect: {
      url: ['https://bluecollardiner.com'],
      numberOfRuns: 1,
      // Emulate mobile device
      settings: { emulatedFormFactor: 'mobile' },
      // No start server needed for static site
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
