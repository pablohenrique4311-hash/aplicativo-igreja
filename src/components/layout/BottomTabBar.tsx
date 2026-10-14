import React from 'react';
import { useChurch, AppTab } from '../../context/ChurchContext';
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  HeartHandshake,
  User
} from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useChurch();

  const tabs: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'biblia', label: 'Bíblia', icon: BookOpen },
    { id: 'departamentos', label: 'Deptos', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'contribuir', label: 'Dízimos', icon: HeartHandshake },
    { id: 'perfil', label: 'Perfil', icon: User }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Navegação Principal"
    >
      <div className="max-w-md mx-auto grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
