import { DashboardContent } from '@/components/dashboard-content';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardContent />;
}
