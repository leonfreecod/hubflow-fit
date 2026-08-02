import { CalendarClock, CheckCircle2, CreditCard, Dumbbell, Flame, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import type {
  Payment,
  ScheduleEvent,
  Student,
  StudentProgressPoint,
  WorkoutPlan,
} from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';
import { formatCurrency, formatDate, getFirstName } from '../../utils/format';

export function StudentHomePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [progressPoints, setProgressPoints] = useState<StudentProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.linkedStudentId) {
      setLoading(false);
      setError('Sua conta não possui um aluno vinculado.');
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    void Promise.all([
      repositories.students.findById(user.linkedStudentId),
      repositories.payments.findAll(),
      repositories.schedule.findAll(),
      repositories.workouts.findAll(),
      repositories.dashboard.getStudentProgress(),
    ])
      .then(([studentData, paymentData, eventData, planData, progressData]) => {
        if (!active) return;
        setStudent(studentData);
        setPayments(paymentData.filter((item) => item.studentId === user.linkedStudentId));
        setEvents(eventData.filter((item) => item.studentId === user.linkedStudentId));
        setPlans(
          planData.filter((item) => item.assignedStudentIds.includes(user.linkedStudentId!)),
        );
        setProgressPoints(progressData);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : 'Não foi possível carregar seu painel.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const nowKey = new Date().toISOString().slice(0, 16);
  const nextEvent = useMemo(
    () =>
      events
        .filter((item) => item.status === 'SCHEDULED' && `${item.date}T${item.time}` >= nowKey)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0],
    [events, nowKey],
  );
  const pendingPayment = [...payments]
    .filter((item) => item.status !== 'PAID')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const latestProgress = progressPoints.at(-1);

  if (loading) return <div className="route-loader">Carregando seu painel...</div>;
  if (error) return <EmptyState title="Não foi possível carregar seu painel" description={error} />;

  return (
    <div className="page-stack">
      <header className="student-hero">
        <div>
          <span className="eyebrow">MINHA JORNADA</span>
          <h1>Vamos em frente, {getFirstName(user?.name ?? 'Atleta')}.</h1>
          <p>Consistência hoje. Resultado amanhã.</p>
        </div>
        <div className="student-hero__goal">
          <span>
            <Target size={20} />
          </span>
          <div>
            <small>OBJETIVO ATUAL</small>
            <strong>{student?.goal ?? 'Carregando...'}</strong>
          </div>
          <b>{student?.progress ?? 0}%</b>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          label="Consistência"
          value={`${latestProgress?.consistency ?? 0}%`}
          helper="último período registrado"
          icon={Flame}
        />
        <StatCard
          label="Evolução"
          value={`${student?.progress ?? 0}%`}
          helper="do objetivo atual"
          icon={CheckCircle2}
        />
        <StatCard
          label="Programas ativos"
          value={String(plans.length)}
          helper="disponíveis agora"
          icon={Dumbbell}
        />
        <StatCard
          label="Mensalidade"
          value={pendingPayment ? formatCurrency(pendingPayment.amount) : 'Em dia'}
          helper={
            pendingPayment ? `vence ${formatDate(pendingPayment.dueDate)}` : 'nenhuma pendência'
          }
          icon={CreditCard}
        />
      </section>

      <section className="dashboard-grid dashboard-grid--wide">
        <Card className="chart-card">
          <div className="section-heading">
            <div>
              <span>EVOLUÇÃO</span>
              <h2>Performance e consistência</h2>
            </div>
            <span className="soft-pill">Últimos 6 meses</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressPoints} margin={{ left: -20, right: 8 }}>
                <defs>
                  <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD54A" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FFD54A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="month" stroke="#777" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#777" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#171717',
                    border: '1px solid #303030',
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="performance"
                  name="Performance"
                  stroke="#FFD54A"
                  strokeWidth={3}
                  fill="url(#performanceFill)"
                />
                <Area
                  type="monotone"
                  dataKey="consistency"
                  name="Consistência"
                  stroke="#848484"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="next-session-card">
          <span className="next-session-card__icon">
            <CalendarClock size={24} />
          </span>
          <span className="eyebrow">PRÓXIMA SESSÃO</span>
          <h2>{nextEvent?.title ?? 'Sem sessão agendada'}</h2>
          {nextEvent && (
            <>
              <strong>
                {formatDate(nextEvent.date)} · {nextEvent.time}
              </strong>
              <p>
                {nextEvent.location} · {nextEvent.durationMinutes} minutos
              </p>
              <Badge status={nextEvent.type} />
            </>
          )}
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card>
          <div className="section-heading">
            <div>
              <span>MEUS PROGRAMAS</span>
              <h2>Planos ativos</h2>
            </div>
          </div>
          <div className="student-plan-list">
            {plans.map((plan) => (
              <div key={plan.id}>
                <span>
                  <Dumbbell size={20} />
                </span>
                <div>
                  <strong>{plan.name}</strong>
                  <p>{plan.description}</p>
                  <small>
                    {plan.weeks} semanas · {plan.sessionsPerWeek} sessões/semana
                  </small>
                </div>
                <Badge status={plan.level} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <span>FINANCEIRO</span>
              <h2>Últimos pagamentos</h2>
            </div>
          </div>
          <div className="payment-cards">
            {payments.slice(0, 3).map((payment) => (
              <div key={payment.id}>
                <div>
                  <strong>{payment.description}</strong>
                  <span>{formatDate(payment.dueDate)}</span>
                </div>
                <div>
                  <strong>{formatCurrency(payment.amount)}</strong>
                  <Badge status={payment.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
