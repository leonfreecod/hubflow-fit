import type {
  MonthlyRevenue,
  OrganizationSettings,
  Payment,
  ScheduleEvent,
  Student,
  StudentProgressPoint,
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
export interface PaymentRepository extends CrudRepository<Payment> {
  markPaid(id: string): Promise<Payment>;
}
export interface ScheduleRepository extends CrudRepository<ScheduleEvent> {
  complete(id: string): Promise<ScheduleEvent>;
}
export type WorkoutRepository = CrudRepository<WorkoutPlan>;

export interface UserRepository {
  findByCredentials(email: string, password: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export interface OrganizationRepository {
  get(): Promise<OrganizationSettings>;
  save(settings: OrganizationSettings): Promise<OrganizationSettings>;
}

export interface DashboardRepository {
  getMonthlyRevenue(): Promise<MonthlyRevenue[]>;
  getStudentProgress(): Promise<StudentProgressPoint[]>;
}
