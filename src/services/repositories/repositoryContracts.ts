import type {
  OrganizationSettings,
  Payment,
  ScheduleEvent,
  Student,
  User,
  WorkoutPlan,
} from '../../domain/models';

export interface CrudRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  remove(id: string): Promise<void>;
}

export type StudentRepository = CrudRepository<Student>;
export type PaymentRepository = CrudRepository<Payment>;
export type ScheduleRepository = CrudRepository<ScheduleEvent>;
export type WorkoutRepository = CrudRepository<WorkoutPlan>;

export interface UserRepository {
  findByCredentials(email: string, password: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export interface OrganizationRepository {
  get(): Promise<OrganizationSettings>;
  save(settings: OrganizationSettings): Promise<OrganizationSettings>;
}
