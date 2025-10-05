'use client';

import { useState } from 'react';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters?: Array<{ id: string; label: string; count: number }>;
}

const filters = [
  { id: 'all', label: 'All Grants', count: 247 },
  { id: 'nsf', label: 'NSF', count: 45 },
  { id: 'nih', label: 'NIH', count: 38 },
  { id: 'foundations', label: 'Foundations', count: 89 },
  { id: 'deadline-soon', label: 'Deadline Soon', count: 12 },
  { id: 'high-match', label: 'High Match', count: 67 },
];

export default function FilterTabs({ activeFilter, onFilterChange, filters: customFilters }: FilterTabsProps) {
  const displayFilters = customFilters || filters;
  
  return (
    <div className="flex space-x-2 mb-8">
      {displayFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
        >
          {filter.label}
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
            activeFilter === filter.id
              ? 'bg-teal-700 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
}
