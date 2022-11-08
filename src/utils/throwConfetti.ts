import confetti from "canvas-confetti";

export function throwConfetti(): void {
  confetti({
    particleCount: 400,
    spread: 70,
    origin: { y: 0.6 },
  });
}