import React, { useState } from 'react';
import { useChurch, AppTab } from '../../context/ChurchContext';
import { ChurchLogo } from '../common/ChurchLogo';
import { UserAvatar } from '../common/UserAvatar';
import {
  Bell,
  Smartphone,
  Monitor,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Radio,
  Shield,
  Video,
  Users,
  Baby,
  Heart,
  Lock
} from 'lucide-react';
import { NotificationsModal } from '../common/NotificationsModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchRole,
    activeTab,
    setActiveTab,
    isPhonePreview,
    setIsPhonePreview,
    liveStream,
    notifications,
    churchSettings,
    departmentMemberships
  } = useChurch();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Identifica lideranças ativas do usuário atual
  const activeLeaderDepts = departmentMemberships.filter(
    (m) => m.userId === currentUser.id && m.status === 'ATIVO' && m.role === 'LÍDER'
  );
  const activeMemberDepts = departmentMemberships.filter(
    (m) => m.userId === currentUser.id && m.status === 'ATIVO' && m.role === 'MEMBRO'
  );

  const navItems: { id: AppTab; label: string }[] = [
    { id: 'inicio', label: 'Início' },
    { id: 'biblia', label: 'Bíblia Digital' },
    { id: 'departamentos', label: 'Departamentos' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'contribuir', label: 'Dízimos & Ofertas' },
    { id: 'perfil', label: 'Perfil' }
  ];

  // Acesso ao Painel de Gestão: Administrador Geral, Líder Pastoral ou Líder de Departamento Ativo
  const canAccessAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'pastor' ||
    activeLeaderDepts.length > 0;

  const getUserBadgeText = () => {
    if (currentUser.role === 'admin') return 'Admin Geral';
    if (currentUser.role === 'pastor') return 'Líder Pastoral';
    if (activeLeaderDepts.length > 0) return `Líder: ${activeLeaderDepts[0].departmentName}`;
    if (currentUser.role === 'visitor') return 'Visitante';
    return 'Membro';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Church Brand Lockup with Official Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('inicio')}
              className="flex items-center text-left focus:outline-hidden"
            >
              <ChurchLogo size="sm" showSlogan={false} />
            </button>

            {/* Live Indicator if on air */}
            {liveStream.isLive && (
              <button
                onClick={() => setActiveTab('inicio')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-pulse"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>AO VIVO</span>
              </button>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 hover:text-white ${
                  activeTab === item.id
                    ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}

            {canAccessAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 whitespace-nowrap py-1 transition-colors ${
                  activeTab === 'admin'
                    ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                    : 'text-amber-300/80 hover:text-amber-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Painel de Gestão</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Interactive Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* YouTube official direct link */}
            <a
              href={churchSettings.youtube}
              target="_blank"
              rel="noopener noreferrer"
              title="Acessar Canal Oficial no YouTube"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-red-400 hover:text-white hover:bg-red-600 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold"
            >
              <Radio className="w-4 h-4" />
              <span>@IGEAD_MT</span>
            </a>

            {/* Mobile View Toggle */}
            <button
              onClick={() => setIsPhonePreview(!isPhonePreview)}
              title={isPhonePreview ? 'Alternar para tela cheia web' : 'Simular visualização de celular (iOS/Android)'}
              className={`p-2 rounded-xl border transition-colors items-center gap-1.5 text-xs font-medium ${
                // Em telas pequenas o simulador não faz sentido; só aparece para sair dele
                isPhonePreview ? 'flex' : 'hidden lg:flex'
              } ${
                isPhonePreview
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isPhonePreview ? (
                <>
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Celular</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifModalOpen(true)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile & Role Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <UserAvatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                  rounded="lg"
                />
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-white max-w-[130px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    {getUserBadgeText()}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher Menu */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 animate-fade-in max-h-[85vh] overflow-y-auto">
                  <div className="p-2 border-b border-slate-800 mb-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Simular Usuário / Perfil IGEAD-MT:
                    </p>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">
                      {currentUser.name} ({getUserBadgeText()})
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    {/* Destaque: Usuários pré-configurados com vínculos reais */}
                    {users.map((u) => {
                      const isSelected = currentUser.id === u.id;
                      const uLeader = departmentMemberships.filter(
                        (m) => m.userId === u.id && m.status === 'ATIVO' && m.role === 'LÍDER'
                      );
                      const uMember = departmentMemberships.filter(
                        (m) => m.userId === u.id && m.status === 'ATIVO' && m.role === 'MEMBRO'
                      );

                      const getIcon = () => {
                        if (u.role === 'admin') return <Shield className="w-4 h-4 text-amber-400 shrink-0" />;
                        if (u.role === 'pastor') return <Heart className="w-4 h-4 text-emerald-400 shrink-0" />;
                        if (u.id === 'user-leader-midia') return <Video className="w-4 h-4 text-blue-400 shrink-0" />;
                        if (uLeader.length > 0) return <Users className="w-4 h-4 text-amber-400 shrink-0" />;
                        return <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />;
                      };

                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchRole(u.id);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl transition-colors text-left ${
                            isSelected
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {getIcon()}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-white truncate text-[11px]">
                                {u.name}
                              </span>
                              {u.id === 'user-leader-midia' && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-bold">
                                  Exemplo
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                              {u.role === 'admin'
                                ? 'Acesso Global Administrativo'
                                : u.role === 'pastor'
                                ? 'Liderança Pastoral'
                                : uLeader.length > 0
                                ? `Líder: ${uLeader.map((l) => l.departmentName).join(', ')}${
                                    uMember.length > 0 ? ` · Membro: ${uMember.map((m) => m.departmentName).join(', ')}` : ''
                                  }`
                                : uMember.length > 0
                                ? `Membro: ${uMember.map((m) => m.departmentName).join(', ')}`
                                : 'Sem vínculos ativos'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('perfil');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 block"
                    >
                      Ver Minha Carteirinha & Vínculos
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationsModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
      />
    </>
  );
};
