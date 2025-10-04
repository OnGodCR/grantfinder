'use client';

import { useState } from 'react';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'All Grants', count: 247 },
  { id: 'nsf', label: 'NSF', count: 45 },
  { id: 'nih', label: 'NIH', count: 38 },
  { id: 'foundations', label: 'Foundations', count: 89 },
  { id: 'deadline-soon', label: 'Deadline Soon', count: 12 },
  { id: 'high-match', label: 'High Match', count: 67 },
];

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex space-x-1 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? 'bg-teal-500 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {filter.label}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeFilter === filter.id
              ? 'bg-teal-600 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
}
