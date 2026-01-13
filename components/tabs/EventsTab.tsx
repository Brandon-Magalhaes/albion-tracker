import { Dispatch, SetStateAction } from 'react';
import { Event } from '@/types/albion';
import EventList from '@/components/EventList';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EventsTabProps {
  events: Event[];
  currentPlayerName: string;
  loading: boolean;
  offset: number;
  setOffset: Dispatch<SetStateAction<number>>;
  limit: number;
}

export default function EventsTab({ 
  events, 
  currentPlayerName, 
  loading, 
  offset, 
  setOffset, 
  limit 
}: EventsTabProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4 px-2 border-l-4 border-blue-500 text-white">Histórico de Combate</h2>
      
      {loading && <div className="text-center py-2 text-blue-400">Atualizando...</div>}
      
      <EventList events={events} currentPlayerName={currentPlayerName} />
      
      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0 || loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Anterior
        </button>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={events.length < limit || loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Próximo <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
