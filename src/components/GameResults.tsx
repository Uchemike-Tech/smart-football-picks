import { motion } from 'framer-motion';
import { AnalysisGame } from '@/lib/types';

interface GameResultsProps {
  games: AnalysisGame[];
  selectedMarket: string;
}

const GameResults = ({ games, selectedMarket }: GameResultsProps) => {
  const approved = games.filter(g => g.status === 'approved');
  const rejected = games.filter(g => g.status === 'rejected');

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-success">{approved.length} Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-destructive">{rejected.length} Rejected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
          <span className="text-muted-foreground">{games.filter(g => g.status === 'pending').length} Pending</span>
        </div>
      </div>

      {/* Games list */}
      <div className="space-y-2">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-4 rounded-lg border transition-all
              ${game.status === 'approved' ? 'border-success/30 bg-success/5' : game.status === 'rejected' ? 'border-destructive/20 bg-destructive/5 opacity-60' : 'border-border bg-card'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {game.homeTeam} vs {game.awayTeam}
                  </span>
                  {game.status === 'approved' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-success/20 text-success uppercase">
                      ✓ Approved
                    </span>
                  )}
                  {game.status === 'rejected' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-destructive/20 text-destructive uppercase">
                      ✗ Rejected
                    </span>
                  )}
                  {game.status === 'pending' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>{game.league}</span>
                  <span>{game.time}</span>
                  <span>Market: {selectedMarket}</span>
                </div>
              </div>

              {game.status === 'approved' && (
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-success">{game.confidence}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Confidence</div>
                </div>
              )}
            </div>

            {/* Agent notes */}
            {game.status === 'approved' && Object.keys(game.agentNotes).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(game.agentNotes).map(([agent, note]) => (
                    <div key={agent} className="text-xs">
                      <span className="font-mono font-bold text-primary">{agent}:</span>{' '}
                      <span className="text-muted-foreground">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameResults;
