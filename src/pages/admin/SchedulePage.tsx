import {
  CalendarPlus,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import type { ScheduleEvent, Student } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import {
  repositories,
  usesApiDataSource,
} from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatDate } from '../../utils/format';

type ScheduleForm = Pick<
  ScheduleEvent,
  'studentId' | 'title' | 'date' | 'time' | 'durationMinutes' | 'location' | 'type'
>;

function createEmptyForm(studentId = ''): ScheduleForm {
  return {
    studentId,
    title: 'Treino individual',
    date: '2026-07-30',
    time: '07:00',
    durationMinutes: 60,
    location: 'Studio Hub',
    type: 'PERSONAL',
  };
}

export function SchedulePage() {
  const collection = useAsyncCollection(repositories.schedule);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [form, setForm] = useState<ScheduleForm>(() => createEmptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStudentsLoading(true);
    setStudentsError(null);
    void repositories.students.findAll()
      .then((items) => {
        if (!active) return;
        setStudents(items);
        setForm((current) => items.some((student) => student.id === current.studentId)
          ? current
          : { ...current, studentId: items[0]?.id ?? '' });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setStudentsError(cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar os alunos.');
      })
      .finally(() => {
        if (active) setStudentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(() => [...collection.items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [collection.items]);
  const visibleError = collection.error ?? studentsError;

  function openCreate() {
    collection.clearError();
    setEditing(null);
    setForm(createEmptyForm(students[0]?.id));
    setModalOpen(true);
  }

  function openEdit(event: ScheduleEvent) {
    collection.clearError();
    setEditing(event);
    setForm({
      studentId: event.studentId,
      title: event.title,
      date: event.date,
      time: event.time,
      durationMinutes: event.durationMinutes,
      location: event.location,
      type: event.type,
    });
    setModalOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const student = students.find((item) => item.id === form.studentId);
    if (!student) {
      setStudentsError('Selecione um aluno válido para o evento.');
      return;
    }

    const scheduleEvent: ScheduleEvent = {
      ...form,
      id: editing?.id ?? createId('event'),
      studentName: student.name,
      status: editing?.status ?? 'SCHEDULED',
    };

    setSubmitting(true);
    try {
      if (editing) await collection.update(scheduleEvent);
      else await collection.create(scheduleEvent);
      setModalOpen(false);
    } catch {
      // The collection exposes the normalized API or storage error in the form.
    } finally {
      setSubmitting(false);
    }
  }

  async function completeEvent(event: ScheduleEvent) {
    setActiveActionId(event.id);
    try {
      await collection.mutate(() => repositories.schedule.complete(event.id));
    } catch {
      // The collection displays the normalized error above the timeline.
    } finally {
      setActiveActionId(null);
    }
  }

  async function removeEvent(event: ScheduleEvent) {
    if (!confirm(`Excluir o evento "${event.title}" de ${event.studentName}?`)) return;
    setActiveActionId(event.id);
    try {
      await collection.remove(event.id);
    } catch {
      // The collection displays the normalized error above the timeline.
    } finally {
      setActiveActionId(null);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">ORGANIZAÇÃO DA ROTINA</span><h1>Agenda</h1><p>Gerencie avaliações, sessões individuais, treinos em grupo e encontros online.</p></div><Button icon={<Plus size={18} />} onClick={openCreate} disabled={studentsLoading || students.length === 0}>Novo horário</Button></header>
      {visibleError && !modalOpen && <div className="form-error" role="alert">{visibleError}</div>}
      <section className="agenda-layout">
        <Card className="calendar-summary">
          <div className="calendar-summary__month"><span>JUL</span><strong>2026</strong></div>
          <div className="mini-calendar">
            {['D','S','T','Q','Q','S','S'].map((day, index) => <span key={`${day}${index}`} className="mini-calendar__weekday">{day}</span>)}
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => <button key={day} className={day === 27 ? 'today' : [24,28,29,30].includes(day) ? 'has-event' : ''}>{day}</button>)}
          </div>
          <div className="calendar-legend"><span><i className="dot dot--yellow" /> Com agenda</span><span><i className="dot dot--outline" /> Hoje</span></div>
        </Card>
        <Card>
          <div className="section-heading"><div><span>PRÓXIMOS COMPROMISSOS</span><h2>Agenda da equipe</h2></div><span className="soft-pill">{sorted.filter((item) => item.status === 'SCHEDULED').length} agendados</span></div>
          <div className="timeline">
            {collection.loading
              ? <EmptyState title="Carregando agenda" description="Aguarde enquanto os eventos são consultados." />
              : sorted.length === 0
                ? <EmptyState title="Nenhum evento encontrado" description="Crie um horário para começar a organizar a agenda." />
                : sorted.map((event) => (
              <article className="timeline-item" key={event.id}>
                <div className="timeline-item__date"><strong>{event.time}</strong><span>{formatDate(event.date)}</span></div>
                <div className="timeline-item__marker"><i /></div>
                <div className="timeline-item__card">
                  <div><Badge status={event.type} /><h3>{event.title}</h3><p>{event.studentName}</p></div>
                  <div className="event-meta"><span><Clock3 size={15} /> {event.durationMinutes} min</span><span><MapPin size={15} /> {event.location}</span></div>
                  <div className="event-actions"><Badge status={event.status} />{event.status === 'SCHEDULED' && <button title="Marcar como concluído" aria-label="Concluir evento" onClick={() => void completeEvent(event)} disabled={activeActionId === event.id}><CheckCircle2 size={18} /></button>}<button title="Editar evento" aria-label="Editar evento" onClick={() => openEdit(event)}><Pencil size={18} /></button><button title="Excluir evento" aria-label="Excluir evento" onClick={() => void removeEvent(event)} disabled={activeActionId === event.id}><Trash2 size={18} /></button></div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar agendamento' : 'Novo agendamento'}
        description={usesApiDataSource
          ? 'O evento será vinculado ao aluno e persistido pela API.'
          : 'Adicione um compromisso à agenda da assessoria.'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit} className="form-grid">
          {visibleError && <div className="form-error field--span-2" role="alert">{visibleError}</div>}
          <label className="field field--span-2"><span>Aluno</span><select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
          <label className="field field--span-2"><span>Título</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label className="field"><span>Data</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="field"><span>Horário</span><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></label>
          <label className="field"><span>Duração (min)</span><input type="number" min="1" max="1440" required value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
          <label className="field"><span>Tipo</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ScheduleEvent['type'] })}><option value="PERSONAL">Personal</option><option value="ASSESSMENT">Avaliação</option><option value="GROUP">Grupo</option><option value="ONLINE">Online</option></select></label>
          <label className="field field--span-2"><span>Local</span><input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          <div className="modal-actions field--span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" icon={<CalendarPlus size={18} />} disabled={submitting}>{submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Agendar'}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
