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
      <Card>
        <CardHeader>
          <CardTitle>Emission Pulse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-gray-900">
                {formatNumber(currentRate, 0)}
              </div>
              <div className="text-sm text-gray-500">kg CO₂/hr</div>
            </div>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {isPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs target</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target</span>
                <span className="font-medium">{formatNumber(target, 0)} kg/hr</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    currentRate > target ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentOfTarget, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
