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
    <motion.div variants={fadeIn}>
      <Card className="hover:shadow-xl transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{recommendation.body}</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingDown className="w-4 h-4" />
                <span className="font-medium">
                  {formatCO2(Math.abs(recommendation.co2_impact))}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>${recommendation.cost_estimate}k</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <span className="text-xs">Feasibility:</span>
                <span className="font-medium">{recommendation.feasibility_score}/10</span>
              </div>
            </div>
            {recommendation.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="flex-1 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDismiss}
                  className="flex-1 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
