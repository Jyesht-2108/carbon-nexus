import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CO2DonutChart } from '@/components/charts/CO2DonutChart';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

interface EmissionDonutCardProps {
  categories: Record<string, number>;
}

export function EmissionDonutCard({ categories }: EmissionDonutCardProps) {
  const chartData = Object.entries(categories).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <CardTitle>CO₂ by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CO2DonutChart data={chartData} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
