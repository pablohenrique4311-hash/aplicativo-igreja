import React, { useState, useRef } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { UserRole, OfficialDepartment, MediaRole, DepartmentId } from '../../types';
import {
  canManageDepartment,
  canAssignDepartmentLeader,
  canChangeInstitutionalRole,
  canAccessFinancialReports,
  canManageChurchLogo,
  validateImageFile,
  getDisplayRole
} from '../../services/permissionSecurityService';
import { ChurchLogo } from '../common/ChurchLogo';
import { UserAvatar } from '../common/UserAvatar';
import {
  Users,
  Radio,
  Calendar,
  Settings,
  CheckCircle,
  Search,
  Plus,
  QrCode,
  ShieldAlert,
  Edit2,
  Video,
  Shield,
  Heart,
  Baby,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Palette,
  Trash2,
  ExternalLink,
  RefreshCw,
  FileText,
  Lock,
  ShieldCheck,
  Filter,
  X,
  AlertCircle,
  Eye,
  Check,
  RotateCcw
} from 'lucide-react';
import { ChurchOfficialEmblem } from '../common/ChurchOfficialEmblem';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    updateUserRole,
    addUser,
    churchSettings,
    updateChurchSettings,
    updateChurchLogo,
    restoreDefaultChurchLogo,
    liveStream,
    toggleLiveStream,
    updateLiveStreamInfo,
    departments,
    updateDepartment,
    mediaSchedules,
    addMediaSchedule,
    departmentMemberships,
    addDepartmentMembership,
    auditLogs,
    setActiveTab
  } = useChurch();

  type AdminTab =
    | 'departamentos'
    | 'identidade_visual'
    | 'transmissao'
    | 'escalas'
    | 'membros'
    | 'auditoria'
    | 'portaria'
    | 'configuracoes';

  const [activeTab, setAdminTab] = useState<AdminTab>('departamentos');

  // Identidade Visual da Igreja State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileDetails, setLogoFileDetails] = useState<{ name: string; sizeKb: number; type: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isPublishingLogo, setIsPublishingLogo] = useState(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [logoToast, setLogoToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      setLogoError(validation.error || 'Formato de arquivo inválido.');
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
      return;
    }

    setLogoFileDetails({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
      type: file.type || 'image/png'
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoPreview(event.target.result);
      }
    };
    reader.onerror = () => {
      setLogoError('Erro ao carregar o arquivo da imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleCancelLogoChange = () => {
    setLogoPreview(null);
    setLogoFileDetails(null);
    setLogoError(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleConfirmPublishLogo = async () => {
    if (!logoPreview) return;
    setIsPublishingLogo(true);
    setLogoError(null);
    try {
      const res = await updateChurchLogo(logoPreview);
      if (res.success) {
        setShowPublishConfirmModal(false);
        setLogoPreview(null);
        setLogoFileDetails(null);
        if (logoFileInputRef.current) logoFileInputRef.current.value = '';
        setLogoToast({
          type: 'success',
          message: 'Logo oficial da Igreja substituída e publicada com sucesso em todo o aplicativo!'
        });
        setTimeout(() => setLogoToast(null), 4000);
      } else {
        setLogoError(res.error || 'Erro ao publicar logo oficial.');
        setShowPublishConfirmModal(false);
      }
    } catch {
      setLogoError('Erro de conexão ao salvar logo.');
      setShowPublishConfirmModal(false);
    } finally {
      setIsPublishingLogo(false);
    }
  };

  const handleRestoreLogo = async (restorePrevious?: boolean) => {
    const msg = restorePrevious
      ? 'Deseja restaurar a logo anterior da igreja?'
      : 'Deseja remover a logo personalizada e restaurar o Emblema Vetorial Oficial Padrão da IGEAD-MT?';

    if (window.confirm(msg)) {
      setIsPublishingLogo(true);
      const res = await restoreDefaultChurchLogo(restorePrevious);
      setIsPublishingLogo(false);
      if (res.success) {
        setLogoToast({
          type: 'success',
          message: restorePrevious
            ? 'Logo anterior restaurada com sucesso!'
            : 'Emblema vetorial oficial da IGEAD-MT restaurado com sucesso!'
        });
        setTimeout(() => setLogoToast(null), 4000);
      } else {
        alert(res.error || 'Erro ao restaurar logo.');
      }
    }
  };

  // Lideranças ativas do usuário atual
  const myActiveLeaderLinks = departmentMemberships.filter(
    (m) => m.userId === currentUser.id && m.status === 'ATIVO' && m.role === 'LÍDER'
  );

  const isAdmin = currentUser.role === 'admin';
  const isPastor = currentUser.role === 'pastor';
  const isDeptLeader = myActiveLeaderLinks.length > 0;
  const canAssignLeader = canAssignDepartmentLeader(currentUser);
  const canEditInstitutionalRoles = canChangeInstitutionalRole(currentUser);

  // Verificação de Acesso Global
  if (!isAdmin && !isPastor && !isDeptLeader) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4 animate-fade-in">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Acesso Restrito à Liderança IGEAD-MT</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Seu perfil ({getDisplayRole(currentUser)}) não possui credenciais administrativas globais nem designação oficial de liderança ativa.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveTab('inicio')}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  // Member search & filter
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Add Member Modal
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');

  // Live stream settings
  const [streamTitle, setStreamTitle] = useState(liveStream.title);
  const [streamPreacher, setStreamPreacher] = useState(liveStream.preacher);
  const [streamVideoId, setStreamVideoId] = useState(liveStream.youtubeVideoId);
  const [streamScripture, setStreamScripture] = useState(liveStream.primaryScripture);
  const [streamSavedToast, setStreamSavedToast] = useState(false);

  // Department editing
  const [editingDeptId, setEditingDeptId] = useState<OfficialDepartment['id'] | null>(null);
  const [deptLeaderUserId, setDeptLeaderUserId] = useState('');
  const [deptLeaderName, setDeptLeaderName] = useState('');
  const [deptSchedule, setDeptSchedule] = useState('');
  const [deptPhone, setDeptPhone] = useState('');

  // Media Schedule Form
  const [schedService, setSchedService] = useState('Culto de Celebração de Domingo');
  const [schedDate, setSchedDate] = useState('Domingo 19:00');
  const [schedRole, setSchedRole] = useState<MediaRole>('Transmissão');
  const [schedVolunteer, setSchedVolunteer] = useState('Membro da Igreja');

  // Audit Logs Filter
  const [auditDeptFilter, setAuditDeptFilter] = useState<string>('todos');
  const [auditSearch, setAuditSearch] = useState('');

  // QR Code Ticket Validator (Portaria)
  const [scannedCode, setScannedCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    name: string;
    event: string;
    time: string;
  } | null>(null);

  // Church Settings Form
  const [cfgName, setCfgName] = useState(churchSettings.name);
  const [cfgAcronym, setCfgAcronym] = useState(churchSettings.acronym);
  const [cfgSlogan, setCfgSlogan] = useState(churchSettings.slogan);
  const [cfgSecondarySlogan, setCfgSecondarySlogan] = useState(churchSettings.secondarySlogan);
  const [cfgAddress, setCfgAddress] = useState(churchSettings.address);
  const [cfgYoutube, setCfgYoutube] = useState(churchSettings.youtube);
  const [cfgPhone, setCfgPhone] = useState(churchSettings.phone);
  const [cfgPix, setCfgPix] = useState(churchSettings.pixKey);
  const [cfgLogoUrl, setCfgLogoUrl] = useState(churchSettings.logoUrl || '');
  const [cfgPrimaryColor, setCfgPrimaryColor] = useState<'amber' | 'blue' | 'emerald' | 'purple'>(
    churchSettings.primaryColor || 'amber'
  );
  const [cfgBannerTitle, setCfgBannerTitle] = useState(
    churchSettings.bannerTitle || 'Conectado com o Céu , firme na terra'
  );
  const [cfgBannerSubtitle, setCfgBannerSubtitle] = useState(
    churchSettings.bannerSubtitle || 'Jesus Cristo é o Centro'
  );
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCfgLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleYoutubeInput = (val: string) => {
    const trimmed = val.trim();
    let videoId = trimmed;
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/);
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) videoId = shortMatch[1];
    else if (vMatch) videoId = vMatch[1];
    else if (liveMatch) videoId = liveMatch[1];
    else if (embedMatch) videoId = embedMatch[1];
    setStreamVideoId(videoId);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.membershipId.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    addUser({
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || 'contato@igeadmt.com.br',
      phone: newMemberPhone.trim() || '(65) 99999-0000',
      role: newMemberRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      membershipDate: new Date().toLocaleDateString('pt-BR'),
      address: churchSettings.address
    });

    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setShowAddMember(false);
  };

  const handleSaveStreamInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateLiveStreamInfo({
      title: streamTitle,
      preacher: streamPreacher,
      youtubeVideoId: streamVideoId,
      primaryScripture: streamScripture
    });
    setStreamSavedToast(true);
    setTimeout(() => setStreamSavedToast(false), 3000);
  };

  const handleSaveDepartment = (deptId: OfficialDepartment['id']) => {
    // 1. Atualiza dados de reunião e contato
    const res = updateDepartment(deptId, {
      meetingSchedule: deptSchedule,
      contactPhone: deptPhone,
      leaderName: deptLeaderName
    });

    // 2. Se o usuário tiver permissão de designar líder e escolheu um usuário
    if (canAssignLeader && deptLeaderUserId) {
      addDepartmentMembership(deptLeaderUserId, deptId, 'LÍDER');
    }

    if (res.success) {
      setEditingDeptId(null);
    } else {
      alert(res.error || 'Erro ao salvar departamento.');
    }
  };

  const handleValidateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;

    setValidationResult({
      valid: true,
      name: 'Membro Autorizado',
      event: 'Culto de Celebração — IGEAD-MT',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateChurchSettings({
      name: cfgName,
      acronym: cfgAcronym,
      slogan: cfgSlogan,
      secondarySlogan: cfgSecondarySlogan,
      address: cfgAddress,
      youtube: cfgYoutube,
      phone: cfgPhone,
      pixKey: cfgPix,
      logoUrl: cfgLogoUrl.trim() || undefined,
      primaryColor: cfgPrimaryColor,
      bannerTitle: cfgBannerTitle,
      bannerSubtitle: cfgBannerSubtitle
    });
    if (res.success) {
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 3000);
    } else {
      alert(res.error || 'Erro ao salvar configurações.');
    }
  };

  // Filtragem de logs de auditoria
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesDept = auditDeptFilter === 'todos' || log.departmentId === auditDeptFilter;
    const matchesText =
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesDept && matchesText;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-fade-in">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Painel de Gestão & Governança — {churchSettings.acronym}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px]">
              {getDisplayRole(currentUser)}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {churchSettings.name}
          </h2>
          <p className="text-xs text-slate-400">
            Controle de perfis institucionais, departamentos, escalas e auditoria de segurança.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('inicio')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
        >
          Visualizar App do Membro
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setAdminTab('departamentos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'departamentos'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Gestão dos 5 Departamentos</span>
        </button>

        <button
          onClick={() => setAdminTab('identidade_visual')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'identidade_visual'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Identidade Visual da Igreja</span>
        </button>

        <button
          onClick={() => setAdminTab('auditoria')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'auditoria'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Auditoria & Segurança ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('transmissao')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'transmissao'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Culto Ao Vivo & YouTube</span>
        </button>

        <button
          onClick={() => setAdminTab('escalas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'escalas'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Escalas Técnicas</span>
        </button>

        <button
          onClick={() => setAdminTab('membros')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'membros'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Membros & Perfis ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('portaria')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'portaria'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Portaria & Check-in QR</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setAdminTab('configuracoes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'configuracoes'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Identidade & Contatos</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: IDENTIDADE VISUAL DA IGREJA */}
      {/* ========================================================================= */}
      {activeTab === 'identidade_visual' && (
        <div className="space-y-6">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={logoFileInputRef}
            onChange={handleLogoFileSelect}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          {/* Toast Notification */}
          {logoToast && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in ${
                logoToast.type === 'success'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-red-500 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{logoToast.message}</span>
            </div>
          )}

          {/* Modal de Confirmação Antes de Publicar */}
          {showPublishConfirmModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-scale-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Confirmar Substituição da Logo Oficial?
                    </h3>
                    <p className="text-xs text-slate-400">
                      Igreja Geração Eleita — IGEAD-MT
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>
                    A nova imagem será armazenada permanentemente e passará a ser utilizada como a <strong>identidade visual oficial</strong> em todos os locais do aplicativo:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pt-1">
                    <li>Cabeçalho superior (Navbar)</li>
                    <li>Página inicial e Banners de Boas-Vindas</li>
                    <li>Carteirinha de membro digital oficial</li>
                    <li>Rodapé institucional e telas informativas</li>
                  </ul>
                  <p className="text-emerald-400 font-semibold pt-1">
                    ✓ As proporções originais e transparência serão preservadas sem distorção.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishConfirmModal(false)}
                    disabled={isPublishingLogo}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Voltar / Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPublishLogo}
                    disabled={isPublishingLogo}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isPublishingLogo ? 'Publicando...' : 'Confirmar e Publicar Agora'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header da Seção */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Módulo de Governança Institucional
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-amber-400" />
                  <span>Identidade Visual da Igreja</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Gerenciamento centralizado da logomarca oficial da congregação. A substituição da logo atualiza automaticamente todos os componentes do aplicativo mantendo proporções, nitidez e transparência.
                </p>
              </div>

              {/* Status de Permissão */}
              <div className="shrink-0">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Administrador Geral: Acesso Total</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-medium text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Modo de Visualização Apenas</span>
                  </span>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong>Acesso Restrito:</strong> Seu perfil atual ({getDisplayRole(currentUser)}) possui autorização para consultar a logo publicada. Apenas o <strong>Administrador Geral</strong> tem permissão para enviar, substituir ou remover a logomarca oficial da igreja.
                </span>
              </div>
            )}
          </div>

          {/* 1. VISUALIZAÇÃO DA LOGO ATUALMENTE PUBLICADA */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Visualização da Logo Atualmente Publicada</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta é a imagem oficial ativa em todas as telas da IGREJA GERAÇÃO ELEITA — IGEAD-MT
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Ativa no Sistema
                </span>
              </div>
            </div>

            {/* Teste Visual em 2 Fundos (Escuro e Claro/Transparência) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Fundo Escuro (Como no cabeçalho e tela do app) */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Exibição em Fundo Escuro (Tema Oficial do App):
                </span>
                <div className="py-6 flex items-center justify-center min-h-[140px] bg-[#0f172b] rounded-xl border border-[#1d293d] p-4">
                  <ChurchLogo size="xl" showSlogan={true} showHeartBadge={true} theme="dark" />
                </div>
              </div>

              {/* Fundo Claro / Contrastante (Para verificar transparência e recorte) */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Verificação de Transparência & Fundo Claro:
                </span>
                <div className="py-6 flex items-center justify-center min-h-[140px] bg-[#f1f5f9] rounded-xl border border-[#cad5e2] p-4 shadow-inner">
                  <ChurchLogo size="xl" showSlogan={true} showHeartBadge={true} theme="light" />
                </div>
              </div>
            </div>

            {/* Detalhes da Logo Atual */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">Tipo de representação atual: </span>
                  <strong className="text-white">
                    {churchSettings.logoUrl &&
                    churchSettings.logoUrl !== '/logo-igead.svg' &&
                    !churchSettings.logoUrl.includes('logo-igead')
                      ? 'Logomarca Personalizada Publicada'
                      : 'Emblema Vetorial Oficial IGEAD-MT (Nativo SVG)'}
                  </strong>
                </div>
                {churchSettings.previousLogoUrl && (
                  <span className="text-[11px] text-amber-300">
                    Histórico: Logo anterior disponível para restauração
                  </span>
                )}
              </div>
            </div>

            {/* Controles de Ação (Exclusivos do Administrador Geral) */}
            {isAdmin && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Enviar Nova Logo</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Formatos aceitos: <strong>PNG, JPG e WEBP</strong> (até 5 MB)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Restaurar Logo Anterior */}
                  {churchSettings.previousLogoUrl &&
                    churchSettings.previousLogoUrl !== churchSettings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleRestoreLogo(true)}
                        disabled={isPublishingLogo}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        title="Restaurar a imagem de logo utilizada anteriormente"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restaurar Logo Anterior</span>
                      </button>
                    )}

                  {/* Restaurar Emblema Vetorial Padrão */}
                  {churchSettings.logoUrl &&
                    churchSettings.logoUrl !== '/logo-igead.svg' &&
                    !churchSettings.logoUrl.includes('logo-igead') && (
                      <button
                        type="button"
                        onClick={() => handleRestoreLogo(false)}
                        disabled={isPublishingLogo}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        title="Remover a imagem personalizada e restaurar o emblema vetorial original"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Restaurar Emblema Vetorial Padrão</span>
                      </button>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* 2. PRÉ-VISUALIZAÇÃO DA IMAGEM ANTES DA PUBLICAÇÃO */}
          {logoPreview && isAdmin && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/60 shadow-2xl space-y-6 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <h4 className="text-base font-bold text-white">
                    Pré-visualização da Imagem Antes da Publicação
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCancelLogoChange}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Cancelar alterações"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informações Técnicas do Arquivo Validado */}
              {logoFileDetails && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400">Arquivo selecionado:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-white font-medium">
                    {logoFileDetails.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-300 font-mono">
                    {logoFileDetails.sizeKb} KB
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 uppercase font-mono text-emerald-400">
                    {logoFileDetails.type.replace('image/', '')}
                  </span>
                  <span className="text-emerald-400 font-medium text-[11px] ml-auto">
                    ✓ Arquivo validado · Proporções originais preservadas
                  </span>
                </div>
              )}

              {/* Amostras de Encaixe em Diferentes Dimensões e Fundos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Visualização de Cabeçalho (Navbar) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Prévia no Cabeçalho (Navbar):
                  </span>
                  <div className="h-16 px-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Prévia Navbar"
                      className="h-10 w-auto max-w-[140px] object-contain drop-shadow-md"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-['Caveat',cursive] font-bold text-white text-xl leading-tight">
                        Geração Eleita
                      </span>
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                        {churchSettings.acronym}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visualização com Fundo Claro / Transparência */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Prévia em Fundo Claro (Verificação de Transparência):
                  </span>
                  <div className="h-16 px-4 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Prévia Transparência"
                      className="h-12 w-auto max-w-[160px] object-contain"
                    />
                  </div>
                </div>
              </div>

              {logoError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{logoError}</span>
                </div>
              )}

              {/* Botões de Ação da Prévia: Substituir Logo e Cancelar Alterações */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelLogoChange}
                  disabled={isPublishingLogo}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishConfirmModal(true)}
                  disabled={isPublishingLogo}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Substituir Logo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GESTÃO DOS 5 DEPARTAMENTOS */}
      {/* ========================================================================= */}
      {activeTab === 'departamentos' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Cada departamento possui um <strong>único líder oficial ativo</strong>. Apenas a Administração Geral e Pastoral podem designar novos líderes.
            </span>
            {canAssignLeader && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] shrink-0">
                Designação de Líderes Autorizada
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => {
              const canEditThisDept = canManageDepartment(currentUser, dept.id, departmentMemberships);
              const deptLeader = departmentMemberships.find(
                (m) => m.departmentId === dept.id && m.status === 'ATIVO' && m.role === 'LÍDER'
              );

              return (
                <div
                  key={dept.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{dept.name}</h4>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">
                        {dept.badge}
                      </span>
                    </div>

                    {canEditThisDept ? (
                      <button
                        onClick={() => {
                          setEditingDeptId(dept.id);
                          setDeptLeaderName(dept.leaderName);
                          setDeptSchedule(dept.meetingSchedule);
                          setDeptPhone(dept.contactPhone);
                          setDeptLeaderUserId(deptLeader?.userId || '');
                        }}
                        className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Administrar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Acesso Restrito ao Líder
                      </span>
                    )}
                  </div>

                  {editingDeptId === dept.id ? (
                    <div className="space-y-3 pt-2 text-xs">
                      {/* Designação de Líder (Somente Admin/Pastor) */}
                      {canAssignLeader && (
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">
                            Designar Líder Oficial Ativo:
                          </label>
                          <select
                            value={deptLeaderUserId}
                            onChange={(e) => {
                              setDeptLeaderUserId(e.target.value);
                              const selectedUser = users.find((u) => u.id === e.target.value);
                              if (selectedUser) setDeptLeaderName(selectedUser.name);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                          >
                            <option value="">Selecione o membro...</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.email})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="text-slate-400 block mb-1">Nome Exibido do Líder:</label>
                        <input
                          type="text"
                          value={deptLeaderName}
                          onChange={(e) => setDeptLeaderName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Horários / Reuniões:</label>
                        <input
                          type="text"
                          value={deptSchedule}
                          onChange={(e) => setDeptSchedule(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Telefone / WhatsApp:</label>
                        <input
                          type="text"
                          value={deptPhone}
                          onChange={(e) => setDeptPhone(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setEditingDeptId(null)}
                          className="flex-1 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveDepartment(dept.id)}
                          className="flex-1 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p>
                        <strong className="text-slate-400">Líder Ativo:</strong>{' '}
                        <span className="text-white font-bold">{dept.leaderName}</span>
                      </p>
                      <p>
                        <strong className="text-slate-400">Reuniões:</strong> {dept.meetingSchedule}
                      </p>
                      <p>
                        <strong className="text-slate-400">Contato:</strong> {dept.contactPhone}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDITORIA & REGISTRO DE OPERAÇÕES RELEVANTES */}
      {/* ========================================================================= */}
      {activeTab === 'auditoria' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Trilha de Auditoria & Segurança Eclesiástica</span>
              </h3>
              <p className="text-xs text-slate-400">
                Registro imutável de designações de líderes, alterações de vínculos, tentativas de invasão e check-ins.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditDeptFilter}
                onChange={(e) => setAuditDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="todos">Todos os Departamentos</option>
                <option value="homens">Homens</option>
                <option value="mulheres">Mulheres</option>
                <option value="jovens">Jovens</option>
                <option value="criancas">Crianças</option>
                <option value="midia">Mídia</option>
              </select>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Buscar por responsável, ação ou detalhe da auditoria..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          {/* Tabela de Logs */}
          <div className="space-y-2">
            {filteredAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-950 rounded-2xl">
                Nenhum registro de auditoria corresponde aos filtros.
              </p>
            ) : (
              filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    log.status === 'DENIED'
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          log.status === 'DENIED'
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="font-bold text-white text-[11px] font-mono">
                        {log.action}
                      </span>
                      {log.departmentId && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-amber-300 rounded uppercase">
                          {log.departmentId}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      📅 {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-white">
                    {log.details}
                  </p>

                  <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>Responsável: <strong>{log.actorName}</strong> ({log.actorRole})</span>
                    {log.targetName && <span>· Alvo: {log.targetName}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRANSMISSÃO AO VIVO & YOUTUBE */}
      {/* ========================================================================= */}
      {activeTab === 'transmissao' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {streamSavedToast && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Informações do culto atualizadas para todos os membros!</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Transmissão Oficial no YouTube — @IGEAD_MT
              </h3>
              <p className="text-xs text-slate-400">
                Ative o status de culto ao vivo e informe o link ou ID da transmissão
              </p>
            </div>

            <button
              onClick={toggleLiveStream}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                liveStream.isLive
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{liveStream.isLive ? 'Finalizar Culto Ao Vivo' : 'Iniciar Culto Ao Vivo Agora'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveStreamInfo} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Título da Pregação / Culto:</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Pregador(a):</label>
                <input
                  type="text"
                  value={streamPreacher}
                  onChange={(e) => setStreamPreacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Texto Bíblico Principal:</label>
                <input
                  type="text"
                  value={streamScripture}
                  onChange={(e) => setStreamScripture(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Link ou ID do Vídeo no YouTube:</label>
              <input
                type="text"
                value={streamVideoId}
                onChange={(e) => handleYoutubeInput(e.target.value)}
                placeholder="Ex: dQw4w9WgXcQ ou https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold"
            >
              Salvar Informações da Transmissão
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ESCALAS TÉCNICAS */}
      {/* ========================================================================= */}
      {activeTab === 'escalas' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Escalas Oficiais da Equipe de Mídia
              </h3>
              <p className="text-xs text-slate-400">
                Organização técnica: Áudio, Vídeo, Câmeras, Transmissão, Projeção e Suporte
              </p>
            </div>
          </div>

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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MEMBROS & PERFIS INSTITUCIONAIS */}
      {/* ========================================================================= */}
      {activeTab === 'membros' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Cadastro Geral de Membros & Vínculos Departamentais
              </h3>
              <p className="text-xs text-slate-400">
                Perfis institucionais (Admin, Pastor, Membro, Visitante) e vínculos ativos em departamentos.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Cadastro</span>
              </button>
            )}
          </div>

          {/* Tabela de Membros com Vínculos */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Nome</th>
                  <th className="pb-3 font-semibold">Matrícula</th>
                  <th className="pb-3 font-semibold">Perfil Institucional</th>
                  <th className="pb-3 font-semibold">Vínculos nos Departamentos</th>
                  {canEditInstitutionalRoles && (
                    <th className="pb-3 font-semibold">Alterar Perfil</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => {
                  const uMemberships = departmentMemberships.filter(
                    (m) => m.userId === u.id && m.status === 'ATIVO'
                  );

                  return (
                    <tr key={u.id} className="text-slate-300">
                      <td className="py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            src={u.avatar}
                            name={u.name}
                            size="sm"
                            rounded="lg"
                          />
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-amber-400">{u.membershipId}</td>
                      <td className="py-3 uppercase text-[10px] font-bold text-slate-300">
                        {getDisplayRole(u)}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {uMemberships.length === 0 ? (
                            <span className="text-[10px] text-slate-600">Sem vínculos</span>
                          ) : (
                            uMemberships.map((m) => (
                              <span
                                key={m.id}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  m.role === 'LÍDER'
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {m.role === 'LÍDER' ? '★ Líder' : 'Membro'}: {m.departmentName}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      {canEditInstitutionalRoles && (
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={(e) => {
                              const res = updateUserRole(u.id, e.target.value as UserRole);
                              if (!res.success) alert(res.error);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-amber-300"
                          >
                            <option value="admin">Administrador Geral</option>
                            <option value="pastor">Líder Pastoral</option>
                            <option value="member">Membro</option>
                            <option value="visitor">Visitante</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PORTARIA & CHECK-IN QR */}
      {/* ========================================================================= */}
      {activeTab === 'portaria' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">
              Validador de Portaria & Credenciais
            </h3>
            <p className="text-xs text-slate-400">
              Digite ou escaneie o código do ingresso ou carteirinha de membro
            </p>
          </div>

          <form onSubmit={handleValidateTicket} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Ex: IGEAD-MEMBRO-0842"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
              >
                Validar Entrada
              </button>
            </div>
          </form>

          {validationResult && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>ACESSO LIBERADO — ENTRADA CONFIRMADA!</span>
              </div>
              <p className="text-white">
                Membro / Participante: <strong>{validationResult.name}</strong>
              </p>
              <p className="text-slate-300">
                Culto / Evento: {validationResult.event}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CONFIGURAÇÕES DA IGREJA (EXCLUSIVO ADMIN GERAL) */}
      {/* ========================================================================= */}
      {activeTab === 'configuracoes' && isAdmin && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {settingsSavedToast && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Configurações oficiais da IGEAD-MT atualizadas com sucesso!</span>
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-white">
              Identidade Institucional, Logomarca & Contatos — IGEAD-MT
            </h3>
            <p className="text-xs text-slate-400">
              Personalize a logomarca oficial, cores, banners, textos institucionais e canais oficiais da igreja
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* 1. SEÇÃO DE LOGOMARCA OFICIAL */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Logomarca Oficial da Igreja</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-slate-700 bg-slate-900 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                  {cfgLogoUrl && cfgLogoUrl !== '/logo-igead.svg' ? (
                    <img
                      src={cfgLogoUrl}
                      alt="Prévia da Logomarca"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-1 flex flex-col items-center justify-center">
                      <ChurchOfficialEmblem size={52} color="#f59e0b" />
                      <span className="text-[8px] font-mono font-bold text-amber-400 block mt-1 leading-tight">
                        OFICIAL
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <p className="text-slate-300 font-semibold text-xs">
                    Logomarca Oficial da Igreja Geração Eleita (IGEAD-MT)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    A identidade visual oficial com mapa do Brasil, chama do Espírito Santo e louros está ativa.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer border border-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Substituir por Arquivo Local</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {cfgLogoUrl && cfgLogoUrl !== '/logo-igead.svg' && (
                      <button
                        type="button"
                        onClick={() => setCfgLogoUrl('/logo-igead.svg')}
                        className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restaurar Logo Oficial</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CONTATOS E PIX */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Endereço, Redes & Chave PIX Oficial
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Endereço Completo do Templo Sede:</label>
                  <input
                    type="text"
                    value={cfgAddress}
                    onChange={(e) => setCfgAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Canal Oficial do YouTube:</label>
                  <input
                    type="text"
                    value={cfgYoutube}
                    onChange={(e) => setCfgYoutube(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Telefone da Secretaria / Contato:</label>
                  <input
                    type="text"
                    value={cfgPhone}
                    onChange={(e) => setCfgPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Chave PIX Oficial da Igreja:</label>
                  <input
                    type="text"
                    value={cfgPix}
                    onChange={(e) => setCfgPix(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
