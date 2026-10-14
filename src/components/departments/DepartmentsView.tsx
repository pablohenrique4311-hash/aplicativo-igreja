import React, { useState } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { OfficialDepartment, MediaRole, DepartmentId, DepartmentRole } from '../../types';
import {
  canManageDepartment,
  canAccessDepartmentInternalContent,
  canParticipateInChat,
  canViewChildSensitiveData,
  canAssignDepartmentLeader
} from '../../services/permissionSecurityService';
import { UserAvatar } from '../common/UserAvatar';
import {
  Users,
  Shield,
  Heart,
  Video,
  Baby,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  Plus,
  AlertTriangle,
  ArrowRight,
  Send,
  UserMinus,
  ShieldCheck,
  ShieldAlert,
  Info,
  CalendarCheck,
  Tag
} from 'lucide-react';

export const DepartmentsView: React.FC = () => {
  const {
    departments,
    currentUser,
    users,
    departmentMemberships,
    addDepartmentMembership,
    endDepartmentMembership,
    departmentChats,
    sendDepartmentChatMessage,
    mediaSchedules,
    confirmMediaSchedule,
    requestMediaSwap,
    addMediaSchedule,
    childRecords,
    checkInChild,
    checkOutChild,
    addChildRecord,
    churchSettings
  } = useChurch();

  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('midia');
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'integrantes' | 'chat' | 'escalas'>('geral');

  // Chat message input
  const [chatInput, setChatInput] = useState('');
  const [chatFeedback, setChatFeedback] = useState<string | null>(null);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('');
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<DepartmentRole>('MEMBRO');
  const [memberActionError, setMemberActionError] = useState<string | null>(null);
  const [memberActionSuccess, setMemberActionSuccess] = useState<string | null>(null);

  // Media Schedule Form state (for media leader or admin)
  const [showAddMediaSched, setShowAddMediaSched] = useState(false);
  const [newMediaService, setNewMediaService] = useState('Culto de Celebração de Domingo');
  const [newMediaDate, setNewMediaDate] = useState('Domingo 19:00');
  const [newMediaRole, setNewMediaRole] = useState<MediaRole>('Transmissão');
  const [newMediaVolunteer, setNewMediaVolunteer] = useState('Membro da Igreja');

  // Children Ministry state
  const [childPinInput, setChildPinInput] = useState<{ [childId: string]: string }>({});
  const [childErrorMsg, setChildErrorMsg] = useState<{ [childId: string]: string }>({});
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildParent, setNewChildParent] = useState(currentUser.name);
  const [newChildPhone, setNewChildPhone] = useState(currentUser.phone);
  const [newChildBirth, setNewChildBirth] = useState('');
  const [newChildNotes, setNewChildNotes] = useState('');
  const [parentAuthorizedConsent, setParentAuthorizedConsent] = useState(true);

  // Volunteer interest modal
  const [volunteerInterestDept, setVolunteerInterestDept] = useState<string | null>(null);

  const selectedDepartment =
    departments.find((d) => d.id === selectedDeptId) || departments[0];

  // Permissões calculadas com base nas regras do RBAC
  const isLeader = canManageDepartment(currentUser, selectedDeptId, departmentMemberships);
  const canAccessInternal = canAccessDepartmentInternalContent(currentUser, selectedDeptId, departmentMemberships);
  const canChat = canParticipateInChat(currentUser, selectedDeptId, departmentMemberships);
  const canAssignLeader = canAssignDepartmentLeader(currentUser);

  // Vínculo do usuário atual no departamento selecionado
  const myMembership = departmentMemberships.find(
    (m) => m.userId === currentUser.id && m.departmentId === selectedDeptId && m.status === 'ATIVO'
  );

  // Integrantes deste departamento
  const deptMemberships = departmentMemberships.filter(
    (m) => m.departmentId === selectedDeptId
  );
  const activeMemberships = deptMemberships.filter((m) => m.status === 'ATIVO');
  const endedMemberships = deptMemberships.filter((m) => m.status === 'ENCERRADO');

  // Mensagens do chat deste departamento
  const currentChatMessages = departmentChats[selectedDeptId] || [];

  // Envio de mensagem no chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const res = sendDepartmentChatMessage(selectedDeptId, chatInput.trim());
    if (res.success) {
      setChatInput('');
      setChatFeedback(null);
    } else {
      setChatFeedback(res.error || 'Erro ao enviar mensagem.');
    }
  };

  // Adicionar integrante ao departamento
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdToAdd) {
      setMemberActionError('Selecione um usuário.');
      return;
    }

    const res = addDepartmentMembership(selectedUserIdToAdd, selectedDeptId, selectedRoleToAdd);
    if (res.success) {
      setMemberActionSuccess('Integrante adicionado com sucesso!');
      setMemberActionError(null);
      setTimeout(() => {
        setShowAddMemberModal(false);
        setMemberActionSuccess(null);
        setSelectedUserIdToAdd('');
      }, 1200);
    } else {
      setMemberActionError(res.error || 'Erro ao adicionar integrante.');
    }
  };

  // Encerrar vínculo (remoção segura que preserva conta e demais vínculos)
  const handleEndMembership = (membershipId: string, memberName: string) => {
    const confirmText = `Deseja realmente encerrar o vínculo de "${memberName}" com o ${selectedDepartment.name}?\n\nImportante: A conta do usuário e os vínculos em outros departamentos permanecerão intactos.`;
    if (!window.confirm(confirmText)) return;

    const res = endDepartmentMembership(membershipId);
    if (!res.success) {
      alert(res.error || 'Erro ao encerrar vínculo.');
    }
  };

  const handleCreateMediaSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addMediaSchedule({
      serviceName: newMediaService,
      date: newMediaDate,
      role: newMediaRole,
      volunteerId: currentUser.id,
      volunteerName: newMediaVolunteer,
      status: 'pending',
      notes: 'Equipamentos e cabos revisados com antecedência.'
    });
    if (res.success) {
      setShowAddMediaSched(false);
    } else {
      alert(res.error || 'Erro ao adicionar escala.');
    }
  };

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildParent.trim()) return;

    addChildRecord({
      childName: newChildName.trim(),
      parentName: newChildParent.trim(),
      parentPhone: newChildPhone.trim(),
      parentAuthorized: parentAuthorizedConsent,
      birthDate: newChildBirth || '01/01/2020',
      allergyOrNotes: newChildNotes.trim() || 'Nenhuma observação informada.'
    });

    setNewChildName('');
    setNewChildNotes('');
    setShowAddChild(false);
  };

  const handleCheckOut = (childId: string) => {
    const pin = childPinInput[childId] || '';
    const success = checkOutChild(childId, pin);
    if (!success) {
      setChildErrorMsg({
        ...childErrorMsg,
        [childId]: 'PIN incorreto! Solicite o código de segurança de 4 dígitos ao responsável.'
      });
    } else {
      setChildErrorMsg({ ...childErrorMsg, [childId]: '' });
      setChildPinInput({ ...childPinInput, [childId]: '' });
    }
  };

  // Solicitar entrada rápida no grupo para o usuário atual
  const handleSelfJoinRequest = () => {
    // Se for líder ou admin aprova direto, senão adiciona como membro
    addDepartmentMembership(currentUser.id, selectedDeptId, 'MEMBRO');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-fade-in">
      {/* Header Institucional */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              Estrutura Eclesiástica — {churchSettings.acronym}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Departamentos Oficiais & Vínculos Independentes
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gestão departamental individualizada: liderança vinculada a cada grupo, chats restritos e auditoria.
            </p>
          </div>

          {/* Badge de status do usuário atual */}
          <div className="p-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Usuário Ativo:</span>
              <span className="font-bold text-white">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Department Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {departments.map((dept) => {
          const isSelected = dept.id === selectedDeptId;
          const userDeptMembership = departmentMemberships.find(
            (m) => m.userId === currentUser.id && m.departmentId === dept.id && m.status === 'ATIVO'
          );

          const getIcon = () => {
            switch (dept.id) {
              case 'homens':
                return <Shield className="w-4 h-4" />;
              case 'mulheres':
                return <Heart className="w-4 h-4" />;
              case 'jovens':
                return <Users className="w-4 h-4" />;
              case 'criancas':
                return <Baby className="w-4 h-4" />;
              case 'midia':
                return <Video className="w-4 h-4" />;
            }
          };

          return (
            <button
              key={dept.id}
              onClick={() => {
                setSelectedDeptId(dept.id);
                setActiveSubTab('geral');
              }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {/* Badge indicando o papel do usuário neste grupo */}
              {userDeptMembership && (
                <span
                  className={`absolute top-1.5 right-1.5 text-[9px] px-1 rounded font-bold uppercase ${
                    userDeptMembership.role === 'LÍDER'
                      ? isSelected
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-400/20 text-amber-300'
                      : isSelected
                      ? 'bg-slate-950/40 text-slate-900'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {userDeptMembership.role === 'LÍDER' ? 'Líder' : 'Membro'}
                </span>
              )}
              {getIcon()}
              <span className="text-xs font-bold tracking-tight">{dept.name}</span>
            </button>
          );
        })}
      </div>

      {/* Banner de Direitos e Vínculo do Usuário Atual no Departamento Selecionado */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isLeader
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : canAccessInternal
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          {isLeader ? (
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : canAccessInternal ? (
            <UserCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5 sm:mt-0" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Seu Vínculo em {selectedDepartment.name}:
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isLeader
                    ? 'bg-amber-400 text-slate-950'
                    : canAccessInternal
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isLeader
                  ? currentUser.role === 'admin'
                    ? 'Administrador Geral (Acesso Total)'
                    : currentUser.role === 'pastor'
                    ? 'Líder Pastoral (Supervisão)'
                    : 'Líder Oficial Ativo'
                  : canAccessInternal
                  ? 'Membro Ativo'
                  : 'Sem Vínculo Ativo'}
              </span>
            </div>

            <p className="text-[11px] mt-0.5 leading-relaxed">
              {isLeader
                ? `Você possui autorização para administrar integralmente o ${selectedDepartment.name}, adicionar/remover integrantes, organizar escalas e moderar o chat.`
                : canAccessInternal
                ? `Você possui vínculo ativo como integrante do ${selectedDepartment.name}. Pode participar do chat e visualizar conteúdos internos autorizados.`
                : `Você não possui vínculo ativo com este departamento. Conteúdos internos e chat são restritos aos integrantes autorizados.`}
            </p>
          </div>
        </div>

        {/* Botão de ação rápida se não for membro */}
        {!canAccessInternal && (
          <button
            onClick={handleSelfJoinRequest}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 self-start sm:self-auto transition-transform active:scale-95"
          >
            Vincular-se como Membro
          </button>
        )}
      </div>

      {/* Sub-navegação interna do Departamento */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('geral')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeSubTab === 'geral'
              ? 'bg-slate-800 text-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Visão Geral & Atividades
        </button>

        <button
          onClick={() => setActiveSubTab('integrantes')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'integrantes'
              ? 'bg-slate-800 text-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Integrantes ({activeMemberships.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'chat'
              ? 'bg-slate-800 text-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chat Oficial ({currentChatMessages.length})</span>
          {!canChat && <Lock className="w-3 h-3 text-slate-500" />}
        </button>

        {selectedDeptId === 'midia' && (
          <button
            onClick={() => setActiveSubTab('escalas')}
            className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'escalas'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Escalas Técnicas</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VISÃO GERAL & ATIVIDADES */}
      {/* ========================================================================= */}
      {activeSubTab === 'geral' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Header do Departamento */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {selectedDepartment.badge}
              </span>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {selectedDepartment.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {selectedDepartment.description}
              </p>
            </div>

            <button
              onClick={() => setVolunteerInterestDept(selectedDepartment.name)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-transform active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Quero Servir Neste Grupo</span>
            </button>
          </div>

          {/* Grid de Informações de Liderança Oficial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Líder Principal Ativo:</span>
              <p className="font-bold text-white text-sm">{selectedDepartment.leaderName}</p>
              <p className="text-[11px] text-amber-400 font-medium">Designação Oficial Ativa</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Horários & Reuniões:</span>
              <p className="font-bold text-white text-sm">{selectedDepartment.meetingSchedule}</p>
              <p className="text-[11px] text-slate-400">Templo Sede IGEAD-MT</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Contato do Departamento:</span>
              <p className="font-bold text-white text-sm">{selectedDepartment.contactPhone}</p>
              <a
                href={`https://api.whatsapp.com/send?phone=${selectedDepartment.contactWhatsapp}&text=Olá! Gostaria de mais informações sobre o ${selectedDepartment.name} da IGEAD-MT.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chamar no WhatsApp Oficial
              </a>
            </div>
          </div>

          {/* Atividades e Funções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Atividades & Reuniões
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedDepartment.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Funções & Escalas
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDepartment.volunteerRoles.map((role, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-2">
                Treinamento prático sob coordenação direta da liderança ativa deste grupo.
              </p>
            </div>
          </div>

          {/* Avisos Oficiais */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Comunicados Oficiais do {selectedDepartment.name}
            </h4>
            <div className="space-y-2">
              {selectedDepartment.announcements.map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white text-xs">{ann.title}</h5>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTEGRANTES & GESTÃO DE VÍNCULOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'integrantes' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">
                Integrantes Oficiais — {selectedDepartment.name}
              </h3>
              <p className="text-xs text-slate-400">
                Vínculos autônomos. A remoção de um integrante encerra apenas o vínculo com este departamento, preservando a conta e os demais vínculos.
              </p>
            </div>

            {/* Botão de Adicionar Integrante (Exclusivo para Líder do Grupo, Admin ou Pastor) */}
            {isLeader && (
              <button
                onClick={() => {
                  setShowAddMemberModal(true);
                  setMemberActionError(null);
                  setMemberActionSuccess(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Integrante</span>
              </button>
            )}
          </div>

          {/* Lista de Vínculos Ativos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Integrantes com Vínculo Ativo ({activeMemberships.length})
            </h4>

            {activeMemberships.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-950 rounded-2xl">
                Nenhum integrante ativo cadastrado no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeMemberships.map((mem) => {
                  const isMemLeader = mem.role === 'LÍDER';

                  return (
                    <div
                      key={mem.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          src={mem.userAvatar}
                          name={mem.userName}
                          size="md"
                          rounded="xl"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white truncate text-sm">
                              {mem.userName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                isMemLeader
                                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {mem.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{mem.userEmail}</p>
                          <p className="text-[10px] text-slate-500">
                            Entrada no grupo: {mem.joinedAt}
                          </p>
                        </div>
                      </div>

                      {/* Botão de Encerrar Vínculo (somente o líder do departamento, admin ou pastor podem remover) */}
                      {isLeader && (
                        <button
                          onClick={() => handleEndMembership(mem.id, mem.userName)}
                          title="Encerrar este vínculo específico"
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remover</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vínculos Encerrados (Histórico de Auditoria do Grupo) */}
          {endedMemberships.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Histórico de Vínculos Encerrados ({endedMemberships.length})
              </h4>
              <div className="space-y-1.5">
                {endedMemberships.map((em) => (
                  <div
                    key={em.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400"
                  >
                    <span>{em.userName} ({em.userEmail})</span>
                    <span className="text-[11px] text-red-400/80 font-mono">
                      Vínculo encerrado em {em.endedAt || 'Data recente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CHAT OFICIAL INDEPENDENTE POR DEPARTAMENTO */}
      {/* ========================================================================= */}
      {activeSubTab === 'chat' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>Chat Oficial — {selectedDepartment.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Canal exclusivo para os integrantes ativos deste departamento. Mensagens persistidas com auditoria.
              </p>
            </div>

            {selectedDeptId === 'criancas' && (
              <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Ambiente Infantil Supervisionado
              </span>
            )}
          </div>

          {/* Aviso se o usuário NÃO tiver vínculo ativo */}
          {!canChat && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold block">Acesso ao Chat Restrito!</span>
                <p className="text-[11px] mt-0.5">
                  Você não possui vínculo ativo no <strong>{selectedDepartment.name}</strong>. Para ler mensagens ou interagir com o grupo, solicite inclusão à liderança.
                </p>
              </div>
            </div>
          )}

          {/* Fluxo de Mensagens */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            {currentChatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <MessageCircle className="w-8 h-8 mb-2 opacity-40" />
                <p>Nenhuma mensagem enviada ainda neste chat departamental.</p>
              </div>
            ) : (
              currentChatMessages.map((msg) => {
                const isMe = msg.userId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] text-xs ${
                      isMe ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <UserAvatar
                      src={msg.userAvatar}
                      name={msg.userName}
                      size="sm"
                      rounded="xl"
                    />

                    <div
                      className={`p-3 rounded-2xl space-y-1 ${
                        isMe
                          ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                          : msg.isLeaderMessage
                          ? 'bg-slate-800 border border-amber-400/30 text-white rounded-tl-none'
                          : 'bg-slate-900 border border-slate-800 text-white rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-[11px] ${isMe ? 'text-slate-950' : 'text-amber-400'}`}>
                          {msg.userName}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isMe
                              ? 'bg-slate-950/20 text-slate-900'
                              : 'bg-slate-950 text-slate-400'
                          }`}
                        >
                          {msg.userRoleBadge}
                        </span>
                        <span
                          className={`text-[9px] ${
                            isMe ? 'text-slate-800' : 'text-slate-500'
                          }`}
                        >
                          {msg.createdAt}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulário de Envio de Mensagem */}
          {canChat ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Mensagem para o ${selectedDepartment.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          ) : (
            <p className="text-center text-[11px] text-slate-500 italic">
              Envio bloqueado: somente integrantes com vínculo ativo podem postar neste chat.
            </p>
          )}

          {chatFeedback && (
            <p className="text-xs text-red-400 text-center font-medium">{chatFeedback}</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ESCALAS TÉCNICAS (GRUPO DA MÍDIA) */}
      {/* ========================================================================= */}
      {activeSubTab === 'escalas' && selectedDeptId === 'midia' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-base font-bold text-white">
                Escalas Oficiais da Equipe de Mídia
              </h4>
              <p className="text-xs text-slate-400">
                Organização técnica: Áudio, Vídeo, Câmeras, Transmissão, Projeção e Suporte.
              </p>
            </div>

            {isLeader && (
              <button
                onClick={() => setShowAddMediaSched(!showAddMediaSched)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar à Escala</span>
              </button>
            )}
          </div>

          {/* Formulário de Adicionar Escala */}
          {showAddMediaSched && isLeader && (
            <form
              onSubmit={handleCreateMediaSchedule}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">Culto:</label>
                <input
                  type="text"
                  value={newMediaService}
                  onChange={(e) => setNewMediaService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Data / Horário:</label>
                <input
                  type="text"
                  value={newMediaDate}
                  onChange={(e) => setNewMediaDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Função na Mídia:</label>
                <select
                  value={newMediaRole}
                  onChange={(e) => setNewMediaRole(e.target.value as MediaRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Áudio">Áudio</option>
                  <option value="Vídeo">Vídeo</option>
                  <option value="Câmeras">Câmeras</option>
                  <option value="Transmissão">Transmissão</option>
                  <option value="Projeção">Projeção</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-400 text-slate-950 font-bold"
                >
                  Confirmar Escala
                </button>
              </div>
            </form>
          )}

          {/* Lista de Escalas */}
          <div className="space-y-3">
            {mediaSchedules.map((sched) => (
              <div
                key={sched.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono uppercase bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      {sched.role}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {sched.volunteerName}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    📅 {sched.serviceName} ({sched.date})
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Instruções: {sched.notes}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sched.status === 'confirmed' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Presença Confirmada
                    </span>
                  ) : sched.status === 'swap_requested' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                      Troca Solicitada
                    </span>
                  ) : (
                    <button
                      onClick={() => confirmMediaSchedule(sched.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                    >
                      Confirmar Presença
                    </button>
                  )}

                  {sched.status !== 'swap_requested' && (
                    <button
                      onClick={() => requestMediaSwap(sched.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                    >
                      Pedir Troca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO ESPECIAL DE PROTEÇÃO REFORÇADA: GRUPO DE CRIANÇAS */}
      {/* ========================================================================= */}
      {selectedDeptId === 'criancas' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="text-base font-bold text-white">
                  Proteção Reforçada a Menores & Check-in Seguro com PIN
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Em conformidade com a LGPD e diretrizes da IGEAD-MT: dados médicos, alergias e PIN de saída são acessíveis apenas aos pais cadastrados e à liderança ativa do Ministério Infantil.
              </p>
            </div>

            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
            >
              + Cadastrar Filho(a)
            </button>
          </div>

          {/* Formulário de Cadastro Infantil */}
          {showAddChild && (
            <form
              onSubmit={handleCreateChild}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
            >
              <h5 className="font-bold text-white text-sm">Novo Cadastro Infantil</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nome da Criança:</label>
                  <input
                    type="text"
                    required
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Ex: Davi Silva"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nome do Responsável:</label>
                  <input
                    type="text"
                    required
                    value={newChildParent}
                    onChange={(e) => setNewChildParent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Telefone WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={newChildPhone}
                    onChange={(e) => setNewChildPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Data de Nascimento:</label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={newChildBirth}
                    onChange={(e) => setNewChildBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Alergias / Cuidados Especiais:
                </label>
                <input
                  type="text"
                  value={newChildNotes}
                  onChange={(e) => setNewChildNotes(e.target.value)}
                  placeholder="Ex: Alergia a lactose, sem glúten, ou nenhuma..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              {/* Termo de Consentimento */}
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={parentAuthorizedConsent}
                  onChange={(e) => setParentAuthorizedConsent(e.target.checked)}
                  className="rounded text-amber-400"
                />
                <span>
                  Autorizo a permanência da criança nas salinhas infantis sob os cuidados da liderança do Grupo de Crianças da IGEAD-MT.
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold"
              >
                Salvar Cadastro Seguro
              </button>
            </form>
          )}

          {/* Listagem com proteção de dados */}
          <div className="space-y-3">
            {childRecords.map((c) => {
              const canViewSensitive = canViewChildSensitiveData(currentUser, c, departmentMemberships);

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{c.childName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          c.checkedIn
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.checkedIn ? 'Na Salinha (Check-in Ativo)' : 'Com os Pais / Liberado'}
                      </span>
                    </div>

                    <p className="text-slate-400">
                      Responsável: {c.parentName}
                    </p>

                    {/* Dados médicos sensíveis protegidos */}
                    {canViewSensitive ? (
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-amber-400">
                          ⚠️ Observações Médicas: {c.allergyOrNotes}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          PIN de Segurança: <span className="font-mono font-bold text-amber-300">{c.securityPin}</span> · Tel: {c.parentPhone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Dados médicos e PIN confidenciais (Acesso restrito aos pais e à liderança infantil).
                      </p>
                    )}
                  </div>

                  {/* Ações de Check-in e Check-out (Somente Líder de Crianças, Pais ou Admin) */}
                  {canViewSensitive && (
                    <div className="space-y-2 shrink-0">
                      {c.checkedIn ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            placeholder="PIN dos Pais"
                            value={childPinInput[c.id] || ''}
                            onChange={(e) =>
                              setChildPinInput({ ...childPinInput, [c.id]: e.target.value })
                            }
                            className="w-32 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white"
                          />
                          <button
                            onClick={() => handleCheckOut(c.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-bold transition-colors"
                          >
                            Check-out (Saída)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => checkInChild(c.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                        >
                          Fazer Check-in de Entrada
                        </button>
                      )}

                      {childErrorMsg[c.id] && (
                        <p className="text-[10px] text-red-400">{childErrorMsg[c.id]}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR INTEGRANTE AO DEPARTAMENTO */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base">
                Adicionar Integrante ao {selectedDepartment.name}
              </h4>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Selecione o Membro Cadastrado:
                </label>
                <select
                  value={selectedUserIdToAdd}
                  onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="">Selecione um usuário...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Função neste Departamento:
                </label>
                <select
                  value={selectedRoleToAdd}
                  onChange={(e) => setSelectedRoleToAdd(e.target.value as DepartmentRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="MEMBRO">MEMBRO</option>
                  {canAssignLeader && <option value="LÍDER">LÍDER (Designação Oficial)</option>}
                </select>
                {!canAssignLeader && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Nota: Apenas a Administração Geral ou Pastoral podem designar um Líder Oficial.
                  </p>
                )}
              </div>

              {memberActionError && (
                <p className="text-xs text-red-400 font-semibold p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  {memberActionError}
                </p>
              )}

              {memberActionSuccess && (
                <p className="text-xs text-emerald-400 font-semibold p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  {memberActionSuccess}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Confirmar Inclusão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Interesse Voluntário */}
      {volunteerInterestDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">
              Interesse Registrado!
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Recebemos seu desejo de servir no <strong>{volunteerInterestDept}</strong> da {churchSettings.name}. A liderança entrará em contato para o acolhimento e integração.
            </p>
            <button
              onClick={() => setVolunteerInterestDept(null)}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
