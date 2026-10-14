export type InstitutionalRole =
  | 'admin'
  | 'pastor'
  | 'member'
  | 'visitor';

export type UserRole =
  | InstitutionalRole
  | 'leader_ministry'
  | 'leader_cell'
  | 'volunteer';

export type DepartmentId = 'homens' | 'mulheres' | 'jovens' | 'criancas' | 'midia';

export type MembershipStatus = 'PENDENTE' | 'ATIVO' | 'ENCERRADO';
export type DepartmentRole = 'MEMBRO' | 'LÍDER';

export interface DepartmentMembership {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  departmentId: DepartmentId;
  departmentName: string;
  status: MembershipStatus;
  role: DepartmentRole;
  joinedAt: string; // Ex: '15/03/2021'
  endedAt?: string; // Ex: '14/10/2026'
  notes?: string;
}

export interface DepartmentChatMessage {
  id: string;
  departmentId: DepartmentId;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRoleBadge: string; // 'Líder da Mídia', 'Membro', 'Pastor'
  content: string;
  createdAt: string;
  isSupervised?: boolean; // Proteção especial para Grupo de Crianças
  isLeaderMessage?: boolean;
}

export type AuditActionType =
  | 'MEMBERSHIP_CREATED'
  | 'MEMBERSHIP_APPROVED'
  | 'MEMBERSHIP_ENDED'
  | 'MEMBERSHIP_ROLE_CHANGED'
  | 'LEADER_ASSIGNED'
  | 'DEPARTMENT_INFO_UPDATED'
  | 'DEPARTMENT_ANNOUNCEMENT_CREATED'
  | 'DEPARTMENT_ANNOUNCEMENT_DELETED'
  | 'SCHEDULE_CREATED'
  | 'SCHEDULE_STATUS_UPDATED'
  | 'CHILD_REGISTERED'
  | 'CHILD_CHECKIN'
  | 'CHILD_CHECKOUT'
  | 'SECURITY_VIOLATION_BLOCKED'
  | 'ROLE_ELEVATION_BLOCKED'
  | 'FINANCIAL_ACCESS_BLOCKED'
  | 'CHURCH_LOGO_UPDATED'
  | 'CHURCH_LOGO_REMOVED'
  | 'USER_AVATAR_UPDATED'
  | 'USER_AVATAR_REMOVED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditActionType;
  departmentId?: DepartmentId;
  targetId?: string;
  targetName?: string;
  details: string;
  status: 'SUCCESS' | 'DENIED';
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Cônjuge' | 'Filho' | 'Filha' | 'Pai' | 'Mãe' | 'Outro';
  birthDate: string;
  isKidsMinistryCheckedIn?: boolean;
  securityPin?: string;
  allergiesOrMedicalNotes?: string;
  parentAuthorized?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  membershipId: string;
  membershipDate: string;
  baptismDate?: string;
  address?: string;
  departmentIds?: string[];
  departmentNames?: string[];
  familyMembers?: FamilyMember[];
}

export interface ChurchSettings {
  name: string;
  acronym: string;
  slogan: string;
  secondarySlogan: string;
  address: string;
  neighborhood: string;
  cityState: string;
  cep: string;
  phone: string;
  whatsapp: string;
  email: string;
  youtube: string;
  youtubeLiveEmbedUrl: string;
  instagram?: string;
  pixKey: string;
  pixKeyType: 'CNPJ' | 'E-mail' | 'Telefone' | 'Chave Aleatória';
  pixBeneficiary: string;
  pixBank: string;
  logoUrl?: string;
  previousLogoUrl?: string;
  primaryColor?: 'amber' | 'blue' | 'emerald' | 'purple';
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerImageUrl?: string;
  serviceTimes: { day: string; time: string; title: string }[];
}

export interface LiveStreamData {
  isLive: boolean;
  title: string;
  preacher: string;
  series: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  viewersCount: number;
  primaryScripture: string;
  notes: string[];
}

export interface SermonNoteEntry {
  id: string;
  serviceDate: string;
  theme: string;
  preacher: string;
  mainScripture: string;
  personalNotes: string;
}

export interface OfficialDepartment {
  id: DepartmentId;
  name: string;
  badge: string;
  description: string;
  leaderTitle: string;
  leaderName: string;
  meetingSchedule: string;
  contactPhone: string;
  contactWhatsapp: string;
  activities: string[];
  volunteerRoles: string[];
  announcements: { id: string; title: string; date: string; content: string }[];
}

export type MediaRole =
  | 'Áudio'
  | 'Vídeo'
  | 'Câmeras'
  | 'Transmissão'
  | 'Projeção'
  | 'Suporte Técnico';

export interface MediaScheduleItem {
  id: string;
  serviceName: string;
  date: string;
  role: MediaRole;
  volunteerId: string;
  volunteerName: string;
  status: 'confirmed' | 'pending' | 'swap_requested';
  notes: string;
}

export interface ChildRecord {
  id: string;
  childName: string;
  parentName: string;
  parentPhone: string;
  parentAuthorized: boolean;
  birthDate: string;
  securityPin: string;
  allergyOrNotes: string;
  checkedIn: boolean;
  checkInTime?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'culto' | 'conferencia' | 'jovens' | 'homens' | 'mulheres' | 'criancas' | 'curso' | 'oracao';
  date: string;
  time: string;
  location: string;
  speaker: string;
  price: number;
  maxAttendees: number;
  registeredUserIds: string[];
  description: string;
  isHighlighted?: boolean;
  badgeText: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  isPrivate: boolean;
  targetGroup: 'pastoral' | 'intercessao' | 'publico';
  title: string;
  content: string;
  createdAt: string;
  prayerCount: number;
  prayedByUserIds: string[];
  status: 'em_oracao' | 'respondido' | 'testemunho';
  pastorNotes?: string;
}

export interface Contribution {
  id: string;
  userId: string;
  userName: string;
  category: 'dizimo' | 'oferta' | 'missoes' | 'obra_social' | 'construcao';
  amount: number;
  method: 'pix' | 'cartao' | 'boleto';
  date: string;
  status: 'aprovado' | 'processando';
  codeReceipt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'live' | 'event' | 'schedule' | 'general' | 'prayer';
}
