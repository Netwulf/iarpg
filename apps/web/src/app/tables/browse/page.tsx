import { requireAuth } from '@/lib/auth-helpers';
import { TableBrowserClient } from './table-browser-client';

export default async function TableBrowsePage() {
  const session = await requireAuth();

  return <TableBrowserClient />;
}
