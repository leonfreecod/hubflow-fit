import { Mail, Phone, Save, ShieldCheck, Target, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Student } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';
import { formatDate } from '../../utils/format';

export function StudentProfilePage() {
  const { user } = useAuth(); const [student, setStudent] = useState<Student | null>(null); const [saved, setSaved] = useState(false);
  useEffect(() => { if (user?.linkedStudentId) void repositories.students.findById(user.linkedStudentId).then(setStudent); }, [user]);
  if (!student) return <div className="route-loader">Carregando perfil...</div>;
  const currentStudent = student;
  async function submit(event: React.FormEvent) { event.preventDefault(); await repositories.students.update(currentStudent); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  return <div className="page-stack"><header className="page-heading"><div><span className="eyebrow">PERFIL</span><h1>Meus dados</h1><p>Mantenha suas informações de contato e objetivo atualizados.</p></div></header><section className="profile-grid"><Card className="profile-summary"><span className="profile-avatar">{student.initials}</span><h2>{student.name}</h2><p>{student.plan}</p><div className="profile-summary__items"><span><Mail size={16}/>{student.email}</span><span><Phone size={16}/>{student.phone}</span><span><Target size={16}/>{student.goal}</span></div><div className="profile-progress"><div><span>Evolução do objetivo</span><strong>{student.progress}%</strong></div><i><b style={{ width: `${student.progress}%` }}/></i></div><small>Aluno desde {formatDate(student.joinedAt)}</small></Card><Card><div className="section-heading"><div><span>DADOS PESSOAIS</span><h2>Editar informações</h2></div><UserRound size={21}/></div><form onSubmit={submit} className="form-grid settings-form"><label className="field field--span-2"><span>Nome completo</span><input value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })}/></label><label className="field"><span>E-mail</span><input type="email" value={student.email} onChange={(e) => setStudent({ ...student, email: e.target.value })}/></label><label className="field"><span>Telefone</span><input value={student.phone} onChange={(e) => setStudent({ ...student, phone: e.target.value })}/></label><label className="field field--span-2"><span>Objetivo</span><textarea rows={3} value={student.goal} onChange={(e) => setStudent({ ...student, goal: e.target.value })}/></label><div className="privacy-note field--span-2"><ShieldCheck size={18}/><span>Seus dados são exibidos apenas para a equipe responsável pelo seu acompanhamento.</span></div><div className="modal-actions field--span-2"><span className={saved ? 'save-feedback visible' : 'save-feedback'}>Perfil atualizado.</span><Button type="submit" icon={<Save size={18}/>}>Salvar alterações</Button></div></form></Card></section></div>;
}
