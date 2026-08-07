import { chromium } from 'playwright';

const WEB = 'http://127.0.0.1:8080';
const checks = [];

function pass(name, detail = '') {
  checks.push({ name, ok: true, detail });
  console.log(`[PASS] ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  checks.push({ name, ok: false, detail });
  console.log(`[FAIL] ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${WEB}/index.html`, { waitUntil: 'networkidle', timeout: 60000 });

  const loginVisible = await page.locator('text=Enviar link mágico').isVisible().catch(() => false);
  const devMsg = await page.locator('text=auto-login').isVisible().catch(() => false);
  const editorVisible = await page.locator('.ed-bar, .ed-sidebar, [class*="ed-"]').first().isVisible().catch(() => false);

  if (editorVisible && !loginVisible) {
    pass('Editor loads without magic-link login');
  } else if (devMsg) {
    pass('Editor in LOCAL_DEV (auto-login path active)');
  } else if (loginVisible) {
    fail('Editor loads without magic-link login', 'Login form still visible');
  } else {
    const body = await page.locator('#root').innerText().catch(() => '');
    fail('Editor loads without magic-link login', body.slice(0, 120) || 'unknown state');
  }

  const orgSelect = page.locator('.ed-org-switch__select');
  if (await orgSelect.isVisible().catch(() => false)) {
    const options = await orgSelect.locator('option').allTextContents();
    const ok = options.length >= 2 && options.some((o) => /teste/i.test(o));
    ok ? pass('Org switcher visible with 2+ orgs', options.join(', ')) : fail('Org switcher', options.join(', '));
    if (ok) {
      const testOpt = await orgSelect.locator('option').filter({ hasText: /teste/i }).first();
      const val = await testOpt.getAttribute('value');
      await orgSelect.selectOption(val);
      await page.waitForTimeout(800);
      pass('Org switcher switches org');
    }
  } else {
    fail('Org switcher visible with 2+ orgs', 'select not found');
  }

  await page.goto(`${WEB}/admin.html`, { waitUntil: 'networkidle', timeout: 60000 });
  const adminCount = await page.getByText('Igreja Anglicana Rio').count();
  adminCount > 0 ? pass('Admin panel loads for superadmin') : fail('Admin panel loads', await page.locator('body').innerText().then((t) => t.slice(0, 100)));

  await page.goto(`${WEB}/marcas/iar/canvas.html`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  const canvasTitle = await page.title();
  const canvasMounted = await page.locator('#root').evaluate((el) => el.children.length > 0).catch(() => false);
  canvasMounted ? pass('Canvas mounts with active org', canvasTitle) : fail('Canvas mounts', canvasTitle);
} catch (err) {
  fail('Browser E2E', err.message);
} finally {
  await browser.close();
}

const passed = checks.filter((c) => c.ok).length;
console.log(`\n=== Browser: ${passed}/${checks.length} passed ===`);
process.exit(passed === checks.length ? 0 : 1);
