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
      <Card>
        <CardHeader>
          <CardTitle>CO₂ Saved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="#14b8a6"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">
                  {percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">of goal</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatCO2(saved)} saved
              </div>
              <div className="text-sm text-gray-500">Goal: {formatCO2(goal)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
