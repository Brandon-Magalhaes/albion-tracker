'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, History, X } from 'lucide-react';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Hydrate history from localStorage on mount
    // This must be in useEffect to avoid hydration mismatch with server rendering
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Defer state update to avoid cascading renders
        queueMicrotask(() => setHistory(parsed));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    // Click outside listener
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToHistory = (term: string) => {
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const removeFromHistory = (e: React.MouseEvent, term: string) => {
    e.stopPropagation(); // Prevent clicking the item itself
    const newHistory = history.filter(h => h !== term);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const term = query.trim();
      addToHistory(term);
      setShowHistory(false);
      router.push(`/player/${encodeURIComponent(term)}`);
    }
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    addToHistory(term); // Move to top
    setShowHistory(false);
    router.push(`/player/${encodeURIComponent(term)}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Nome do Player..."
          value={query}
          onFocus={() => setShowHistory(true)}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none z-10 relative"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors z-10 relative"
        >
          <Search size={20} />
        </button>
      </form>

      {/* History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20">
          <div className="text-xs text-gray-500 px-4 py-2 font-semibold bg-gray-900/50">Recentes</div>
          <ul>
            {history.map((term) => (
              <li key={term} className="flex items-center justify-between hover:bg-gray-700 group transition-colors cursor-pointer">
                <div
                  onClick={() => handleHistoryClick(term)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 text-gray-300 group-hover:text-white"
                >
                  <History size={16} className="text-gray-500 group-hover:text-blue-400" />
                  <span>{term}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => removeFromHistory(e, term)}
                  className="mr-3 p-1.5 rounded-full hover:bg-gray-600 text-gray-500 hover:text-red-400 transition-all"
                  title="Remover do histórico"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
