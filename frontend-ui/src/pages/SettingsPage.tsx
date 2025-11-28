import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

export function SettingsPage() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Notification Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">Email alerts for critical hotspots</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">Daily emission summary</span>
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Threshold Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Warning threshold (%)</label>
                <input
                  type="number"
                  defaultValue={80}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Critical threshold (%)</label>
                <input
                  type="number"
                  defaultValue={150}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
