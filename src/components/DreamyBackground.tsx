import { useEffect, useState } from 'react';

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  kind: 'yellow-star' | 'pink-sparkle' | 'blue-bokeh';
}

interface SnowParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  char: string;
}

const SNOW_CHARS = ['❄', '❅', '❆', '·', '✧'];

/** Curated dreamy particle layout echoing the pastel stars, pink sparkles & sky bokeh in image_78e6922c.png */
const DREAMY_PARTICLES: StarParticle[] = [
  { id: 1, x: 11, y: 16, size: 22, duration: 5.4, delay: 0.2, kind: 'blue-bokeh' },
  { id: 2, x: 18, y: 68, size: 20, duration: 4.6, delay: 1.1, kind: 'yellow-star' },
  { id: 3, x: 8, y: 80, size: 24, duration: 5.2, delay: 0.7, kind: 'pink-sparkle' },
  { id: 4, x: 35, y: 24, size: 22, duration: 4.8, delay: 1.8, kind: 'pink-sparkle' },
  { id: 5, x: 46, y: 33, size: 26, duration: 5.5, delay: 0.4, kind: 'yellow-star' },
  { id: 6, x: 57, y: 14, size: 23, duration: 4.9, delay: 2.1, kind: 'yellow-star' },
  { id: 7, x: 74, y: 12, size: 20, duration: 5.8, delay: 1.3, kind: 'pink-sparkle' },
  { id: 8, x: 88, y: 14, size: 28, duration: 7.2, delay: 0.6, kind: 'blue-bokeh' },
  { id: 9, x: 60, y: 67, size: 24, duration: 4.7, delay: 1.5, kind: 'pink-sparkle' },
  { id: 10, x: 33, y: 79, size: 21, duration: 5.3, delay: 2.4, kind: 'yellow-star' },
  { id: 11, x: 70, y: 80, size: 22, duration: 5.1, delay: 0.9, kind: 'yellow-star' },
  { id: 12, x: 93, y: 58, size: 24, duration: 5.6, delay: 1.7, kind: 'pink-sparkle' },
  { id: 13, x: 95, y: 78, size: 26, duration: 6.8, delay: 0.3, kind: 'blue-bokeh' },
  { id: 14, x: 24, y: 42, size: 15, duration: 4.2, delay: 2.6, kind: 'yellow-star' },
  { id: 15, x: 79, y: 46, size: 16, duration: 4.5, delay: 1.9, kind: 'yellow-star' },
];

function RoundedStarSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3.2C16.7 3.2 17.3 3.6 17.6 4.3L20.1 9.8L26.1 10.5C27.5 10.7 28.1 12.4 27 13.4L22.5 17.5L23.7 23.4C24 24.8 22.5 25.9 21.3 25.2L16 22.2L10.7 25.2C9.5 25.9 8 24.8 8.3 23.4L9.5 17.5L5 13.4C3.9 12.4 4.5 10.7 5.9 10.5L11.9 9.8L14.4 4.3C14.7 3.6 15.3 3.2 16 3.2Z"
        fill="#FFF3B0"
        stroke="#F7E48B"
        strokeWidth="0.8"
      />
    </svg>
  );
}

function PinkSparkleSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2C16.9 10.2 21.8 15.1 30 16C21.8 16.9 16.9 21.8 16 30C15.1 21.8 10.2 16.9 2 16C10.2 15.1 15.1 10.2 16 2Z"
        fill="#F6D5E5"
      />
    </svg>
  );
}

export default function DreamyBackground({ enabled = true }: { enabled?: boolean }) {
  const [snowFlakes, setSnowFlakes] = useState<SnowParticle[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    if (mq.matches || !enabled) {
      setSnowFlakes([]);
      return;
    }

    const generated: SnowParticle[] = Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: (i * 6.3 + 3) % 97,
      size: (i % 4) * 3 + 9,
      duration: 13 + (i % 5) * 2.6,
      delay: (i * 1.1) % 9,
      opacity: 0.35 + (i % 3) * 0.14,
      char: SNOW_CHARS[i % SNOW_CHARS.length],
    }));

    setSnowFlakes(generated);
  }, [enabled]);

  const animateActive = enabled && !reducedMotion;

  return (
    <>
      {/* Layer 0: Fixed Pastel Sky Vignette Artwork + Breathing Aura */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white"
      >
        {/* Uploaded pastel sky background image */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
            animateActive ? 'dreamy-bg-breathe' : ''
          }`}
          style={{
            backgroundImage: "url('/assets/aistudio/image_78e6922c.png')",
          }}
        />

        {/* Soft animated sky-blue mist glow in the center for living depth */}
        <div
          className={`absolute inset-0 ${animateActive ? 'dreamy-aura-pulse' : ''}`}
          style={{
            background:
              'radial-gradient(ellipse 56% 46% at 50% 50%, rgba(168, 214, 248, 0.28) 0%, rgba(210, 235, 253, 0.12) 52%, rgba(255, 255, 255, 0) 80%)',
          }}
        />

        {/* Animated pastel stars, pink 4-point sparkles, and sky-blue bokeh */}
        {animateActive &&
          DREAMY_PARTICLES.map((p) => (
            <div
              key={p.id}
              className={
                p.kind === 'yellow-star'
                  ? 'dreamy-star-twinkle'
                  : p.kind === 'pink-sparkle'
                    ? 'dreamy-sparkle-pulse'
                    : 'dreamy-bokeh-drift'
              }
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.kind === 'yellow-star' && <RoundedStarSvg size={p.size} />}
              {p.kind === 'pink-sparkle' && <PinkSparkleSvg size={p.size} />}
              {p.kind === 'blue-bokeh' && (
                <div
                  style={{ width: p.size, height: p.size }}
                  className="rounded-full bg-[#CCE3F6]/65 blur-[0.5px]"
                />
              )}
            </div>
          ))}
      </div>

      {/* Layer 1: Gentle Falling Winter Crystals */}
      {animateActive && snowFlakes.length > 0 && (
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
          {snowFlakes.map((flake) => (
            <span
              key={flake.id}
              className="snowflake-particle select-none"
              style={{
                left: `${flake.left}%`,
                fontSize: `${flake.size}px`,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                opacity: flake.opacity,
                color: '#9EC8EE',
                textShadow: '0 0 6px rgba(173, 212, 247, 0.65)',
              }}
            >
              {flake.char}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
