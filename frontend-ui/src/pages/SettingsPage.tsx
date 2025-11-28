import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

export function SettingsPage() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-6 rounded-2xl border-l-4 border-l-accent1"
      >
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-accent1 to-accent2 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted dark:text-gray-400 mt-2 text-lg">
          Configure your preferences and thresholds
        </p>
      </motion.div>

      <Card>
        <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
          <CardTitle className="font-heading">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-base font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <motion.label
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-2xl glass cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded-lg border-2 border-primary text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Email alerts for critical hotspots
                </span>
              </motion.label>
              <motion.label
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-2xl glass cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded-lg border-2 border-primary text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Daily emission summary
                </span>
              </motion.label>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-base font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Threshold Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Warning threshold (%)
                </label>
                <input
                  type="number"
                  defaultValue={80}
                  className="w-full rounded-2xl glass-card border-2 border-gray-200 dark:border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Critical threshold (%)
                </label>
                <input
                  type="number"
                  defaultValue={150}
                  className="w-full rounded-2xl glass-card border-2 border-gray-200 dark:border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" className="w-full sm:w-auto">
              Save Changes
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
