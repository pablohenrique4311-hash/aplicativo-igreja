import React from 'react';
import { ChurchProvider, useChurch } from './context/ChurchContext';
import { Navbar } from './components/layout/Navbar';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { HomeView } from './components/home/HomeView';
import { BibleView } from './components/bible/BibleView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { EventsView } from './components/events/EventsView';
import { GivingView } from './components/giving/GivingView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QrModal } from './components/common/QrModal';
import { ChurchLogo } from './components/common/ChurchLogo';
import { Video, Heart, Shield, Radio, ExternalLink } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isPhonePreview, churchSettings, setActiveTab } = useChurch();

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'inicio':
        return <HomeView />;
      case 'biblia':
        return <BibleView />;
      case 'departamentos':
        return <DepartmentsView />;
      case 'agenda':
        return <EventsView />;
      case 'contribuir':
        return <GivingView />;
      case 'perfil':
        return <ProfileView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomeView />;
    }
  };

  if (isPhonePreview) {
    // Smartphone Mockup Mode
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6">
        <div className="w-full max-w-[430px] h-[870px] bg-slate-950 border-[6px] border-slate-800 rounded-[48px] shadow-2xl flex flex-col overflow-hidden relative ring-1 ring-slate-700/50">
          {/* Phone Dynamic Island */}
          <div className="h-6 w-full bg-slate-950 flex items-center justify-center shrink-0 z-50 pt-1">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-between px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
            </div>
          </div>

          {/* Top Bar inside Phone */}
          <Navbar />

          {/* Scrollable Phone Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
            {renderCurrentTab()}
          </div>

          {/* Bottom Tab Bar */}
          <BottomTabBar />
        </div>
      </div>
    );
  }

  // Full Desktop & Tablet Responsive View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentTab()}
      </main>

      {/* Institutional Desktop Footer */}
      <footer className="hidden lg:block border-t border-slate-800 bg-slate-950 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div>
            <ChurchLogo size="sm" showSlogan={true} />
            <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
              ❤️ {churchSettings.secondarySlogan}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="text-white font-semibold">
              {churchSettings.name} — {churchSettings.acronym}
            </p>
            <p>{churchSettings.address}</p>
            <p>{churchSettings.neighborhood}, {churchSettings.cityState} — CEP {churchSettings.cep}</p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={churchSettings.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <Video className="w-4 h-4" />
              <span>YouTube @IGEAD_MT</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <button
              onClick={() => setActiveTab('contribuir')}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Dízimos & Ofertas PIX
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('biblia')}
              className="hover:text-white"
            >
              Bíblia Digital
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (hidden on desktop) */}
      <div className="block lg:hidden">
        <BottomTabBar />
      </div>

      <QrModal />
    </div>
  );
};

export default function App() {
  return (
    <ChurchProvider>
      <MainContent />
    </ChurchProvider>
  );
}
