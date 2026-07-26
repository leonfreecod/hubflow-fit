import { CalendarPlus, CheckCircle2, Clock3, MapPin, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import type { ScheduleEvent, Student } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import { repositories } from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatDate } from '../../utils/format';

export function SchedulePage() {
  const collection = useAsyncCollection(repositories.schedule);
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: 'student-001', title: 'Treino individual', date: '2026-07-30', time: '07:00', durationMinutes: 60, location: 'Studio Hub', type: 'PERSONAL' as ScheduleEvent['type'] });

  useEffect(() => { void repositories.students.findAll().then(setStudents); }, []);
  const sorted = useMemo(() => [...collection.items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [collection.items]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const student = students.find((item) => item.id === form.studentId);
    await collection.create({ ...form, id: createId('event'), studentName: student?.name ?? 'Aluno', status: 'SCHEDULED' });
    setModalOpen(false);
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">ORGANIZAÇÃO DA ROTINA</span><h1>Agenda</h1><p>Gerencie avaliações, sessões individuais, treinos em grupo e encontros online.</p></div><Button icon={<Plus size={18} />} onClick={() => setModalOpen(true)}>Novo horário</Button></header>
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
            {sorted.map((event) => (
              <article className="timeline-item" key={event.id}>
                <div className="timeline-item__date"><strong>{event.time}</strong><span>{formatDate(event.date)}</span></div>
                <div className="timeline-item__marker"><i /></div>
                <div className="timeline-item__card">
                  <div><Badge status={event.type} /><h3>{event.title}</h3><p>{event.studentName}</p></div>
                  <div className="event-meta"><span><Clock3 size={15} /> {event.durationMinutes} min</span><span><MapPin size={15} /> {event.location}</span></div>
                  <div className="event-actions"><Badge status={event.status} />{event.status === 'SCHEDULED' && <button title="Marcar como concluído" onClick={() => void collection.update({ ...event, status: 'COMPLETED' })}><CheckCircle2 size={18} /></button>}</div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <Modal open={modalOpen} title="Novo agendamento" description="Adicione um compromisso à agenda da assessoria." onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="form-grid">
          <label className="field field--span-2"><span>Aluno</span><select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
          <label className="field field--span-2"><span>Título</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label className="field"><span>Data</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="field"><span>Horário</span><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></label>
          <label className="field"><span>Duração (min)</span><input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
          <label className="field"><span>Tipo</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ScheduleEvent['type'] })}><option value="PERSONAL">Personal</option><option value="ASSESSMENT">Avaliação</option><option value="GROUP">Grupo</option><option value="ONLINE">Online</option></select></label>
          <label className="field field--span-2"><span>Local</span><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          <div className="modal-actions field--span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" icon={<CalendarPlus size={18} />}>Agendar</Button></div>
        </form>
      </Modal>
    </div>
  );
}
