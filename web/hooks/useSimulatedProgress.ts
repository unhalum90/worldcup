import { useEffect, useState } from 'react';

/**
 * Custom hook for simulating non-linear progress during AI planning
 * Provides realistic progress pacing with fast initial scan, medium analysis, and slow optimization phases
 */
export function useSimulatedProgress(duration = 60000) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - start;
      const ratio = elapsed / duration;

      let newProgress: number;

      if (ratio < 0.3) {
        // Phase 1: Fast initial scan (0-70% in first 30% of time)
        newProgress = (ratio / 0.3) * 70 * 1.2; // Slight overshoot
      } else if (ratio < 0.8) {
        // Phase 2: Medium analysis (70-90% in next 50% of time)
        const phaseRatio = (ratio - 0.3) / 0.5;
        newProgress = 70 + (phaseRatio * 20);
      } else if (ratio < 0.95) {
        // Phase 3: Slow optimization crawl (90-97% in next 15% of time)
        const phaseRatio = (ratio - 0.8) / 0.15;
        newProgress = 90 + (phaseRatio * 7);
      } else {
        // Phase 4: Final wait at 97% until completion
        newProgress = 97;
      }

      // Cap at 97% and add slight randomness for realism
      const finalProgress = Math.min(97, newProgress + (Math.random() - 0.5) * 2);
      setProgress(Math.max(0, finalProgress));

      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration]);

  return progress;
}