import type { ScoreBreakdown } from './types';

const BASE_POINTS_BY_LEVEL: Record<number, number> = {
  1: 100,
  2: 200,
  3: 150,
  4: 200,
  5: 300,
};

/**
 * Calculate the attempt multiplier — fewer attempts = higher multiplier.
 * 1 attempt = 1.0, 2 = 0.9, 3 = 0.8, 4 = 0.7, 5+ = 0.5
 */
function getAttemptMultiplier(attempts: number): number {
  if (attempts <= 1) return 1.0;
  if (attempts === 2) return 0.9;
  if (attempts === 3) return 0.8;
  if (attempts === 4) return 0.7;
  return 0.5;
}

/**
 * Speed bonus based on seconds elapsed.
 * Under 60s = 50, under 120s = 30, under 180s = 15, else 0
 */
function getSpeedBonus(elapsedSeconds: number): number {
  if (elapsedSeconds < 60) return 50;
  if (elapsedSeconds < 120) return 30;
  if (elapsedSeconds < 180) return 15;
  return 0;
}

export function calculateScore(
  level: number,
  attemptCount: number,
  elapsedSeconds: number,
  creativityScore: number = 0,
): ScoreBreakdown {
  const basePoints = BASE_POINTS_BY_LEVEL[level] || 100;
  const attemptMultiplier = getAttemptMultiplier(attemptCount);
  const speedBonus = getSpeedBonus(elapsedSeconds);
  const creativityBonus = Math.min(creativityScore, 50); // cap at 50

  const finalScore = Math.round(
    (basePoints * attemptMultiplier) + creativityBonus + speedBonus
  );

  return {
    basePoints,
    attemptMultiplier,
    creativityBonus,
    speedBonus,
    finalScore,
  };
}
