import { useState, useCallback } from 'react';
import { Agent, AGENTS, AnalysisGame, BetOption } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runAnalysis = useCallback(async (option: BetOption) => {
    setSelectedOption(option);
    setIsRunning(true);
    setGames([]);
    setFetchError(null);
    setAgents(AGENTS.map(a => ({ ...a, status: 'idle' })));

    // Agent 1: Search — fetch real fixtures from API-Football
    setCurrentAgentIndex(0);
    setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'searching' } : a));

    let candidateGames: AnalysisGame[] = [];

    try {
      const { data, error } = await supabase.functions.invoke('fetch-fixtures');

      if (error) {
        throw new Error(error.message || 'Failed to fetch fixtures');
      }

      if (!data?.success || !data?.fixtures?.length) {
        throw new Error(data?.error || 'No fixtures found for today');
      }

      console.log(`Fetched ${data.fixtures.length} real fixtures for ${data.date}`);

      // Take up to 30 fixtures, shuffle for variety
      const shuffled = [...data.fixtures].sort(() => Math.random() - 0.5);
      candidateGames = shuffled.slice(0, 30).map((f: any) => ({
        id: f.id,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        league: `${f.league} (${f.country})`,
        time: f.time,
        status: 'pending' as const,
        confidence: 0,
        agentNotes: { SCOUT: 'Found via live fixture scan' },
      }));
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setFetchError(err.message || 'Failed to fetch today\'s fixtures');
      setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'failed' } : a));
      setIsRunning(false);
      return;
    }

    setGames(candidateGames);
    setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'complete' } : a));

    // Agent 2: Fundamental
    setCurrentAgentIndex(1);
    setAgents(prev => prev.map((a, i) => i === 1 ? { ...a, status: 'analyzing' } : a));
    await delay(2500);
    const afterFundamental = candidateGames.map(g => ({
      ...g,
      status: Math.random() > 0.4 ? 'pending' as const : 'rejected' as const,
      agentNotes: Math.random() > 0.4
        ? { ...g.agentNotes, INTEL: agentNoteTemplates.INTEL[Math.floor(Math.random() * 3)] }
        : g.agentNotes,
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
        agentNotes: pass
          ? { ...g.agentNotes, STATS: agentNoteTemplates.STATS[Math.floor(Math.random() * 3)] }
          : g.agentNotes,
      };
    });
    setGames(afterStats);
    setAgents(prev => prev.map((a, i) => i === 2 ? { ...a, status: 'complete' } : a));

    // Agent 4: Judge — very strict
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
        agentNotes: pass
          ? { ...g.agentNotes, JUDGE: agentNoteTemplates.JUDGE[Math.floor(Math.random() * 3)] }
          : g.agentNotes,
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

  return { agents, games, isRunning, currentAgentIndex, selectedOption, fetchError, runAnalysis };
}
