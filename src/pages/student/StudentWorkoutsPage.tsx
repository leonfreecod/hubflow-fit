import { CalendarRange, Dumbbell, Gauge, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import type { WorkoutPlan } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';

export function StudentWorkoutsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  useEffect(() => { if (user?.linkedStudentId) void repositories.workouts.findAll().then((items) => setPlans(items.filter((plan) => plan.assignedStudentIds.includes(user.linkedStudentId!)))); }, [user]);
  return <div className="page-stack"><header className="page-heading"><div><span className="eyebrow">TREINAMENTO</span><h1>Meus treinos</h1><p>Acompanhe os programas liberados pelo seu treinador.</p></div></header><section className="student-workout-grid">{plans.map((plan, index) => <Card className="student-workout-card" key={plan.id}><div className="student-workout-card__number">0{index+1}</div><div className="student-workout-card__head"><span><Dumbbell size={26}/></span><Badge status={plan.level}/></div><h2>{plan.name}</h2><p>{plan.description}</p><div className="student-workout-card__meta"><span><CalendarRange size={17}/>{plan.weeks} semanas</span><span><Gauge size={17}/>{plan.sessionsPerWeek} sessões/semana</span></div><button><PlayCircle size={19}/> Abrir programa</button></Card>)}</section></div>;
}
