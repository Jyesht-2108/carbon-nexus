import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, TrendingDown, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { Recommendation } from '@/services/api';
import { formatCO2 } from '@/lib/utils';
import { LottieCheckmark } from '@/components/effects/LottieLoader';
import { useState } from 'react';

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
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApprove = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onApprove();
    }, 800);
  };

  return (
    <motion.div
      variants={fadeIn}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neon-cyan/10 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <LottieCheckmark size={48} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <CardContent className="p-5">
          <div className="space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-gray-900 dark:text-text-bright text-base">
                {recommendation.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-text-muted mt-2 leading-relaxed">
                {recommendation.body}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-neon-teal/10 text-green-700 dark:text-neon-teal border border-transparent dark:border-neon-teal/20"
              >
                <TrendingDown className="w-4 h-4" />
                <span className="font-semibold">
                  {formatCO2(Math.abs(recommendation.co2_impact))}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-neon-cyan/10 text-blue-700 dark:text-neon-cyan border border-transparent dark:border-neon-cyan/20"
              >
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">${recommendation.cost_estimate}k</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-neon-blue/10 text-purple-700 dark:text-neon-blue border border-transparent dark:border-neon-blue/20"
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
                  onClick={handleApprove}
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
