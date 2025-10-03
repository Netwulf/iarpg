import { requireAuth } from '@/lib/auth-helpers';
import { JoinTableClient } from './join-table-client';

export default async function JoinTablePage() {
  const session = await requireAuth();

  return <JoinTableClient />;
}
