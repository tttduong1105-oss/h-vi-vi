import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Disc3,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  ChevronDown,
  ListMusic,
} from 'lucide-react';
import { winterAudio } from '../utils/audioPlayer';

export interface MusicTrack {
  id: string;
  si: string;
  title: string;
  artist: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'OmfG5jX1f3g',
    si: 'x4rs5tjZDZ-5YFqZ',
    title: 'Biển, Đảo Và Em (海屿你)',
    artist: 'Mã Dã (Crabbit)',
  },
  {
    id: '2YM4j-oP_qQ',
    si: '5o4K4fl8fNaIPeq-',
    title: 'Mơ (Dreaming)',
    artist: 'Vũ Cát Tường',
  },
  {
    id: 'OdBz2pZSamo',
    si: '3KbwQkUZPNtqZzk0',
    title: 'Đâu Đâu Cũng Là Em (哪里都是你)',
    artist: 'Đội Trưởng (队长)',
  },
  {
    id: 'WqYjmjtXMwQ',
    si: '-8eAQUJSjNP8PJ4A',
    title: 'Tình Mình Lạ Kì',
    artist: 'Lil Z Poet',
  },
  {
    id: '_YzngEllRgM',
    si: 'XW3R8ajuMOzMYmB1',
    title: 'Có Em Chờ (ft. Mr.A)',
    artist: 'MIN',
  },
];

interface MusicBoxProps {
  externalToggleSignal?: number;
  externalOpenSignal?: number;
  onPlayingStateChange?: (isPlaying: boolean) => void;
}

export default function MusicBox({
  externalToggleSignal = 0,
  externalOpenSignal = 0,
  onPlayingStateChange,
}: MusicBoxProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [shouldAutoplay, setShouldAutoplay] = useState<boolean>(false);
  const [repeatOne, setRepeatOne] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [showTracklist, setShowTracklist] = useState<boolean>(true);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const repeatOneRef = useRef<boolean>(repeatOne);
  const lastToggleSignalRef = useRef<number>(externalToggleSignal);
  const lastOpenSignalRef = useRef<number>(externalOpenSignal);

  useEffect(() => {
    repeatOneRef.current = repeatOne;
  }, [repeatOne]);

  useEffect(() => {
    onPlayingStateChange?.(isPlaying);
    if (isPlaying && winterAudio.getIsPlaying()) {
      winterAudio.pause();
    }
  }, [isPlaying, onPlayingStateChange]);

  const sendPlayerCommand = useCallback((func: string, args: unknown[] = []) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({
        event: 'command',
        func,
        args,
      }),
      '*'
    );
  }, []);

  const registerYouTubeBridge = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({
        event: 'listening',
        id: 'winter-music-box',
        channel: 'widget',
      }),
      '*'
    );
    win.postMessage(
      JSON.stringify({
        event: 'command',
        func: 'addEventListener',
        args: ['onStateChange'],
      }),
      '*'
    );
  }, []);

  const handleIframeLoad = useCallback(() => {
    registerYouTubeBridge();
    const timer = window.setTimeout(() => {
      registerYouTubeBridge();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [registerYouTubeBridge]);

  const handleNextTrack = useCallback(() => {
    setShouldAutoplay(true);
    setCurrentIndex((prev) => (prev + 1) % MUSIC_TRACKS.length);
    setIsPlaying(true);
  }, []);

  const handlePrevTrack = useCallback(() => {
    setShouldAutoplay(true);
    setCurrentIndex((prev) => (prev - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      sendPlayerCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      if (!shouldAutoplay) {
        setShouldAutoplay(true);
      }
      sendPlayerCommand('playVideo');
      setIsPlaying(true);
    }
  }, [isPlaying, sendPlayerCommand, shouldAutoplay]);

  const handleSelectTrack = (index: number) => {
    if (index === currentIndex) {
      handleTogglePlay();
      return;
    }
    setShouldAutoplay(true);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  // Sync external play/pause toggle from Header
  useEffect(() => {
    if (externalToggleSignal !== lastToggleSignalRef.current) {
      lastToggleSignalRef.current = externalToggleSignal;
      setIsExpanded(true);
      handleTogglePlay();
    }
  }, [externalToggleSignal, handleTogglePlay]);

  // Sync external open request
  useEffect(() => {
    if (externalOpenSignal !== lastOpenSignalRef.current) {
      lastOpenSignalRef.current = externalOpenSignal;
      setIsExpanded((prev) => !prev);
    }
  }, [externalOpenSignal]);

  // Listen to YouTube IFrame API postMessage state updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;
      if (typeof event.data !== 'string') return;

      try {
        const payload = JSON.parse(event.data);
        const stateCode =
          payload?.event === 'onStateChange'
            ? payload.info
            : payload?.event === 'infoDelivery' &&
                typeof payload?.info?.playerState === 'number'
              ? payload.info.playerState
              : undefined;

        if (stateCode === 1) {
          setIsPlaying(true);
        } else if (stateCode === 2) {
          setIsPlaying(false);
        } else if (stateCode === 0) {
          if (repeatOneRef.current) {
            sendPlayerCommand('seekTo', [0, true]);
            sendPlayerCommand('playVideo');
            setIsPlaying(true);
          } else {
            handleNextTrack();
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleNextTrack, sendPlayerCommand]);

  const currentTrack = MUSIC_TRACKS[currentIndex];
  const embedSrc = `https://www.youtube.com/embed/${currentTrack.id}?si=${currentTrack.si}&enablejsapi=1&playsinline=1&rel=0${
    shouldAutoplay ? '&autoplay=1' : ''
  }`;

  return (
    <aside
      aria-label="Hộp nhạc mùa tuyết"
      className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-1.5rem)]"
    >
      <div
        className={
          isExpanded
            ? 'w-[276px] sm:w-[296px] rounded-2xl bg-white/92 backdrop-blur-md border border-[#C3DCF4] shadow-[0_12px_32px_-8px_rgba(36,71,110,0.24)] p-3 space-y-2.5'
            : ''
        }
      >
        {/* 1. Compact Header when expanded */}
        {isExpanded && (
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#E3EFFA]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Disc3
                className={`w-4 h-4 text-[#3B6692] shrink-0 music-disc-spin ${
                  isPlaying ? '' : 'music-disc-paused'
                }`}
              />
              <span className="font-serif font-bold text-xs text-[#234A74] truncate">
                Hộp Nhạc Mùa Tuyết
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowTracklist((prev) => !prev)}
                title={showTracklist ? 'Ẩn danh sách bài' : 'Hiện danh sách bài'}
                aria-label="Ẩn hiện danh sách bài hát"
                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer ${
                  showTracklist
                    ? 'bg-[#E6F2FE] text-[#234A74]'
                    : 'text-[#5A7FA5] hover:bg-[#EEF6FD]'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                title="Thu gọn hộp nhạc"
                aria-label="Thu gọn hộp nhạc"
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#5A7FA5] hover:bg-[#EEF6FD] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Persistent Mini YouTube Player (stays mounted when collapsed so audio never stops) */}
        <div
          className={
            isExpanded
              ? 'w-full h-[116px] rounded-lg overflow-hidden border border-[#D4E5F5] bg-[#EAF3FC]'
              : 'fixed -left-[9999px] bottom-0 w-[260px] h-[146px] opacity-0 pointer-events-none overflow-hidden'
          }
        >
          <iframe
            key={currentTrack.id}
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0"
            src={embedSrc}
            title={`${currentTrack.title} - ${currentTrack.artist}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        {/* 3. Expanded Song Info, Controls & Compact Tracklist OR Collapsed Floating Pill */}
        {isExpanded ? (
          <>
            {/* Current Song Name & Artist */}
            <div className="px-0.5">
              <div className="text-xs font-bold text-[#1D436D] leading-snug line-clamp-1">
                {currentTrack.title}
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px] text-[#6688AC] mt-0.5">
                <span className="truncate">{currentTrack.artist}</span>
                <span className="font-mono tabular-nums shrink-0">
                  0{currentIndex + 1}/0{MUSIC_TRACKS.length}
                </span>
              </div>
            </div>

            {/* Compact Transport Controls */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  title="Bài trước"
                  aria-label="Bài trước"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white hover:bg-[#EDF5FD] border border-[#CFE2F4] text-[#355D87] transition-colors cursor-pointer"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
                  className="inline-flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg bg-[#587DA5] hover:bg-[#476A91] text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 shrink-0" />
                      <span>Dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      <span>Phát</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  title="Bài tiếp theo"
                  aria-label="Bài tiếp theo"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white hover:bg-[#EDF5FD] border border-[#CFE2F4] text-[#355D87] transition-colors cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setRepeatOne((prev) => !prev)}
                title={repeatOne ? 'Đang lặp 1 bài' : 'Đang tự chuyển bài'}
                aria-label="Chế độ lặp bài"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer ${
                  repeatOne
                    ? 'bg-[#E5F2FE] border-[#B4D3F1] text-[#214873]'
                    : 'bg-white hover:bg-[#F2F7FC] border-[#CFE2F4] text-[#6488AE]'
                }`}
              >
                {repeatOne ? (
                  <Repeat1 className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Compact 5-Song List with Song Names */}
            {showTracklist && (
              <div className="pt-2 border-t border-[#E3EFFA] max-h-[146px] overflow-y-auto divide-y divide-[#EEF5FC] pr-0.5">
                {MUSIC_TRACKS.map((track, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#E6F2FE] text-[#1C426C]'
                          : 'hover:bg-[#F3F8FD] text-[#395D84]'
                      }`}
                    >
                      <span className="w-4 shrink-0 flex items-center justify-center">
                        {isSelected && isPlaying ? (
                          <Volume2 className="w-3 h-3 text-[#346291]" />
                        ) : (
                          <span
                            className={`font-mono tabular-nums text-[10px] ${
                              isSelected
                                ? 'font-bold text-[#234C78]'
                                : 'text-[#84A4C4]'
                            }`}
                          >
                            0{idx + 1}
                          </span>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[11.5px] leading-tight truncate ${
                            isSelected ? 'font-bold' : 'font-medium'
                          }`}
                        >
                          {track.title}
                        </div>
                        <div className="text-[10px] text-[#6B8DB0] truncate">
                          {track.artist}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Minimized Compact Pill */
          <div className="inline-flex items-center gap-1.5 pl-3 pr-1.5 h-11 rounded-full bg-white/92 backdrop-blur-md border border-[#C3DCF4] shadow-md">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              title={`Mở hộp nhạc: ${currentTrack.title}`}
              className="inline-flex items-center gap-2 min-w-0 py-1 cursor-pointer text-left"
            >
              <Disc3
                className={`w-4 h-4 text-[#3B6692] shrink-0 music-disc-spin ${
                  isPlaying ? '' : 'music-disc-paused'
                }`}
              />
              <span className="text-xs font-semibold text-[#234A74] max-w-[140px] sm:max-w-[175px] truncate">
                {currentTrack.title}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#587DA5] hover:bg-[#476A91] text-white transition-colors cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
