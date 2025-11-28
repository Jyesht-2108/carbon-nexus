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
      className="space-y-8"
    >
      <motion.div
        variants={fadeIn}
        className="glass-card p-6 rounded-2xl border-l-4 border-l-accent2"
      >
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-accent2 to-primary bg-clip-text text-transparent">
          Recent Activity
        </h1>
        <p className="text-muted dark:text-gray-400 mt-2 text-lg">
          Track all carbon emission events across your supply chain
        </p>
      </motion.div>

      <Card>
        <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
          <CardTitle className="font-heading">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={fadeIn}
                initial="hidden"
                animate="show"
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center justify-between p-5 glass rounded-2xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent1 flex items-center justify-center shadow-glow"
                  >
                    <Activity className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {activity.description}
                    </div>
                    <div className="text-sm text-muted dark:text-gray-400 mt-1">
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      activity.trend === 'up'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    }`}
                  >
                    {activity.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-bold">{activity.co2} kg</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
