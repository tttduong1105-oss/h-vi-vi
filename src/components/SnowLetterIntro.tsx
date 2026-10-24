import { useEffect, useState, useCallback, useRef } from 'react';

type IntroPhase = 'sealed' | 'opening' | 'rising' | 'revealing';

interface SnowLetterIntroProps {
  authorName: string;
  onComplete: () => void;
}

const BURST_CLASSES = [
  'snow-burst-p1',
  'snow-burst-p2',
  'snow-burst-p3',
  'snow-burst-p4',
  'snow-burst-p5',
  'snow-burst-p6',
  'snow-burst-p7',
  'snow-burst-p8',
  'snow-burst-p9',
  'snow-burst-p10',
];

function BlingStarSvg({
  className,
  tone = 'crystal',
}: {
  className?: string;
  tone?: 'crystal' | 'pink' | 'gold' | 'ice';
}) {
  const fillMap = {
    crystal: '#FFFFFF',
    pink: '#FAD2E8',
    gold: '#FFF1AE',
    ice: '#C6E4FF',
  };
  const glowMap = {
    crystal: 'drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]',
    pink: 'drop-shadow-[0_0_8px_rgba(246,192,224,0.9)]',
    gold: 'drop-shadow-[0_0_9px_rgba(255,232,145,0.92)]',
    ice: 'drop-shadow-[0_0_8px_rgba(166,214,255,0.9)]',
  };

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={`${glowMap[tone]} ${className ?? 'w-5 h-5'}`}
    >
      {/* Secondary diagonal 4-point cross rays for extra jewel bling */}
      <path
        d="M18 9 L19.2 16.8 L27 18 L19.2 19.2 L18 27 L16.8 19.2 L9 18 L16.8 16.8 Z"
        fill="#FFFFFF"
        fillOpacity="0.65"
        transform="rotate(45 18 18)"
      />
      {/* Primary elongated 4-point diamond flare */}
      <path
        d="M18 1.5 C18.8 11.4 24.6 17.2 34.5 18 C24.6 18.8 18.8 24.6 18 34.5 C17.2 24.6 11.4 18.8 1.5 18 C11.4 17.2 17.2 11.4 18 1.5 Z"
        fill={fillMap[tone]}
      />
      <circle cx="18" cy="18" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}

function WaxSealCrestSvg() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="w-full h-full drop-shadow-[0_8px_16px_rgba(52,86,136,0.3)]"
    >
      <defs>
        {/* Pearlescent Pastel Ombre Wax Seal Gradient */}
        <radialGradient id="winterOmbreWaxGrad" cx="32%" cy="26%" r="74%">
          <stop offset="0%" stopColor="#F8DDF0" />
          <stop offset="36%" stopColor="#A9CFF6" />
          <stop offset="72%" stopColor="#759FD6" />
          <stop offset="100%" stopColor="#4A73A8" />
        </radialGradient>
        <linearGradient id="winterOmbreWaxRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#F5D5EA" />
          <stop offset="100%" stopColor="#5D8AC0" />
        </linearGradient>
      </defs>

      {/* Organic scalloped wax seal outer edge */}
      <path
        d="M40 4 C45 4, 49 7, 54 6 C59 5, 64 9, 66 14 C68 19, 73 21, 74 26 C75 31, 73 36, 75 40 C77 45, 74 50, 72 54 C70 59, 70 64, 65 67 C60 70, 56 71, 52 74 C47 77, 43 75, 40 76 C35 77, 31 74, 26 73 C21 72, 16 69, 14 64 C12 59, 8 56, 7 51 C6 46, 8 42, 6 37 C4 32, 7 27, 9 23 C11 18, 12 13, 17 10 C22 7, 26 7, 31 5 C35 3, 37 4, 40 4 Z"
        fill="url(#winterOmbreWaxGrad)"
        stroke="url(#winterOmbreWaxRim)"
        strokeWidth="1.6"
      />

      {/* Embossed inner wax ring */}
      <circle
        cx="40"
        cy="40"
        r="26"
        stroke="#FFF7FC"
        strokeOpacity="0.82"
        strokeWidth="1.35"
      />
      <circle
        cx="40"
        cy="40"
        r="23"
        stroke="#365B8C"
        strokeOpacity="0.26"
        strokeWidth="0.9"
        strokeDasharray="2.5 2.5"
      />

      {/* Crisp 6-branch winter snowflake crest */}
      <g stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round">
        <line x1="40" y1="22" x2="40" y2="58" />
        <line x1="24.4" y1="31" x2="55.6" y2="49" />
        <line x1="55.6" y1="31" x2="24.4" y2="49" />
        <polyline points="36.5,26 40,29.5 43.5,26" />
        <polyline points="36.5,54 40,50.5 43.5,54" />
        <polyline points="27,36.2 31.8,35.3 30.8,30.6" />
        <polyline points="49.2,49.4 48.2,44.7 53,43.8" />
        <polyline points="53,36.2 48.2,35.3 49.2,30.6" />
        <polyline points="30.8,49.4 31.8,44.7 27,43.8" />
        <circle cx="40" cy="40" r="3.2" fill="#82AEE0" />
      </g>

      {/* Tiny specular jewel glint on top-left of wax seal */}
      <path
        d="M25 18 C25.4 21.2 27.3 23.1 30.5 23.5 C27.3 23.9 25.4 25.8 25 29 C24.6 25.8 22.7 23.9 19.5 23.5 C22.7 23.1 24.6 21.2 25 18 Z"
        fill="#FFFFFF"
        fillOpacity="0.92"
      />
    </svg>
  );
}

export default function SnowLetterIntro({
  authorName,
  onComplete,
}: SnowLetterIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>('sealed');
  const [flapBehind, setFlapBehind] = useState(false);

  const phaseRef = useRef<IntroPhase>('sealed');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const timersRef = useRef<number[]>([]);

  const unlockPageScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const updatePhase = useCallback((next: IntroPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const handleOpenEnvelope = useCallback(() => {
    const current = phaseRef.current;

    // If letter is already risen and visitor taps again, enter website right away
    if (current === 'rising') {
      clearAllTimers();
      unlockPageScroll();
      updatePhase('revealing');
      const quickFinish = window.setTimeout(() => {
        onCompleteRef.current();
      }, 320);
      timersRef.current.push(quickFinish);
      return;
    }

    if (current !== 'sealed') return;

    clearAllTimers();

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      unlockPageScroll();
      updatePhase('revealing');
      const reducedDone = window.setTimeout(() => {
        onCompleteRef.current();
      }, 220);
      timersRef.current.push(reducedDone);
      return;
    }

    // Step 1: Break ombre wax seal with bling burst & fold top flap open in 3D
    updatePhase('opening');

    // Step 2: Once top flap crosses 90deg, move flap behind letter & glide snow letter upward
    const riseTimer = window.setTimeout(() => {
      setFlapBehind(true);
      updatePhase('rising');
    }, 270);

    // Step 3: Let the risen snow letter shine briefly, unlock scroll, and dissolve into the site
    const revealTimer = window.setTimeout(() => {
      unlockPageScroll();
      updatePhase('revealing');
    }, 1680);

    // Step 4: Unmount overlay cleanly
    const finishTimer = window.setTimeout(() => {
      unlockPageScroll();
      onCompleteRef.current();
    }, 2200);

    timersRef.current.push(riseTimer, revealTimer, finishTimer);
  }, [clearAllTimers, unlockPageScroll, updatePhase]);

  // Mount/unmount-only lifecycle so state updates or parent re-renders never cancel opening timers
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenEnvelope();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearAllTimers();
      unlockPageScroll();
    };
  }, [handleOpenEnvelope, clearAllTimers, unlockPageScroll]);

  const isOpened = phase === 'opening' || phase === 'rising' || phase === 'revealing';
  const isLetterRisen = phase === 'rising' || phase === 'revealing';
  const isRevealing = phase === 'revealing';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mở lá thư mùa tuyết"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center px-4 pt-12 pb-8 select-none overflow-hidden transition-opacity duration-500 ease-out ${
        isRevealing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Layer 0: Dreamy Pastel Ombre Backdrop + Soft Iridescent Glow Clouds */}
      <div
        aria-hidden="true"
        className="absolute inset-0 ombre-intro-backdrop backdrop-blur-md"
      />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Ombre Glow Orbs (Ice Sky, Sakura Blush, Periwinkle Starlight) */}
        <div className="ombre-orb-a absolute -top-20 -left-16 w-80 h-80 sm:w-[440px] sm:h-[440px] rounded-full bg-gradient-to-br from-[#B6DCFF]/65 via-[#E4ECFF]/45 to-transparent blur-3xl" />
        <div className="ombre-orb-b absolute -bottom-24 -right-16 w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full bg-gradient-to-tl from-[#FAD2E8]/65 via-[#DDD8FF]/45 to-transparent blur-3xl" />
        <div className="ombre-orb-a absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[420px] sm:h-[340px] rounded-full bg-gradient-to-r from-[#CFE8FF]/55 via-[#FCE2F1]/55 to-[#DCE3FF]/55 blur-3xl" />

        {/* Ambient Drifting Snowflakes */}
        <span className="intro-snow-1 absolute top-8 left-[13%] text-base text-[#82B0E0]">
          ❄
        </span>
        <span className="intro-snow-2 absolute top-14 left-[28%] text-xs text-[#9AC4EE]">
          ❅
        </span>
        <span className="intro-snow-3 absolute top-7 right-[25%] text-sm text-[#86B3E2]">
          ❆
        </span>
        <span className="intro-snow-4 absolute top-20 right-[13%] text-base text-[#96C0EB]">
          ❄
        </span>
        <span className="intro-snow-5 absolute top-[34%] left-[9%] text-xs text-[#8BB6E3]">
          ❅
        </span>
        <span className="intro-snow-6 absolute top-[36%] right-[10%] text-xs text-[#88B4E2]">
          ❆
        </span>

        {/* Bling-Bling Diamond Sparkle Field Across the Ombre Curtain */}
        <div className="bling-twinkle-1 absolute top-[14%] left-[19%]">
          <BlingStarSvg tone="crystal" className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="bling-twinkle-2 absolute top-[18%] right-[19%]">
          <BlingStarSvg tone="gold" className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="bling-twinkle-3 absolute top-[44%] left-[14%] hidden sm:block">
          <BlingStarSvg tone="pink" className="w-6 h-6" />
        </div>
        <div className="bling-twinkle-4 absolute top-[42%] right-[15%] hidden sm:block">
          <BlingStarSvg tone="ice" className="w-6 h-6" />
        </div>
        <div className="bling-twinkle-5 absolute bottom-[20%] left-[21%]">
          <BlingStarSvg tone="gold" className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="bling-twinkle-6 absolute bottom-[18%] right-[20%]">
          <BlingStarSvg tone="crystal" className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="bling-twinkle-7 absolute top-[26%] left-[48%]">
          <BlingStarSvg tone="crystal" className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="bling-twinkle-8 absolute bottom-[28%] left-[12%]">
          <BlingStarSvg tone="pink" className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* Outer Entrance Wrapper (kept separate so animation-fill-mode never overrides stage transform) */}
      <div className="relative z-10 snow-letter-enter">
        {/* Center Stage Transform Wrapper */}
        <div
          className={`flex flex-col items-center transition-transform duration-700 ease-out ${
            isRevealing
              ? 'translate-y-6 scale-105'
              : isLetterRisen
                ? 'translate-y-10 sm:translate-y-12'
                : 'translate-y-0'
          }`}
        >
          {/* Envelope Assembly (Strictly Click-to-Open) */}
          <div
            onClick={handleOpenEnvelope}
            className={`relative w-[min(88vw,436px)] aspect-[16/11] cursor-pointer group ${
              !isOpened ? 'envelope-idle-float' : ''
            }`}
          >
            {/* Pastel Ombre Halo Glow directly behind Envelope */}
            <div
              aria-hidden="true"
              className={`absolute -inset-5 rounded-3xl bg-gradient-to-tr from-[#A9D5FF]/55 via-[#F9CEE6]/55 to-[#D5DCFF]/55 blur-2xl transition-opacity duration-700 pointer-events-none ${
                isOpened ? 'opacity-85' : 'opacity-65 group-hover:opacity-95'
              }`}
            />

            {/* Soft Grounding Shadow beneath Envelope */}
            <div
              aria-hidden="true"
              className={`absolute -inset-x-3 -bottom-4 h-12 rounded-full bg-[#436899]/20 blur-xl transition-transform duration-700 pointer-events-none ${
                isLetterRisen ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
              }`}
            />

            {/* Close-range Jewel Bling Sparkles Hugging the Envelope Corners */}
            {!isOpened && (
              <div aria-hidden="true" className="pointer-events-none">
                <div className="bling-twinkle-5 absolute -top-3.5 -left-3.5 z-50">
                  <BlingStarSvg tone="crystal" className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="bling-twinkle-2 absolute -top-3 -right-3 z-50">
                  <BlingStarSvg tone="gold" className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="bling-twinkle-6 absolute -bottom-3 -left-2.5 z-50">
                  <BlingStarSvg tone="pink" className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="bling-twinkle-1 absolute -bottom-3.5 -right-3 z-50">
                  <BlingStarSvg tone="crystal" className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
            )}

            {/* LAYER 1: Envelope Backplate & Lined Ombre Frost Interior */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-[#C5E0FA] via-[#E4E9FF] to-[#FADDF0] border border-[#C3DCF5] shadow-[0_24px_60px_-16px_rgba(38,68,112,0.28)] overflow-hidden"
            >
              {/* Subtle interior winter dashed lining */}
              <div className="absolute inset-2 rounded-lg border border-dashed border-white/80 opacity-85" />
            </div>

            {/* LAYER 2: The Rising Ombre Snow Letter Sheet */}
            <div
              className={`absolute inset-x-[5.5%] top-[6%] bottom-[8%] z-20 rounded-lg bg-gradient-to-b from-white via-[#FAFDFE] to-[#FDF5FA] winter-paper border border-[#CBE0F6] shadow-[0_14px_34px_-10px_rgba(32,62,102,0.24)] px-4 sm:px-6 py-3.5 sm:py-5 flex flex-col justify-between transition-transform duration-700 ease-out will-change-transform ${
                isRevealing
                  ? '-translate-y-[56%] scale-[1.04]'
                  : isLetterRisen
                    ? '-translate-y-[48%] sm:-translate-y-[52%] scale-100'
                    : 'translate-y-[4%] scale-[0.95]'
              }`}
            >
              {/* Corner registration ticks on letter paper */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#C2DCF5]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#EACBE0]"
              />

              {/* Letterhead Ornament */}
              <div className="text-center space-y-1 sm:space-y-1.5">
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center gap-2 text-[11px] text-[#7BA5D4]"
                >
                  <span className="h-px w-7 bg-gradient-to-r from-transparent to-[#C5DFF7]" />
                  <span>✦</span>
                  <span>·</span>
                  <span>❄︎</span>
                  <span>·</span>
                  <span>✦</span>
                  <span className="h-px w-7 bg-gradient-to-l from-transparent to-[#F0CCE2]" />
                </div>

                <p className="text-[11px] sm:text-xs font-medium text-[#698BB4]">
                  Gửi người ghé thăm mùa đông
                </p>

                <h2 className="font-serif text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#1F4B7A] via-[#536DA8] to-[#875F9A] bg-clip-text text-transparent tracking-tight leading-snug">
                  Thư Gửi Mùa Tuyết
                </h2>
              </div>

              {/* Letter Body Greeting */}
              <p className="font-serif italic text-xs sm:text-[13.5px] text-[#395E88] text-center leading-relaxed line-clamp-2 px-1">
                “Nơi lưu giữ những nhân vật, mảnh chuyện và lời tâm tình giữa hiên nhà tuyết trắng.”
              </p>

              {/* Letter Signature */}
              <div className="pt-1.5 border-t border-dashed border-[#DAE7F7] flex items-center justify-between text-[11px] text-[#668BB2]">
                <span>❄︎ Hiên Nhà Tuyết</span>
                <span className="font-serif font-semibold text-[#2B527E]">
                  — {authorName}
                </span>
              </div>
            </div>

            {/* LAYER 3: Envelope Front Side & Bottom Folded Ombre Flaps */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-30 rounded-xl overflow-hidden pointer-events-none"
            >
              <svg
                viewBox="0 0 440 302"
                fill="none"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="envLeftOmbreFold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5FAFF" />
                    <stop offset="58%" stopColor="#E4F1FE" />
                    <stop offset="100%" stopColor="#F8E7F3" />
                  </linearGradient>
                  <linearGradient id="envRightOmbreFold" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FDF3F9" />
                    <stop offset="55%" stopColor="#E8ECFE" />
                    <stop offset="100%" stopColor="#DCEEFF" />
                  </linearGradient>
                  <linearGradient id="envBottomOmbrePocket" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="52%" stopColor="#F2F8FF" />
                    <stop offset="100%" stopColor="#FCECF6" />
                  </linearGradient>
                </defs>

                {/* Left diagonal envelope fold */}
                <path
                  d="M0,0 L218,162 L0,302 Z"
                  fill="url(#envLeftOmbreFold)"
                  stroke="#C9DFF6"
                  strokeWidth="1.1"
                />

                {/* Right diagonal envelope fold */}
                <path
                  d="M440,0 L222,162 L440,302 Z"
                  fill="url(#envRightOmbreFold)"
                  stroke="#D4DDF6"
                  strokeWidth="1.1"
                />

                {/* Soft shadow under bottom pocket crease */}
                <path
                  d="M0,302 L192,146 Q220,126 248,146 L440,302 Z"
                  fill="#4D73A6"
                  fillOpacity="0.08"
                  transform="translate(0, -3)"
                />

                {/* Bottom stationery pocket fold */}
                <path
                  d="M0,302 L194,150 Q220,131 246,150 L440,302 Z"
                  fill="url(#envBottomOmbrePocket)"
                  stroke="#C5DCF4"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Iridescent Bling Foil Shimmer Sweep across Envelope Front */}
              {!isOpened && (
                <div className="bling-shimmer-sweep absolute inset-y-0 -inset-x-12 pointer-events-none" />
              )}

              {/* Etched Winter Postmark on Bottom-Right of Envelope */}
              <div className="absolute bottom-3.5 right-4 sm:bottom-4 sm:right-5 flex items-center gap-2 opacity-80">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-[#96BCE4] bg-white/45 flex items-center justify-center text-xs text-[#5B88BA]">
                  ❄︎
                </div>
                <div className="text-[9.5px] sm:text-[10px] font-mono text-[#698AB3] leading-tight">
                  <div>WINTER POST</div>
                  <div>2026 · SNOW</div>
                </div>
              </div>

              {/* Quiet Addressee Script on Bottom-Left */}
              <div className="absolute bottom-3.5 left-4 sm:bottom-4 sm:left-5 text-left">
                <p className="font-serif italic text-[11px] sm:text-xs text-[#597DA6]">
                  Gửi người thương mùa tuyết
                </p>
              </div>
            </div>

            {/* LAYER 4: 3D Top Triangular Ombre Flap (swaps z-index behind rising letter at 90deg) */}
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-[58%] envelope-perspective pointer-events-none ${
                flapBehind ? 'z-[15]' : 'z-40'
              }`}
            >
              <div
                className={`relative w-full h-full envelope-flap-card ${
                  isOpened ? 'envelope-flap-opened' : 'envelope-flap-closed'
                }`}
              >
                {/* Front Face of Top Flap (visible when closed) */}
                <div className="absolute inset-0 envelope-face">
                  <svg
                    viewBox="0 0 440 176"
                    fill="none"
                    preserveAspectRatio="none"
                    className="w-full h-full drop-shadow-[0_6px_12px_rgba(44,74,116,0.13)]"
                  >
                    <defs>
                      <linearGradient id="envTopOmbreOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="52%" stopColor="#ECF6FF" />
                        <stop offset="100%" stopColor="#FBEAF5" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M4,0 L436,0 Q440,0 440,4 L246,156 Q220,174 194,156 L0,4 Q0,0 4,0 Z"
                      fill="url(#envTopOmbreOuter)"
                      stroke="#C2DCF5"
                      strokeWidth="1.25"
                    />
                    {/* Delicate inner stitched border line on top flap */}
                    <path
                      d="M18,7 L422,7 L241,148 Q220,163 199,148 Z"
                      stroke="#D8E7F8"
                      strokeWidth="0.95"
                      strokeDasharray="3 3"
                    />
                  </svg>
                </div>

                {/* Back Face of Top Flap (visible when folded open upward) */}
                <div className="absolute inset-0 envelope-face-back">
                  <svg
                    viewBox="0 0 440 176"
                    fill="none"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id="envTopOmbreInner" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#CFE4FA" />
                        <stop offset="55%" stopColor="#E9EEFF" />
                        <stop offset="100%" stopColor="#FCEBF5" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M4,176 L436,176 Q440,176 440,172 L246,20 Q220,2 194,20 L0,172 Q0,176 4,176 Z"
                      fill="url(#envTopOmbreInner)"
                      stroke="#C2DCF5"
                      strokeWidth="1.2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* LAYER 5: Bling-Bling Starburst + Interactive Ombre Crystal Wax Seal */}
            <div className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center">
              {/* Radial snow & jewel-star burst when breaking the wax seal */}
              {isOpened && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {BURST_CLASSES.map((cls, idx) => (
                    <span
                      key={cls}
                      className={`absolute flex items-center justify-center ${cls}`}
                    >
                      {idx % 3 === 0 ? (
                        <BlingStarSvg tone="crystal" className="w-5 h-5" />
                      ) : idx % 3 === 1 ? (
                        <BlingStarSvg tone="gold" className="w-4 h-4" />
                      ) : (
                        <span className="text-sm sm:text-base text-[#6EA2D6]">❄</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Sparkle glint perched right on the edge of the closed wax seal */}
              {!isOpened && (
                <div
                  aria-hidden="true"
                  className="bling-twinkle-5 pointer-events-none absolute -top-2 -right-2 z-20"
                >
                  <BlingStarSvg tone="crystal" className="w-5 h-5" />
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEnvelope();
                }}
                aria-label="Ấn vào dấu niêm phong để mở thư tuyết"
                className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-0 bg-transparent border-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5888B8] transition-all duration-300 ${
                  isOpened
                    ? 'opacity-0 scale-125 pointer-events-none'
                    : 'opacity-100 wax-seal-breathe group-hover:scale-110 active:scale-95'
                }`}
              >
                <WaxSealCrestSvg />
              </button>
            </div>
          </div>

          {/* Interactive Click-to-Open Prompt Underneath Envelope */}
          <div
            className={`mt-7 text-center transition-opacity duration-300 ${
              isOpened ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={handleOpenEnvelope}
              className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-lg bg-gradient-to-r from-white/92 via-[#F7FAFF]/92 to-[#FDF4FA]/92 hover:from-white hover:to-white border border-[#C6DEF6] text-xs sm:text-sm font-semibold text-[#2A517D] shadow-[0_6px_20px_-6px_rgba(72,112,160,0.22)] hover:shadow-[0_8px_24px_-6px_rgba(72,112,160,0.3)] transition-all cursor-pointer whitespace-nowrap"
            >
              <span aria-hidden="true" className="text-[#6B9CD2]">
                ✦
              </span>
              <span>Ấn vào phong thư để mở</span>
              <span aria-hidden="true" className="text-[#D99BC0]">
                ❄︎
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
