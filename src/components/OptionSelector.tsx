import { useState } from 'react';
import { motion } from 'framer-motion';
import { BET_OPTIONS, BetOption } from '@/lib/types';

interface OptionSelectorProps {
  onSelect: (option: BetOption) => void;
}

const OptionSelector = ({ onSelect }: OptionSelectorProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">AI Agent System Online</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-mono font-bold mb-4 text-gradient-green">
            PITCH PROPHET
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            5 AI agents analyze thousands of matches daily. Select your market below to begin the analysis pipeline.
          </p>
        </motion.div>

        {/* Option Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BET_OPTIONS.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onMouseEnter={() => setHoveredId(option.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(option)}
              className={`
                relative group p-6 rounded-lg border transition-all duration-300 text-left
                ${hoveredId === option.id
                  ? 'border-primary bg-primary/10 glow-green'
                  : 'border-border bg-card hover:border-primary/40'
                }
              `}
            >
              <div className="text-3xl mb-3">{option.icon}</div>
              <h3 className="font-mono text-sm font-semibold text-foreground mb-1">{option.shortLabel}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
              
              {/* Hover indicator */}
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 rounded-b-lg ${hoveredId === option.id ? 'w-full' : 'w-0'}`} />
            </motion.button>
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-muted-foreground text-sm mt-12 font-mono"
        >
          Select a market to activate the 5-agent analysis pipeline
        </motion.p>
      </div>
    </div>
  );
};

export default OptionSelector;
