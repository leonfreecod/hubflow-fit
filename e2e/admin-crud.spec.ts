import { expect, test, type Locator, type Page } from '@playwright/test';

function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@hubflow.fit');
  await page.getByLabel('Senha', { exact: true }).fill('hubflow123');
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole('heading', { name: /Olá,/ })).toBeVisible();
}

async function confirm(dialogName: string, buttonName: string, page: Page) {
  const dialog = page.getByRole('dialog', { name: dialogName });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: buttonName }).click();
  await expect(dialog).toBeHidden();
}

async function createAndUpdateStudent(page: Page, name: string, email: string) {
  await page.goto('/admin/alunos');
  await expect(page.getByRole('heading', { name: 'Alunos', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Novo aluno' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Novo aluno' });
  await createDialog.getByLabel('Nome completo').fill(name);
  await createDialog.getByLabel('E-mail').fill(email);
  await createDialog.getByLabel('Telefone').fill('(11) 99999-0000');
  await createDialog.getByLabel('Plano').selectOption({ label: 'Essencial' });
  await createDialog.getByLabel('Mensalidade').fill('199.90');
  await createDialog.getByLabel('Próxima cobrança').fill(futureDate(30));
  await createDialog.getByLabel('Objetivo principal').fill('Objetivo inicial E2E');
  await createDialog.getByRole('button', { name: 'Cadastrar aluno' }).click();
  await expect(createDialog).toBeHidden();

  let row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toContainText(email);
  await row.getByRole('button', { name: 'Editar' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Editar aluno' });
  await editDialog.getByLabel('Plano').selectOption({ label: 'Performance Pro' });
  await editDialog.getByLabel('Objetivo principal').fill('Objetivo atualizado E2E');
  await editDialog.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(editDialog).toBeHidden();
  row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toContainText('Performance Pro');
  await expect(row).toContainText('Objetivo atualizado E2E');
}

async function exercisePaymentCrud(page: Page, studentName: string, suffix: string) {
  const description = `Cobrança E2E ${suffix}`;
  const updatedDescription = `${description} atualizada`;
  await page.goto('/admin/financeiro');
  await expect(page.getByRole('heading', { name: 'Financeiro', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nova cobrança' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Nova cobrança' });
  await createDialog.getByLabel('Aluno').selectOption({ label: studentName });
  await createDialog.getByLabel('Descrição').fill(description);
  await createDialog.getByLabel('Valor').fill('149.90');
  await createDialog.getByLabel('Vencimento', { exact: true }).fill(futureDate(15));
  await createDialog.getByLabel('Método').selectOption('PIX');
  await createDialog.getByRole('button', { name: 'Criar cobrança' }).click();
  await expect(createDialog).toBeHidden();

  let row = page.getByRole('row').filter({ hasText: description });
  await expect(row).toContainText('Pendente');
  await row.getByRole('button', { name: 'Editar pagamento' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Editar cobrança' });
  await editDialog.getByLabel('Descrição').fill(updatedDescription);
  await editDialog.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(editDialog).toBeHidden();

  row = page.getByRole('row').filter({ hasText: updatedDescription });
  await row.getByRole('button', { name: 'Baixar' }).click();
  await expect(row).toContainText('Pago');
  await row.getByRole('button', { name: 'Excluir pagamento' }).click();
  await confirm('Excluir cobrança?', 'Excluir cobrança', page);
  await expect(page.getByRole('row').filter({ hasText: updatedDescription })).toHaveCount(0);
}

async function exerciseScheduleCrud(page: Page, studentName: string, suffix: string) {
  const title = `Sessão E2E ${suffix}`;
  await page.goto('/admin/agenda');
  await expect(page.getByRole('heading', { name: 'Agenda', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Novo horário' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Novo agendamento' });
  await createDialog.getByLabel('Aluno').selectOption({ label: studentName });
  await createDialog.getByLabel('Título').fill(title);
  await createDialog.getByLabel('Data').fill(futureDate(20));
  await createDialog.getByLabel('Horário').fill('14:35');
  await createDialog.getByLabel('Duração (min)').fill('50');
  await createDialog.getByLabel('Local').fill('Sala E2E');
  await createDialog.getByRole('button', { name: 'Agendar' }).click();
  await expect(createDialog).toBeHidden();

  let event = page.locator('.timeline-item').filter({ hasText: title });
  await expect(event).toContainText('Sala E2E');
  await event.getByRole('button', { name: 'Editar evento' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Editar agendamento' });
  await editDialog.getByLabel('Local').fill('Pista E2E');
  await editDialog.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(editDialog).toBeHidden();
  event = page.locator('.timeline-item').filter({ hasText: title });
  await expect(event).toContainText('Pista E2E');

  await event.getByRole('button', { name: 'Concluir evento' }).click();
  await expect(event).toContainText('Concluído');
  await event.getByRole('button', { name: 'Excluir evento' }).click();
  await confirm('Excluir evento?', 'Excluir evento', page);
  await expect(page.locator('.timeline-item').filter({ hasText: title })).toHaveCount(0);
}

async function fillWorkoutStructure(dialog: Locator) {
  await dialog.getByRole('button', { name: 'Adicionar sessão' }).click();
  await dialog.getByLabel('Nome da sessão').fill('Sessão funcional E2E');
  await dialog.getByLabel('Orientações').fill('Executar em intensidade moderada.');
  await dialog.getByRole('button', { name: 'Adicionar exercício' }).click();
  await dialog.getByLabel('Exercício', { exact: true }).fill('Agachamento');
  await dialog.getByLabel('Prescrição').fill('3 séries de 12 repetições');
  await dialog.getByLabel('Descanso (s)').fill('60');
}

async function exerciseWorkoutCrud(page: Page, studentName: string, suffix: string) {
  const planName = `Plano E2E ${suffix}`;
  await page.goto('/admin/treinos');
  await expect(page.getByRole('heading', { name: 'Treinos', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Novo plano' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Novo plano de treino' });
  await createDialog.getByLabel('Nome do programa').fill(planName);
  await createDialog.getByLabel('Objetivo').fill('Validar CRUD completo');
  await createDialog.getByLabel('Duração (semanas)').fill('4');
  await createDialog.getByLabel('Sessões por semana').fill('2');
  await createDialog.getByLabel('Descrição').fill('Plano criado pelo smoke test.');
  await fillWorkoutStructure(createDialog);
  await createDialog.getByRole('checkbox', { name: new RegExp(studentName) }).check();
  await createDialog.getByRole('button', { name: 'Criar programa' }).click();
  await expect(createDialog).toBeHidden();

  let card = page.locator('.workout-card').filter({ hasText: planName });
  await expect(card).toContainText('Validar CRUD completo');
  await card.getByRole('button', { name: `Editar ${planName}` }).click();
  const editDialog = page.getByRole('dialog', { name: 'Editar plano de treino' });
  await editDialog.getByLabel('Descrição').fill('Plano atualizado pelo smoke test.');
  await editDialog.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(editDialog).toBeHidden();
  card = page.locator('.workout-card').filter({ hasText: planName });
  await expect(card).toContainText('Plano atualizado pelo smoke test.');

  await card.getByRole('button', { name: `Excluir ${planName}` }).click();
  await confirm('Excluir plano?', 'Excluir plano', page);
  await expect(page.locator('.workout-card').filter({ hasText: planName })).toHaveCount(0);
}

test('admin completes CRUD smoke flow against the Spring API', async ({ page }) => {
  const suffix = Date.now().toString().slice(-7);
  const studentName = `Aluno E2E ${suffix}`;
  const studentEmail = `aluno.e2e.${suffix}@hubflow.fit`;

  await loginAsAdmin(page);
  await createAndUpdateStudent(page, studentName, studentEmail);
  await exercisePaymentCrud(page, studentName, suffix);
  await exerciseScheduleCrud(page, studentName, suffix);
  await exerciseWorkoutCrud(page, studentName, suffix);

  await page.goto('/admin/alunos');
  const studentRow = page.getByRole('row').filter({ hasText: studentEmail });
  await studentRow.getByRole('button', { name: 'Excluir' }).click();
  await confirm('Remover aluno?', 'Remover aluno', page);
  await expect(page.getByRole('row').filter({ hasText: studentEmail })).toHaveCount(0);
});
