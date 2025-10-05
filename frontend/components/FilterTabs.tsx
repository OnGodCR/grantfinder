'use client';

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
    <div className="flex space-x-3 mb-0">
      {displayFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeFilter === filter.id
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-slate-700/50'
          }`}
        >
          {filter.label}
          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
            activeFilter === filter.id
              ? 'bg-teal-700 text-white'
              : 'bg-slate-700/50 text-slate-300'
          }`}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
}
