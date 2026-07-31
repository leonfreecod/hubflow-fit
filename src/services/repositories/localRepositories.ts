import type {
  OrganizationSettings,
  Payment,
  ScheduleEvent,
  Student,
  User,
  WorkoutPlan,
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
} from './repositoryContracts';
import { apiRepositories } from './apiRepositories';

class LocalCrudRepository<T extends { id: string }> implements CrudRepository<T> {
  constructor(private readonly key: string, private readonly seed: T[]) {
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
    writeStorage(this.key, items.filter((item) => item.id !== id));
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

class LocalPaymentRepository
  extends LocalCrudRepository<Payment>
  implements PaymentRepository {
  async markPaid(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    if (!payment) throw new Error('Pagamento não encontrado.');
    return this.update({
      ...payment,
      status: 'PAID',
      paidAt: payment.paidAt ?? new Date().toISOString().slice(0, 10),
    });
  }
}

class LocalScheduleRepository
  extends LocalCrudRepository<ScheduleEvent>
  implements ScheduleRepository {
  async complete(id: string): Promise<ScheduleEvent> {
    const event = await this.findById(id);
    if (!event) throw new Error('Evento não encontrado.');
    return this.update({
      ...event,
      status: 'COMPLETED',
    });
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
  students: new LocalCrudRepository<Student>(storageKeys.students, studentsSeed),
  payments: new LocalPaymentRepository(storageKeys.payments, paymentsSeed),
  schedule: new LocalScheduleRepository(storageKeys.schedule, scheduleSeed),
  workouts: new LocalCrudRepository<WorkoutPlan>(storageKeys.workouts, workoutsSeed),
  organization: new LocalOrganizationRepository(),
  dashboard: new LocalDashboardRepository(),
};

export const usesApiDataSource = import.meta.env.VITE_DATA_SOURCE === 'api';

export const repositories = usesApiDataSource
  ? {
      ...localRepositories,
      users: apiRepositories.users,
      students: apiRepositories.students,
      payments: apiRepositories.payments,
      schedule: apiRepositories.schedule,
      workouts: apiRepositories.workouts,
    }
  : localRepositories;

export function resetDemoData(): void {
  writeStorage(storageKeys.users, usersSeed);
  writeStorage(storageKeys.students, studentsSeed);
  writeStorage(storageKeys.payments, paymentsSeed);
  writeStorage(storageKeys.schedule, scheduleSeed);
  writeStorage(storageKeys.workouts, workoutsSeed);
  writeStorage(storageKeys.organization, organizationSeed);
}
