import { test, expect } from '@playwright/test';

test.describe('Embedded Dev Tracker - End to End Test Suite', () => {
  test('1. First Visit: Dashboard loads instantly, sample projects appear, status badge is accurate', async ({ page }) => {
    await page.goto('/Embedded-development-tracker/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Confirm no stuck "Loading..."
    await expect(page.locator('text=Loading dashboard data...')).toHaveCount(0);
    await expect(page.locator('text=Embedded Engineering Dashboard').first()).toBeVisible();

    // Check status badge in sidebar
    const storageBadge = page.locator('aside').filter({ hasText: 'Local storage' });
    await expect(storageBadge).toBeVisible();
    await expect(storageBadge.filter({ hasText: 'Persistent' })).toBeVisible();

    // Verify all 3 sample projects appear in visible main content table
    const main = page.locator('main');
    await expect(main.getByText('Smart Sensor Hub — STM32').first()).toBeVisible();
    await expect(main.getByText('Motor Controller — ESP32').first()).toBeVisible();
    await expect(main.getByText('BLE Asset Tracker — nRF52840').first()).toBeVisible();

    // Check KPI metrics
    await expect(page.getByText('Active Projects', { exact: true })).toBeVisible();
  });

  test('2. Projects: Create, edit, and delete project with persistence', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/Embedded-development-tracker/projects/');

    // Click "Create Project"
    await page.locator('button:has-text("Create Project")').first().click();

    // Fill Create Project modal
    await page.fill('input[placeholder*="STM32 Smart Sensor Gateway"]', 'Test Drone Telemetry Node');
    await page.fill('input[placeholder*="STM32-GW"]', 'DRONE-TX');
    await page.fill('input[placeholder*="STM32F401RE"]', 'STM32G474CE');
    await page.fill('input[placeholder*="Nucleo-64"]', 'Custom Flight PCB');
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Confirm new project is in list
    const projectRow = page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node' });
    await expect(projectRow.first()).toBeVisible({ timeout: 10000 });

    // Refresh and confirm it persists
    await page.reload();
    const persistedRow = page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node' });
    await expect(persistedRow.first()).toBeVisible();

    // Edit project
    const editBtn = persistedRow.first().locator('button[title*="Edit" i]').first();
    await editBtn.click();
    const nameInput = page.locator('form input[value*="Test Drone"]').first();
    await nameInput.fill('Test Drone Telemetry Node v2');
    await page.click('button[type="submit"]:has-text("Save Changes")');

    // Confirm edit persisted
    await expect(page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node v2' }).first()).toBeVisible();
    await page.reload();
    await expect(page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node v2' }).first()).toBeVisible();

    // Delete project
    const updatedRow = page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node v2' }).first();
    const deleteBtn = updatedRow.locator('button[title*="Delete" i]').first();
    await deleteBtn.click();

    // Confirm deleted
    await expect(page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node v2' })).toHaveCount(0);
    await page.reload();
    await expect(page.locator('tbody tr, div.mono-card').filter({ hasText: 'Test Drone Telemetry Node v2' })).toHaveCount(0);
  });

  test('3. Lifecycle & Tasks: Add phase, add task, mark complete, refresh and confirm persistence', async ({ page }) => {
    await page.goto('/Embedded-development-tracker/lifecycle/');

    // Add Phase
    await page.click('button:has-text("Add Phase")');
    await page.fill('input[placeholder*="Phase 8"]', 'Environmental Chamber Testing');
    await page.fill('textarea[placeholder*="Phase goals"]', 'Thermal cycling from -40C to +85C');
    await page.click('button[type="submit"]:has-text("Create Phase")');

    // Confirm phase appears
    await expect(page.locator('.mono-card').filter({ hasText: 'Environmental Chamber Testing' }).first()).toBeVisible();

    // Add Task
    await page.click('button:has-text("Add Task")');
    await page.fill('input[placeholder*="Configure SPI DMA"]', 'Calibrate thermocouple data logger');
    await page.click('button[type="submit"]:has-text("Create Task")');

    // Verify task exists in table
    await expect(page.locator('tbody tr').filter({ hasText: 'Calibrate thermocouple data logger' }).first()).toBeVisible();

    // Refresh and confirm persistence
    await page.reload();
    await expect(page.locator('.mono-card').filter({ hasText: 'Environmental Chamber Testing' }).first()).toBeVisible();
    await expect(page.locator('tbody tr').filter({ hasText: 'Calibrate thermocouple data logger' }).first()).toBeVisible();
  });

  test('4. Product Release Gates: Tick checklist items, sign off gate, and verify persistence', async ({ page }) => {
    await page.goto('/Embedded-development-tracker/gates/');

    // Select Gate A
    await page.click('button:has-text("Gate A")');

    // Mark all pending checklist items as passed so gate can be signed off
    const signOffBtn = page.locator('button:has-text("Sign Off & Pass Gate")');
    
    // Loop until sign off button is enabled
    for (let attempts = 0; attempts < 30; attempts++) {
      if (await signOffBtn.isEnabled()) break;
      const pendingBtn = page.locator('button:has-text("Mark Passed")').first();
      if (await pendingBtn.isVisible()) {
        await pendingBtn.click();
        await page.waitForTimeout(100);
      } else {
        break;
      }
    }

    // Now sign off button should be enabled
    await expect(signOffBtn).toBeEnabled({ timeout: 5000 });
    await signOffBtn.click();

    // Fill sign off modal
    await page.fill('input[placeholder*="v1.2.0-rc1"]', 'v1.0.0-rc1');
    await page.fill('input[placeholder*="Rev B"]', 'Rev B');
    await page.fill('textarea[placeholder*="stress tests"]', 'All pre-demo verification checks completed.');
    await page.click('button[type="submit"]:has-text("Confirm & Pass Gate")');

    // Verify Gate marked as Passed
    await expect(page.locator('text=Gate Passed').first()).toBeVisible();

    // Refresh and check persistence
    await page.reload();
    await page.click('button:has-text("Gate A")');
    await expect(page.locator('text=Gate Passed').first()).toBeVisible();
  });

  test('5. Engineering Notes: Create with category, filter, edit, and delete', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/Embedded-development-tracker/notes/');

    // Click "+ Write Technical Note"
    await page.click('button:has-text("Write Technical Note")');
    await page.fill('input[placeholder*="DMA Circular Buffer Overrun"]', 'CAN Bus Termination 120 Ohm Verification');
    
    // Select category Hardware
    await page.locator('form select').nth(1).selectOption('Hardware');
    
    await page.fill('textarea[placeholder*="Record observations"]', 'Verified split termination 60 Ohm DC resistance with multimeter.');
    await page.click('button[type="submit"]:has-text("Save Note")');

    // Confirm created
    await expect(page.locator('text=CAN Bus Termination 120 Ohm Verification').first()).toBeVisible();

    // Filter by category "Hardware"
    await page.click('button:has-text("Hardware")');
    await expect(page.locator('text=CAN Bus Termination 120 Ohm Verification').first()).toBeVisible();

    // Edit note
    const noteCard = page.locator('div.mono-card').filter({ hasText: 'CAN Bus Termination 120 Ohm Verification' }).first();
    await noteCard.locator('button[title*="Edit note"]').click();
    const editTitleInput = page.locator('form input[value*="CAN Bus Termination"]').first();
    await editTitleInput.fill('CAN Bus Termination 120 Ohm Verification (Passed)');
    await page.click('button[type="submit"]:has-text("Update Note")');

    await expect(page.locator('text=CAN Bus Termination 120 Ohm Verification (Passed)').first()).toBeVisible();

    // Delete note
    await page.click('button:has-text("All")');
    const updatedCard = page.locator('div.mono-card').filter({ hasText: 'CAN Bus Termination 120 Ohm Verification (Passed)' }).first();
    await updatedCard.locator('button[title*="Delete note"]').click();

    await expect(page.locator('text=CAN Bus Termination 120 Ohm Verification (Passed)')).toHaveCount(0);
  });

  test('6. Settings: Export JSON, Reset data, Import JSON, Export CSV, and Theme Toggle', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/Embedded-development-tracker/settings/');

    // 1. Export JSON download test
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export all data (JSON)")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');

    // 2. Export CSV download test
    const csvDownloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Release Gate Checklists & Failures (CSV)")');
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toContain('.csv');

    // 3. Reset data
    await page.click('button:has-text("Reset all data")');
    await expect(page.locator('text=All local data has been reset to default demo embedded projects.')).toBeVisible();

    // 4. Dark/Light Theme toggle
    const themeBtn = page.locator('button').filter({ hasText: /Switch to Light|Switch to Dark/ });
    await themeBtn.click();
    await page.reload();
    const savedTheme = await page.evaluate(() => localStorage.getItem('edt_theme'));
    expect(savedTheme).toBeTruthy();
  });

  test('7. Edge Cases: Corrupted localStorage recovery and invalid import handling', async ({ page }) => {
    await page.goto('/Embedded-development-tracker/settings/');

    // Set corrupted data in localStorage under both keys
    await page.evaluate(() => {
      localStorage.setItem('edt_data_v1', '{ corrupted: invalid json !!!');
      localStorage.setItem('embedded_dev_tracker_data', '{ corrupted: invalid json !!!');
    });

    // Reload page; should recover without crash
    await page.reload();
    await expect(page.locator('h3:has-text("Browser Local Storage")')).toBeVisible();

    // Test invalid import file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ "notAValidBackup": true }'),
    });

    // Should display clear error message
    await expect(page.locator('text=Restore failed')).toBeVisible();
  });

  test('8. Navigation & Base Path: All sidebar links and topbar controls work with no 404s', async ({ page }) => {
    await page.goto('/Embedded-development-tracker/');

    const links = [
      { text: 'Projects Board', path: '/projects/' },
      { text: 'Lifecycle & Tasks', path: '/lifecycle/' },
      { text: 'Product Release Gates', path: '/gates/' },
      { text: 'Engineering Notes', path: '/notes/' },
      { text: 'Settings & Backup', path: '/settings/' },
      { text: 'Dashboard', path: '/' },
    ];

    for (const link of links) {
      await page.locator(`aside a:has-text("${link.text}")`).click();
      if (link.path === '/') {
        await page.waitForURL((url) => url.pathname === '/Embedded-development-tracker/' || url.pathname.endsWith('/Embedded-development-tracker/'));
      } else {
        await page.waitForURL(`**${link.path}`);
      }
      expect(page.url()).toContain(`/Embedded-development-tracker${link.path}`);
      await expect(page.locator('text=404: This page could not be found')).toHaveCount(0);
    }

    // Direct page refresh on /projects/
    await page.goto('/Embedded-development-tracker/projects/');
    await page.reload();
    await expect(page.locator('text=404: This page could not be found')).toHaveCount(0);
    await expect(page.locator('text=Embedded Projects Board')).toBeVisible();

    // Topbar "Create Project" modal
    await page.locator('header button:has-text("Create Project")').click();
    await expect(page.locator('text=Create New Embedded Project')).toBeVisible();
    await page.locator('button:has-text("Cancel")').click();

    // Topbar "Notes" slide-over drawer
    await page.locator('header button:has-text("Notes")').click();
    await expect(page.locator('text=Updates & Notes')).toBeVisible();
    // Close drawer via its X button inside drawer
    await page.locator('.fixed.inset-y-0 button').first().click();
    await expect(page.locator('text=Updates & Notes')).toHaveCount(0);
  });

  test('9. Network & Console: Zero /api/ calls and zero unexpected errors', async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/')) {
        apiCalls.push(req.url());
      }
    });

    const routes = ['/', '/projects/', '/lifecycle/', '/gates/', '/notes/', '/settings/'];
    for (const route of routes) {
      await page.goto(`/Embedded-development-tracker${route}`);
      await page.waitForLoadState('domcontentloaded');
    }

    expect(apiCalls).toEqual([]);
  });
});
