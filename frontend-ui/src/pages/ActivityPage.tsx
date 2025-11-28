import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

const mockActivities = [
  {
    id: 1,
    type: 'transport',
    description: 'Supplier A - Long haul delivery',
    co2: 145,
    timestamp: '2 hours ago',
    trend: 'up',
  },
  {
    id: 2,
    type: 'factory',
    description: 'Factory B - Production shift',
    co2: 892,
    timestamp: '4 hours ago',
    trend: 'down',
  },
  {
    id: 3,
    type: 'warehouse',
    description: 'Warehouse C - Cooling system',
    co2: 67,
    timestamp: '6 hours ago',
    trend: 'up',
  },
];

export function ActivityPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <motion.div
                key={activity.id}
                variants={fadeIn}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-gray-900">{activity.description}</div>
                    <div className="text-sm text-gray-500">{activity.timestamp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activity.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                  <span className="font-semibold text-gray-900">{activity.co2} kg</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
