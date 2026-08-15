import { expect, test } from '@playwright/test';

test.describe('public portfolio demo', () => {
  test.skip(
    process.env.PLAYWRIGHT_PORTFOLIO_DEMO !== 'true',
    'Runs only against the explicitly configured public read-only portfolio.',
  );

  test('prefills the public account and keeps the admin experience read-only and responsive', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const runtimeErrors: string[] = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
        runtimeErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/login');

    await expect(page.getByLabel('E-mail')).toHaveValue('demo@hubflow.fit');
    await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('123456');
    await page.screenshot({ path: 'test-results/portfolio-login-mobile.png', fullPage: true });

    await page.getByRole('button', { name: 'Entrar na demonstração' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 30_000 });
    await expect(page.getByRole('status')).toContainText('Modo demonstração');
    await page.screenshot({ path: 'test-results/portfolio-dashboard-mobile.png', fullPage: true });

    for (const route of [
      '/admin/dashboard',
      '/admin/alunos',
      '/admin/agenda',
      '/admin/treinos',
      '/admin/financeiro',
      '/admin/configuracoes',
    ]) {
      await page.goto(route);
      await expect(page.locator('.page-stack')).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${route} criou rolagem horizontal`).toBeLessThanOrEqual(
        dimensions.clientWidth + 1,
      );
    }

    const mutation = await page.evaluate(async () => {
      const csrfResponse = await fetch('/api/auth/csrf', { credentials: 'include' });
      const csrf = (await csrfResponse.json()) as { token: string };
      const response = await fetch('/api/students', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrf.token,
        },
        body: '{}',
      });
      return {
        status: response.status,
        body: (await response.json()) as { message?: string },
      };
    });
    expect(mutation.status).toBe(403);
    expect(mutation.body.message).toContain('somente leitura');
    expect(runtimeErrors).toEqual([]);
  });
});
