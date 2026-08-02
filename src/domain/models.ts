export type UserRole = 'ADMIN' | 'STUDENT';
export type StudentStatus = 'ACTIVE' | 'PAUSED' | 'INACTIVE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type ScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
export type WorkoutLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AccountStatus = 'INVITED' | 'ACTIVE' | 'DISABLED';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Present only in the local demo repository; the API never returns passwords. */
  password?: string;
  role: UserRole;
  avatar?: string;
  linkedStudentId?: string;
  accountStatus?: AccountStatus;
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

export interface PixCharge {
  id: string;
  paymentId: string;
  provider: string;
  copyPaste: string;
  qrCodePayload: string;
  status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'CANCELED';
  amount: number;
  expiresAt: string;
  simulated: boolean;
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
  recurrenceGroupId?: string;
  recurrenceWeeks?: number;
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
  sessions?: WorkoutSession[];
}

export interface WorkoutSession {
  id: string;
  weekNumber: number;
  dayOrder: number;
  name: string;
  instructions: string;
  exercises: WorkoutExercise[];
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  prescription: string;
  restSeconds: number;
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

export interface Invitation {
  activationUrl: string;
  expiresAt: string;
}
