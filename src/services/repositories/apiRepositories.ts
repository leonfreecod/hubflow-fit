import type {
  OrganizationSettings,
  Payment,
  ScheduleEvent,
  Student,
  User,
  WorkoutPlan,
} from '../../domain/models';
import { ApiError, apiRequest, apiSession } from '../api/apiClient';
import type {
  CrudRepository,
  OrganizationRepository,
  UserRepository,
} from './repositoryContracts';

interface AuthResponse {
  token: string;
  user: User;
}

class ApiCrudRepository<T extends { id: string }> implements CrudRepository<T> {
  constructor(private readonly endpoint: string) {}

  findAll(): Promise<T[]> {
    return apiRequest<T[]>(this.endpoint);
  }

  findById(id: string): Promise<T | null> {
    return apiRequest<T>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      });
  }

  create(entity: T): Promise<T> {
    return apiRequest<T>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(entity),
    });
  }

  update(entity: T): Promise<T> {
    return apiRequest<T>(`${this.endpoint}/${encodeURIComponent(entity.id)}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
    });
  }

  remove(id: string): Promise<void> {
    return apiRequest<void>(`${this.endpoint}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
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

export const apiRepositories = {
  users: new ApiUserRepository(),
  students: new ApiCrudRepository<Student>('/students'),
  payments: new ApiCrudRepository<Payment>('/payments'),
  schedule: new ApiCrudRepository<ScheduleEvent>('/schedule'),
  workouts: new ApiCrudRepository<WorkoutPlan>('/workouts'),
  organization: new ApiOrganizationRepository(),
};
