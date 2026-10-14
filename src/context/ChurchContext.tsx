import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  ChurchSettings,
  LiveStreamData,
  OfficialDepartment,
  MediaScheduleItem,
  ChildRecord,
  EventItem,
  PrayerRequest,
  Contribution,
  PushNotification,
  SermonNoteEntry,
  DepartmentMembership,
  DepartmentChatMessage,
  AuditLogEntry,
  AuditActionType,
  DepartmentId,
  DepartmentRole
} from '../types';
import {
  UserVerseNote,
  UserVerseFavorite
} from '../data/bibleData';
import {
  INITIAL_CHURCH_SETTINGS,
  INITIAL_USERS,
  INITIAL_LIVE_STREAM,
  INITIAL_DEPARTMENTS,
  INITIAL_MEDIA_SCHEDULES,
  INITIAL_CHILD_RECORDS,
  INITIAL_EVENTS,
  INITIAL_PRAYERS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DEPARTMENT_MEMBERSHIPS,
  INITIAL_DEPARTMENT_CHATS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import {
  canManageDepartment,
  canAccessDepartmentInternalContent,
  canParticipateInChat,
  canAssignDepartmentLeader,
  canChangeInstitutionalRole,
  canAccessFinancialReports,
  canEndMembership,
  canManageChurchLogo,
  canUpdateUserAvatar,
  createAuditLog
} from '../services/permissionSecurityService';

export type AppTab =
  | 'inicio'
  | 'biblia'
  | 'departamentos'
  | 'agenda'
  | 'contribuir'
  | 'perfil'
  | 'admin';

interface BibleNavigationTarget {
  bookId: string;
  chapter: number;
  verse?: number;
}

interface QrModalData {
  isOpen: boolean;
  title: string;
  code: string;
  subtitle?: string;
  type?: 'ticket' | 'pix' | 'membership' | 'kids';
}

interface ChurchContextType {
  // Current user & Auth
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (roleOrUserId: string) => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;
  updateUserRole: (userId: string, role: UserRole) => { success: boolean; error?: string };
  addUser: (userData: Omit<User, 'id' | 'membershipId'>) => void;

  // Independent Department Memberships
  departmentMemberships: DepartmentMembership[];
  addDepartmentMembership: (
    userId: string,
    departmentId: DepartmentId,
    role?: DepartmentRole
  ) => { success: boolean; error?: string };
  endDepartmentMembership: (membershipId: string) => { success: boolean; error?: string };
  approveDepartmentMembership: (membershipId: string) => { success: boolean; error?: string };
  changeDepartmentMemberRole: (
    membershipId: string,
    newRole: DepartmentRole
  ) => { success: boolean; error?: string };

  // Independent Department Chats
  departmentChats: Record<DepartmentId, DepartmentChatMessage[]>;
  sendDepartmentChatMessage: (
    departmentId: DepartmentId,
    content: string
  ) => { success: boolean; error?: string };

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLogEntry: (
    action: AuditActionType,
    details: string,
    status?: 'SUCCESS' | 'DENIED',
    departmentId?: DepartmentId,
    targetId?: string,
    targetName?: string
  ) => void;

  // Navigation & View
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isPhonePreview: boolean;
  setIsPhonePreview: (val: boolean) => void;

  // Church Settings & Identity
  churchSettings: ChurchSettings;
  updateChurchSettings: (settings: Partial<ChurchSettings>) => { success: boolean; error?: string };
  updateChurchLogo: (logoDataUrl: string) => Promise<{ success: boolean; error?: string }>;
  restoreDefaultChurchLogo: (restorePrevious?: boolean) => Promise<{ success: boolean; error?: string }>;

  // User Avatar Management
  updateUserAvatar: (userId: string, avatarDataUrl: string) => Promise<{ success: boolean; error?: string }>;
  removeUserAvatar: (userId: string) => Promise<{ success: boolean; error?: string }>;

  // Live Stream
  liveStream: LiveStreamData;
  setLiveStream: React.Dispatch<React.SetStateAction<LiveStreamData>>;
  toggleLiveStream: () => void;
  updateLiveStreamInfo: (data: Partial<LiveStreamData>) => void;

  // Sermon Notes
  sermonNotes: SermonNoteEntry[];
  saveSermonNote: (note: Omit<SermonNoteEntry, 'id' | 'serviceDate'>) => void;

  // Digital Bible Integration
  bibleTarget: BibleNavigationTarget | null;
  openBibleAt: (bookId: string, chapter: number, verse?: number) => void;
  userVerseNotes: UserVerseNote[];
  addVerseNote: (
    bookId: string,
    bookName: string,
    chapter: number,
    verse: number,
    text: string,
    note: string
  ) => void;
  removeVerseNote: (id: string) => void;
  userVerseFavorites: UserVerseFavorite[];
  toggleVerseFavorite: (
    bookId: string,
    bookName: string,
    chapter: number,
    verse: number,
    text: string
  ) => void;
  bibleRecentHistory: { bookId: string; bookName: string; chapter: number; accessedAt: string }[];
  addBibleHistory: (bookId: string, bookName: string, chapter: number) => void;

  // 5 Official Departments
  departments: OfficialDepartment[];
  updateDepartment: (
    id: OfficialDepartment['id'],
    data: Partial<OfficialDepartment>
  ) => { success: boolean; error?: string };

  // Media Department & Schedules
  mediaSchedules: MediaScheduleItem[];
  confirmMediaSchedule: (id: string) => void;
  requestMediaSwap: (id: string) => void;
  addMediaSchedule: (item: Omit<MediaScheduleItem, 'id'>) => { success: boolean; error?: string };

  // Children Security
  childRecords: ChildRecord[];
  checkInChild: (id: string) => void;
  checkOutChild: (id: string, pin: string) => boolean;
  addChildRecord: (record: Omit<ChildRecord, 'id' | 'securityPin' | 'checkedIn'>) => void;

  // Events & Registration
  events: EventItem[];
  registerForEvent: (eventId: string) => boolean;
  cancelEventRegistration: (eventId: string) => void;

  // Prayer Requests
  prayerRequests: PrayerRequest[];
  addPrayerRequest: (data: {
    title: string;
    content: string;
    isPrivate: boolean;
    targetGroup: 'pastoral' | 'intercessao' | 'publico';
  }) => void;
  prayForRequest: (requestId: string) => void;
  markPrayerAnswered: (requestId: string) => void;

  // Contributions
  contributions: Contribution[];
  addContribution: (
    amount: number,
    category: Contribution['category'],
    method: Contribution['method']
  ) => Contribution;

  // Notifications
  notifications: PushNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // QR Modal
  qrModalData: QrModalData | null;
  openQrModal: (
    title: string,
    code: string,
    subtitle?: string,
    type?: QrModalData['type']
  ) => void;
  closeQrModal: () => void;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings with fallback to IGEAD-MT
  const [churchSettings, setChurchSettings] = useState<ChurchSettings>(() => {
    const saved = localStorage.getItem('igead_settings_v2');
    return saved ? JSON.parse(saved) : INITIAL_CHURCH_SETTINGS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('igead_users_v2');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Default logged in user: Carlos Rocha (Líder da Mídia & Membro dos Homens)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('igead_current_user_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    // Default to Carlos Rocha (user-leader-midia) so the user directly experiences the required example!
    return INITIAL_USERS.find((u) => u.id === 'user-leader-midia') || INITIAL_USERS[2];
  });

  // Independent Department Memberships
  const [departmentMemberships, setDepartmentMemberships] = useState<DepartmentMembership[]>(() => {
    const saved = localStorage.getItem('igead_dept_memberships_v2');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENT_MEMBERSHIPS;
  });

  // Independent Department Chats
  const [departmentChats, setDepartmentChats] = useState<Record<DepartmentId, DepartmentChatMessage[]>>(() => {
    const saved = localStorage.getItem('igead_dept_chats_v2');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENT_CHATS;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('igead_audit_logs_v2');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('departamentos');
  const [isPhonePreview, setIsPhonePreview] = useState<boolean>(false);

  const [liveStream, setLiveStream] = useState<LiveStreamData>(() => {
    const saved = localStorage.getItem('igead_live');
    return saved ? JSON.parse(saved) : INITIAL_LIVE_STREAM;
  });

  const [sermonNotes, setSermonNotes] = useState<SermonNoteEntry[]>(() => {
    const saved = localStorage.getItem('igead_sermon_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Bible Navigation State
  const [bibleTarget, setBibleTarget] = useState<BibleNavigationTarget | null>({
    bookId: '1pe',
    chapter: 2,
    verse: 9
  });

  const [userVerseNotes, setUserVerseNotes] = useState<UserVerseNote[]>(() => {
    const saved = localStorage.getItem('igead_bible_notes');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'note-1',
            bookId: '1pe',
            bookName: '1 Pedro',
            chapter: 2,
            verse: 9,
            text: 'Mas vós sois a geração eleita, o sacerdócio real...',
            note: 'Versículo que deu origem ao nome da nossa igreja! Chamados para anunciar a Sua maravilhosa luz.',
            createdAt: '14/10/2026'
          }
        ];
  });

  const [userVerseFavorites, setUserVerseFavorites] = useState<UserVerseFavorite[]>(() => {
    const saved = localStorage.getItem('igead_bible_favorites');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'fav-1',
            bookId: '1pe',
            bookName: '1 Pedro',
            chapter: 2,
            verse: 9,
            text: 'Mas vós sois a geração eleita, o sacerdócio real, a nação santa...',
            savedAt: '14/10/2026'
          },
          {
            id: 'fav-2',
            bookId: 'sl',
            bookName: 'Salmos',
            chapter: 23,
            verse: 1,
            text: 'O Senhor é o meu pastor, nada me faltará.',
            savedAt: '14/10/2026'
          }
        ];
  });

  const [bibleRecentHistory, setBibleRecentHistory] = useState<
    { bookId: string; bookName: string; chapter: number; accessedAt: string }[]
  >(() => {
    const saved = localStorage.getItem('igead_bible_history');
    return saved
      ? JSON.parse(saved)
      : [
          { bookId: '1pe', bookName: '1 Pedro', chapter: 2, accessedAt: 'Hoje' },
          { bookId: 'sl', bookName: 'Salmos', chapter: 23, accessedAt: 'Hoje' },
          { bookId: 'jo', bookName: 'João', chapter: 3, accessedAt: 'Ontem' }
        ];
  });

  // Departments
  const [departments, setDepartments] = useState<OfficialDepartment[]>(() => {
    const saved = localStorage.getItem('igead_departments_v2');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [mediaSchedules, setMediaSchedules] = useState<MediaScheduleItem[]>(() => {
    const saved = localStorage.getItem('igead_media_schedules');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA_SCHEDULES;
  });

  const [childRecords, setChildRecords] = useState<ChildRecord[]>(() => {
    const saved = localStorage.getItem('igead_child_records');
    return saved ? JSON.parse(saved) : INITIAL_CHILD_RECORDS;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('igead_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('igead_prayers');
    return saved ? JSON.parse(saved) : INITIAL_PRAYERS;
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem('igead_contributions');
    return saved ? JSON.parse(saved) : INITIAL_CONTRIBUTIONS;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('igead_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [qrModalData, setQrModalData] = useState<QrModalData | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('igead_settings_v2', JSON.stringify(churchSettings));
  }, [churchSettings]);

  useEffect(() => {
    localStorage.setItem('igead_current_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('igead_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('igead_departments_v2', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('igead_dept_memberships_v2', JSON.stringify(departmentMemberships));
  }, [departmentMemberships]);

  useEffect(() => {
    localStorage.setItem('igead_dept_chats_v2', JSON.stringify(departmentChats));
  }, [departmentChats]);

  useEffect(() => {
    localStorage.setItem('igead_audit_logs_v2', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Initial sync with backend settings for logo and identity
  useEffect(() => {
    fetch('/api/church-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.logoUrl) {
          setChurchSettings((prev) => ({
            ...prev,
            logoUrl: data.settings.logoUrl,
            previousLogoUrl: data.settings.previousLogoUrl || prev.previousLogoUrl
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('igead_media_schedules', JSON.stringify(mediaSchedules));
  }, [mediaSchedules]);

  useEffect(() => {
    localStorage.setItem('igead_child_records', JSON.stringify(childRecords));
  }, [childRecords]);

  useEffect(() => {
    localStorage.setItem('igead_bible_notes', JSON.stringify(userVerseNotes));
  }, [userVerseNotes]);

  useEffect(() => {
    localStorage.setItem('igead_bible_favorites', JSON.stringify(userVerseFavorites));
  }, [userVerseFavorites]);

  useEffect(() => {
    localStorage.setItem('igead_bible_history', JSON.stringify(bibleRecentHistory));
  }, [bibleRecentHistory]);

  useEffect(() => {
    localStorage.setItem('igead_sermon_notes', JSON.stringify(sermonNotes));
  }, [sermonNotes]);

  useEffect(() => {
    localStorage.setItem('igead_prayers', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  useEffect(() => {
    localStorage.setItem('igead_contributions', JSON.stringify(contributions));
  }, [contributions]);

  // Auditoria interna helper
  const addAuditLogEntry = (
    action: AuditActionType,
    details: string,
    status: 'SUCCESS' | 'DENIED' = 'SUCCESS',
    departmentId?: DepartmentId,
    targetId?: string,
    targetName?: string
  ) => {
    const entry = createAuditLog(
      currentUser,
      action,
      details,
      status,
      departmentId,
      targetId,
      targetName
    );
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Troca de usuário / simulação de perfil
  const switchRole = (roleOrUserId: string) => {
    // 1. Procura por ID direto do usuário
    const foundById = users.find((u) => u.id === roleOrUserId);
    if (foundById) {
      setCurrentUser(foundById);
      return;
    }

    // 2. Procura pelo role institucional
    const foundByRole = users.find((u) => u.role === roleOrUserId);
    if (foundByRole) {
      setCurrentUser(foundByRole);
      return;
    }

    // 3. Fallback: ajusta o role do usuário atual
    setCurrentUser((prev) => ({ ...prev, role: roleOrUserId as UserRole }));
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...data };
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === updated.id ? updated : u)));
      return updated;
    });
  };

  /**
   * Altera o papel institucional do usuário.
   * REGRA DE SEGURANÇA: Somente ADMINISTRADOR GERAL pode alterar cargos institucionais!
   * Usuários comuns ou líderes departamentais não podem elevar privilégios.
   */
  const updateUserRole = (userId: string, role: UserRole): { success: boolean; error?: string } => {
    if (!canChangeInstitutionalRole(currentUser)) {
      addAuditLogEntry(
        'ROLE_ELEVATION_BLOCKED',
        `Tentativa não autorizada de alterar cargo institucional do usuário ${userId} para '${role}'.`,
        'DENIED',
        undefined,
        userId
      );
      return {
        success: false,
        error: 'Acesso negado: Somente a Administração Geral pode alterar cargos institucionais.'
      };
    }

    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role }));
    }

    addAuditLogEntry(
      'MEMBERSHIP_ROLE_CHANGED',
      `Cargo institucional de ${targetUser?.name || userId} alterado para '${role}'.`,
      'SUCCESS',
      undefined,
      userId,
      targetUser?.name
    );

    return { success: true };
  };

  const addUser = (userData: Omit<User, 'id' | 'membershipId'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      membershipId: `IGEAD-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setUsers((prev) => [newUser, ...prev]);
    addAuditLogEntry(
      'MEMBERSHIP_CREATED',
      `Novo usuário cadastrado na IGEAD-MT: ${newUser.name} (${newUser.email}).`,
      'SUCCESS',
      undefined,
      newUser.id,
      newUser.name
    );
  };

  /**
   * VÍNCULOS INDEPENDENTES: Adiciona um integrante ao departamento
   * - Líder do departamento pode adicionar integrantes ao seu departamento.
   * - Admin e Pastor podem adicionar em qualquer departamento.
   * - Se o papel for 'LÍDER', valida que apenas Admin ou Pastor podem designar líderes!
   */
  const addDepartmentMembership = (
    userId: string,
    departmentId: DepartmentId,
    role: DepartmentRole = 'MEMBRO'
  ): { success: boolean; error?: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    // Validação de permissão de gestão
    if (!canManageDepartment(currentUser, departmentId, departmentMemberships)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        `Tentativa de adicionar integrante no departamento '${departmentId}' sem permissão de liderança.`,
        'DENIED',
        departmentId,
        userId,
        targetUser.name
      );
      return {
        success: false,
        error: 'Acesso negado: Você não possui designação ativa de liderança neste departamento.'
      };
    }

    // Designação de líder é exclusiva de Admin Geral e Líder Pastoral
    if (role === 'LÍDER' && !canAssignDepartmentLeader(currentUser)) {
      addAuditLogEntry(
        'ROLE_ELEVATION_BLOCKED',
        `Tentativa não autorizada de designar líder para '${departmentId}'.`,
        'DENIED',
        departmentId,
        userId,
        targetUser.name
      );
      return {
        success: false,
        error: 'Apenas a Administração Geral ou Liderança Pastoral podem designar líderes de departamento.'
      };
    }

    // Regra: Apenas 1 líder principal ativo por departamento
    if (role === 'LÍDER') {
      const existingLeader = departmentMemberships.find(
        (m) => m.departmentId === departmentId && m.status === 'ATIVO' && m.role === 'LÍDER'
      );
      if (existingLeader && existingLeader.userId !== userId) {
        // Encerra liderança anterior ou rebaixa para membro
        setDepartmentMemberships((prev) =>
          prev.map((m) =>
            m.id === existingLeader.id
              ? { ...m, role: 'MEMBRO', notes: 'Liderança transferida' }
              : m
          )
        );
      }
    }

    const dept = departments.find((d) => d.id === departmentId);
    const existing = departmentMemberships.find(
      (m) => m.userId === userId && m.departmentId === departmentId
    );

    if (existing) {
      // Reativa vínculo se estava encerrado ou pendente
      setDepartmentMemberships((prev) =>
        prev.map((m) =>
          m.id === existing.id
            ? {
                ...m,
                status: 'ATIVO',
                role,
                joinedAt: new Date().toLocaleDateString('pt-BR'),
                endedAt: undefined
              }
            : m
        )
      );
    } else {
      const newMembership: DepartmentMembership = {
        id: `mem-${userId}-${departmentId}-${Date.now()}`,
        userId,
        userName: targetUser.name,
        userEmail: targetUser.email,
        userAvatar: targetUser.avatar,
        departmentId,
        departmentName: dept?.name || departmentId,
        status: 'ATIVO',
        role,
        joinedAt: new Date().toLocaleDateString('pt-BR')
      };
      setDepartmentMemberships((prev) => [newMembership, ...prev]);
    }

    // Se for líder, atualiza o nome exibido no departamento
    if (role === 'LÍDER' && dept) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === departmentId ? { ...d, leaderName: targetUser.name } : d))
      );
    }

    addAuditLogEntry(
      role === 'LÍDER' ? 'LEADER_ASSIGNED' : 'MEMBERSHIP_APPROVED',
      `Usuário ${targetUser.name} adicionado ao '${dept?.name || departmentId}' como ${role}.`,
      'SUCCESS',
      departmentId,
      userId,
      targetUser.name
    );

    return { success: true };
  };

  /**
   * VÍNCULOS INDEPENDENTES: Encerra um vínculo específico
   * REGRA FUNDAMENTAL: Encerra SOMENTE o vínculo com este departamento.
   * A conta do usuário e todos os demais vínculos em outros departamentos permanecem 100% intactos!
   * Revoga imediatamente acesso a conteúdos restritos e ao chat do departamento.
   */
  const endDepartmentMembership = (membershipId: string): { success: boolean; error?: string } => {
    const targetMembership = departmentMemberships.find((m) => m.id === membershipId);
    if (!targetMembership) {
      return { success: false, error: 'Vínculo não encontrado.' };
    }

    if (!canEndMembership(currentUser, targetMembership, departmentMemberships)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        `Tentativa de encerrar vínculo sem autorização no departamento '${targetMembership.departmentId}'.`,
        'DENIED',
        targetMembership.departmentId,
        targetMembership.userId,
        targetMembership.userName
      );
      return {
        success: false,
        error: 'Acesso negado: Você não possui permissão para remover integrantes deste departamento.'
      };
    }

    const endedDate = new Date().toLocaleDateString('pt-BR');

    // Atualiza SOMENTE o vínculo em questão para status 'ENCERRADO'
    setDepartmentMemberships((prev) =>
      prev.map((m) =>
        m.id === membershipId
          ? {
              ...m,
              status: 'ENCERRADO',
              endedAt: endedDate
            }
          : m
      )
    );

    addAuditLogEntry(
      'MEMBERSHIP_ENDED',
      `Vínculo de ${targetMembership.userName} com o '${targetMembership.departmentName}' foi ENCERRADO em ${endedDate}. Conta e demais vínculos preservados.`,
      'SUCCESS',
      targetMembership.departmentId,
      targetMembership.userId,
      targetMembership.userName
    );

    return { success: true };
  };

  /**
   * Aprova uma solicitação de vínculo pendente
   */
  const approveDepartmentMembership = (membershipId: string): { success: boolean; error?: string } => {
    const target = departmentMemberships.find((m) => m.id === membershipId);
    if (!target) return { success: false, error: 'Vínculo não encontrado.' };

    if (!canManageDepartment(currentUser, target.departmentId, departmentMemberships)) {
      return { success: false, error: 'Acesso negado para aprovar membros neste departamento.' };
    }

    setDepartmentMemberships((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, status: 'ATIVO' } : m))
    );

    addAuditLogEntry(
      'MEMBERSHIP_APPROVED',
      `Vínculo de ${target.userName} no '${target.departmentName}' aprovado e ativado.`,
      'SUCCESS',
      target.departmentId,
      target.userId,
      target.userName
    );

    return { success: true };
  };

  /**
   * Altera a função de um integrante no departamento (MEMBRO <-> LÍDER)
   */
  const changeDepartmentMemberRole = (
    membershipId: string,
    newRole: DepartmentRole
  ): { success: boolean; error?: string } => {
    const target = departmentMemberships.find((m) => m.id === membershipId);
    if (!target) return { success: false, error: 'Vínculo não encontrado.' };

    if (newRole === 'LÍDER' && !canAssignDepartmentLeader(currentUser)) {
      addAuditLogEntry(
        'ROLE_ELEVATION_BLOCKED',
        `Tentativa não autorizada de promover ${target.userName} a Líder de '${target.departmentId}'.`,
        'DENIED',
        target.departmentId,
        target.userId,
        target.userName
      );
      return {
        success: false,
        error: 'Apenas a Administração Geral e Pastoral podem designar líderes departamentais.'
      };
    }

    setDepartmentMemberships((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, role: newRole } : m))
    );

    addAuditLogEntry(
      'MEMBERSHIP_ROLE_CHANGED',
      `Função de ${target.userName} no departamento '${target.departmentName}' alterada para ${newRole}.`,
      'SUCCESS',
      target.departmentId,
      target.userId,
      target.userName
    );

    return { success: true };
  };

  /**
   * CHAT INDEPENDENTE: Envia mensagem no chat do departamento
   * REGRA DE SEGURANÇA: Somente usuários com vínculo ATIVO no departamento (ou Admin/Pastor) podem enviar!
   */
  const sendDepartmentChatMessage = (
    departmentId: DepartmentId,
    content: string
  ): { success: boolean; error?: string } => {
    if (!content.trim()) return { success: false, error: 'Mensagem vazia.' };

    if (!canParticipateInChat(currentUser, departmentId, departmentMemberships)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        `Tentativa de envio de mensagem no chat de '${departmentId}' sem vínculo ativo.`,
        'DENIED',
        departmentId,
        currentUser.id,
        currentUser.name
      );
      return {
        success: false,
        error: 'Acesso negado: Você precisa ter um vínculo ATIVO neste departamento para participar do chat.'
      };
    }

    const membership = departmentMemberships.find(
      (m) => m.userId === currentUser.id && m.departmentId === departmentId && m.status === 'ATIVO'
    );

    let roleBadge = 'Membro';
    if (currentUser.role === 'admin') roleBadge = 'Administração Geral';
    else if (currentUser.role === 'pastor') roleBadge = 'Líder Pastoral';
    else if (membership?.role === 'LÍDER') roleBadge = `Líder do Grupo`;
    else roleBadge = `Membro`;

    const newMessage: DepartmentChatMessage = {
      id: `chat-${departmentId}-${Date.now()}`,
      departmentId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRoleBadge: roleBadge,
      content: content.trim(),
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isLeaderMessage: membership?.role === 'LÍDER' || currentUser.role === 'admin' || currentUser.role === 'pastor',
      isSupervised: departmentId === 'criancas'
    };

    setDepartmentChats((prev) => ({
      ...prev,
      [departmentId]: [...(prev[departmentId] || []), newMessage]
    }));

    return { success: true };
  };

  const updateChurchSettings = (settings: Partial<ChurchSettings>): { success: boolean; error?: string } => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'pastor') {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        'Tentativa não autorizada de editar configurações globais da igreja.',
        'DENIED'
      );
      return { success: false, error: 'Acesso restrito à Administração Geral e Pastoral.' };
    }

    setChurchSettings((prev) => ({ ...prev, ...settings }));
    addAuditLogEntry(
      'DEPARTMENT_INFO_UPDATED',
      'Configurações institucionais da IGEAD-MT atualizadas com sucesso.',
      'SUCCESS'
    );
    return { success: true };
  };

  const updateChurchLogo = async (logoDataUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!canManageChurchLogo(currentUser)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        'Tentativa não autorizada de alterar a logo oficial da igreja.',
        'DENIED'
      );
      return { success: false, error: 'Apenas o Administrador Geral pode alterar a logo oficial da igreja.' };
    }

    try {
      const res = await fetch('/api/church-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ logoDataUrl })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro do servidor');
      }

      const data = await res.json();
      setChurchSettings((prev) => ({
        ...prev,
        previousLogoUrl: prev.logoUrl,
        logoUrl: data.logoUrl || logoDataUrl
      }));
    } catch {
      // Persistência local transparente
      setChurchSettings((prev) => ({
        ...prev,
        previousLogoUrl: prev.logoUrl,
        logoUrl: logoDataUrl
      }));
    }

    addAuditLogEntry(
      'CHURCH_LOGO_UPDATED',
      'Logo oficial da Igreja atualizada com sucesso pelo Administrador Geral.',
      'SUCCESS'
    );
    return { success: true };
  };

  const restoreDefaultChurchLogo = async (restorePrevious?: boolean): Promise<{ success: boolean; error?: string }> => {
    if (!canManageChurchLogo(currentUser)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        'Tentativa não autorizada de remover ou restaurar a logo da igreja.',
        'DENIED'
      );
      return { success: false, error: 'Apenas o Administrador Geral pode alterar a logo oficial.' };
    }

    try {
      await fetch(`/api/church-logo?restorePrevious=${restorePrevious ? 'true' : 'false'}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
    } catch {
      // Fallback local
    }

    setChurchSettings((prev) => {
      if (restorePrevious && prev.previousLogoUrl) {
        return {
          ...prev,
          logoUrl: prev.previousLogoUrl,
          previousLogoUrl: prev.logoUrl
        };
      }
      return {
        ...prev,
        previousLogoUrl: prev.logoUrl,
        logoUrl: '/logo-igead.svg'
      };
    });

    addAuditLogEntry(
      'CHURCH_LOGO_REMOVED',
      restorePrevious
        ? 'Logo anterior da Igreja restaurada com sucesso.'
        : 'Logo personalizada removida. Logo oficial vetorial da IGEAD-MT restaurada.',
      'SUCCESS'
    );
    return { success: true };
  };

  const updateUserAvatar = async (userId: string, avatarDataUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!canUpdateUserAvatar(currentUser, userId)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        `Tentativa não autorizada de alterar a foto do usuário '${userId}'.`,
        'DENIED',
        undefined,
        userId
      );
      return { success: false, error: 'Você só pode alterar exclusivamente a sua própria foto de perfil.' };
    }

    try {
      await fetch(`/api/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ avatarDataUrl })
      });
    } catch {
      // Fallback local
    }

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, avatar: avatarDataUrl }));
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, avatar: avatarDataUrl } : u))
    );

    setDepartmentMemberships((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, userAvatar: avatarDataUrl } : m))
    );

    addAuditLogEntry(
      'USER_AVATAR_UPDATED',
      `Foto de perfil atualizada para o usuário ID ${userId}.`,
      'SUCCESS',
      undefined,
      userId
    );
    return { success: true };
  };

  const removeUserAvatar = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!canUpdateUserAvatar(currentUser, userId)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        `Tentativa não autorizada de remover a foto do usuário '${userId}'.`,
        'DENIED',
        undefined,
        userId
      );
      return { success: false, error: 'Você só pode remover exclusivamente a sua própria foto de perfil.' };
    }

    try {
      await fetch(`/api/users/${userId}/avatar`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
    } catch {
      // Fallback local
    }

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, avatar: '' }));
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, avatar: '' } : u))
    );

    setDepartmentMemberships((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, userAvatar: '' } : m))
    );

    addAuditLogEntry(
      'USER_AVATAR_REMOVED',
      `Foto de perfil removida para o usuário ID ${userId}. Avatar padrão ativado.`,
      'SUCCESS',
      undefined,
      userId
    );
    return { success: true };
  };

  const toggleLiveStream = () => {
    setLiveStream((prev) => ({ ...prev, isLive: !prev.isLive }));
  };

  const updateLiveStreamInfo = (data: Partial<LiveStreamData>) => {
    setLiveStream((prev) => ({ ...prev, ...data }));
  };

  const saveSermonNote = (note: Omit<SermonNoteEntry, 'id' | 'serviceDate'>) => {
    const newEntry: SermonNoteEntry = {
      ...note,
      id: `sermon-note-${Date.now()}`,
      serviceDate: new Date().toLocaleDateString('pt-BR')
    };
    setSermonNotes((prev) => [newEntry, ...prev]);
  };

  // Open Bible directly from sermon reference
  const openBibleAt = (bookId: string, chapter: number, verse?: number) => {
    setBibleTarget({ bookId, chapter, verse });
    setActiveTab('biblia');
  };

  const addVerseNote = (
    bookId: string,
    bookName: string,
    chapter: number,
    verse: number,
    text: string,
    note: string
  ) => {
    const newNote: UserVerseNote = {
      id: `note-${Date.now()}`,
      bookId,
      bookName,
      chapter,
      verse,
      text,
      note,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    setUserVerseNotes((prev) => [newNote, ...prev]);
  };

  const removeVerseNote = (id: string) => {
    setUserVerseNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleVerseFavorite = (
    bookId: string,
    bookName: string,
    chapter: number,
    verse: number,
    text: string
  ) => {
    const existing = userVerseFavorites.find(
      (f) => f.bookId === bookId && f.chapter === chapter && f.verse === verse
    );
    if (existing) {
      setUserVerseFavorites((prev) => prev.filter((f) => f.id !== existing.id));
    } else {
      const newFav: UserVerseFavorite = {
        id: `fav-${Date.now()}`,
        bookId,
        bookName,
        chapter,
        verse,
        text,
        savedAt: new Date().toLocaleDateString('pt-BR')
      };
      setUserVerseFavorites((prev) => [newFav, ...prev]);
    }
  };

  const addBibleHistory = (bookId: string, bookName: string, chapter: number) => {
    setBibleRecentHistory((prev) => {
      const filtered = prev.filter(
        (h) => !(h.bookId === bookId && h.chapter === chapter)
      );
      return [
        {
          bookId,
          bookName,
          chapter,
          accessedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        },
        ...filtered
      ].slice(0, 10);
    });
  };

  const updateDepartment = (
    id: OfficialDepartment['id'],
    data: Partial<OfficialDepartment>
  ): { success: boolean; error?: string } => {
    if (!canManageDepartment(currentUser, id, departmentMemberships)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        `Tentativa de alterar dados do departamento '${id}' sem autorização de liderança.`,
        'DENIED',
        id
      );
      return { success: false, error: 'Acesso negado: Você não é o líder autorizado deste departamento.' };
    }

    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );

    addAuditLogEntry(
      'DEPARTMENT_INFO_UPDATED',
      `Informações do departamento '${id}' atualizadas com sucesso.`,
      'SUCCESS',
      id
    );

    return { success: true };
  };

  const confirmMediaSchedule = (id: string) => {
    setMediaSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'confirmed' } : s))
    );
    addAuditLogEntry('SCHEDULE_STATUS_UPDATED', `Presença na escala de mídia confirmada (ID: ${id}).`, 'SUCCESS', 'midia');
  };

  const requestMediaSwap = (id: string) => {
    setMediaSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'swap_requested' } : s))
    );
    addAuditLogEntry('SCHEDULE_STATUS_UPDATED', `Solicitação de troca na escala de mídia (ID: ${id}).`, 'SUCCESS', 'midia');
  };

  const addMediaSchedule = (item: Omit<MediaScheduleItem, 'id'>): { success: boolean; error?: string } => {
    if (!canManageDepartment(currentUser, 'midia', departmentMemberships)) {
      addAuditLogEntry(
        'SECURITY_VIOLATION_BLOCKED',
        'Tentativa não autorizada de cadastrar escala no Grupo da Mídia.',
        'DENIED',
        'midia'
      );
      return { success: false, error: 'Apenas a liderança da Mídia pode cadastrar novas escalas.' };
    }

    const newItem: MediaScheduleItem = {
      ...item,
      id: `sched-${Date.now()}`
    };
    setMediaSchedules((prev) => [newItem, ...prev]);
    addAuditLogEntry(
      'SCHEDULE_CREATED',
      `Nova escala criada na Mídia: ${item.role} para ${item.volunteerName} em ${item.serviceName}.`,
      'SUCCESS',
      'midia'
    );
    return { success: true };
  };

  const checkInChild = (id: string) => {
    setChildRecords((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              checkedIn: true,
              checkInTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
          : c
      )
    );
    addAuditLogEntry('CHILD_CHECKIN', `Check-in infantil realizado com sucesso para a criança ID ${id}.`, 'SUCCESS', 'criancas');
  };

  const checkOutChild = (id: string, pin: string): boolean => {
    const child = childRecords.find((c) => c.id === id);
    if (!child || child.securityPin !== pin.trim()) {
      addAuditLogEntry('CHILD_CHECKOUT', `Tentativa de check-out infantil com PIN incorreto para criança ID ${id}.`, 'DENIED', 'criancas');
      return false;
    }

    setChildRecords((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checkedIn: false } : c))
    );
    addAuditLogEntry('CHILD_CHECKOUT', `Check-out infantil liberado com PIN correto para ${child.childName}.`, 'SUCCESS', 'criancas');
    return true;
  };

  const addChildRecord = (record: Omit<ChildRecord, 'id' | 'securityPin' | 'checkedIn'>) => {
    const newChild: ChildRecord = {
      ...record,
      id: `child-${Date.now()}`,
      securityPin: `KIDS-${Math.floor(1000 + Math.random() * 9000)}`,
      checkedIn: false
    };
    setChildRecords((prev) => [newChild, ...prev]);
    addAuditLogEntry(
      'CHILD_REGISTERED',
      `Cadastro infantil criado com proteção LGPD para ${newChild.childName}. Responsável: ${newChild.parentName}.`,
      'SUCCESS',
      'criancas'
    );
  };

  const registerForEvent = (eventId: string): boolean => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredUserIds: [...e.registeredUserIds, currentUser.id] }
          : e
      )
    );
    return true;
  };

  const cancelEventRegistration = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredUserIds: e.registeredUserIds.filter((id) => id !== currentUser.id) }
          : e
      )
    );
  };

  const addPrayerRequest = (data: {
    title: string;
    content: string;
    isPrivate: boolean;
    targetGroup: 'pastoral' | 'intercessao' | 'publico';
  }) => {
    const newReq: PrayerRequest = {
      id: `pray-${Date.now()}`,
      userId: currentUser.id,
      userName: data.isPrivate ? 'Membro (Confidencial)' : currentUser.name,
      isPrivate: data.isPrivate,
      targetGroup: data.targetGroup,
      title: data.title,
      content: data.content,
      createdAt: 'Hoje',
      prayerCount: 1,
      prayedByUserIds: [currentUser.id],
      status: 'em_oracao'
    };
    setPrayerRequests((prev) => [newReq, ...prev]);
  };

  const prayForRequest = (requestId: string) => {
    setPrayerRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const already = req.prayedByUserIds.includes(currentUser.id);
          const newIds = already
            ? req.prayedByUserIds.filter((id) => id !== currentUser.id)
            : [...req.prayedByUserIds, currentUser.id];
          return {
            ...req,
            prayedByUserIds: newIds,
            prayerCount: Math.max(1, req.prayerCount + (already ? -1 : 1))
          };
        }
        return req;
      })
    );
  };

  const markPrayerAnswered = (requestId: string) => {
    setPrayerRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'respondido' } : req))
    );
  };

  const addContribution = (
    amount: number,
    category: Contribution['category'],
    method: Contribution['method']
  ): Contribution => {
    const newContrib: Contribution = {
      id: `contrib-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      category,
      amount,
      method,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'aprovado',
      codeReceipt: `PIX-IGEAD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setContributions((prev) => [newContrib, ...prev]);
    return newContrib;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openQrModal = (
    title: string,
    code: string,
    subtitle?: string,
    type: QrModalData['type'] = 'ticket'
  ) => {
    setQrModalData({ isOpen: true, title, code, subtitle, type });
  };

  const closeQrModal = () => {
    setQrModalData(null);
  };

  return (
    <ChurchContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchRole,
        updateCurrentUserProfile,
        updateUserRole,
        addUser,
        departmentMemberships,
        addDepartmentMembership,
        endDepartmentMembership,
        approveDepartmentMembership,
        changeDepartmentMemberRole,
        departmentChats,
        sendDepartmentChatMessage,
        auditLogs,
        addAuditLogEntry,
        activeTab,
        setActiveTab,
        isPhonePreview,
        setIsPhonePreview,
        churchSettings,
        updateChurchSettings,
        updateChurchLogo,
        restoreDefaultChurchLogo,
        updateUserAvatar,
        removeUserAvatar,
        liveStream,
        setLiveStream,
        toggleLiveStream,
        updateLiveStreamInfo,
        sermonNotes,
        saveSermonNote,
        bibleTarget,
        openBibleAt,
        userVerseNotes,
        addVerseNote,
        removeVerseNote,
        userVerseFavorites,
        toggleVerseFavorite,
        bibleRecentHistory,
        addBibleHistory,
        departments,
        updateDepartment,
        mediaSchedules,
        confirmMediaSchedule,
        requestMediaSwap,
        addMediaSchedule,
        childRecords,
        checkInChild,
        checkOutChild,
        addChildRecord,
        events,
        registerForEvent,
        cancelEventRegistration,
        prayerRequests,
        addPrayerRequest,
        prayForRequest,
        markPrayerAnswered,
        contributions,
        addContribution,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        qrModalData,
        openQrModal,
        closeQrModal
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
