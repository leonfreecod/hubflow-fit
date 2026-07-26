import { Dumbbell, Plus, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import type { Student, WorkoutLevel } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import { repositories } from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatDate } from '../../utils/format';

export function WorkoutsPage() {
  const collection = useAsyncCollection(repositories.workouts);
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', objective: '', level: 'BEGINNER' as WorkoutLevel, weeks: 4, sessionsPerWeek: 3, assignedStudentIds: [] as string[], description: '' });
  useEffect(() => { void repositories.students.findAll().then(setStudents); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await collection.create({ ...form, id: createId('workout'), updatedAt: new Date().toISOString().slice(0, 10) });
    setModalOpen(false);
  }

  function toggleStudent(id: string) {
    setForm((current) => ({ ...current, assignedStudentIds: current.assignedStudentIds.includes(id) ? current.assignedStudentIds.filter((studentId) => studentId !== id) : [...current.assignedStudentIds, id] }));
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">PLANEJAMENTO ESPORTIVO</span><h1>Treinos</h1><p>Crie programas e organize os alunos vinculados a cada ciclo.</p></div><Button icon={<Plus size={18} />} onClick={() => setModalOpen(true)}>Novo plano</Button></header>
      <section className="workout-grid">
        {collection.items.map((plan, index) => (
          <Card className="workout-card" interactive key={plan.id}>
            <div className="workout-card__cover"><span>PROGRAMA {String(index + 1).padStart(2, '0')}</span><Dumbbell size={30} /><i /></div>
            <div className="workout-card__content"><div className="workout-card__header"><Badge status={plan.level} /><span>Atualizado {formatDate(plan.updatedAt)}</span></div><h2>{plan.name}</h2><p>{plan.description}</p>
              <div className="workout-metrics"><div><strong>{plan.weeks}</strong><span>semanas</span></div><div><strong>{plan.sessionsPerWeek}x</strong><span>por semana</span></div><div><strong>{plan.assignedStudentIds.length}</strong><span>alunos</span></div></div>
              <div className="workout-card__footer"><span><UsersRound size={17} /> {plan.objective}</span><button className="text-button">Ver programa</button></div>
            </div>
          </Card>
        ))}
      </section>

      <Modal open={modalOpen} title="Novo plano de treino" description="Crie uma estrutura inicial e vincule alunos ao programa." onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="form-grid">
          <label className="field field--span-2"><span>Nome do programa</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Base para 10 km" /></label>
          <label className="field field--span-2"><span>Objetivo</span><input required value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></label>
          <label className="field"><span>Nível</span><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as WorkoutLevel })}><option value="BEGINNER">Iniciante</option><option value="INTERMEDIATE">Intermediário</option><option value="ADVANCED">Avançado</option></select></label>
          <label className="field"><span>Duração (semanas)</span><input type="number" min="1" value={form.weeks} onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })} /></label>
          <label className="field"><span>Sessões por semana</span><input type="number" min="1" max="7" value={form.sessionsPerWeek} onChange={(e) => setForm({ ...form, sessionsPerWeek: Number(e.target.value) })} /></label>
          <label className="field field--span-2"><span>Descrição</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
          <fieldset className="checkbox-group field--span-2"><legend>Vincular alunos</legend>{students.filter((student) => student.status === 'ACTIVE').map((student) => <label key={student.id}><input type="checkbox" checked={form.assignedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} /><span className="avatar avatar--tiny">{student.initials}</span><strong>{student.name}</strong></label>)}</fieldset>
          <div className="modal-actions field--span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" icon={<Dumbbell size={18} />}>Criar programa</Button></div>
        </form>
      </Modal>
    </div>
  );
}
