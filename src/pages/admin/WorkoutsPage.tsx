import { Dumbbell, Plus, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import type { Student, WorkoutPlan } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import {
  repositories,
  usesApiDataSource,
} from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatDate } from '../../utils/format';

type WorkoutForm = Omit<WorkoutPlan, 'id' | 'updatedAt'>;

function createEmptyForm(): WorkoutForm {
  return {
    name: '',
    objective: '',
    level: 'BEGINNER',
    weeks: 4,
    sessionsPerWeek: 3,
    assignedStudentIds: [],
    description: '',
  };
}

export function WorkoutsPage() {
  const collection = useAsyncCollection(repositories.workouts);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutPlan | null>(null);
  const [form, setForm] = useState<WorkoutForm>(() => createEmptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStudentsLoading(true);
    setStudentsError(null);
    void repositories.students.findAll()
      .then((items) => {
        if (active) setStudents(items);
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

  const visibleError = collection.error ?? actionError ?? studentsError;

  function openCreate() {
    collection.clearError();
    setActionError(null);
    setEditing(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  }

  async function openEdit(id: string) {
    collection.clearError();
    setActionError(null);
    setActiveActionId(id);
    try {
      const plan = await repositories.workouts.findById(id);
      if (!plan) {
        setActionError('Plano de treino não encontrado.');
        return;
      }
      setEditing(plan);
      setForm({
        name: plan.name,
        objective: plan.objective,
        level: plan.level,
        weeks: plan.weeks,
        sessionsPerWeek: plan.sessionsPerWeek,
        assignedStudentIds: [...plan.assignedStudentIds],
        description: plan.description,
      });
      setModalOpen(true);
    } catch (cause) {
      setActionError(cause instanceof Error
        ? cause.message
        : 'Não foi possível consultar o plano de treino.');
    } finally {
      setActiveActionId(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const workoutPlan: WorkoutPlan = {
      ...form,
      id: editing?.id ?? createId('workout'),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setSubmitting(true);
    try {
      if (editing) await collection.update(workoutPlan);
      else await collection.create(workoutPlan);
      setModalOpen(false);
    } catch {
      // The collection exposes the normalized API or storage error in the form.
    } finally {
      setSubmitting(false);
    }
  }

  async function removePlan(plan: WorkoutPlan) {
    if (!confirm(`Excluir o plano "${plan.name}"?`)) return;
    setActiveActionId(plan.id);
    setActionError(null);
    try {
      await collection.remove(plan.id);
    } catch {
      // The collection displays the normalized error above the grid.
    } finally {
      setActiveActionId(null);
    }
  }

  function toggleStudent(id: string) {
    setForm((current) => ({ ...current, assignedStudentIds: current.assignedStudentIds.includes(id) ? current.assignedStudentIds.filter((studentId) => studentId !== id) : [...current.assignedStudentIds, id] }));
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">PLANEJAMENTO ESPORTIVO</span><h1>Treinos</h1><p>Crie programas e organize os alunos vinculados a cada ciclo.</p></div><Button icon={<Plus size={18} />} onClick={openCreate} disabled={studentsLoading}>Novo plano</Button></header>
      {visibleError && !modalOpen && <div className="form-error" role="alert">{visibleError}</div>}
      <section className="workout-grid">
        {collection.loading
          ? <EmptyState title="Carregando treinos" description="Aguarde enquanto os planos são consultados." />
          : collection.items.length === 0
            ? <EmptyState title="Nenhum plano encontrado" description="Crie um programa para começar a organizar os treinos." />
            : collection.items.map((plan, index) => (
          <Card className="workout-card" interactive key={plan.id}>
            <div className="workout-card__cover"><span>PROGRAMA {String(index + 1).padStart(2, '0')}</span><Dumbbell size={30} /><i /></div>
            <div className="workout-card__content"><div className="workout-card__header"><Badge status={plan.level} /><span>Atualizado {formatDate(plan.updatedAt)}</span></div><h2>{plan.name}</h2><p>{plan.description}</p>
              <div className="workout-metrics"><div><strong>{plan.weeks}</strong><span>semanas</span></div><div><strong>{plan.sessionsPerWeek}x</strong><span>por semana</span></div><div><strong>{plan.assignedStudentIds.length}</strong><span>alunos</span></div></div>
              <div className="workout-card__footer"><span><UsersRound size={17} /> {plan.objective}</span><div><button className="text-button" aria-label={`Editar ${plan.name}`} onClick={() => void openEdit(plan.id)} disabled={activeActionId === plan.id}>Editar</button>{' '}<button className="text-button" aria-label={`Excluir ${plan.name}`} onClick={() => void removePlan(plan)} disabled={activeActionId === plan.id}>Excluir</button></div></div>
            </div>
          </Card>
        ))}
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar plano de treino' : 'Novo plano de treino'}
        description={usesApiDataSource
          ? 'O plano e seus vínculos com alunos serão persistidos pela API.'
          : 'Crie uma estrutura inicial e vincule alunos ao programa.'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit} className="form-grid">
          {visibleError && <div className="form-error field--span-2" role="alert">{visibleError}</div>}
          <label className="field field--span-2"><span>Nome do programa</span><input required maxLength={255} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Base para 10 km" /></label>
          <label className="field field--span-2"><span>Objetivo</span><input required maxLength={255} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></label>
          <label className="field"><span>Nível</span><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as WorkoutPlan['level'] })}><option value="BEGINNER">Iniciante</option><option value="INTERMEDIATE">Intermediário</option><option value="ADVANCED">Avançado</option></select></label>
          <label className="field"><span>Duração (semanas)</span><input type="number" min="1" max="520" required value={form.weeks} onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })} /></label>
          <label className="field"><span>Sessões por semana</span><input type="number" min="1" max="7" required value={form.sessionsPerWeek} onChange={(e) => setForm({ ...form, sessionsPerWeek: Number(e.target.value) })} /></label>
          <label className="field field--span-2"><span>Descrição</span><textarea required maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
          <fieldset className="checkbox-group field--span-2"><legend>Vincular alunos</legend>{students.filter((student) => student.status === 'ACTIVE').map((student) => <label key={student.id}><input type="checkbox" checked={form.assignedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} /><span className="avatar avatar--tiny">{student.initials}</span><strong>{student.name}</strong></label>)}</fieldset>
          <div className="modal-actions field--span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" icon={<Dumbbell size={18} />} disabled={submitting}>{submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar programa'}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
