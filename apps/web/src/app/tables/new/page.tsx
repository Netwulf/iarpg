'use client';

import { requireAuth } from '@/lib/auth-helpers';
import { TableCreateForm } from './table-create-form';

export default async function TableCreatePage() {
  const session = await requireAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1>Create New Table</h1>
        <p className="text-body text-gray-400 mt-2">
          Set up your D&D 5e game table with custom settings
        </p>
      </div>

      <TableCreateForm />
    </div>
  );
}
