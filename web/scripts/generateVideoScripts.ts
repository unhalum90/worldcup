// Video Script Generator for all 72 World Cup 2026 Group Stage Matches
// Run with: npx tsx scripts/generateVideoScripts.ts

import { groupStageMatches, type Match } from '../lib/matchesData.js';
import { teams, type Team } from '../lib/teamsData.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to find team data
function getTeam(teamName: string): Team | undefined {
  const normalizedName = teamName.toLowerCase().replace(/[^a-z]/g, '');
  return teams.find(t => {
    const tName = t.name.toLowerCase().replace(/[^a-z]/g, '');
    return tName === normalizedName || t.slug.replace(/-/g, '') === normalizedName;
  });
}

// Helper to format star players for script
function formatStarPlayers(team: Team): string {
  if (!team.starPlayers || team.starPlayers.length === 0) {
    return 'Key players to watch for are still being finalized.';
  }
  
  const topPlayers = team.starPlayers.slice(0, 3);
  return topPlayers.map(p => `${p.name} (${p.position}, ${p.club})`).join(', ');
}

// Generate script for a single match
function generateMatchScript(match: Match): string {
  const team1Data = getTeam(match.team1);
  const team2Data = getTeam(match.team2);
  
  const isPlayoffTeam = (name: string) => name.includes('Playoff') || name.includes('TBD');
  
  // Team 1 info
  const team1Nickname = team1Data?.nickname || match.team1;
  const team1Coach = team1Data?.coach || 'TBD';
  const team1Flag = team1Data?.flagEmoji || '🏳️';
  const team1Ranking = team1Data?.fifaRanking ? `#${team1Data.fifaRanking}` : 'TBD';
  const team1Players = team1Data ? formatStarPlayers(team1Data) : 'To be determined after playoffs';
  const team1Appearances = team1Data?.appearances ? `${team1Data.appearances} World Cup appearances` : '';
  const team1BestFinish = team1Data?.bestFinish || '';
  
  // Team 2 info
  const team2Nickname = team2Data?.nickname || match.team2;
  const team2Coach = team2Data?.coach || 'TBD';
  const team2Flag = team2Data?.flagEmoji || '🏳️';
  const team2Ranking = team2Data?.fifaRanking ? `#${team2Data.fifaRanking}` : 'TBD';
  const team2Players = team2Data ? formatStarPlayers(team2Data) : 'To be determined after playoffs';
  const team2Appearances = team2Data?.appearances ? `${team2Data.appearances} World Cup appearances` : '';
  const team2BestFinish = team2Data?.bestFinish || '';

  const script = `
================================================================================
MATCH ${match.matchNumber}: ${match.team1} vs ${match.team2}
================================================================================

📍 LOCATION: ${match.city} | ${match.stadium}
📅 DATE: ${match.date} | ${match.time} ET

--------------------------------------------------------------------------------
🎬 VIDEO SCRIPT
--------------------------------------------------------------------------------

[INTRO - On Screen: Match ${match.matchNumber}]

"Welcome to Match ${match.matchNumber} of the 2026 FIFA World Cup!

We're here in ${match.city} at ${match.stadium}, where ${team1Flag} ${match.team1} takes on ${team2Flag} ${match.team2}.

${match.date}, ${match.time} Eastern Time."

---

[TEAM 1 SEGMENT - ${match.team1}]

${isPlayoffTeam(match.team1) ? `"${match.team1} - this spot will be determined by upcoming playoffs. We'll update this video once the team is confirmed."` : `
"First up, ${team1Flag} ${match.team1}, known as '${team1Nickname}'.

Currently ranked ${team1Ranking} in the world, they come into this tournament with ${team1Appearances}${team1BestFinish ? `, with their best finish being ${team1BestFinish}` : ''}.

Head Coach ${team1Coach} will be looking to their star players: ${team1Players}.

${team1Data?.fanCulture?.traditions ? `Their passionate supporters are known for ${team1Data.fanCulture.traditions.slice(0, 150)}...` : ''}
"`}

---

[TEAM 2 SEGMENT - ${match.team2}]

${isPlayoffTeam(match.team2) ? `"${match.team2} - this spot will be determined by upcoming playoffs. We'll update this video once the team is confirmed."` : `
"Their opponents, ${team2Flag} ${match.team2}, nicknamed '${team2Nickname}'.

Ranked ${team2Ranking} in the FIFA rankings, they have ${team2Appearances}${team2BestFinish ? `, with a best finish of ${team2BestFinish}` : ''}.

Under coach ${team2Coach}, watch out for: ${team2Players}.

${team2Data?.fanCulture?.traditions ? `The ${match.team2} fans are famous for ${team2Data.fanCulture.traditions.slice(0, 150)}...` : ''}
"`}

---

[MATCH PREVIEW / CLOSING]

"This ${match.city} showdown promises to be a thrilling encounter.

${match.stadium} will be packed with fans from both nations, creating an electric atmosphere.

Don't miss Match ${match.matchNumber} - ${match.team1} versus ${match.team2}, ${match.date} at ${match.time} Eastern.

For complete travel guides, lodging tips, and fan fest information for ${match.city}, check out worldcup26.guide."

---

[END CARD]
Match ${match.matchNumber} | ${match.team1} vs ${match.team2}
${match.city} | ${match.date} | ${match.time} ET
worldcup26.guide

================================================================================

`;

  return script;
}

// Generate all scripts
function generateAllScripts(): void {
  const outputDir = path.join(__dirname, '../video_scripts');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate master file with all scripts
  let masterScript = `
################################################################################
#                                                                              #
#           2026 FIFA WORLD CUP - ALL 72 GROUP STAGE VIDEO SCRIPTS            #
#                                                                              #
#           Generated: ${new Date().toISOString().split('T')[0]}                                          #
#                                                                              #
################################################################################

TABLE OF CONTENTS
-----------------
`;

  // Add table of contents
  groupStageMatches.forEach(match => {
    masterScript += `Match ${match.matchNumber.toString().padStart(2, '0')}: ${match.team1} vs ${match.team2} (${match.city})\n`;
  });

  masterScript += '\n\n';

  // Generate individual scripts
  groupStageMatches.forEach(match => {
    const script = generateMatchScript(match);
    masterScript += script;
    
    // Also save individual file
    const fileName = `match-${match.matchNumber.toString().padStart(2, '0')}-${match.team1.toLowerCase().replace(/[^a-z]/g, '-')}-vs-${match.team2.toLowerCase().replace(/[^a-z]/g, '-')}.txt`;
    fs.writeFileSync(path.join(outputDir, fileName), script);
  });
  
  // Save master file
  fs.writeFileSync(path.join(outputDir, 'ALL_SCRIPTS_MASTER.txt'), masterScript);
  
  console.log(`\n✅ Generated ${groupStageMatches.length} video scripts!`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📄 Master file: ALL_SCRIPTS_MASTER.txt`);
  console.log(`📄 Individual files: match-XX-teamA-vs-teamB.txt`);
}

// Run
generateAllScripts();
