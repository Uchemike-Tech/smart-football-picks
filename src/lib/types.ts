export type BetOption = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
};

export const BET_OPTIONS: BetOption[] = [
  { id: 'ft_draw', label: 'Full Time Draw', shortLabel: 'FT Draw', description: 'Match ends in a draw at full time', icon: '⚖️' },
  { id: 'ht_draw', label: 'Half Time Draw', shortLabel: 'HT Draw', description: 'Match is drawn at half time', icon: '⏸️' },
  { id: 'home_win', label: 'Home Win', shortLabel: 'Home', description: 'Home team wins the match', icon: '🏠' },
  { id: '1x', label: '1X (Home or Draw)', shortLabel: '1X', description: 'Home team wins or match ends in draw', icon: '🔄' },
  { id: 'over_1_5', label: 'Over 1.5 Goals', shortLabel: 'O1.5', description: 'Two or more goals in the match', icon: '⚽' },
  { id: 'over_2_5', label: 'Over 2.5 Goals', shortLabel: 'O2.5', description: 'Three or more goals in the match', icon: '🔥' },
  { id: 'ht_corners', label: 'Half Time Over Corners', shortLabel: 'HT Corners', description: 'Over corner threshold at half time', icon: '📐' },
  { id: 'ft_corners', label: 'Full Time Over Corners', shortLabel: 'FT Corners', description: 'Over corner threshold at full time', icon: '🚩' },
];

export type AgentStatus = 'idle' | 'searching' | 'analyzing' | 'complete' | 'failed';

export type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  icon: string;
};

export const AGENTS: Agent[] = [
  { id: 'search', name: 'SCOUT', role: 'Search Agent', description: 'Scans for matching games worldwide', status: 'idle', icon: '🔍' },
  { id: 'fundamental', name: 'INTEL', role: 'Fundamental Agent', description: 'Analyzes team form, injuries & news', status: 'idle', icon: '📊' },
  { id: 'statistics', name: 'STATS', role: 'Statistics Agent', description: 'Deep statistical analysis of matchups', status: 'idle', icon: '📈' },
  { id: 'collector', name: 'JUDGE', role: 'Collector Agent', description: 'Strict realistic assessment — no wishful thinking', status: 'idle', icon: '⚖️' },
  { id: 'boss', name: 'BOSS', role: 'Boss Agent', description: 'Final approval — only the strongest picks', status: 'idle', icon: '👑' },
];

export type AnalysisGame = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  time: string;
  confidence: number;
  agentNotes: Record<string, string>;
  status: 'approved' | 'rejected' | 'pending';
};
