export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string): string {
  if (!value) return '—';
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

export function getFirstName(name: string): string {
  return name.trim().split(' ')[0] ?? name;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Ativo', PAUSED: 'Pausado', INACTIVE: 'Inativo',
    PAID: 'Pago', PENDING: 'Pendente', OVERDUE: 'Em atraso',
    SCHEDULED: 'Agendado', COMPLETED: 'Concluído', CANCELED: 'Cancelado',
    BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediário', ADVANCED: 'Avançado',
    ASSESSMENT: 'Avaliação', PERSONAL: 'Personal', GROUP: 'Grupo', ONLINE: 'Online',
  };
  return labels[status] ?? status;
}
