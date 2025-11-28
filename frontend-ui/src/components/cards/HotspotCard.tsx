import { Card, CardContent } from '@/components/ui/Card';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { Hotspot } from '@/services/api';

interface HotspotCardProps {
  hotspot: Hotspot;
  onClick?: () => void;
}

export function HotspotCard({ hotspot, onClick }: HotspotCardProps) {
  const severityColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <motion.div variants={fadeIn}>
      <Card
        className={`cursor-pointer hover:shadow-xl transition-shadow ${
          severityColors[hotspot.severity]
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div>
                <div className="font-semibold">{hotspot.entity}</div>
                <div className="text-sm opacity-80">{hotspot.entity_type}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 font-bold">
                <TrendingUp className="w-4 h-4" />
                {hotspot.percent_above.toFixed(0)}%
              </div>
              <div className="text-xs opacity-80">above baseline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
