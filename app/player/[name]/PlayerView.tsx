'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/types/albion';
import { Loader2 } from 'lucide-react';
import PlayerHeader from '@/components/PlayerHeader';
import PerformanceCard from '@/components/PerformanceCard';
import PlayerTabs from '@/components/PlayerTabs';
import EventsTab from '@/components/tabs/EventsTab';
import BuildsTab from '@/components/tabs/BuildsTab';
import ZonesTab from '@/components/tabs/ZonesTab';

export default function PlayerView({ name }: { name: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'builds' | 'zones'>('events');
  const LIMIT = 20;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/albion/events?player=${encodeURIComponent(name)}&limit=${LIMIT}&offset=${offset}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Jogador não encontrado (ou sem eventos recentes).');
          throw new Error('Falha ao carregar eventos.');
        }
        const data = await res.json();
        setEvents(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [name, offset]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-5xl mx-auto">
        <PlayerHeader name={name} />

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {loading && events.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
          </div>
        ) : (
          <>
            {/* Always show Performance Summary if we have data */}
            {events.length > 0 && (
              <div className="mb-8">
                <PerformanceCard events={events} playerName={name} />
              </div>
            )}

            {/* Tabs Navigation */}
            {events.length > 0 && (
              <PlayerTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'events' && (
                <EventsTab 
                  events={events} 
                  currentPlayerName={name} 
                  loading={loading}
                  offset={offset}
                  setOffset={setOffset}
                  limit={LIMIT}
                />
              )}

              {activeTab === 'builds' && (
                <BuildsTab events={events} playerName={name} />
              )}

              {activeTab === 'zones' && (
                <ZonesTab events={events} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
