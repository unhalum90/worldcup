import { useEffect } from 'react';

type PlannerType = 'trip' | 'flight' | 'lodging';

export function usePlannerTheme(plannerType: PlannerType) {
  useEffect(() => {
    // Add planner class to body for scoped styling
    document.body.classList.remove('planner-trip', 'planner-flight', 'planner-lodging');
    document.body.classList.add(`planner-${plannerType}`);

    // Set CSS custom properties for dynamic theming
    const colors = {
      trip: {
        primary: '#2563EB',
        secondary: '#1D4ED8',
        accent: '#1E40AF'
      },
      flight: {
        primary: '#0EA5E9',
        secondary: '#0369A1',
        accent: '#0284C7'
      },
      lodging: {
        primary: '#F87171',
        secondary: '#DC2626',
        accent: '#B91C1C'
      }
    };

    const colorSet = colors[plannerType];
    document.documentElement.style.setProperty("--planner-primary", colorSet.primary);
    document.documentElement.style.setProperty("--planner-secondary", colorSet.secondary);
    document.documentElement.style.setProperty("--planner-accent", colorSet.accent);

    // Cleanup on unmount
    return () => {
      document.body.classList.remove(`planner-${plannerType}`);
    };
  }, [plannerType]);
}