import { Card, CardContent } from '@/components/ui/Card';
import { Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

interface DataQualityBadgeProps {
  completeness: number;
  predicted: number;
  anomalies: number;
}

export function DataQualityBadge({
  completeness,
  predicted,
  anomalies,
}: DataQualityBadgeProps) {
  return (
    <motion.div variants={scaleIn} initial="hidden" animate="show">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Data Quality</div>
              <div className="text-xs text-gray-500 mt-1">
                {completeness.toFixed(0)}% Real | {predicted.toFixed(0)}% Predicted
              </div>
            </div>
            {anomalies > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{anomalies}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
