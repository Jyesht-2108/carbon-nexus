import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { formatNumber } from '@/lib/utils';

interface EmissionPulseCardProps {
  currentRate: number;
  trend: number;
  target: number;
}

export function EmissionPulseCard({ currentRate, trend, target }: EmissionPulseCardProps) {
  const isPositive = trend > 0;
  const percentOfTarget = ((currentRate / target) * 100).toFixed(0);

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="show">
      <Card className="overflow-hidden relative">
        {/* Animated glow ring */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0, 246, 255, 0.4), transparent)',
            filter: 'blur(30px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading dark:text-text-bright">
            Emission Pulse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="text-5xl font-heading font-bold text-gradient">
                {formatNumber(currentRate, 0)}
              </div>
              <div className="text-sm text-muted dark:text-text-muted mt-1">kg CO₂/hr</div>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 p-3 rounded-2xl glass-premium"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-neon-orange" />
              ) : (
                <TrendingDown className="w-5 h-5 text-neon-teal" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-neon-orange' : 'text-neon-teal'
                }`}
              >
                {isPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              <span className="text-sm text-muted dark:text-text-muted">vs target</span>
            </motion.div>
            <div className="pt-3 border-t border-gray-200/50 dark:border-white/10">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted dark:text-text-muted">Target</span>
                <span className="font-semibold dark:text-text-bright">
                  {formatNumber(target, 0)} kg/hr
                </span>
              </div>
              <div className="relative h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    currentRate > target
                      ? 'bg-gradient-to-r from-neon-orange to-neon-yellow'
                      : 'bg-gradient-to-r from-neon-teal to-neon-cyan'
                  }`}
                  style={{
                    boxShadow: currentRate > target
                      ? '0 0 10px rgba(255, 122, 26, 0.5)'
                      : '0 0 10px rgba(0, 246, 255, 0.5)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentOfTarget, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
