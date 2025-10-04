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
    <div className="flex space-x-2 mb-8">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeFilter === filter.id
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 scale-105'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:scale-105'
          }`}
        >
          {filter.label}
          <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold ${
            activeFilter === filter.id
              ? 'bg-teal-700 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
}
