import { useState, useCallback } from 'react';
import { Agent, AGENTS, AnalysisGame, BetOption } from '@/lib/types';

// Mock data generator for demo purposes
const MOCK_GAMES: Omit<AnalysisGame, 'id' | 'status' | 'confidence' | 'agentNotes'>[] = [
  { homeTeam: 'Manchester City', awayTeam: 'Arsenal', league: 'Premier League', time: '15:00' },
  { homeTeam: 'Barcelona', awayTeam: 'Real Madrid', league: 'La Liga', time: '21:00' },
  { homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', league: 'Bundesliga', time: '18:30' },
  { homeTeam: 'PSG', awayTeam: 'Lyon', league: 'Ligue 1', time: '20:00' },
  { homeTeam: 'Inter Milan', awayTeam: 'Juventus', league: 'Serie A', time: '20:45' },
  { homeTeam: 'Benfica', awayTeam: 'Porto', league: 'Liga Portugal', time: '19:00' },
  { homeTeam: 'Ajax', awayTeam: 'PSV', league: 'Eredivisie', time: '16:30' },
  { homeTeam: 'Celtic', awayTeam: 'Rangers', league: 'Scottish Prem', time: '12:30' },
  { homeTeam: 'Galatasaray', awayTeam: 'Fenerbahce', league: 'Süper Lig', time: '19:00' },
  { homeTeam: 'Olympiacos', awayTeam: 'Panathinaikos', league: 'Greek Super League', time: '20:00' },
  { homeTeam: 'Red Star', awayTeam: 'Partizan', league: 'Serbian SuperLiga', time: '18:00' },
  { homeTeam: 'Al Hilal', awayTeam: 'Al Nassr', league: 'Saudi Pro League', time: '20:00' },
  { homeTeam: 'Flamengo', awayTeam: 'Palmeiras', league: 'Brasileirão', time: '01:00' },
  { homeTeam: 'Boca Juniors', awayTeam: 'River Plate', league: 'Liga Argentina', time: '02:00' },
  { homeTeam: 'Club Brugge', awayTeam: 'Anderlecht', league: 'Belgian Pro', time: '18:30' },
  { homeTeam: 'Sporting CP', awayTeam: 'Braga', league: 'Liga Portugal', time: '21:15' },
  { homeTeam: 'Feyenoord', awayTeam: 'AZ Alkmaar', league: 'Eredivisie', time: '14:30' },
  { homeTeam: 'Lazio', awayTeam: 'Roma', league: 'Serie A', time: '18:00' },
  { homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', league: 'La Liga', time: '16:15' },
  { homeTeam: 'Marseille', awayTeam: 'Monaco', league: 'Ligue 1', time: '20:45' },
  { homeTeam: 'Leverkusen', awayTeam: 'Leipzig', league: 'Bundesliga', time: '15:30' },
  { homeTeam: 'Newcastle', awayTeam: 'Liverpool', league: 'Premier League', time: '17:30' },
  { homeTeam: 'Tottenham', awayTeam: 'Chelsea', league: 'Premier League', time: '14:00' },
  { homeTeam: 'Napoli', awayTeam: 'AC Milan', league: 'Serie A', time: '20:45' },
  { homeTeam: 'Villarreal', awayTeam: 'Real Sociedad', league: 'La Liga', time: '18:30' },
  { homeTeam: 'Lille', awayTeam: 'Rennes', league: 'Ligue 1', time: '17:00' },
  { homeTeam: 'Stuttgart', awayTeam: 'Frankfurt', league: 'Bundesliga', time: '15:30' },
  { homeTeam: 'West Ham', awayTeam: 'Aston Villa', league: 'Premier League', time: '15:00' },
  { homeTeam: 'Atalanta', awayTeam: 'Fiorentina', league: 'Serie A', time: '15:00' },
  { homeTeam: 'Valencia', awayTeam: 'Athletic Bilbao', league: 'La Liga', time: '21:00' },
];

const agentNoteTemplates: Record<string, string[]> = {
  SCOUT: ['Found via league scan', 'Strong matchup pattern detected', 'Historical trend match'],
  INTEL: ['Key player fit, no injuries', 'Manager tactical shift noted', 'Home form excellent'],
  STATS: ['H2H supports prediction', 'xG metrics align', 'Corner averages high'],
  JUDGE: ['Passes strict criteria', 'No red flags found', 'Realistic expectations met'],
  BOSS: ['Final approval granted', 'High confidence pick', 'Strong consensus across agents'],
};

export function useAnalysis() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS.map(a => ({ ...a })));
  const [games, setGames] = useState<AnalysisGame[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<BetOption | null>(null);

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runAnalysis = useCallback(async (option: BetOption) => {
    setSelectedOption(option);
    setIsRunning(true);
    setGames([]);
    setAgents(AGENTS.map(a => ({ ...a, status: 'idle' })));

    // Shuffle and pick games
    const shuffled = [...MOCK_GAMES].sort(() => Math.random() - 0.5);
    const candidateGames: AnalysisGame[] = shuffled.slice(0, 30).map((g, i) => ({
      ...g,
      id: `game-${i}`,
      status: 'pending' as const,
      confidence: 0,
      agentNotes: {},
    }));

    setGames(candidateGames);

    // Agent 1: Search
    setCurrentAgentIndex(0);
    setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'searching' } : a));
    await delay(2000);
    setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'complete' } : a));

    // Agent 2: Fundamental
    setCurrentAgentIndex(1);
    setAgents(prev => prev.map((a, i) => i === 1 ? { ...a, status: 'analyzing' } : a));
    await delay(2500);
    // Reject some games
    const afterFundamental = candidateGames.map(g => ({
      ...g,
      status: Math.random() > 0.4 ? 'pending' as const : 'rejected' as const,
      agentNotes: Math.random() > 0.4 ? { INTEL: agentNoteTemplates.INTEL[Math.floor(Math.random() * 3)] } : {},
    }));
    setGames(afterFundamental);
    setAgents(prev => prev.map((a, i) => i === 1 ? { ...a, status: 'complete' } : a));

    // Agent 3: Statistics
    setCurrentAgentIndex(2);
    setAgents(prev => prev.map((a, i) => i === 2 ? { ...a, status: 'analyzing' } : a));
    await delay(2500);
    const afterStats = afterFundamental.map(g => {
      if (g.status === 'rejected') return g;
      const pass = Math.random() > 0.35;
      return {
        ...g,
        status: pass ? 'pending' as const : 'rejected' as const,
        agentNotes: pass ? { ...g.agentNotes, STATS: agentNoteTemplates.STATS[Math.floor(Math.random() * 3)] } : g.agentNotes,
      };
    });
    setGames(afterStats);
    setAgents(prev => prev.map((a, i) => i === 2 ? { ...a, status: 'complete' } : a));

    // Agent 4: Collector (JUDGE) — very strict
    setCurrentAgentIndex(3);
    setAgents(prev => prev.map((a, i) => i === 3 ? { ...a, status: 'analyzing' } : a));
    await delay(3000);
    const afterJudge = afterStats.map(g => {
      if (g.status === 'rejected') return g;
      const pass = Math.random() > 0.3;
      return {
        ...g,
        status: pass ? 'pending' as const : 'rejected' as const,
        confidence: pass ? Math.floor(70 + Math.random() * 25) : 0,
        agentNotes: pass ? { ...g.agentNotes, JUDGE: agentNoteTemplates.JUDGE[Math.floor(Math.random() * 3)] } : g.agentNotes,
      };
    });
    setGames(afterJudge);
    setAgents(prev => prev.map((a, i) => i === 3 ? { ...a, status: 'complete' } : a));

    // Agent 5: Boss — final picks (max 20)
    setCurrentAgentIndex(4);
    setAgents(prev => prev.map((a, i) => i === 4 ? { ...a, status: 'analyzing' } : a));
    await delay(2000);
    let approvedCount = 0;
    const finalGames = afterJudge.map(g => {
      if (g.status === 'rejected') return g;
      if (approvedCount >= 20) return { ...g, status: 'rejected' as const };
      const pass = Math.random() > 0.2;
      if (pass) {
        approvedCount++;
        return {
          ...g,
          status: 'approved' as const,
          agentNotes: { ...g.agentNotes, BOSS: agentNoteTemplates.BOSS[Math.floor(Math.random() * 3)] },
        };
      }
      return { ...g, status: 'rejected' as const };
    });

    // Sort: approved first
    const sorted = [...finalGames].sort((a, b) => {
      if (a.status === 'approved' && b.status !== 'approved') return -1;
      if (a.status !== 'approved' && b.status === 'approved') return 1;
      return b.confidence - a.confidence;
    });

    setGames(sorted);
    setAgents(prev => prev.map((a, i) => i === 4 ? { ...a, status: 'complete' } : a));
    setCurrentAgentIndex(-1);
    setIsRunning(false);
  }, []);

  return { agents, games, isRunning, currentAgentIndex, selectedOption, runAnalysis };
}
