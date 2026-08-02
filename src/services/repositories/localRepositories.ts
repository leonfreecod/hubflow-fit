import type {
  OrganizationSettings,
  Payment,
  PixCharge,
  ScheduleEvent,
  Student,
  User,
  WorkoutPlan,
  Invitation,
} from '../../domain/models';
import {
  monthlyRevenueSeed,
  organizationSeed,
  paymentsSeed,
  scheduleSeed,
  studentsSeed,
  studentProgressSeed,
  usersSeed,
  workoutsSeed,
} from '../../data/mocks/seed';
import { readStorage, storageKeys, writeStorage } from '../storage/storage';
import type {
  CrudRepository,
  DashboardRepository,
  OrganizationRepository,
  PaymentRepository,
  ScheduleRepository,
  UserRepository,
  StudentRepository,
  WorkoutRepository,
} from './repositoryContracts';
import { apiRepositories } from './apiRepositories';

class LocalCrudRepository<T extends { id: string }> implements CrudRepository<T> {
  constructor(
    private readonly key: string,
    private readonly seed: T[],
  ) {
    if (!localStorage.getItem(key)) writeStorage(key, seed);
  }

  async findAll(): Promise<T[]> {
    return readStorage(this.key, this.seed);
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.findAll();
    return items.find((item) => item.id === id) ?? null;
  }

  async create(entity: T): Promise<T> {
    const items = await this.findAll();
    writeStorage(this.key, [...items, entity]);
    return entity;
  }

  async update(entity: T): Promise<T> {
    const items = await this.findAll();
    const next = items.map((item) => (item.id === entity.id ? entity : item));
    writeStorage(this.key, next);
    return entity;
  }

  async remove(id: string): Promise<void> {
    const items = await this.findAll();
    writeStorage(
      this.key,
      items.filter((item) => item.id !== id),
    );
  }
}

class LocalUserRepository implements UserRepository {
  constructor() {
    if (!localStorage.getItem(storageKeys.users)) writeStorage(storageKeys.users, usersSeed);
  }

  async findByCredentials(email: string, password: string): Promise<User | null> {
    const users = readStorage<User[]>(storageKeys.users, usersSeed);
    return users.find((user) => user.email === email && user.password === password) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const users = readStorage<User[]>(storageKeys.users, usersSeed);
    return users.find((user) => user.id === id) ?? null;
  }
}

class LocalStudentRepository extends LocalCrudRepository<Student> implements StudentRepository {
  async invite(id: string): Promise<Invitation> {
    const student = await this.findById(id);
    if (!student) throw new Error('Aluno não encontrado.');
    return {
      activationUrl: `${window.location.origin}/login`,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    };
  }
}

class LocalPaymentRepository extends LocalCrudRepository<Payment> implements PaymentRepository {
  async markPaid(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    if (!payment) throw new Error('Pagamento não encontrado.');
    return this.update({
      ...payment,
      status: 'PAID',
      paidAt: payment.paidAt ?? new Date().toISOString().slice(0, 10),
    });
  }

  async getOrCreatePixCharge(id: string): Promise<PixCharge> {
    const payment = await this.findById(id);
    if (!payment) throw new Error('Pagamento não encontrado.');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const payload = `HUBFLOW-PIX-SIMULADO|${payment.id}|${payment.amount}|${expiresAt}`;
    return {
      id: `local-${payment.id}`,
      paymentId: payment.id,
      provider: 'LOCAL',
      copyPaste: payload,
      qrCodePayload: payload,
      status: 'ACTIVE',
      amount: payment.amount,
      expiresAt,
      simulated: true,
    };
  }
}

class LocalScheduleRepository
  extends LocalCrudRepository<ScheduleEvent>
  implements ScheduleRepository
{
  async create(event: ScheduleEvent): Promise<ScheduleEvent> {
    const occurrences = event.recurrenceWeeks ?? 1;
    const recurrenceGroupId = occurrences > 1 ? crypto.randomUUID() : undefined;
    let first: ScheduleEvent | null = null;
    for (let week = 0; week < occurrences; week += 1) {
      const date = new Date(`${event.date}T12:00:00`);
      date.setDate(date.getDate() + week * 7);
      const occurrence: ScheduleEvent = {
        ...event,
        id: week === 0 ? event.id : `${event.id}-${week + 1}`,
        date: date.toISOString().slice(0, 10),
        recurrenceGroupId,
        recurrenceWeeks: undefined,
      };
      await super.create(occurrence);
      first ??= occurrence;
    }
    return first!;
  }

  async complete(id: string): Promise<ScheduleEvent> {
    const event = await this.findById(id);
    if (!event) throw new Error('Evento não encontrado.');
    return this.update({
      ...event,
      status: 'COMPLETED',
    });
  }

  async cancel(id: string): Promise<ScheduleEvent> {
    const event = await this.findById(id);
    if (!event) throw new Error('Evento não encontrado.');
    return this.update({ ...event, status: 'CANCELED' });
  }
}

class LocalWorkoutRepository extends LocalCrudRepository<WorkoutPlan> implements WorkoutRepository {
  async completeSession(planId: string, sessionId: string): Promise<WorkoutPlan> {
    return this.setCompletion(planId, sessionId, true);
  }

  async undoSessionCompletion(planId: string, sessionId: string): Promise<WorkoutPlan> {
    return this.setCompletion(planId, sessionId, false);
  }

  private async setCompletion(planId: string, sessionId: string, completed: boolean) {
    const plan = await this.findById(planId);
    if (!plan) throw new Error('Plano de treino não encontrado.');
    const sessions = (plan.sessions ?? []).map((session) =>
      session.id === sessionId ? { ...session, completed } : session,
    );
    return this.update({ ...plan, sessions });
  }
}

class LocalOrganizationRepository implements OrganizationRepository {
  constructor() {
    if (!localStorage.getItem(storageKeys.organization)) {
      writeStorage(storageKeys.organization, organizationSeed);
    }
  }

  async get(): Promise<OrganizationSettings> {
    return readStorage(storageKeys.organization, organizationSeed);
  }

  async save(settings: OrganizationSettings): Promise<OrganizationSettings> {
    writeStorage(storageKeys.organization, settings);
    return settings;
  }
}

class LocalDashboardRepository implements DashboardRepository {
  async getMonthlyRevenue() {
    return monthlyRevenueSeed;
  }

  async getStudentProgress() {
    return studentProgressSeed;
  }
}

export const localRepositories = {
  users: new LocalUserRepository(),
  students: new LocalStudentRepository(storageKeys.students, studentsSeed),
  payments: new LocalPaymentRepository(storageKeys.payments, paymentsSeed),
  schedule: new LocalScheduleRepository(storageKeys.schedule, scheduleSeed),
  workouts: new LocalWorkoutRepository(storageKeys.workouts, workoutsSeed),
  organization: new LocalOrganizationRepository(),
  dashboard: new LocalDashboardRepository(),
};

export const usesApiDataSource = import.meta.env.VITE_DATA_SOURCE === 'api';

export const repositories = usesApiDataSource ? apiRepositories : localRepositories;

export function resetDemoData(): void {
  writeStorage(storageKeys.users, usersSeed);
  writeStorage(storageKeys.students, studentsSeed);
  writeStorage(storageKeys.payments, paymentsSeed);
  writeStorage(storageKeys.schedule, scheduleSeed);
  writeStorage(storageKeys.workouts, workoutsSeed);
  writeStorage(storageKeys.organization, organizationSeed);
}
