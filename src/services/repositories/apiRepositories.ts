import type {
  Payment,
  ScheduleEvent,
  Student,
  User,
  WorkoutPlan,
} from '../../domain/models';
import { ApiError, apiRequest, apiSession } from '../api/apiClient';
import type {
  CrudRepository,
  PaymentRepository,
  ScheduleRepository,
  UserRepository,
} from './repositoryContracts';

interface AuthResponse {
  token: string;
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
    return apiRequest<T>(this.itemPath(id))
      .catch((error: unknown) => {
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

class ApiPaymentRepository
  extends ApiCrudRepository<Payment>
  implements PaymentRepository {
  constructor() {
    super('/payments', toPaymentRequest);
  }

  markPaid(id: string): Promise<Payment> {
    return apiRequest<Payment>(`${this.itemPath(id)}/pay`, {
      method: 'PATCH',
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
  };
}

class ApiScheduleRepository
  extends ApiCrudRepository<ScheduleEvent>
  implements ScheduleRepository {
  constructor() {
    super('/schedule', toScheduleEventRequest);
  }

  complete(id: string): Promise<ScheduleEvent> {
    return apiRequest<ScheduleEvent>(`${this.itemPath(id)}/complete`, {
      method: 'PATCH',
    });
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
  };
}

class ApiUserRepository implements UserRepository {
  async findByCredentials(email: string, password: string): Promise<User | null> {
    try {
      const result = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      apiSession.setToken(result.token);
      return result.user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  }

  async findById(_id: string): Promise<User | null> {
    if (!apiSession.getToken()) return null;
    try {
      return await apiRequest<User>('/auth/me');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) return null;
      throw error;
    }
  }
}

export const apiRepositories = {
  users: new ApiUserRepository(),
  students: new ApiCrudRepository<Student>('/students'),
  payments: new ApiPaymentRepository(),
  schedule: new ApiScheduleRepository(),
  workouts: new ApiCrudRepository<WorkoutPlan>('/workouts', toWorkoutPlanRequest),
};
