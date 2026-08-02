import type {
  Payment,
  PixCharge,
  ScheduleEvent,
  Student,
  User,
  WorkoutPlan,
  Invitation,
  OrganizationSettings,
  MonthlyRevenue,
  StudentProgressPoint,
} from '../../domain/models';
import { ApiError, apiRequest, initializeApiSession } from '../api/apiClient';
import type {
  CrudRepository,
  PaymentRepository,
  ScheduleRepository,
  StudentRepository,
  OrganizationRepository,
  DashboardRepository,
  WorkoutRepository,
  UserRepository,
} from './repositoryContracts';

interface AuthResponse {
  token?: string;
  user: User;
}

class ApiCrudRepository<T extends { id: string }> implements CrudRepository<T> {
  constructor(
    private readonly endpoint: string,
    private readonly toRequestBody: (entity: T) => unknown = (entity) => entity,
  ) {}

  protected itemPath(id: string): string {
    return `${this.endpoint}/${encodeURIComponent(id)}`;
  }

  findAll(): Promise<T[]> {
    return apiRequest<T[]>(this.endpoint);
  }

  findById(id: string): Promise<T | null> {
    return apiRequest<T>(this.itemPath(id)).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    });
  }

  create(entity: T): Promise<T> {
    return apiRequest<T>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(this.toRequestBody(entity)),
    });
  }

  update(entity: T): Promise<T> {
    return apiRequest<T>(this.itemPath(entity.id), {
      method: 'PUT',
      body: JSON.stringify(this.toRequestBody(entity)),
    });
  }

  remove(id: string): Promise<void> {
    return apiRequest<void>(this.itemPath(id), {
      method: 'DELETE',
    });
  }
}

function toPaymentRequest(payment: Payment) {
  return {
    studentId: payment.studentId,
    description: payment.description,
    amount: payment.amount,
    dueDate: payment.dueDate,
    paidAt: payment.paidAt,
    status: payment.status,
    method: payment.method,
  };
}

class ApiPaymentRepository extends ApiCrudRepository<Payment> implements PaymentRepository {
  constructor() {
    super('/payments', toPaymentRequest);
  }

  markPaid(id: string): Promise<Payment> {
    return apiRequest<Payment>(`${this.itemPath(id)}/pay`, {
      method: 'PATCH',
    });
  }

  getOrCreatePixCharge(id: string): Promise<PixCharge> {
    return apiRequest<PixCharge>(`${this.itemPath(id)}/pix-charge`, {
      method: 'POST',
    });
  }
}

class ApiStudentRepository extends ApiCrudRepository<Student> implements StudentRepository {
  constructor() {
    super('/students');
  }

  invite(id: string): Promise<Invitation> {
    return apiRequest<Invitation>(`${this.itemPath(id)}/invitation`, {
      method: 'POST',
    });
  }
}

function toScheduleEventRequest(event: ScheduleEvent) {
  return {
    studentId: event.studentId,
    title: event.title,
    date: event.date,
    time: event.time,
    durationMinutes: event.durationMinutes,
    location: event.location,
    status: event.status,
    type: event.type,
    recurrenceWeeks: event.recurrenceWeeks ?? 1,
  };
}

class ApiScheduleRepository extends ApiCrudRepository<ScheduleEvent> implements ScheduleRepository {
  constructor() {
    super('/schedule', toScheduleEventRequest);
  }

  complete(id: string): Promise<ScheduleEvent> {
    return apiRequest<ScheduleEvent>(`${this.itemPath(id)}/complete`, {
      method: 'PATCH',
    });
  }

  cancel(id: string): Promise<ScheduleEvent> {
    return apiRequest<ScheduleEvent>(`${this.itemPath(id)}/cancel`, {
      method: 'PATCH',
    });
  }
}

class ApiOrganizationRepository implements OrganizationRepository {
  get(): Promise<OrganizationSettings> {
    return apiRequest<OrganizationSettings>('/organization');
  }

  save(settings: OrganizationSettings): Promise<OrganizationSettings> {
    return apiRequest<OrganizationSettings>('/organization', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

class ApiDashboardRepository implements DashboardRepository {
  getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    return apiRequest<MonthlyRevenue[]>('/dashboard/monthly-revenue');
  }

  getStudentProgress(): Promise<StudentProgressPoint[]> {
    return apiRequest<StudentProgressPoint[]>('/dashboard/student-progress');
  }
}

function toWorkoutPlanRequest(plan: WorkoutPlan) {
  return {
    name: plan.name,
    objective: plan.objective,
    level: plan.level,
    weeks: plan.weeks,
    sessionsPerWeek: plan.sessionsPerWeek,
    assignedStudentIds: plan.assignedStudentIds,
    updatedAt: plan.updatedAt,
    description: plan.description,
    sessions: (plan.sessions ?? []).map((session) => ({
      id: session.id,
      weekNumber: session.weekNumber,
      dayOrder: session.dayOrder,
      name: session.name,
      instructions: session.instructions,
      exercises: session.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        prescription: exercise.prescription,
        restSeconds: exercise.restSeconds,
      })),
    })),
  };
}

class ApiWorkoutRepository extends ApiCrudRepository<WorkoutPlan> implements WorkoutRepository {
  constructor() {
    super('/workouts', toWorkoutPlanRequest);
  }

  completeSession(planId: string, sessionId: string): Promise<WorkoutPlan> {
    return apiRequest<WorkoutPlan>(
      `${this.itemPath(planId)}/sessions/${encodeURIComponent(sessionId)}/complete`,
      { method: 'PATCH' },
    );
  }

  undoSessionCompletion(planId: string, sessionId: string): Promise<WorkoutPlan> {
    return apiRequest<WorkoutPlan>(
      `${this.itemPath(planId)}/sessions/${encodeURIComponent(sessionId)}/complete`,
      { method: 'DELETE' },
    );
  }
}

class ApiUserRepository implements UserRepository {
  async findByCredentials(email: string, password: string): Promise<User | null> {
    try {
      const result = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await initializeApiSession();
      return result.user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  }

  async findById(_id: string): Promise<User | null> {
    try {
      const user = await apiRequest<User>('/auth/me');
      await initializeApiSession();
      return user;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) return null;
      throw error;
    }
  }
}

export const apiRepositories = {
  users: new ApiUserRepository(),
  students: new ApiStudentRepository(),
  payments: new ApiPaymentRepository(),
  schedule: new ApiScheduleRepository(),
  workouts: new ApiWorkoutRepository(),
  organization: new ApiOrganizationRepository(),
  dashboard: new ApiDashboardRepository(),
};
