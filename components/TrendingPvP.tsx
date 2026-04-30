'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Event } from '@/types/albion';
import { Sword, Skull, Clock, MapPin, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TrendingPvP() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/albion/events/global?limit=10', { cache: 'no-store' });
      if (!res.ok) {
        setEvents([]);
        setError(true);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        setEvents([]);
        setError(true);
        return;
      }

      setEvents(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          PvP em tempo real
        </h2>
        <button 
          onClick={fetchEvents} 
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Atualizar"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && events.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse border border-gray-700/50" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center text-red-300">
          <p>Não foi possível carregar o feed de PvP no momento.</p>
          <button 
            onClick={fetchEvents}
            className="mt-3 text-sm underline hover:text-white"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {events.map((event) => (
            <Link 
              href={`/event/${event.EventId}?fallbackPlayer=${encodeURIComponent(event.Victim.Name)}&fallbackKiller=${encodeURIComponent(event.Killer.Name)}`}
              key={event.EventId}
              className="group bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Players */}
              <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                {/* Killer */}
                <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
                  <span className="font-bold text-green-400 truncate text-sm sm:text-base">{event.Killer.Name}</span>
                  <div className="text-xs text-gray-500 font-mono hidden sm:block">({event.Killer.AverageItemPower.toFixed(0)})</div>
                </div>
                
                {/* VS Icon */}
                <div className="text-gray-600 px-1">
                    <Sword size={14} />
                </div>

                {/* Victim */}
                <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
                  <span className="font-bold text-red-400 truncate text-sm sm:text-base">{event.Victim.Name}</span>
                  <div className="text-xs text-gray-500 font-mono hidden sm:block">({event.Victim.AverageItemPower.toFixed(0)})</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5" title="Fama total">
                  <Skull size={14} className="text-gray-500" />
                  <span className="font-mono text-yellow-500 font-bold">{event.TotalVictimKillFame.toLocaleString()}</span>
                </div>

                {event.KillArea && (
                    <div className="flex items-center gap-1.5 hidden sm:flex">
                        <MapPin size={14} className="text-gray-500" />
                        <span className="truncate max-w-[100px]">{event.KillArea}</span>
                    </div>
                )}
                
                <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
                  <Clock size={14} className="text-gray-500" />
                  <span>
                    {formatDistanceToNow(new Date(event.TimeStamp), { addSuffix: true, locale: ptBR })
                      .replace('cerca de ', '')
                    }
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
