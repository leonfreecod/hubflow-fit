import { expect, test, type Page } from '@playwright/test';

const responsiveWidths = [320, 390, 768, 1024, 1440];

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('hubflow123');
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
  await expect(page).toHaveURL(
    email.startsWith('admin') ? /\/admin\/dashboard$/ : /\/aluno\/inicio$/,
  );
}

async function settleResponsiveLayout(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      }),
  );
}

async function expectNoHorizontalOverflow(page: Page, route: string, width: number) {
  await page.setViewportSize({ width, height: 800 });
  await settleResponsiveLayout(page);

  const layout = await page.evaluate(() => {
    const root = document.documentElement;
    const cardsOutsideViewport = [...document.querySelectorAll<HTMLElement>('.card')]
      .filter((card) => card.getBoundingClientRect().right > root.clientWidth + 1)
      .map((card) => card.className);
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      cardsOutsideViewport,
    };
  });

  expect(layout.scrollWidth, `${route} criou rolagem horizontal em ${width}px`).toBeLessThanOrEqual(
    layout.clientWidth + 1,
  );
  expect(
    layout.cardsOutsideViewport,
    `${route} possui cards fora da viewport em ${width}px`,
  ).toEqual([]);
}

async function auditRoutes(page: Page, routes: string[]) {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('.page-stack')).toBeVisible();
    for (const width of responsiveWidths) {
      await expectNoHorizontalOverflow(page, route, width);
    }
  }
}

test('admin pages remain contained from mobile through desktop widths', async ({ page }) => {
  await login(page, 'admin@hubflow.fit');
  await auditRoutes(page, [
    '/admin/dashboard',
    '/admin/alunos',
    '/admin/agenda',
    '/admin/treinos',
    '/admin/financeiro',
    '/admin/configuracoes',
  ]);

  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/admin/agenda');
  await expect(page.locator('.page-stack')).toBeVisible();
  const actionOverflow = await page
    .locator('.event-actions button')
    .evaluateAll(
      (buttons) =>
        buttons.filter(
          (button) =>
            button.getBoundingClientRect().right > document.documentElement.clientWidth + 1,
        ).length,
    );
  expect(actionOverflow).toBe(0);
});

test('student pages remain contained from mobile through desktop widths', async ({ page }) => {
  await login(page, 'aluno@hubflow.fit');
  await auditRoutes(page, [
    '/aluno/inicio',
    '/aluno/treinos',
    '/aluno/agenda',
    '/aluno/pagamentos',
    '/aluno/perfil',
  ]);
});

test('authentication pages remain contained on narrow screens', async ({ page }) => {
  for (const route of [
    '/login',
    '/activate',
    '/esqueci-senha',
    '/reset-password?token=layout-test',
  ]) {
    await page.goto(route);
    for (const width of [320, 390, 1024]) {
      await expectNoHorizontalOverflow(page, route, width);
    }
  }
});
