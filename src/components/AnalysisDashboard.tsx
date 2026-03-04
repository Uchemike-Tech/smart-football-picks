import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { BetOption } from '@/lib/types';
import AgentPipeline from '@/components/AgentPipeline';
import GameResults from '@/components/GameResults';
import { useAnalysis } from '@/hooks/useAnalysis';

interface AnalysisDashboardProps {
  option: BetOption;
  onBack: () => void;
}

const AnalysisDashboard = ({ option, onBack }: AnalysisDashboardProps) => {
  const { agents, games, isRunning, currentAgentIndex } = useAnalysis();
  const approved = games.filter(g => g.status === 'approved');

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{option.icon}</span>
            <div>
              <h1 className="font-mono text-xl font-bold text-foreground">{option.label}</h1>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </div>
          {isRunning && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">ANALYZING</span>
            </div>
          )}
          {!isRunning && approved.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs font-mono text-success">{approved.length} PICKS READY</span>
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Pipeline - left column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8">
              <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">Agent Pipeline</h2>
              <AgentPipeline agents={agents} currentAgentIndex={currentAgentIndex} />
            </div>
          </motion.div>

          {/* Results - right column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Match Analysis {games.length > 0 && `(${games.length} scanned)`}
            </h2>
            {games.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="font-mono text-sm">Initializing agent pipeline...</p>
              </div>
            ) : (
              <GameResults games={games} selectedMarket={option.shortLabel} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
