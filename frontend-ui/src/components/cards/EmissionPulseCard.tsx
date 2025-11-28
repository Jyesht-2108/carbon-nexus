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
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Emission Pulse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl font-heading font-bold bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
                {formatNumber(currentRate, 0)}
              </div>
              <div className="text-sm text-muted dark:text-gray-400 mt-1">kg CO₂/hr</div>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 p-3 rounded-2xl glass"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {isPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              <span className="text-sm text-muted dark:text-gray-400">vs target</span>
            </motion.div>
            <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted dark:text-gray-400">Target</span>
                <span className="font-semibold dark:text-gray-200">
                  {formatNumber(target, 0)} kg/hr
                </span>
              </div>
              <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    currentRate > target
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600'
                  }`}
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
