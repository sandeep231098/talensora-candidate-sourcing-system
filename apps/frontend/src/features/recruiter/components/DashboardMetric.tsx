import { MetricCard } from '../../../components/app/DashboardComponents'

interface DashboardMetricProps {
  label: string
  value: number
}

export function DashboardMetric({
  label,
  value,
}: DashboardMetricProps) {
  return <MetricCard label={label} value={value} />
}
