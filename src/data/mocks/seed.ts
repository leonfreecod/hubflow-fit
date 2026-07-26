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

export const usersSeed: User[] = [
  {
    id: 'user-admin-001',
    name: 'Rafael Martins',
    email: 'admin@hubflow.fit',
    password: 'hubflow123',
    role: 'ADMIN',
  },
  {
    id: 'user-student-001',
    name: 'Mariana Costa',
    email: 'aluno@hubflow.fit',
    password: 'hubflow123',
    role: 'STUDENT',
    linkedStudentId: 'student-001',
  },
];

export const studentsSeed: Student[] = [
  {
    id: 'student-001',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    phone: '(11) 98810-2201',
    status: 'ACTIVE',
    plan: 'Performance Pro',
    monthlyFee: 289.9,
    joinedAt: '2026-02-10',
    nextBillingDate: '2026-08-05',
    goal: 'Correr 10 km abaixo de 50 minutos',
    coach: 'Rafael Martins',
    initials: 'MC',
    progress: 82,
  },
  {
    id: 'student-002',
    name: 'Lucas Almeida',
    email: 'lucas.almeida@email.com',
    phone: '(11) 97731-4402',
    status: 'ACTIVE',
    plan: 'Essencial',
    monthlyFee: 189.9,
    joinedAt: '2026-03-18',
    nextBillingDate: '2026-08-10',
    goal: 'Ganho de força e condicionamento',
    coach: 'Rafael Martins',
    initials: 'LA',
    progress: 68,
  },
  {
    id: 'student-003',
    name: 'Bianca Rodrigues',
    email: 'bianca.rodrigues@email.com',
    phone: '(11) 99700-8710',
    status: 'ACTIVE',
    plan: 'Assessoria Running',
    monthlyFee: 229.9,
    joinedAt: '2025-11-02',
    nextBillingDate: '2026-08-02',
    goal: 'Completar a primeira meia maratona',
    coach: 'Camila Nunes',
    initials: 'BR',
    progress: 75,
  },
  {
    id: 'student-004',
    name: 'Gabriel Santos',
    email: 'gabriel.santos@email.com',
    phone: '(11) 98192-7311',
    status: 'PAUSED',
    plan: 'Essencial',
    monthlyFee: 189.9,
    joinedAt: '2026-01-20',
    nextBillingDate: '2026-08-15',
    goal: 'Redução de gordura corporal',
    coach: 'Rafael Martins',
    initials: 'GS',
    progress: 44,
  },
  {
    id: 'student-005',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    phone: '(11) 96680-2214',
    status: 'ACTIVE',
    plan: 'Performance Pro',
    monthlyFee: 289.9,
    joinedAt: '2025-09-11',
    nextBillingDate: '2026-07-22',
    goal: 'Melhorar mobilidade e resistência',
    coach: 'Camila Nunes',
    initials: 'FL',
    progress: 89,
  },
  {
    id: 'student-006',
    name: 'Diego Oliveira',
    email: 'diego.oliveira@email.com',
    phone: '(11) 97520-1180',
    status: 'INACTIVE',
    plan: 'Assessoria Running',
    monthlyFee: 229.9,
    joinedAt: '2025-08-04',
    nextBillingDate: '2026-07-05',
    goal: 'Retorno gradual às corridas',
    coach: 'Rafael Martins',
    initials: 'DO',
    progress: 31,
  },
];

export const paymentsSeed: Payment[] = [
  {
    id: 'payment-001', studentId: 'student-001', studentName: 'Mariana Costa',
    description: 'Mensalidade — agosto', amount: 289.9, dueDate: '2026-08-05', status: 'PENDING', method: 'PIX',
  },
  {
    id: 'payment-002', studentId: 'student-002', studentName: 'Lucas Almeida',
    description: 'Mensalidade — julho', amount: 189.9, dueDate: '2026-07-10', paidAt: '2026-07-08', status: 'PAID', method: 'PIX',
  },
  {
    id: 'payment-003', studentId: 'student-003', studentName: 'Bianca Rodrigues',
    description: 'Mensalidade — julho', amount: 229.9, dueDate: '2026-07-02', paidAt: '2026-07-02', status: 'PAID', method: 'CARD',
  },
  {
    id: 'payment-004', studentId: 'student-004', studentName: 'Gabriel Santos',
    description: 'Mensalidade — julho', amount: 189.9, dueDate: '2026-07-15', status: 'OVERDUE', method: 'PIX',
  },
  {
    id: 'payment-005', studentId: 'student-005', studentName: 'Fernanda Lima',
    description: 'Mensalidade — julho', amount: 289.9, dueDate: '2026-07-22', status: 'OVERDUE', method: 'TRANSFER',
  },
  {
    id: 'payment-006', studentId: 'student-001', studentName: 'Mariana Costa',
    description: 'Avaliação física', amount: 120, dueDate: '2026-07-05', paidAt: '2026-07-05', status: 'PAID', method: 'PIX',
  },
];

export const scheduleSeed: ScheduleEvent[] = [
  {
    id: 'event-001', studentId: 'student-001', studentName: 'Mariana Costa', title: 'Treino de ritmo',
    date: '2026-07-27', time: '07:00', durationMinutes: 60, location: 'Parque Central', status: 'SCHEDULED', type: 'PERSONAL',
  },
  {
    id: 'event-002', studentId: 'student-002', studentName: 'Lucas Almeida', title: 'Treino de força',
    date: '2026-07-27', time: '10:30', durationMinutes: 50, location: 'Studio Hub', status: 'SCHEDULED', type: 'PERSONAL',
  },
  {
    id: 'event-003', studentId: 'student-003', studentName: 'Bianca Rodrigues', title: 'Longão em grupo',
    date: '2026-07-28', time: '06:00', durationMinutes: 100, location: 'Parque do Ibirapuera', status: 'SCHEDULED', type: 'GROUP',
  },
  {
    id: 'event-004', studentId: 'student-005', studentName: 'Fernanda Lima', title: 'Avaliação trimestral',
    date: '2026-07-29', time: '18:30', durationMinutes: 45, location: 'Studio Hub', status: 'SCHEDULED', type: 'ASSESSMENT',
  },
  {
    id: 'event-005', studentId: 'student-001', studentName: 'Mariana Costa', title: 'Revisão de planilha',
    date: '2026-07-24', time: '19:00', durationMinutes: 30, location: 'Google Meet', status: 'COMPLETED', type: 'ONLINE',
  },
];

export const workoutsSeed: WorkoutPlan[] = [
  {
    id: 'workout-001', name: '10K Performance', objective: 'Velocidade e resistência', level: 'INTERMEDIATE',
    weeks: 8, sessionsPerWeek: 4, assignedStudentIds: ['student-001', 'student-003'], updatedAt: '2026-07-22',
    description: 'Ciclo progressivo com intervalados, tempo run, rodagem leve e longão.',
  },
  {
    id: 'workout-002', name: 'Força Essencial', objective: 'Força geral e estabilidade', level: 'BEGINNER',
    weeks: 6, sessionsPerWeek: 3, assignedStudentIds: ['student-002', 'student-004'], updatedAt: '2026-07-20',
    description: 'Base de movimentos fundamentais, mobilidade e progressão semanal.',
  },
  {
    id: 'workout-003', name: 'Meia Maratona Base', objective: 'Construção de volume', level: 'INTERMEDIATE',
    weeks: 12, sessionsPerWeek: 5, assignedStudentIds: ['student-003'], updatedAt: '2026-07-18',
    description: 'Bloco de base aeróbia para preparação segura da primeira meia maratona.',
  },
  {
    id: 'workout-004', name: 'Mobilidade & Condicionamento', objective: 'Mobilidade e resistência', level: 'BEGINNER',
    weeks: 4, sessionsPerWeek: 3, assignedStudentIds: ['student-005'], updatedAt: '2026-07-24',
    description: 'Sessões curtas combinando mobilidade ativa, core e condicionamento leve.',
  },
];

export const organizationSeed: OrganizationSettings = {
  name: 'Hub Running Assessoria',
  document: '12.345.678/0001-90',
  phone: '(11) 4002-8922',
  email: 'contato@hubrunning.com.br',
  pixKey: 'financeiro@hubrunning.com.br',
  city: 'São Paulo — SP',
};

export const monthlyRevenueSeed: MonthlyRevenue[] = [
  { month: 'Fev', revenue: 7860, expenses: 2840 },
  { month: 'Mar', revenue: 8420, expenses: 3020 },
  { month: 'Abr', revenue: 8990, expenses: 3210 },
  { month: 'Mai', revenue: 9450, expenses: 3180 },
  { month: 'Jun', revenue: 10180, expenses: 3460 },
  { month: 'Jul', revenue: 11240, expenses: 3650 },
];

export const studentProgressSeed: StudentProgressPoint[] = [
  { month: 'Fev', performance: 52, consistency: 61 },
  { month: 'Mar', performance: 60, consistency: 68 },
  { month: 'Abr', performance: 64, consistency: 72 },
  { month: 'Mai', performance: 71, consistency: 76 },
  { month: 'Jun', performance: 77, consistency: 81 },
  { month: 'Jul', performance: 82, consistency: 88 },
];
