import confetti from 'canvas-confetti';

export const showSuccessConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFC107', '#FFEB3B'],
  });
};