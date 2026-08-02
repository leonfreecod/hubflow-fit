import type {
  MonthlyRevenue,
  OrganizationSettings,
  Payment,
  PixCharge,
  ScheduleEvent,
  Student,
  StudentProgressPoint,
  User,
  WorkoutPlan,
  Invitation,
} from '../../domain/models';

export interface CrudRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface StudentRepository extends CrudRepository<Student> {
  invite(id: string): Promise<Invitation>;
}
export interface PaymentRepository extends CrudRepository<Payment> {
  markPaid(id: string): Promise<Payment>;
  getOrCreatePixCharge(id: string): Promise<PixCharge>;
}
export interface ScheduleRepository extends CrudRepository<ScheduleEvent> {
  complete(id: string): Promise<ScheduleEvent>;
  cancel(id: string): Promise<ScheduleEvent>;
}
export interface WorkoutRepository extends CrudRepository<WorkoutPlan> {
  completeSession(planId: string, sessionId: string): Promise<WorkoutPlan>;
  undoSessionCompletion(planId: string, sessionId: string): Promise<WorkoutPlan>;
}

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
