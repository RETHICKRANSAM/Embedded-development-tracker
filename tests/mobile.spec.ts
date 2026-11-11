import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport (390x844) Responsiveness & Smoke Tests', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });

  const pages = [
    { name: 'dashboard', path: '/' },
    { name: 'projects', path: '/projects/' },
    { name: 'lifecycle', path: '/lifecycle/' },
    { name: 'gates', path: '/gates/' },
    { name: 'notes', path: '/notes/' },
    { name: 'settings', path: '/settings/' },
  ];

  for (const p of pages) {
    test(`Mobile screen check & screenshot: ${p.name}`, async ({ page }) => {
      await page.goto(`/Embedded-development-tracker${p.path}`);
      await page.waitForLoadState('domcontentloaded');

      // Check for horizontal overflow
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      // Take screenshot of the mobile page
      await page.screenshot({
        path: `test-results/mobile/${p.name}.png`,
        fullPage: false,
      });

      console.log(`Page: ${p.name}, horizontal overflow: ${isOverflowing}`);
      expect(isOverflowing).toBe(false);
    });
  }
});
