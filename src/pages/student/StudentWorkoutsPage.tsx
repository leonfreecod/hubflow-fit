import { CalendarRange, CheckCircle2, Dumbbell, Gauge, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import type { WorkoutPlan, WorkoutSession } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';

export function StudentWorkoutsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.linkedStudentId) {
      setLoading(false);
      setError('Sua conta não possui um aluno vinculado.');
      return;
    }
    let active = true;
    setLoading(true);
    void repositories.workouts
      .findAll()
      .then((items) => {
        if (active)
          setPlans(items.filter((plan) => plan.assignedStudentIds.includes(user.linkedStudentId!)));
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : 'Não foi possível carregar os treinos.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function toggleCompletion(session: WorkoutSession) {
    if (!selectedPlan) return;
    setActiveSessionId(session.id);
    setError(null);
    try {
      const updated = session.completed
        ? await repositories.workouts.undoSessionCompletion(selectedPlan.id, session.id)
        : await repositories.workouts.completeSession(selectedPlan.id, session.id);
      setPlans((current) => current.map((plan) => (plan.id === updated.id ? updated : plan)));
      setSelectedPlan(updated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar a sessão.');
    } finally {
      setActiveSessionId(null);
    }
  }

  if (loading) return <div className="route-loader">Carregando treinos...</div>;

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">TREINAMENTO</span>
          <h1>Meus treinos</h1>
          <p>Acompanhe os programas liberados pelo seu treinador.</p>
        </div>
      </header>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {plans.length === 0 ? (
        <EmptyState
          title="Nenhum programa disponível"
          description="Seu treinador ainda não vinculou um plano à sua conta."
        />
      ) : (
        <section className="student-workout-grid">
          {plans.map((plan, index) => (
            <Card className="student-workout-card" key={plan.id}>
              <div className="student-workout-card__number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="student-workout-card__head">
                <span>
                  <Dumbbell size={26} />
                </span>
                <Badge status={plan.level} />
              </div>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className="student-workout-card__meta">
                <span>
                  <CalendarRange size={17} />
                  {plan.weeks} semanas
                </span>
                <span>
                  <Gauge size={17} />
                  {plan.sessionsPerWeek} sessões/semana
                </span>
              </div>
              <button type="button" onClick={() => setSelectedPlan(plan)}>
                <PlayCircle size={19} /> Abrir programa
              </button>
            </Card>
          ))}
        </section>
      )}

      <Modal
        open={Boolean(selectedPlan)}
        title={selectedPlan?.name ?? 'Programa'}
        description={selectedPlan?.description}
        onClose={() => setSelectedPlan(null)}
      >
        <div className="student-session-list">
          {(selectedPlan?.sessions ?? []).length === 0 && (
            <EmptyState
              title="Estrutura em preparação"
              description="As sessões detalhadas ainda não foram publicadas."
            />
          )}
          {(selectedPlan?.sessions ?? []).map((session) => (
            <section
              className={
                session.completed ? 'student-session student-session--completed' : 'student-session'
              }
              key={session.id}
            >
              <header>
                <div>
                  <span>
                    SEMANA {session.weekNumber} · DIA {session.dayOrder}
                  </span>
                  <h3>{session.name}</h3>
                </div>
                <Badge status={session.completed ? 'COMPLETED' : 'SCHEDULED'} />
              </header>
              <p>{session.instructions}</p>
              <ol>
                {session.exercises.map((exercise) => (
                  <li key={exercise.id}>
                    <div>
                      <strong>{exercise.name}</strong>
                      <span>{exercise.prescription}</span>
                    </div>
                    {exercise.restSeconds > 0 && <small>{exercise.restSeconds}s descanso</small>}
                  </li>
                ))}
              </ol>
              <Button
                type="button"
                variant={session.completed ? 'secondary' : 'primary'}
                icon={<CheckCircle2 size={17} />}
                disabled={activeSessionId === session.id}
                onClick={() => void toggleCompletion(session)}
              >
                {activeSessionId === session.id
                  ? 'Atualizando...'
                  : session.completed
                    ? 'Desmarcar conclusão'
                    : 'Marcar como concluída'}
              </Button>
            </section>
          ))}
        </div>
      </Modal>
    </div>
  );
}
