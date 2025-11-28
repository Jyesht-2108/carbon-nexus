import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, TrendingDown, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { Recommendation } from '@/services/api';
import { formatCO2 } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApprove: () => void;
  onDismiss: () => void;
}

export function RecommendationCard({
  recommendation,
  onApprove,
  onDismiss,
}: RecommendationCardProps) {
  return (
    <motion.div
      variants={fadeIn}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100 text-base">
                {recommendation.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                {recommendation.body}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              >
                <TrendingDown className="w-4 h-4" />
                <span className="font-semibold">
                  {formatCO2(Math.abs(recommendation.co2_impact))}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
              >
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">${recommendation.cost_estimate}k</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
              >
                <span className="text-xs font-medium">Feasibility:</span>
                <span className="font-semibold">{recommendation.feasibility_score}/10</span>
              </motion.div>
            </div>
            {recommendation.status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 pt-2"
              >
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDismiss}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
