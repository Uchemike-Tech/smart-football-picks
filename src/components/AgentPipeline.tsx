import { motion } from 'framer-motion';
import { Agent, AgentStatus } from '@/lib/types';

interface AgentPipelineProps {
  agents: Agent[];
  currentAgentIndex: number;
}

const statusColors: Record<AgentStatus, string> = {
  idle: 'bg-muted-foreground/30',
  searching: 'bg-primary animate-pulse',
  analyzing: 'bg-accent animate-pulse',
  complete: 'bg-success',
  failed: 'bg-destructive',
};

const statusLabels: Record<AgentStatus, string> = {
  idle: 'STANDBY',
  searching: 'SCANNING',
  analyzing: 'ANALYZING',
  complete: 'DONE',
  failed: 'FAILED',
};

const AgentPipeline = ({ agents, currentAgentIndex }: AgentPipelineProps) => {
  return (
    <div className="flex flex-col gap-3">
      {agents.map((agent, index) => {
        const isActive = index === currentAgentIndex;
        const isDone = agent.status === 'complete';

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-4 p-4 rounded-lg border transition-all duration-500
              ${isActive ? 'border-primary bg-primary/5 glow-green' : isDone ? 'border-success/30 bg-success/5' : 'border-border bg-card'}
            `}
          >
            {/* Status dot */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[agent.status]}`} />

            {/* Icon */}
            <span className="text-2xl flex-shrink-0">{agent.icon}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{agent.name}</span>
                <span className="text-xs text-muted-foreground">— {agent.role}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
            </div>

            {/* Status badge */}
            <span className={`
              text-[10px] font-mono font-bold px-2 py-1 rounded uppercase tracking-wider flex-shrink-0
              ${isActive ? 'text-primary bg-primary/10' : isDone ? 'text-success bg-success/10' : 'text-muted-foreground bg-muted'}
            `}>
              {statusLabels[agent.status]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentPipeline;
