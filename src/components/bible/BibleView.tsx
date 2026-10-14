import React, { useState, useEffect, useRef } from 'react';
import { useChurch } from '../../context/ChurchContext';
import {
  BIBLE_66_BOOKS,
  BibleBookInfo,
  parseBiblicalReference
} from '../../data/bibleData';
import {
  BibleVerseItem,
  AVAILABLE_TRANSLATIONS,
  BibleTranslationMeta,
  fetchChapterVerses,
  isChapterCachedLocally,
  downloadBookForOffline,
  runBibleDiagnostics,
  DiagnosticResult,
  getOfflineCacheStats,
  clearAllBibleCache,
  getCachedChaptersSet
} from '../../services/bibleService';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Copy,
  Check,
  Edit3,
  Trash2,
  History,
  Info,
  Sun,
  Moon,
  Video,
  Radio,
  ExternalLink,
  X,
  Download,
  WifiOff,
  CloudCheck,
  Database,
  RefreshCw,
  Sliders,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const BibleView: React.FC = () => {
  const {
    bibleTarget,
    userVerseNotes,
    addVerseNote,
    removeVerseNote,
    userVerseFavorites,
    toggleVerseFavorite,
    bibleRecentHistory,
    addBibleHistory,
    churchSettings,
    liveStream,
    appTheme
  } = useChurch();

  // Translation Selection
  const [selectedTranslation, setSelectedTranslation] = useState<string>('por_blj');
  const activeTranslationMeta =
    AVAILABLE_TRANSLATIONS.find((t) => t.id === selectedTranslation) ||
    AVAILABLE_TRANSLATIONS[0];

  // Selected Book and Chapter
  const [selectedBookId, setSelectedBookId] = useState<string>(
    bibleTarget?.bookId || '1pe'
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(
    bibleTarget?.chapter || 2
  );
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(
    bibleTarget?.verse || 9
  );

  // Verses state from online API / offline cache
  const [verses, setVerses] = useState<BibleVerseItem[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(true);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Cached chapters tracking
  const [cachedChaptersSet, setCachedChaptersSet] = useState<Set<string>>(new Set());

  // Download state for entire book
  const [isDownloadingBook, setIsDownloadingBook] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    completed: number;
    total: number;
    currentChapter: number;
  } | null>(null);
  const downloadAbortRef = useRef<AbortController | null>(null);

  // Modals & Panels
  const [showLiveStreamPlayer, setShowLiveStreamPlayer] = useState(false);
  const [showTranslationInfoModal, setShowTranslationInfoModal] = useState(false);
  const [showOfflineManagerModal, setShowOfflineManagerModal] = useState(false);
  const [cacheStats, setCacheStats] = useState(getOfflineCacheStats());

  // Diagnostics Test Suite State
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[] | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);

  // Reader Settings
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia'>(
    appTheme === 'claro' ? 'light' : 'dark'
  );

  // Sub-tabs: 'leitura' | 'favoritos' | 'anotacoes' | 'historico'
  const [activeSubTab, setActiveSubTab] = useState<
    'leitura' | 'favoritos' | 'anotacoes' | 'historico'
  >('leitura');

  // Search input
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { book: BibleBookInfo; chapter: number; verse: number; text: string }[]
  >([]);

  // Note dialog
  const [editingNoteVerse, setEditingNoteVerse] = useState<{
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
  } | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);

  const currentBook =
    BIBLE_66_BOOKS.find((b) => b.id === selectedBookId) || BIBLE_66_BOOKS[0];

  // Refresh cached set
  const refreshCacheStatus = () => {
    setCachedChaptersSet(getCachedChaptersSet());
    setCacheStats(getOfflineCacheStats());
  };

  useEffect(() => {
    refreshCacheStatus();
  }, []);

  // Fetch Chapter Verses whenever book, chapter, or translation changes
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function loadChapter() {
      setIsLoadingVerses(true);
      setFetchError(null);

      try {
        const result = await fetchChapterVerses(
          selectedTranslation,
          selectedBookId,
          selectedChapter,
          controller.signal
        );

        if (!isCancelled) {
          if (result.verses.length > 0) {
            setVerses(result.verses);
            setIsFromCache(result.fromCache);
            setFetchError(null);
            refreshCacheStatus();
          } else if (result.error === 'OFFLINE_UNAVAILABLE') {
            setVerses([]);
            setIsFromCache(false);
            setFetchError('OFFLINE_UNAVAILABLE');
          } else {
            setVerses([]);
            setIsFromCache(false);
            setFetchError('NETWORK_ERROR');
          }
        }
      } catch (e: any) {
        if (!isCancelled && e?.name !== 'AbortError') {
          setVerses([]);
          setIsFromCache(false);
          setFetchError('NETWORK_ERROR');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingVerses(false);
        }
      }
    }

    loadChapter();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [selectedTranslation, selectedBookId, selectedChapter]);

  // Sync external navigation targets (e.g., from Live Service base scripture)
  useEffect(() => {
    if (bibleTarget) {
      setSelectedBookId(bibleTarget.bookId);
      setSelectedChapter(bibleTarget.chapter);
      if (bibleTarget.verse) {
        setHighlightedVerse(bibleTarget.verse);
      }
      setActiveSubTab('leitura');
    }
  }, [bibleTarget]);

  // Record history
  useEffect(() => {
    addBibleHistory(currentBook.id, currentBook.name, selectedChapter);
  }, [currentBook.id, selectedChapter]);

  // Scroll to highlighted verse when loaded
  useEffect(() => {
    if (highlightedVerse && !isLoadingVerses && verses.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`verse-${highlightedVerse}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [highlightedVerse, isLoadingVerses, verses.length]);

  // Chapter navigation
  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((prev) => prev - 1);
      setHighlightedVerse(null);
    } else {
      const currentIndex = BIBLE_66_BOOKS.findIndex((b) => b.id === selectedBookId);
      if (currentIndex > 0) {
        const prevBook = BIBLE_66_BOOKS[currentIndex - 1];
        setSelectedBookId(prevBook.id);
        setSelectedChapter(prevBook.chaptersCount);
        setHighlightedVerse(null);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < currentBook.chaptersCount) {
      setSelectedChapter((prev) => prev + 1);
      setHighlightedVerse(null);
    } else {
      const currentIndex = BIBLE_66_BOOKS.findIndex((b) => b.id === selectedBookId);
      if (currentIndex < BIBLE_66_BOOKS.length - 1) {
        const nextBook = BIBLE_66_BOOKS[currentIndex + 1];
        setSelectedBookId(nextBook.id);
        setSelectedChapter(1);
        setHighlightedVerse(null);
      }
    }
  };

  // Search handler (reference parser or text match)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // 1. Direct Reference Jump
    const parsed = parseBiblicalReference(searchQuery);
    if (parsed && parsed.book && parsed.chapter) {
      setSelectedBookId(parsed.book.id);
      setSelectedChapter(parsed.chapter);
      if (parsed.verse) {
        setHighlightedVerse(parsed.verse);
      }
      setActiveSubTab('leitura');
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    // 2. Keyword Search in currently loaded and seed passages
    const query = searchQuery.toLowerCase();
    const results: { book: BibleBookInfo; chapter: number; verse: number; text: string }[] = [];

    // Search in current chapter
    verses.forEach((v) => {
      if (v.text.toLowerCase().includes(query)) {
        results.push({
          book: currentBook,
          chapter: selectedChapter,
          verse: v.number,
          text: v.text
        });
      }
    });

    setSearchResults(results.slice(0, 20));
  };

  const handleCopyVerse = (verseNum: number, text: string) => {
    const formatted = `"${text}"\n— ${currentBook.name} ${selectedChapter}:${verseNum} (${activeTranslationMeta.shortName})\nIgreja Geração Eleita — IGEAD-MT`;
    navigator.clipboard.writeText(formatted);
    setCopiedVerseNum(verseNum);
    setTimeout(() => setCopiedVerseNum(null), 2000);
  };

  const handleShareWhatsApp = (verseNum: number, text: string) => {
    const message = encodeURIComponent(
      `"${text}"\n\n📖 *${currentBook.name} ${selectedChapter}:${verseNum}* (${activeTranslationMeta.shortName})\nIgreja Geração Eleita — IGEAD-MT\n_Conectado com o Céu, firme na terra_`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteVerse || !noteContent.trim()) return;

    addVerseNote(
      editingNoteVerse.bookId,
      editingNoteVerse.bookName,
      editingNoteVerse.chapter,
      editingNoteVerse.verse,
      editingNoteVerse.text,
      noteContent.trim()
    );

    setEditingNoteVerse(null);
    setNoteContent('');
  };

  // Download entire book for offline use
  const handleDownloadCurrentBook = async () => {
    if (isDownloadingBook) return;
    setIsDownloadingBook(true);
    const controller = new AbortController();
    downloadAbortRef.current = controller;

    try {
      await downloadBookForOffline(
        selectedTranslation,
        selectedBookId,
        currentBook.chaptersCount,
        (completed, total, ch) => {
          setDownloadProgress({
            completed,
            total,
            currentChapter: ch
          });
        },
        controller.signal
      );
      refreshCacheStatus();
    } catch (e) {
      console.error('Download cancelled or failed', e);
    } finally {
      setIsDownloadingBook(false);
      setDownloadProgress(null);
      downloadAbortRef.current = null;
    }
  };

  const handleCancelDownload = () => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort();
    }
    setIsDownloadingBook(false);
    setDownloadProgress(null);
  };

  // Run Real Diagnostic Tests
  const handleExecuteDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await runBibleDiagnostics();
      setDiagnosticResults(res);
    } catch (e) {
      console.error('Diagnostics failed', e);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Theme styling for reading paper
  const getThemeClasses = () => {
    switch (readerTheme) {
      // Cores fixas: o papel de leitura tem tema próprio, independente do tema do app
      case 'light':
        return 'bg-[#fffbeb] text-[#0f172b] border-[#fee685] shadow-md';
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#e8d5b5] shadow-md';
      case 'dark':
      default:
        return 'bg-[#0f172b] text-[#f1f5f9] border-[#1d293d] shadow-2xl';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm sm:text-base leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'xl':
        return 'text-xl sm:text-2xl leading-loose';
      case 'md':
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  const isCurrentChapterOffline = isChapterCachedLocally(
    selectedTranslation,
    selectedBookId,
    selectedChapter
  );

  return (
    <div className="space-y-5 pb-20 md:pb-12 animate-fade-in">
      {/* 1. Header with Church Identity & Bible Metadata */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Palavra de Deus · IGEAD-MT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Bíblia Digital Completa (66 Livros)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Acompanhe as pregações da <strong>IGREJA GERAÇÃO ELEITA</strong>, leia os 66 livros canônicos com texto bíblico real online e offline, marque favoritos e anote seus insights.
          </p>
        </div>

        {/* Live Stream, Offline Manager & Translation Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Button to watch live preaching while reading Bible */}
          <button
            type="button"
            onClick={() => setShowLiveStreamPlayer(!showLiveStreamPlayer)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              showLiveStreamPlayer
                ? 'bg-red-500 text-white border-red-400 shadow-md'
                : liveStream.isLive
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Video className="w-4 h-4 text-red-400" />
            <span>
              {showLiveStreamPlayer
                ? 'Ocultar Vídeo do Culto'
                : liveStream.isLive
                ? 'Acompanhar Culto ao Vivo'
                : 'Assistir Transmissão'}
            </span>
            {liveStream.isLive && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          {/* Offline Manager Quick Button */}
          <button
            type="button"
            onClick={() => {
              setCacheStats(getOfflineCacheStats());
              setShowOfflineManagerModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors"
            title="Gerenciar Leitura Offline e Download"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline ({cacheStats.cachedChaptersCount} cap)</span>
          </button>

          {/* Translation selector with legal disclaimer badge */}
          <button
            type="button"
            onClick={() => setShowTranslationInfoModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Versão: <strong className="text-amber-300">{activeTranslationMeta.shortName}</strong> ({activeTranslationMeta.licenseType === 'public-domain' ? 'Domínio Público' : 'CC BY 3.0'})</span>
          </button>
        </div>
      </div>

      {/* 2. DOCKED LIVE STREAM MINI PLAYER (Allows following preaching with the Bible) */}
      {showLiveStreamPlayer && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {liveStream.isLive ? 'Culto Ao Vivo — IGEAD-MT' : 'Transmissão Oficial IGEAD-MT'}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                · Acompanhe a pregação simultaneamente com a Bíblia aberta
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={churchSettings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setShowLiveStreamPlayer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                title="Fechar Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative aspect-video max-w-3xl mx-auto w-full bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            {liveStream.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${liveStream.youtubeVideoId}?autoplay=1&rel=0`}
                title="Culto Ao Vivo IGEAD-MT"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Radio className="w-8 h-8 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Canal Oficial: @IGEAD_MT</h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Acesse o canal do YouTube da Igreja Geração Eleita para cultos anteriores e transmissões.
                </p>
                <a
                  href={churchSettings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Abrir Canal no YouTube</span>
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <p>
              Pregador: <strong className="text-white">{liveStream.preacher}</strong> · Tema:{' '}
              <strong className="text-white">{liveStream.title}</strong>
            </p>
            <p className="text-amber-400 font-mono">Texto Base: {liveStream.primaryScripture}</p>
          </div>
        </div>
      )}

      {/* 3. Sub-Tabs: Leitura | Favoritos | Minhas Anotações | Histórico */}
      <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveSubTab('leitura')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeSubTab === 'leitura'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Leitura Bíblica</span>
        </button>

        <button
          onClick={() => setActiveSubTab('favoritos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeSubTab === 'favoritos'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Versículos Favoritos ({userVerseFavorites.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('anotacoes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeSubTab === 'anotacoes'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Minhas Anotações ({userVerseNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('historico')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeSubTab === 'historico'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Histórico</span>
        </button>
      </div>

      {/* TAB 1: LEITURA BÍBLICA */}
      {activeSubTab === 'leitura' && (
        <div className="space-y-4">
          {/* Quick Search and Reference Jump Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite a referência (ex: 1 Pedro 2:9, João 3:16, Sl 23, Rm 8:28) ou palavra..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition-transform active:scale-95"
            >
              Ir para o Texto
            </button>
          </form>

          {/* Search results banner if any */}
          {searchResults.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">
                  {searchResults.length} Resultados Encontrados no capítulo
                </span>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Fechar busca
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 divide-y divide-slate-800">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedBookId(res.book.id);
                      setSelectedChapter(res.chapter);
                      setHighlightedVerse(res.verse);
                      setSearchResults([]);
                    }}
                    className="pt-1.5 cursor-pointer hover:text-amber-300 text-xs text-slate-300"
                  >
                    <strong className="text-amber-400 font-semibold">
                      {res.book.name} {res.chapter}:{res.verse}
                    </strong>{' '}
                    — {res.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book, Chapter and Formatting Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Book Selector (All 66 Books) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold">Livro:</span>
                <select
                  value={selectedBookId}
                  onChange={(e) => {
                    const newBookId = e.target.value;
                    setSelectedBookId(newBookId);
                    setSelectedChapter(1);
                    setHighlightedVerse(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-hidden"
                >
                  <optgroup label="Antigo Testamento (39 Livros)">
                    {BIBLE_66_BOOKS.filter((b) => b.testament === 'AT').map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.abbrev})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Novo Testamento (27 Livros)">
                    {BIBLE_66_BOOKS.filter((b) => b.testament === 'NT').map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.abbrev})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Chapter Selector with Offline Badge Indicator */}
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-xs text-slate-400 font-semibold">Capítulo:</span>
                <select
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(Number(e.target.value));
                    setHighlightedVerse(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-hidden"
                >
                  {Array.from({ length: currentBook.chaptersCount }, (_, i) => i + 1).map(
                    (ch) => {
                      const isCached = isChapterCachedLocally(
                        selectedTranslation,
                        selectedBookId,
                        ch
                      );
                      return (
                        <option key={ch} value={ch}>
                          Cap. {ch} {isCached ? '✓ (Offline)' : ''}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* Offline indicator badge for current chapter */}
              <div className="hidden sm:flex items-center">
                {isCurrentChapterOffline ? (
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <CloudCheck className="w-3 h-3 text-emerald-400" />
                    <span>Disponível Offline</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadCurrentBook}
                    disabled={isDownloadingBook}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-medium flex items-center gap-1 transition-colors"
                    title={`Baixar todos os ${currentBook.chaptersCount} capítulos de ${currentBook.name} para leitura sem internet`}
                  >
                    <Download className="w-3 h-3 text-amber-400" />
                    <span>{isDownloadingBook ? 'Baixando...' : `Baixar ${currentBook.name}`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Reading Mode and Font size options */}
            <div className="flex items-center gap-2">
              {/* Font Size Button */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFontSize('sm')}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold ${
                    fontSize === 'sm' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fonte Pequena"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('md')}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold ${
                    fontSize === 'md' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fonte Média"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold ${
                    fontSize === 'lg' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fonte Grande"
                >
                  A+
                </button>
              </div>

              {/* Color Themes: Dark / Light / Sepia */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setReaderTheme('dark')}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs ${
                    readerTheme === 'dark' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
                  }`}
                  title="Modo Escuro"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReaderTheme('light')}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs ${
                    readerTheme === 'light' ? 'bg-[#fffbeb] text-[#0f172b] ring-1 ring-amber-400 font-bold' : 'text-slate-400'
                  }`}
                  title="Modo Claro"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReaderTheme('sepia')}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${
                    readerTheme === 'sepia' ? 'bg-[#fbf0d9] text-[#433422] ring-1 ring-amber-400' : 'text-slate-400'
                  }`}
                  title="Modo Sépia (Papel Bíblico)"
                >
                  S
                </button>
              </div>
            </div>
          </div>

          {/* Book Download Progress Banner if active */}
          {downloadProgress && (
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Download className="w-4 h-4 animate-bounce text-amber-400" />
                  Baixando {currentBook.name} para uso offline: Capítulo {downloadProgress.currentChapter} de {downloadProgress.total}...
                </span>
                <button
                  type="button"
                  onClick={handleCancelDownload}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  Cancelar
                </button>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 transition-all duration-200"
                  style={{
                    width: `${Math.round((downloadProgress.completed / downloadProgress.total) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Scripture Reading Canvas */}
          <div className={`p-4 sm:p-10 rounded-3xl border transition-colors ${getThemeClasses()}`}>
            {/* Header: Book Title & Chapter Navigation */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-current/10">
              <button
                onClick={handlePrevChapter}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Capítulo Anterior</span>
              </button>

              <div className="text-center">
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-amber-500 block">
                  {currentBook.category} · {currentBook.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mt-0.5">
                  {currentBook.name} {selectedChapter}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[11px] font-sans opacity-70">
                    {activeTranslationMeta.name}
                  </span>
                  {isFromCache && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-sans bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      Cache Offline
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleNextChapter}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-semibold transition-colors"
              >
                <span className="hidden sm:inline">Próximo Capítulo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Loading Spinner */}
            {isLoadingVerses && (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 font-sans text-center">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-sm font-semibold opacity-80">
                  Carregando {currentBook.name} {selectedChapter}...
                </p>
                <p className="text-xs opacity-50">
                  Consultando Free Use Bible API ({activeTranslationMeta.shortName})
                </p>
              </div>
            )}

            {/* Offline Unavailable Error State */}
            {!isLoadingVerses && fetchError === 'OFFLINE_UNAVAILABLE' && (
              <div className="py-12 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center font-sans space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <WifiOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Capítulo Não Disponível Offline
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Você está desconectado da internet e o capítulo <strong>{currentBook.name} {selectedChapter}</strong> ainda não foi salvo em seu dispositivo.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedBookId('1pe');
                      setSelectedChapter(2);
                      setHighlightedVerse(9);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Ler 1 Pedro 2 (Disponível Offline)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBookId('sl');
                      setSelectedChapter(23);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
                  >
                    Ler Salmos 23 (Disponível Offline)
                  </button>
                </div>
              </div>
            )}

            {/* Network Error State */}
            {!isLoadingVerses && fetchError === 'NETWORK_ERROR' && (
              <div className="py-12 px-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center font-sans space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">
                  Não foi possível carregar este capítulo online
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Verifique sua conexão ou tente recarregar. Se persistir, você pode consultar os capítulos já salvos em cache.
                </p>
                <button
                  onClick={() => {
                    setSelectedChapter((prev) => prev);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Quick Verse Jump Pills */}
            {!isLoadingVerses && verses.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-current/10 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 shrink-0">
                  Pular p/ Versículo:
                </span>
                {verses.map((v) => (
                  <button
                    key={v.number}
                    type="button"
                    onClick={() => {
                      setHighlightedVerse(v.number);
                      const el = document.getElementById(`verse-${v.number}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-8 h-8 rounded-lg shrink-0 text-xs font-semibold flex items-center justify-center transition-all ${
                      highlightedVerse === v.number
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md scale-105'
                        : 'bg-black/10 hover:bg-black/20 text-current border border-current/10'
                    }`}
                    title={`Ir para o versículo ${v.number}`}
                  >
                    {v.number}
                  </button>
                ))}
              </div>
            )}

            {/* Real Verses List */}
            {!isLoadingVerses && verses.length > 0 && (
              <div className={`space-y-4 font-serif ${getFontSizeClass()}`}>
                {verses.map((verse) => {
                  const isHighlighted = highlightedVerse === verse.number;
                  const isFavorite = userVerseFavorites.some(
                    (f) =>
                      f.bookId === currentBook.id &&
                      f.chapter === selectedChapter &&
                      f.verse === verse.number
                  );
                  const hasNote = userVerseNotes.some(
                    (n) =>
                      n.bookId === currentBook.id &&
                      n.chapter === selectedChapter &&
                      n.verse === verse.number
                  );

                  return (
                    <div
                      key={verse.number}
                      id={`verse-${verse.number}`}
                      className={`p-3 rounded-2xl transition-all group ${
                        isHighlighted
                          ? 'bg-amber-500/20 ring-2 ring-amber-400/50'
                          : 'hover:bg-current/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <sup className="text-xs font-sans font-bold text-amber-500 pt-1 select-none shrink-0">
                          {verse.number}
                        </sup>
                        <div className="flex-1 min-w-0">
                          <span className="leading-relaxed">{verse.text}</span>

                          {/* Inline Actions Toolbar */}
                          <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2 pt-2 border-t border-current/10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans">
                            {/* Favorite toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                toggleVerseFavorite(
                                  currentBook.id,
                                  currentBook.name,
                                  selectedChapter,
                                  verse.number,
                                  verse.text
                                )
                              }
                              className={`min-h-8 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                                isFavorite
                                  ? 'text-rose-500 font-bold'
                                  : 'hover:bg-current/10 opacity-70 hover:opacity-100'
                              }`}
                              title={isFavorite ? 'Remover dos Favoritos' : 'Favoritar Versículo'}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                              <span className="text-[11px]">{isFavorite ? 'Salvo' : 'Favoritar'}</span>
                            </button>

                            {/* Add / View Note */}
                            <button
                              type="button"
                              onClick={() =>
                                setEditingNoteVerse({
                                  bookId: currentBook.id,
                                  bookName: currentBook.name,
                                  chapter: selectedChapter,
                                  verse: verse.number,
                                  text: verse.text
                                })
                              }
                              className={`min-h-8 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                                hasNote
                                  ? 'text-amber-400 font-bold'
                                  : 'hover:bg-current/10 opacity-70 hover:opacity-100'
                              }`}
                              title="Adicionar anotação bíblica pessoal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{hasNote ? 'Ver Anotação' : 'Anotar'}</span>
                            </button>

                            {/* Copy Verse */}
                            <button
                              type="button"
                              onClick={() => handleCopyVerse(verse.number, verse.text)}
                              className="min-h-8 px-2 py-1.5 rounded-lg hover:bg-current/10 transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
                              title="Copiar texto e referência"
                            >
                              {copiedVerseNum === verse.number ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-[11px] text-emerald-400">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copiar</span>
                                </>
                              )}
                            </button>

                            {/* Share WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleShareWhatsApp(verse.number, verse.text)}
                              className="min-h-8 px-2 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors flex items-center gap-1 ml-auto"
                              title="Compartilhar no WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom chapter navigation */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-current/10">
              <button
                onClick={handlePrevChapter}
                className="px-4 py-2 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Capítulo Anterior</span>
              </button>

              <span className="text-xs font-mono opacity-60">
                {currentBook.name} {selectedChapter} de {currentBook.chaptersCount}
              </span>

              <button
                onClick={handleNextChapter}
                className="px-4 py-2 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Próximo Capítulo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Translation Footnote & Legal Attribution */}
            <div className="mt-8 pt-4 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-sans opacity-60">
              <span>
                Texto bíblico: <strong>{activeTranslationMeta.name}</strong> ({activeTranslationMeta.license})
              </span>
              <span>
                Fonte de dados: Free Use Bible API · bible.helloao.org
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERSÍCULOS FAVORITOS */}
      {activeSubTab === 'favoritos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              Meus Versículos Favoritos ({userVerseFavorites.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Passagens bíblicas que você guardou no coração durante os cultos e devocionais.
            </p>
          </div>

          {userVerseFavorites.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Heart className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Você ainda não favoritou nenhum versículo.
              </p>
              <p className="text-[11px] text-slate-500">
                Ao ler a Bíblia, passe o mouse ou toque sobre um versículo e clique em "Favoritar".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userVerseFavorites.map((fav) => (
                <div
                  key={fav.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      onClick={() => {
                        setSelectedBookId(fav.bookId);
                        setSelectedChapter(fav.chapter);
                        setHighlightedVerse(fav.verse);
                        setActiveSubTab('leitura');
                      }}
                      className="font-bold text-amber-400 text-xs hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {fav.bookName} {fav.chapter}:{fav.verse}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        toggleVerseFavorite(
                          fav.bookId,
                          fav.bookName,
                          fav.chapter,
                          fav.verse,
                          fav.text
                        )
                      }
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                    "{fav.text}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Salvo em {fav.savedAt}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyVerse(fav.verse, fav.text)}
                        className="hover:text-white"
                      >
                        Copiar
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(fav.verse, fav.text)}
                        className="hover:text-emerald-400"
                      >
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MINHAS ANOTAÇÕES */}
      {activeSubTab === 'anotacoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Minhas Anotações Bíblicas ({userVerseNotes.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflexões, revelações e anotações dos cultos vinculadas à sua conta.
            </p>
          </div>

          {userVerseNotes.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Edit3 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Nenhuma anotação bíblica registrada até o momento.
              </p>
              <p className="text-[11px] text-slate-500">
                Você pode anotar reflexões em qualquer versículo enquanto acompanha a pregação.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userVerseNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      onClick={() => {
                        setSelectedBookId(n.bookId);
                        setSelectedChapter(n.chapter);
                        setHighlightedVerse(n.verse);
                        setActiveSubTab('leitura');
                      }}
                      className="font-bold text-amber-400 text-xs hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {n.bookName} {n.chapter}:{n.verse}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVerseNote(n.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Excluir Anotação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-serif italic border-l-2 border-amber-400/40 pl-2">
                    "{n.text}"
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                    {n.note}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Anotado em {n.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HISTÓRICO DE CAPÍTULOS CONSULTADOS */}
      {activeSubTab === 'historico' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Histórico de Capítulos Consultados
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Últimos capítulos que você acessou para estudo ou acompanhamento de pregações.
            </p>
          </div>

          {bibleRecentHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Nenhum histórico registrado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {bibleRecentHistory.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedBookId(h.bookId);
                    setSelectedChapter(h.chapter);
                    setHighlightedVerse(null);
                    setActiveSubTab('leitura');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/40 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <strong className="text-xs text-white block">
                      {h.bookName} {h.chapter}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Acessado em {h.accessedAt}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Creation / Editing Modal */}
      {editingNoteVerse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveNote}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Anotação Bíblica — {editingNoteVerse.bookName} {editingNoteVerse.chapter}:{editingNoteVerse.verse}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteVerse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-serif italic p-3 bg-slate-950 rounded-xl border border-slate-800">
              "{editingNoteVerse.text}"
            </p>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                Sua anotação pessoal ou reflexão do culto:
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Ex: O pastor destacou este versículo sobre sermos geração eleita e sacerdócio real..."
                rows={4}
                required
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNoteVerse(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 shadow-md"
              >
                Salvar Anotação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Translation & Copyright Info Modal */}
      {showTranslationInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Tradução Bíblica & Licenciamento Legal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTranslationInfoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Fonte Oficial Online:
                </span>
                <p className="font-bold text-white text-sm">
                  Free Use Bible API (AO Lab) · bible.helloao.org
                </p>
                <p className="text-slate-400 text-[11px]">
                  Todos os 66 livros da Bíblia Sagrada integrados diretamente no app, com textos bíblicos reais em língua portuguesa e cache para consulta sem internet.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1.5">
                  Selecione a Versão Bíblica:
                </h4>
                <div className="space-y-2">
                  {AVAILABLE_TRANSLATIONS.map((item) => (
                    <label
                      key={item.id}
                      className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-colors ${
                        selectedTranslation === item.id
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="translation"
                            checked={selectedTranslation === item.id}
                            onChange={() => setSelectedTranslation(item.id)}
                            className="accent-amber-400"
                          />
                          <span className="font-bold text-xs text-white">{item.name}</span>
                        </div>
                        {item.recommended && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold">
                            Recomendada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 pl-6">
                        {item.description}
                      </p>
                      <span className="text-[10px] text-amber-400/90 pl-6 font-mono">
                        Licença: {item.license}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Real Diagnostic Tool Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExecuteDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className={`w-4 h-4 text-emerald-400 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
                  <span>{isRunningDiagnostics ? 'Executando Testes...' : 'Executar Diagnóstico e Teste da API Bíblica'}</span>
                </button>
              </div>

              {/* Diagnostic Results Report */}
              {diagnosticResults && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in text-[11px]">
                  <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">
                    ✓ Relatório de Testes & Validação da API:
                  </span>
                  <div className="space-y-1.5 divide-y divide-slate-800/80">
                    {diagnosticResults.map((r) => (
                      <div key={r.testId} className="pt-1.5 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{r.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {r.status === 'passed' ? 'PASSOU' : 'FALHOU'} ({r.durationMs}ms)
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px]">{r.details}</p>
                        {r.verseExcerpt && (
                          <p className="text-amber-300 font-serif italic text-[10px] bg-slate-900 p-1.5 rounded">
                            "{r.verseExcerpt}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTranslationInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Cache Manager Modal */}
      {showOfflineManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Gerenciador de Bíblia Offline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineManagerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Capítulos em Cache:</span>
                  <span className="text-xl font-bold text-emerald-400">{cacheStats.cachedChaptersCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Espaço Utilizado:</span>
                  <span className="text-xl font-bold text-amber-400">~{cacheStats.estimatedSizeKb} KB</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Ações de Leitura Offline:</span>
                <p className="text-[11px] text-slate-400">
                  Você pode baixar livros inteiros para ler sem conexão durante viagens ou momentos sem internet.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadCurrentBook();
                      setShowOfflineManagerModal(false);
                    }}
                    disabled={isDownloadingBook}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-between"
                  >
                    <span>Baixar Livro Atual ({currentBook.name} — {currentBook.chaptersCount} cap)</span>
                    <Download className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAllBibleCache();
                    refreshCacheStatus();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Cache Offline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowOfflineManagerModal(false)}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
