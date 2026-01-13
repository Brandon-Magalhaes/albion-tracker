import { useState, useMemo } from 'react';
import { Event } from '@/types/albion';
import EventList from '@/components/EventList';
import { ArrowDown } from 'lucide-react';

interface EventsTabProps {
  events: Event[];
  currentPlayerName: string;
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function EventsTab({ 
  events, 
  currentPlayerName, 
  loading, 
  onLoadMore,
  hasMore
}: EventsTabProps) {
  const [filter, setFilter] = useState<'all' | 'kills' | 'deaths'>('all');

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    const nameLower = currentPlayerName.toLowerCase();
    return events.filter(e => {
      if (filter === 'kills') return e.Killer.Name.toLowerCase() === nameLower;
      if (filter === 'deaths') return e.Victim.Name.toLowerCase() === nameLower;
      return true;
    });
  }, [events, filter, currentPlayerName]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold px-2 border-l-4 border-blue-500 text-white">Histórico de Combate</h2>
        
        {/* Filters */}
        <div className="flex bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('kills')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filter === 'kills' ? 'bg-green-900/50 text-green-400' : 'text-gray-400 hover:text-green-400'}`}
          >
            Kills
          </button>
          <button
            onClick={() => setFilter('deaths')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filter === 'deaths' ? 'bg-red-900/50 text-red-400' : 'text-gray-400 hover:text-red-400'}`}
          >
            Deaths
          </button>
        </div>
      </div>
      
      {loading && events.length === 0 && <div className="text-center py-10 text-blue-400">Carregando eventos...</div>}
      
      <EventList events={filteredEvents} currentPlayerName={currentPlayerName} />
      
      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onLoadMore}
          disabled={loading || !hasMore}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all"
        >
          {loading ? 'Carregando...' : 'Carregar Mais'}
          {!loading && <ArrowDown size={18} />}
        </button>
      </div>
    </div>
  );
}
