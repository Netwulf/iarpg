'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Label } from '@iarpg/ui';
import { Search, X, Plus } from 'lucide-react';
import { TableCard } from '@/components/tables/table-card';

interface Table {
  id: string;
  name: string;
  description: string;
  playStyle: 'sync' | 'async' | 'solo';
  privacy: string;
  playerCount: number;
  maxPlayers: number;
  tags: string[];
  lastActivityAt: string;
  inviteCode: string;
}

interface Filters {
  search: string;
  playStyles: string[];
  tags: string[];
}

export function TableBrowserClient() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    playStyles: [],
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTables();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, page]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await apiClient.get('/tables', { params: { ...filters, page } });

      // Mock data for now
      setTables([]);
      setTotalPages(1);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayStyle = (style: string) => {
    setFilters(prev => ({
      ...prev,
      playStyles: prev.playStyles.includes(style)
        ? prev.playStyles.filter(s => s !== style)
        : [...prev.playStyles, style],
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', playStyles: [], tags: [] });
    setPage(1);
  };

  const activeFiltersCount = filters.playStyles.length + filters.tags.length + (filters.search ? 1 : 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Discover Tables</h1>
          <p className="text-body text-gray-400 mt-2">
            Browse and join public D&D 5e games
          </p>
        </div>
        <Link href="/tables/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Table
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="search"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search tables..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Play Style Filter */}
              <div className="space-y-2">
                <Label>Play Style</Label>
                <div className="space-y-2">
                  {['sync', 'async', 'solo'].map((style) => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.playStyles.includes(style)}
                        onChange={() => togglePlayStyle(style)}
                        className="w-4 h-4 rounded border-gray-600 text-green-neon focus:ring-green-neon focus:ring-offset-black"
                      />
                      <span className="text-small capitalize">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full text-small"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters ({activeFiltersCount})
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {loading && tables.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">Loading tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-4xl">🎲</span>
                </div>
                <h2 className="text-h2 mb-2">No Tables Found</h2>
                <p className="text-body text-gray-400 mb-6">
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters or create a new table'
                    : 'Be the first to create a public table!'}
                </p>
              </div>
              {activeFiltersCount > 0 ? (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                <Link href="/tables/new">
                  <Button size="lg">Create Your First Table</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {tables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Previous
                  </Button>
                  <span className="text-small text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
