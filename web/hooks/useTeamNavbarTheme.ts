import { useEffect } from 'react';
import { teamColors } from "@/lib/constants/teamColors";

export function useTeamNavbarTheme(favoriteTeam?: string) {
  useEffect(() => {
    const team = favoriteTeam ? teamColors[favoriteTeam] : null;
    
    const bg = team ? team.primary : "#FFFFFF"; // default white
    const text = team ? getContrastColor(team.primary) : "#111827"; // dynamic contrast
    const borderColor = team ? team.secondary : "var(--color-neutral-100)";

    document.documentElement.style.setProperty("--nav-bg", bg);
    document.documentElement.style.setProperty("--nav-text", text);
    document.documentElement.style.setProperty("--nav-border", borderColor);
  }, [favoriteTeam]);

  const team = favoriteTeam ? teamColors[favoriteTeam] : null;
  const flag = team?.flag || null;

  return { flag, teamColors: team };
}

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  // For team backgrounds, always use white text for maximum readability
  // Team colors are typically bold/saturated, so white provides best contrast
  return "#FFFFFF";
}