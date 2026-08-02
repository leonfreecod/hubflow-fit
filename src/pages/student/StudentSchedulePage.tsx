import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ScheduleEvent } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';
import { formatDate } from '../../utils/format';

export function StudentSchedulePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.linkedStudentId) {
      setLoading(false);
      setError('Sua conta não possui um aluno vinculado.');
      return;
    }
    let active = true;
    void repositories.schedule
      .findAll()
      .then((items) => {
        if (active)
          setEvents(
            items
              .filter((event) => event.studentId === user.linkedStudentId)
              .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
          );
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a agenda.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <div className="route-loader">Carregando agenda...</div>;
  if (error) return <EmptyState title="Não foi possível carregar a agenda" description={error} />;

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">AGENDA</span>
          <h1>Meus compromissos</h1>
          <p>Sessões, avaliações e encontros programados com sua equipe.</p>
        </div>
      </header>
      {events.length === 0 ? (
        <EmptyState
          title="Agenda livre"
          description="Você ainda não possui compromissos registrados."
        />
      ) : (
        <section className="student-event-grid">
          {events.map((event) => (
            <Card key={event.id} className="student-event-card">
              <div className="student-event-card__date">
                <CalendarDays size={21} />
                <strong>{formatDate(event.date)}</strong>
                <span>{event.time}</span>
              </div>
              <div className="student-event-card__body">
                <Badge status={event.type} />
                <h2>{event.title}</h2>
                <p>
                  <MapPin size={15} />
                  {event.location}
                </p>
                <p>
                  <Clock3 size={15} />
                  {event.durationMinutes} minutos
                </p>
              </div>
              <Badge status={event.status} />
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
