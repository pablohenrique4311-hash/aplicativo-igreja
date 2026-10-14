import React, { useState } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { EventItem } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  CheckCircle,
  Share2,
  CalendarPlus,
  Filter
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const {
    events,
    currentUser,
    registerForEvent,
    cancelEventRegistration,
    churchSettings,
    openQrModal
  } = useChurch();

  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const categories = [
    { id: 'todos', label: 'Todos os Eventos' },
    { id: 'conferencia', label: 'Conferências' },
    { id: 'jovens', label: 'Jovens' },
    { id: 'casais', label: 'Casais' },
    { id: 'curso', label: 'Cursos & EBD' },
    { id: 'culto', label: 'Cultos Regulares' }
  ];

  const filteredEvents = events.filter((e) => {
    if (categoryFilter === 'todos') return true;
    return e.category === categoryFilter;
  });

  const handleRegister = (eventId: string, title: string) => {
    registerForEvent(eventId);
    setSuccessToast(`Inscrição confirmada com sucesso em: ${title}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenTicket = (event: EventItem) => {
    const code = `INGRESSO-${event.id.toUpperCase()}-${currentUser.membershipId}`;
    openQrModal(
      event.title,
      code,
      `Participante: ${currentUser.name} · ${event.date}`,
      'ticket'
    );
  };

  const handleShareEvent = (event: EventItem) => {
    const text = encodeURIComponent(
      `Venha participar conosco!\n\n*${event.title}*\n📅 ${event.date} às ${event.time}\n📍 ${event.location}\n\nInscreva-se pelo aplicativo da ${churchSettings.name}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Agenda & Eventos da Igreja
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Participe de nossos cultos, congressos, conferências e cursos com inscrição e ingresso digital.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const isRegistered = event.registeredUserIds.includes(currentUser.id);
          const attendeesCount = event.registeredUserIds.length;
          const slotsLeft = Math.max(0, event.maxAttendees - attendeesCount);

          return (
            <div
              key={event.id}
              className={`p-6 rounded-3xl border transition-all ${
                event.isHighlighted
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/40 shadow-xl'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {event.badgeText}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">
                      {event.price === 0 ? 'Entrada Gratuita' : `R$ ${event.price.toFixed(2)}`}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-emerald-400">
                      {slotsLeft} vagas disponíveis
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Preletor: {event.speaker}</span>
                    </div>
                  </div>
                </div>

                {/* Registration & Ticket Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                  {isRegistered ? (
                    <>
                      <button
                        onClick={() => handleOpenTicket(event)}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Ver Meu Ingresso QR</span>
                      </button>
                      <button
                        onClick={() => cancelEventRegistration(event.id)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors text-center"
                      >
                        Cancelar Inscrição
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id, event.title)}
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>Confirmar Presença</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleShareEvent(event)}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Convidar Amigo</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cultos Fixos da Semana */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1">
          Cultos Semanais Fixos
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Nossa igreja tem portas abertas todos os dias para você e sua família
        </p>

        <div className="divide-y divide-slate-800/80">
          {churchSettings.serviceTimes.map((srv, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {srv.title}
                </h4>
                <p className="text-[11px] text-slate-400">{srv.day}</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg">
                {srv.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
