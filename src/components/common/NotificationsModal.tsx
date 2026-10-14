import React from 'react';
import { useChurch } from '../../context/ChurchContext';
import { X, Bell, CheckCheck, Radio, Calendar, Users, Heart } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useChurch();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'live':
        return <Radio className="w-4 h-4 text-red-400" />;
      case 'schedule':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'prayer':
        return <Heart className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm mt-12 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Notificações Push</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Lidas
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-colors ${
                  notif.read
                    ? 'opacity-70 hover:bg-slate-800/40'
                    : 'bg-slate-800/80 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
