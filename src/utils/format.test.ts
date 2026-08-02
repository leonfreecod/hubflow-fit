import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, getFirstName, statusLabel } from './format';

describe('format utilities', () => {
  it('formats Brazilian currency and calendar-only dates', () => {
    expect(formatCurrency(189.9)).toMatch(/R\$\s?189,90/);
    expect(formatDate('2026-08-01')).toContain('01');
    expect(formatDate('')).toBe('—');
  });

  it('normalizes names and known status labels', () => {
    expect(getFirstName('  Mariana Costa ')).toBe('Mariana');
    expect(statusLabel('OVERDUE')).toBe('Em atraso');
    expect(statusLabel('CUSTOM')).toBe('CUSTOM');
  });
});
