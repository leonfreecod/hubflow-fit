import { CalendarClock, CircleDollarSign, Dumbbell, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import type { MonthlyRevenue, Payment, ScheduleEvent, Student } from '../../domain/models';
import { repositories } from '../../services/repositories/localRepositories';
import { formatCurrency, formatDate, getFirstName } from '../../utils/format';
import { useAuth } from '../../features/auth/AuthContext';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);

  useEffect(() => {
    void Promise.all([
      repositories.students.findAll(), repositories.payments.findAll(),
      repositories.schedule.findAll(), repositories.dashboard.getMonthlyRevenue(),
    ]).then(([studentData, paymentData, eventData, revenueData]) => {
      setStudents(studentData); setPayments(paymentData); setEvents(eventData); setMonthlyRevenue(revenueData);
    });
  }, []);

  const activeStudents = students.filter((student) => student.status === 'ACTIVE').length;
  const received = payments.filter((payment) => payment.status === 'PAID').reduce((sum, payment) => sum + payment.amount, 0);
  const pending = payments.filter((payment) => payment.status !== 'PAID');
  const upcoming = events.filter((event) => event.status === 'SCHEDULED').slice(0, 4);
  const expectedRevenue = useMemo(() => students.filter((student) => student.status === 'ACTIVE').reduce((sum, student) => sum + student.monthlyFee, 0), [students]);

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div><span className="eyebrow">PAINEL DE GESTÃO</span><h1>Olá, {getFirstName(user?.name ?? 'Treinador')}.</h1><p>Acompanhe o desempenho da sua assessoria em um só lugar.</p></div>
        <Button icon={<CalendarClock size={18} />}>Novo agendamento</Button>
      </header>

      <section className="stats-grid">
        <StatCard label="Alunos ativos" value={String(activeStudents)} helper="na base atual" trend={8.4} icon={UsersRound} />
        <StatCard label="Receita recebida" value={formatCurrency(received)} helper="no período" trend={12.1} icon={CircleDollarSign} />
        <StatCard label="Receita recorrente" value={formatCurrency(expectedRevenue)} helper="mensal estimada" trend={6.8} icon={Dumbbell} />
        <StatCard label="Pendências" value={String(pending.length)} helper="cobranças abertas" trend={-4.2} icon={CalendarClock} />
      </section>

      <section className="dashboard-grid dashboard-grid--wide">
        <Card className="chart-card">
          <div className="section-heading"><div><span>DESEMPENHO FINANCEIRO</span><h2>Receita x despesas</h2></div><select className="compact-select"><option>Últimos 6 meses</option></select></div>
          <div className="chart-legend"><span><i className="dot dot--yellow" /> Receita</span><span><i className="dot dot--gray" /> Despesas</span></div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD54A" stopOpacity={0.35} /><stop offset="100%" stopColor="#FFD54A" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="month" stroke="#767676" tickLine={false} axisLine={false} />
                <YAxis stroke="#767676" tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip contentStyle={{ background: '#171717', border: '1px solid #303030', borderRadius: 12 }} formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#FFD54A" strokeWidth={3} fill="url(#revenueFill)" />
                <Area type="monotone" dataKey="expenses" stroke="#777777" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="section-heading"><div><span>PRÓXIMOS HORÁRIOS</span><h2>Agenda</h2></div><button className="text-button">Ver agenda</button></div>
          <div className="schedule-list">
            {upcoming.map((event) => (
              <div className="schedule-item" key={event.id}>
                <div className="schedule-item__time"><strong>{event.time}</strong><span>{formatDate(event.date).split(' de ')[0]}</span></div>
                <div className="schedule-item__content"><strong>{event.studentName}</strong><span>{event.title} · {event.location}</span></div>
                <span className="schedule-item__duration">{event.durationMinutes} min</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card>
          <div className="section-heading"><div><span>COBRANÇAS</span><h2>Pagamentos pendentes</h2></div><button className="text-button">Abrir financeiro</button></div>
          <div className="table-wrap">
            <table className="data-table data-table--compact"><thead><tr><th>Aluno</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>
              {pending.slice(0, 4).map((payment) => <tr key={payment.id}><td><strong>{payment.studentName}</strong><span>{payment.description}</span></td><td>{formatDate(payment.dueDate)}</td><td>{formatCurrency(payment.amount)}</td><td><Badge status={payment.status} /></td></tr>)}
            </tbody></table>
          </div>
        </Card>

        <Card>
          <div className="section-heading"><div><span>BASE DE ALUNOS</span><h2>Progresso em destaque</h2></div></div>
          <div className="progress-list">
            {students.filter((student) => student.status === 'ACTIVE').slice(0, 4).map((student) => (
              <div className="progress-row" key={student.id}>
                <span className="avatar avatar--small">{student.initials}</span>
                <div><strong>{student.name}</strong><span>{student.goal}</span><div className="progress-bar"><i style={{ width: `${student.progress}%` }} /></div></div>
                <strong>{student.progress}%</strong>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
