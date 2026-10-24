import { useEffect, useState } from 'react';

interface SnowflakeItem {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  char: string;
}

const SNOW_CHARS = ['❄', '❅', '❆', '•', '·', '✧'];

export default function Snowfall({ enabled = true }: { enabled?: boolean }) {
  const [flakes, setFlakes] = useState<SnowflakeItem[]>([]);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !enabled) {
      setFlakes([]);
      return;
    }

    // Generate gentle, sparse snowflakes (18 items for gentle aesthetic, non-distracting)
    const newFlakes: SnowflakeItem[] = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 98,
      size: Math.random() * 10 + 8, // 8px to 18px
      duration: Math.random() * 12 + 10, // 10s to 22s slow fall
      delay: Math.random() * 8,
      opacity: Math.random() * 0.5 + 0.35,
      char: SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)],
    }));

    setFlakes(newFlakes);
  }, [enabled]);

  if (!enabled || flakes.length === 0) return null;

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake-particle select-none"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
            color: '#B8D7F3',
            textShadow: '0 0 6px rgba(184, 215, 243, 0.6)',
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
}
