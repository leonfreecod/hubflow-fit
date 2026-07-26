export type UserRole = 'ADMIN' | 'STUDENT';
export type StudentStatus = 'ACTIVE' | 'PAUSED' | 'INACTIVE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type ScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
export type WorkoutLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  linkedStudentId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
  plan: string;
  monthlyFee: number;
  joinedAt: string;
  nextBillingDate: string;
  goal: string;
  coach: string;
  initials: string;
  progress: number;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: PaymentStatus;
  method: 'PIX' | 'CARD' | 'CASH' | 'TRANSFER';
}

export interface ScheduleEvent {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  location: string;
  status: ScheduleStatus;
  type: 'ASSESSMENT' | 'PERSONAL' | 'GROUP' | 'ONLINE';
}

export interface WorkoutPlan {
  id: string;
  name: string;
  objective: string;
  level: WorkoutLevel;
  weeks: number;
  sessionsPerWeek: number;
  assignedStudentIds: string[];
  updatedAt: string;
  description: string;
}

export interface OrganizationSettings {
  name: string;
  document: string;
  phone: string;
  email: string;
  pixKey: string;
  city: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
}

export interface StudentProgressPoint {
  month: string;
  performance: number;
  consistency: number;
}
