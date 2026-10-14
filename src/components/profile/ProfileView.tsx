import React, { useState, useRef } from 'react';
import { useChurch, APP_THEMES } from '../../context/ChurchContext';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { UserAvatar } from '../common/UserAvatar';
import { getDisplayRole, validateImageFile } from '../../services/permissionSecurityService';
import {
  User,
  Shield,
  BookOpen,
  Calendar,
  Lock,
  Download,
  Edit2,
  Baby,
  FileText,
  Users,
  CheckCircle2,
  LogOut,
  ArrowRight,
  Camera,
  Trash2,
  Upload,
  X,
  Check,
  AlertCircle,
  Palette
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    churchSettings,
    events,
    sermonNotes,
    openQrModal,
    setActiveTab,
    departmentMemberships,
    endDepartmentMembership,
    updateUserAvatar,
    removeUserAvatar,
    appTheme,
    setAppTheme
  } = useChurch();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address || '');

  // Add child to family
  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [childName, setChildName] = useState('');
  const [childBirth, setChildBirth] = useState('');

  // Vínculos deste usuário
  const myMemberships = departmentMemberships.filter(
    (m) => m.userId === currentUser.id && m.status === 'ATIVO'
  );

  // Avatar upload and management
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarFileDetails, setAvatarFileDetails] = useState<{ name: string; sizeKb: number; type: string } | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      setAvatarError(validation.error || 'Arquivo inválido.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarFileDetails({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
      type: file.type || 'image/png'
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setAvatarError('Erro ao ler a imagem selecionada.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview) return;
    setIsSavingAvatar(true);
    setAvatarError(null);
    try {
      const res = await updateUserAvatar(currentUser.id, avatarPreview);
      if (res.success) {
        setAvatarPreview(null);
        setAvatarFileDetails(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setAvatarError(res.error || 'Erro ao atualizar foto de perfil.');
      }
    } catch {
      setAvatarError('Erro de conexão ao salvar foto.');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarPreview(null);
    setAvatarFileDetails(null);
    setAvatarError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (
      window.confirm(
        'Deseja remover sua foto de perfil?\n\nO aplicativo passará a exibir o avatar padrão da congregação no seu perfil e cabeçalho.'
      )
    ) {
      setIsSavingAvatar(true);
      await removeUserAvatar(currentUser.id);
      setIsSavingAvatar(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name,
      phone,
      address
    });
    setIsEditing(false);
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;

    const newMember = {
      id: `fam-${Date.now()}`,
      name: childName.trim(),
      relationship: 'Filho' as const,
      birthDate: childBirth || '01/01/2020',
      isKidsMinistryCheckedIn: false,
      securityPin: `KIDS-${Math.floor(1000 + Math.random() * 9000)}`,
      parentAuthorized: true
    };

    updateCurrentUserProfile({
      familyMembers: [...(currentUser.familyMembers || []), newMember]
    });

    setChildName('');
    setChildBirth('');
    setIsAddingFamily(false);
  };

  const handleOpenMemberQr = () => {
    openQrModal(
      `Carteirinha: ${currentUser.name}`,
      `IGEAD-MEMBRO-${currentUser.membershipId}`,
      `Matrícula: ${currentUser.membershipId} · ${churchSettings.name}`,
      'membership'
    );
  };

  const handleLeaveDepartment = (membershipId: string, deptName: string) => {
    if (
      window.confirm(
        `Deseja sair do ${deptName}?\n\nImportante: Seu vínculo com este grupo será encerrado, mas sua conta na igreja e seus outros grupos permanecerão ativos.`
      )
    ) {
      endDepartmentMembership(membershipId);
    }
  };

  const canAccessAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'pastor' ||
    myMemberships.some((m) => m.role === 'LÍDER');

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-fade-in">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* 0. Modal / Caixa de Pré-Visualização da Foto de Perfil */}
      {avatarPreview && (
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl space-y-4 animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Pré-visualização da Nova Foto de Perfil</h3>
            </div>
            <button
              onClick={handleCancelAvatar}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <div className="relative">
              <img
                src={avatarPreview}
                alt="Pré-visualização"
                className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider">
                Nova
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 text-center sm:text-left flex-1">
              <p className="font-semibold text-white">
                Verifique se o enquadramento e a nitidez estão adequados:
              </p>
              {avatarFileDetails && (
                <div className="inline-flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {avatarFileDetails.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                    {avatarFileDetails.sizeKb} KB
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase">
                    {avatarFileDetails.type.replace('image/', '')}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-slate-400 pt-1">
                Formatos suportados: PNG, JPG e WEBP (até 5 MB). A nova foto será exibida no cabeçalho, carteirinha e nos chats oficiais.
              </p>
            </div>
          </div>

          {avatarError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{avatarError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancelAvatar}
              disabled={isSavingAvatar}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSavingAvatar}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingAvatar ? 'Salvando Foto...' : 'Salvar e Publicar Foto'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Carteirinha Digital de Membro Oficial IGEAD-MT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-amber-950/60 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar & Photo Action Buttons */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative group">
                <UserAvatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="2xl"
                  rounded="2xl"
                  className="shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar foto de perfil"
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-xs cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-bold mt-1">Alterar</span>
                </button>
              </div>

              {/* Botões explícitos para dispositivos móveis ou toque */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  title="Enviar nova foto do dispositivo"
                >
                  <Camera className="w-3 h-3" />
                  <span>Foto</span>
                </button>

                {currentUser.avatar && currentUser.avatar.trim() !== '' && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 font-medium text-[10px] transition-colors"
                    title="Remover foto e usar avatar padrão"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Carteirinha Digital Oficial
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-amber-400/20 text-amber-300 uppercase">
                  {getDisplayRole(currentUser)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentUser.name}
              </h2>
              <p className="text-xs text-amber-300 font-semibold">
                {churchSettings.name} — {churchSettings.acronym}
              </p>
              <p className="text-xs text-slate-300">
                Matrícula: <span className="font-mono font-semibold text-white">{currentUser.membershipId}</span>
              </p>
              <p className="text-xs text-slate-400">
                {churchSettings.address}, {churchSettings.neighborhood}, {churchSettings.cityState}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center gap-2 shrink-0">
            <button
              onClick={handleOpenMemberQr}
              className="p-3 bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform"
              title="Clique para expandir QR Code"
            >
              <QrCodeSvg
                value={`IGEAD-${currentUser.membershipId}`}
                size={80}
              />
            </button>
            <span className="text-[10px] font-mono text-amber-400">
              Toque para expandir
            </span>
          </div>
        </div>
      </div>

      {/* Admin Panel Quick Entry if privileged */}
      {canAccessAdmin && (
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">
                Painel de Gestão & Liderança IGEAD-MT
              </h4>
              <p className="text-[11px] text-slate-400">
                Acesse a administração de departamentos, escalas técnicas e trilha de auditoria.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shrink-0"
          >
            Abrir Painel
          </button>
        </div>
      )}

      {/* 2. Meus Vínculos Departamentais Independentes */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Meus Departamentos & Vínculos Ativos</span>
            </h3>
            <p className="text-xs text-slate-400">
              Vínculos independentes: você pode liderar um grupo e ser membro de outros simultaneamente.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('departamentos')}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myMemberships.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            Você ainda não possui vínculos ativos em nenhum dos 5 departamentos oficiais.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myMemberships.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">
                      {m.departmentName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        m.role === 'LÍDER'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.role === 'LÍDER' ? '★ Líder Oficial' : 'Membro'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Entrada no grupo: {m.joinedAt}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Vínculo Ativo & Acesso ao Chat
                  </p>
                </div>

                <button
                  onClick={() => handleLeaveDepartment(m.id, m.departmentName)}
                  title="Sair deste departamento"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 text-xs shrink-0 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Meus Dados Pessoais */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Dados Cadastrais</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar Dados
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Telefone:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Endereço:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
            >
              Salvar Alterações
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block">E-mail:</span>
              <span className="font-semibold text-white">{currentUser.email}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block">Telefone:</span>
              <span className="font-semibold text-white">{currentUser.phone}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 sm:col-span-2">
              <span className="text-slate-500 block">Endereço:</span>
              <span className="font-semibold text-white">
                {currentUser.address || churchSettings.address}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Núcleo Familiar & Check-in do Grupo de Crianças */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Núcleo Familiar & Filhos</h3>
            <p className="text-xs text-slate-400">
              Cadastro dos filhos para autorização e PIN de segurança no Grupo de Crianças
            </p>
          </div>
          <button
            onClick={() => setIsAddingFamily(!isAddingFamily)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            + Adicionar Filho(a)
          </button>
        </div>

        {isAddingFamily && (
          <form
            onSubmit={handleAddFamilyMember}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4 space-y-3"
          >
            <h4 className="text-xs font-bold text-white">Cadastrar Novo Filho(a)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome da Criança"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Data de Nascimento (DD/MM/AAAA)"
                value={childBirth}
                onChange={(e) => setChildBirth(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Salvar Cadastro Infantil
            </button>
          </form>
        )}

        <div className="space-y-3">
          {currentUser.familyMembers?.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{member.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {member.relationship} · Nasc: {member.birthDate}
                  </p>
                </div>
              </div>

              {member.securityPin && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    PIN Kids Seguro
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    {member.securityPin}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Minhas Anotações de Sermão Salvas */}
      {sermonNotes.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Minhas Anotações do Culto
            </h3>
            <span className="text-xs text-slate-400">{sermonNotes.length} anotações</span>
          </div>

          <div className="space-y-2">
            {sermonNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{note.theme}</h4>
                  <span className="text-slate-500 font-mono text-[11px]">{note.serviceDate}</span>
                </div>
                <p className="text-amber-400">
                  Pregador: {note.preacher} · Texto: {note.mainScripture}
                </p>
                {note.personalNotes && (
                  <p className="text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    {note.personalNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aparência */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          Aparência do Aplicativo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="radiogroup" aria-label="Tema do aplicativo">
          {APP_THEMES.map((theme) => {
            const selected = appTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setAppTheme(theme.id)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  selected
                    ? 'border-amber-400 bg-slate-800'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-10 h-10 shrink-0 rounded-xl border border-white/10 flex items-end justify-end p-1"
                  style={{ background: `linear-gradient(135deg, ${theme.swatches[0]} 50%, ${theme.swatches[1]} 50%)` }}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ background: theme.swatches[2] }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-white">{theme.name}</span>
                  <span className="block text-xs text-slate-400">{theme.description}</span>
                </span>
                {selected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. LGPD & Privacidade */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-400">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          Proteção de Dados & LGPD na IGEAD-MT
        </h3>
        <p className="leading-relaxed">
          Seus dados e de seus filhos são protegidos conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), sendo utilizados estritamente para o cuidado pastoral, segurança dos menores e comunhão eclesiástica na {churchSettings.name}.
        </p>
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(currentUser, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `dados_${currentUser.name.replace(/\s+/g, '_')}_igead.json`;
              a.click();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Meus Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
};
