import React, { useMemo } from 'react';

interface SakuraBackgroundProps {
  enabled?: boolean;
}

export const SakuraBackground: React.FC<SakuraBackgroundProps> = ({ enabled = true }) => {
  // Generate random petals with varied positions, sizes and animation delays
  const petals = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.8 + (i % 3) * 4) % 96}%`,
      size: 14 + (i % 4) * 5,
      delay: `${(i * 0.9) % 8}s`,
      duration: `${7 + (i % 5) * 2.5}s`,
      opacity: 0.35 + (i % 3) * 0.2,
      rotate: (i * 45) % 360,
    }));
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Soft gradient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-200/30 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-purple-200/25 blur-3xl" />
      <div className="absolute top-[35%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-rose-100/30 blur-3xl" />

      {/* Falling Sakura Petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute text-pink-300 select-none"
          style={{
            left: petal.left,
            top: '-30px',
            fontSize: `${petal.size}px`,
            opacity: petal.opacity,
            animation: `floatPetal ${petal.duration} infinite linear`,
            animationDelay: petal.delay,
            transform: `rotate(${petal.rotate}deg)`,
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};
