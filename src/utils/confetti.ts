import confetti from 'canvas-confetti';

export function fireHeartConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#F7B6D2', '#FFE4EF', '#8B75C9', '#FF6B8B', '#FFD1DC'],
    });

    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#F7B6D2', '#FFE4EF', '#8B75C9', '#FF6B8B', '#FFD1DC'],
    });
  } catch {
    // ignore
  }
}

export function fireVictoryFanfare() {
  try {
    const end = Date.now() + 1200;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 + 0.2 },
        colors: ['#F7B6D2', '#8B75C9', '#FF85A1', '#FFC3A0', '#D4A5FF'],
      });
    }, 250);
  } catch {
    // ignore
  }
}
