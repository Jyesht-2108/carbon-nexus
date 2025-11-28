import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { formatCO2 } from '@/lib/utils';

interface GaugeProgressCardProps {
  saved: number;
  goal: number;
}

export function GaugeProgressCard({ saved, goal }: GaugeProgressCardProps) {
  const percentage = Math.min((saved / goal) * 100, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="show">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">CO₂ Saved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48 filter drop-shadow-lg">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5A0" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="14"
                  fill="none"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="url(#gaugeGradient)"
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                  style={{
                    strokeDasharray: circumference,
                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 160, 0.5))',
                  }}
                />
              </svg>
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
                  {percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-muted dark:text-gray-400 mt-1">of goal</div>
              </motion.div>
            </div>
            <motion.div
              className="mt-6 text-center space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100">
                {formatCO2(saved)} saved
              </div>
              <div className="text-sm text-muted dark:text-gray-400">
                Goal: {formatCO2(goal)}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
