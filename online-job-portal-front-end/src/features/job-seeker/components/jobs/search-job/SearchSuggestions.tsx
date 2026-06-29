'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, Search, TrendingUp, X } from 'lucide-react';

import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';

interface SearchSuggestionsProps {
  jobs: Job[];
  searchTerm: string;
  onSearch: (term: string) => void;
  onClose?: () => void;
}

const POPULAR_SEARCHES = [
  'Senior Developer',
  'Marketing Manager',
  'Sales Executive',
  'Business Analyst',
  'Product Manager',
  'UX Designer',
];

export default function SearchSuggestions({
  jobs,
  searchTerm,
  onSearch,
  onClose,
}: SearchSuggestionsProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jobSearchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Generate suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const jobSuggestions = [
      ...new Set([
        ...jobs
          .filter(
            (j) => j.title.toLowerCase().includes(term) || j.company.toLowerCase().includes(term),
          )
          .slice(0, 3)
          .map((j) => j.title),
        ...jobs
          .filter((j) => j.company.toLowerCase().includes(term))
          .slice(0, 2)
          .map((j) => j.company),
      ]),
    ];

    setSuggestions(jobSuggestions.slice(0, 5));
    setSelectedIndex(-1);
  }, [searchTerm, jobs]);

  const addToHistory = (term: string) => {
    const updated = [term, ...searchHistory.filter((h) => h !== term)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('jobSearchHistory', JSON.stringify(updated));
  };

  const removeFromHistory = (term: string) => {
    const updated = searchHistory.filter((h) => h !== term);
    setSearchHistory(updated);
    localStorage.setItem('jobSearchHistory', JSON.stringify(updated));
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
    addToHistory(suggestion);
    onClose?.();
  };

  if (!searchTerm && searchHistory.length === 0 && !onClose) {
    return null;
  }

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {/* Suggestions from search results */}
      {searchTerm && suggestions.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            <TrendingUp size={12} className="inline mr-1" />
            Gợi ý
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-2 transition ${
                index === selectedIndex ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
              }`}
            >
              <Search size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1">{suggestion}</span>
            </button>
          ))}
          <div className="border-t border-border my-2" />
        </div>
      )}

      {/* Search History */}
      {!searchTerm && searchHistory.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            <Clock size={12} className="inline mr-1" />
            Tìm kiếm gần đây
          </div>
          {searchHistory.map((term) => (
            <div
              key={term}
              className="px-4 py-2.5 flex items-center gap-2 hover:bg-secondary group transition"
            >
              <Clock size={16} className="text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => handleSuggestionClick(term)}
                className="flex-1 text-left hover:text-primary transition"
              >
                {term}
              </button>
              <button
                onClick={() => removeFromHistory(term)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="border-t border-border my-2" />
        </div>
      )}

      {/* Popular Searches */}
      {!searchTerm && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Xu hướng tìm kiếm
          </div>
          {POPULAR_SEARCHES.map((search) => (
            <button
              key={search}
              onClick={() => handleSuggestionClick(search)}
              className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-secondary transition"
            >
              <TrendingUp size={16} className="text-accent flex-shrink-0" />
              <span>{search}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
