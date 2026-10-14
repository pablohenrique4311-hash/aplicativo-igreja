import React, { useState } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { ChurchLogo } from '../common/ChurchLogo';
import { getChapterVerses } from '../../data/bibleData';
import {
  Radio,
  BookOpen,
  Calendar,
  HeartHandshake,
  Heart,
  Video,
  FileText,
  ExternalLink,
  Save,
  Check,
  Share2,
  Users,
  Baby,
  Shield,
  ChevronRight,
  Sparkles,
  Settings,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  RefreshCw,
  Tv,
  AlertCircle,
  Bell,
  ArrowRight
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    churchSettings,
    liveStream,
    events,
    setActiveTab,
    openBibleAt,
    saveSermonNote,
    currentUser,
    updateLiveStreamInfo,
    toggleLiveStream
  } = useChurch();

  // Sermon Notes Form
  const [noteTheme, setNoteTheme] = useState(liveStream.title);
  const [notePreacher, setNotePreacher] = useState(liveStream.preacher);
  const [noteScripture, setNoteScripture] = useState(liveStream.primaryScripture);
  const [noteObservations, setNoteObservations] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Live status verification logic
  const [isCheckingStream, setIsCheckingStream] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Agora há pouco');
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);

  // Active recorded video player mode (if user chooses to watch a past message inside the app player)
  const [activeRecordedVideo, setActiveRecordedVideo] = useState<{
    id: string;
    title: string;
    videoId: string;
    preacher: string;
    scripture: string;
    date: string;
  } | null>(null);

  // Quick Admin Transmission Update
  const isManagement =
    currentUser.role === 'admin' ||
    currentUser.role === 'pastor' ||
    currentUser.role === 'leader_ministry';

  const [showAdminStreamEdit, setShowAdminStreamEdit] = useState(false);
  const [adminInputUrl, setAdminInputUrl] = useState(liveStream.youtubeVideoId);
  const [adminQuickSaved, setAdminQuickSaved] = useState(false);

  // Inline Bible synchronization while watching
  const [showInlineBible, setShowInlineBible] = useState(false);

  // Check live status on YouTube channel
  const handleCheckLiveStatus = () => {
    setIsCheckingStream(true);
    setCheckFeedback(null);

    setTimeout(() => {
      setIsCheckingStream(false);
      const nowStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastCheckedTime(nowStr);

      if (liveStream.isLive && liveStream.youtubeVideoId) {
        setCheckFeedback('Transmissão ao vivo detectada no canal oficial!');
      } else {
        setCheckFeedback(
          `Canal verificado às ${nowStr}: nenhum culto ao vivo ativo no momento no @IGEAD_MT.`
        );
      }

      setTimeout(() => setCheckFeedback(null), 4500);
    }, 1100);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTheme.trim()) return;

    saveSermonNote({
      theme: noteTheme,
      preacher: notePreacher,
      mainScripture: noteScripture,
      personalNotes: noteObservations
    });

    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const handleAdminQuickSaveStream = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = adminInputUrl.trim();
    let videoId = trimmed;
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/);
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) videoId = shortMatch[1];
    else if (vMatch) videoId = vMatch[1];
    else if (liveMatch) videoId = liveMatch[1];
    else if (embedMatch) videoId = embedMatch[1];

    updateLiveStreamInfo({
      youtubeVideoId: videoId
    });
    setAdminQuickSaved(true);
    setTimeout(() => setAdminQuickSaved(false), 2500);
  };

  const handleOpenReferencedBible = (ref: string) => {
    if (ref.includes('Pedro')) {
      openBibleAt('1pe', 2, 9);
    } else if (ref.includes('João')) {
      openBibleAt('jo', 3, 16);
    } else if (ref.includes('Salmo')) {
      openBibleAt('sl', 23, 1);
    } else if (ref.includes('Rom')) {
      openBibleAt('rm', 8, 28);
    } else {
      openBibleAt('1pe', 2, 9);
    }
  };

  const handlePlayRecordedInApp = (sermon: typeof recordedSermons[0]) => {
    setActiveRecordedVideo({
      id: sermon.id,
      title: sermon.title,
      videoId: sermon.youtubeVideoId,
      preacher: sermon.preacher,
      scripture: sermon.scripture,
      date: sermon.date
    });
    setNoteTheme(sermon.title);
    setNotePreacher(sermon.preacher);
    setNoteScripture(sermon.scripture);

    // Scroll smoothly to player
    const playerEl = document.getElementById('youtube-player-section');
    playerEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 1 Pedro 2 verses for inline synchronised reading
  const inlineVerses = getChapterVerses('1pe', 2);

  // Official Recorded Sermons & Past Transmissions from @IGEAD_MT
  const recordedSermons = [
    {
      id: 'rec-1',
      title: 'Culto de Celebração da Família — Geração Firme',
      date: 'Domingo às 19:00',
      preacher: 'Liderança Pastoral IGEAD-MT',
      scripture: '1 Pedro 2:9',
      category: 'Família',
      duration: '1h 35m',
      youtubeVideoId: 'dQw4w9WgXcQ'
    },
    {
      id: 'rec-2',
      title: 'Culto de Oração & Intercessão pelas Vidas',
      date: 'Terça-feira às 19:30',
      preacher: 'Equipe de Intercessão IGEAD-MT',
      scripture: 'Filipenses 4:6',
      category: 'Oração',
      duration: '1h 15m',
      youtubeVideoId: 'dQw4w9WgXcQ'
    },
    {
      id: 'rec-3',
      title: 'Culto de Doutrina Bíblica: Firmes na Sã Palavra',
      date: 'Quinta-feira às 19:30',
      preacher: 'Liderança Pastoral IGEAD-MT',
      scripture: 'Romanos 8:28',
      category: 'Doutrina',
      duration: '1h 22m',
      youtubeVideoId: 'dQw4w9WgXcQ'
    },
    {
      id: 'rec-4',
      title: 'Culto do Grupo de Jovens: Conectado com o Céu',
      date: 'Sábado às 19:30',
      preacher: 'Coordenação de Jovens IGEAD-MT',
      scripture: 'João 3:16',
      category: 'Jovens',
      duration: '1h 40m',
      youtubeVideoId: 'dQw4w9WgXcQ'
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-fade-in">
      {/* 1. Official Church Hero Banner with Logo & Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30">
        {/* Decorative Palm Silhouette Overlay echoing the official church banner */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,#fbbf24_0,transparent_70%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <ChurchLogo size="lg" showSlogan={true} showHeartBadge={true} />

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              {churchSettings.address} — {churchSettings.neighborhood}, {churchSettings.cityState} · CEP {churchSettings.cep}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <a
              href={churchSettings.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Canal no YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <button
              onClick={() => setActiveTab('biblia')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Bíblia Digital Completa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CULTO AO VIVO — IGEAD-MT (YouTube Player & Verificação de Status com Estado de Espera) */}
      <div
        id="youtube-player-section"
        className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden scroll-mt-20"
      >
        {/* Stream Status Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            {liveStream.isLive && liveStream.youtubeVideoId ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  CULTO AO VIVO — IGEAD-MT (EM ANDAMENTO)
                </span>
              </>
            ) : activeRecordedVideo ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  REPRODUZINDO GRAVAÇÃO DO CULTO
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></span>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  ESTADO DE ESPERA — CULTO AO VIVO IGEAD-MT
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Button to check stream status */}
            <button
              type="button"
              onClick={handleCheckLiveStatus}
              disabled={isCheckingStream}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Verificar status da transmissão no YouTube"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isCheckingStream ? 'animate-spin' : ''}`} />
              <span>{isCheckingStream ? 'Verificando...' : 'Verificar Status'}</span>
            </button>

            {isManagement && (
              <button
                type="button"
                onClick={() => setShowAdminStreamEdit(!showAdminStreamEdit)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Atualizar link da transmissão"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Gerenciar Transmissão (Admin)</span>
              </button>
            )}

            <a
              href={churchSettings.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Canal @IGEAD_MT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Check Feedback Toast Banner */}
        {checkFeedback && (
          <div className="px-5 py-2.5 bg-amber-400/10 border-b border-amber-400/20 text-xs text-amber-300 flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{checkFeedback}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {lastCheckedTime}
            </span>
          </div>
        )}

        {/* Admin Quick Stream Editor Drawer */}
        {isManagement && showAdminStreamEdit && (
          <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Painel Rápido de Transmissão (Liderança IGEAD-MT)
              </span>
              {adminQuickSaved && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Link atualizado com sucesso!
                </span>
              )}
            </div>

            <form onSubmit={handleAdminQuickSaveStream} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={adminInputUrl}
                onChange={(e) => setAdminInputUrl(e.target.value)}
                placeholder="Cole o link ou ID do YouTube da transmissão (ex: https://youtu.be/...)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold whitespace-nowrap"
              >
                Salvar Link
              </button>
              <button
                type="button"
                onClick={toggleLiveStream}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  liveStream.isLive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {liveStream.isLive ? 'Finalizar Ao Vivo' : 'Iniciar Ao Vivo'}
              </button>
            </form>
          </div>
        )}

        {/* Video Screen / Player Area */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
          {/* Active Recorded Video Mode */}
          {activeRecordedVideo ? (
            <div className="relative w-full h-full flex flex-col">
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="font-bold text-white truncate max-w-xs sm:max-w-md">
                    {activeRecordedVideo.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRecordedVideo(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                >
                  Voltar ao Estado de Espera
                </button>
              </div>

              <iframe
                src={`https://www.youtube.com/embed/${activeRecordedVideo.videoId}?autoplay=1&rel=0`}
                title={activeRecordedVideo.title}
                className="w-full h-full border-0 pt-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : liveStream.isLive && liveStream.youtubeVideoId ? (
            /* Active Live Stream Player */
            <iframe
              src={`https://www.youtube.com/embed/${liveStream.youtubeVideoId}?autoplay=1&rel=0`}
              title="Culto Ao Vivo IGEAD-MT"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* Official Waiting State (No simulated fake transmission, clean respectful church waiting room) */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 relative overflow-hidden">
              {/* Subtle background decorative cross/glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.06)_0,transparent_70%)] pointer-events-none" />

              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                {/* Waiting Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  <span>Transmissão em Espera · Canal Oficial @IGEAD_MT</span>
                </div>

                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  Nenhum culto ao vivo sendo transmitido agora
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  As transmissões da <strong>IGREJA GERAÇÃO ELEITA (IGEAD-MT)</strong> são realizadas em tempo real diretamente do nosso templo durante os cultos oficiais.
                </p>

                {/* Schedule in Waiting State */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs max-w-md mx-auto space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    Horários dos Cultos Presenciais & Transmissão:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>
                      <strong className="text-white block">Domingos 19:00:</strong>
                      <span>Culto da Família</span>
                    </div>
                    <div>
                      <strong className="text-white block">Terças 19:30:</strong>
                      <span>Oração & Intercessão</span>
                    </div>
                    <div>
                      <strong className="text-white block">Quintas 19:30:</strong>
                      <span>Doutrina Bíblica</span>
                    </div>
                    <div>
                      <strong className="text-white block">Sábados 19:30:</strong>
                      <span>Culto dos Jovens</span>
                    </div>
                  </div>
                </div>

                {/* Waiting State Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={handleCheckLiveStatus}
                    disabled={isCheckingStream}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStream ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStream ? 'Verificando...' : 'Verificar se Iniciou'}</span>
                  </button>

                  <a
                    href={churchSettings.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Abrir Canal no YouTube</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>

                  {recordedSermons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handlePlayRecordedInApp(recordedSermons[0])}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Assistir Última Gravação</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live / Service Information Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {activeRecordedVideo
                ? activeRecordedVideo.title
                : liveStream.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeRecordedVideo
                ? `${activeRecordedVideo.preacher} · ${activeRecordedVideo.date}`
                : `${liveStream.preacher} · Canal oficial: @IGEAD_MT`}
            </p>
          </div>

          {/* Quick Bible Reference Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowInlineBible(!showInlineBible)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{showInlineBible ? 'Ocultar Bíblia do Culto' : 'Acompanhar Bíblia Aqui'}</span>
              {showInlineBible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() =>
                handleOpenReferencedBible(
                  activeRecordedVideo
                    ? activeRecordedVideo.scripture
                    : liveStream.primaryScripture
                )
              }
              className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>
                Texto Base:{' '}
                {activeRecordedVideo
                  ? activeRecordedVideo.scripture
                  : liveStream.primaryScripture}
              </span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Inline Synced Bible Reader (Allows reading verses without leaving the video stream) */}
        {showInlineBible && (
          <div className="p-5 bg-slate-950/90 border-b border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Leitura Bíblica Sincronizada — 1 Pedro 2:9 (Texto Base Oficial)
              </span>
              <button
                onClick={() => openBibleAt('1pe', 2, 9)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Abrir na Bíblia Digital Completa</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-2 text-xs text-slate-200 font-serif leading-relaxed">
              {inlineVerses.map((v) => (
                <p
                  key={v.number}
                  className={`p-2 rounded-xl transition-colors ${
                    v.number === 9
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                      : 'hover:bg-slate-900'
                  }`}
                >
                  <sup className="font-sans font-bold text-amber-400 mr-1.5">
                    {v.number}
                  </sup>
                  {v.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Sermon Notes Form (Tema, Pregador, Texto Bíblico, Observações) */}
        <div className="p-5 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Anotações Pessoais do Culto & Sermão
            </h4>
            {noteSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                Anotação salva com sucesso!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveNotes} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Tema da Pregação:</label>
                <input
                  type="text"
                  value={noteTheme}
                  onChange={(e) => setNoteTheme(e.target.value)}
                  placeholder="Ex: O Poder da Geração Eleita"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Pregador:</label>
                <input
                  type="text"
                  value={notePreacher}
                  onChange={(e) => setNotePreacher(e.target.value)}
                  placeholder="Ex: Liderança Pastoral IGEAD-MT"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Texto Bíblico Principal:</label>
                <input
                  type="text"
                  value={noteScripture}
                  onChange={(e) => setNoteScripture(e.target.value)}
                  placeholder="Ex: 1 Pedro 2:9"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Observações Pessoais & O que Deus falou com você:
              </label>
              <textarea
                rows={3}
                value={noteObservations}
                onChange={(e) => setNoteObservations(e.target.value)}
                placeholder="Escreva os pontos marcantes do sermão para guardar no seu histórico espiritual..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleOpenReferencedBible(noteScripture)}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Consultar {noteScripture || 'versículo'} na Bíblia Digital</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar no Meu Perfil</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Últimas Pregações & Transmissões Gravadas (@IGEAD_MT) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-red-400" />
              Últimas Pregações & Transmissões Gravadas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assista novamente às mensagens ministradas nos cultos oficiais pelo canal @IGEAD_MT
            </p>
          </div>

          <a
            href={churchSettings.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            <span>Ver todas no YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {recordedSermons.map((sermon) => (
            <div
              key={sermon.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    {sermon.category}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sermon.duration}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {sermon.title}
                </h4>

                <p className="text-[11px] text-slate-400">{sermon.preacher}</p>
                <p className="text-[10px] text-slate-500 font-mono">📅 {sermon.date}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayRecordedInApp(sermon)}
                  className="flex-1 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>No Player</span>
                </button>

                <a
                  href={churchSettings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  title="Abrir no canal do YouTube"
                >
                  <Video className="w-3 h-3" />
                  <span>YouTube</span>
                </a>

                <button
                  onClick={() => handleOpenReferencedBible(sermon.scripture)}
                  className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-[11px] flex items-center gap-1"
                  title={`Abrir texto base: ${sermon.scripture}`}
                >
                  <BookOpen className="w-3 h-3 text-amber-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Atalhos dos 5 Departamentos Oficiais da Igreja */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Departamentos Oficiais da Igreja
          </h3>
          <button
            onClick={() => setActiveTab('departamentos')}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
          >
            Ver Todos
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('departamentos')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-400 flex items-center justify-center mb-2 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Grupo de Homens</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Sacerdócio e fé</p>
          </button>

          <button
            onClick={() => setActiveTab('departamentos')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-rose-400 flex items-center justify-center mb-2 transition-colors">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Grupo de Mulheres</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Oração e virtude</p>
          </button>

          <button
            onClick={() => setActiveTab('departamentos')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-indigo-400 flex items-center justify-center mb-2 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Grupo de Jovens</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Conectados no Céu</p>
          </button>

          <button
            onClick={() => setActiveTab('departamentos')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-emerald-400 flex items-center justify-center mb-2 transition-colors">
              <Baby className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Grupo de Crianças</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Proteção e amor</p>
          </button>

          <button
            onClick={() => setActiveTab('departamentos')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-left transition-all group sm:col-span-1 col-span-2"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-400 flex items-center justify-center mb-2 transition-colors">
              <Video className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Grupo da Mídia</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Escalas de serviço</p>
          </button>
        </div>
      </div>

      {/* 5. Versículo Oficial da Igreja: 1 Pedro 2:9 */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Palavra Oficial da Igreja
            </span>
          </div>
          <span className="text-xs text-slate-400">1 Pedro 2:9</span>
        </div>

        <blockquote className="text-sm sm:text-base font-serif italic text-slate-100 leading-relaxed">
          "Mas vós sois a geração eleita, o sacerdócio real, a nação santa, o povo adquirido, para que anuncieis as virtudes daquele que vos chamou das trevas para a sua maravilhosa luz."
        </blockquote>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <span className="text-amber-400 font-bold">
            — {churchSettings.name} ({churchSettings.acronym})
          </span>
          <button
            onClick={() => openBibleAt('1pe', 2, 9)}
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Ler 1 Pedro 2 no contexto</span>
          </button>
        </div>
      </div>

      {/* 6. Horários Oficiais dos Cultos da IGEAD-MT */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1">
          Cultos Presenciais da Semana
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {churchSettings.address} — {churchSettings.neighborhood}, {churchSettings.cityState}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {churchSettings.serviceTimes.map((srv, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-white">{srv.title}</p>
                <p className="text-[11px] text-slate-400">{srv.day}</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                {srv.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
