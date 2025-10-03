'use client';

import { TablePageClient } from './table-page-client';

export default function TablePage({ params }: { params: { id: string } }) {
  // TODO: Add authentication (Story 1.3)
  return <TablePageClient tableId={params.id} />;
}
