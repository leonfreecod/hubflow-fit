export const storageKeys = {
  users: 'hubflow.users',
  students: 'hubflow.students',
  payments: 'hubflow.payments',
  schedule: 'hubflow.schedule',
  workouts: 'hubflow.workouts',
  organization: 'hubflow.organization',
  session: 'hubflow.session',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
