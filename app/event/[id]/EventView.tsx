'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Event } from '@/types/albion';
import EquipmentGrid from '@/components/EquipmentGrid';
import { Loader2, ArrowLeft, Swords, Skull } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EventView({ id }: { id: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('player');
  const otherPlayer = searchParams.get('otherPlayer');
  const fallbackPlayer = searchParams.get('fallbackPlayer');
  const fallbackKiller = searchParams.get('fallbackKiller');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        let url = `/api/albion/event/${id}`;
        const query = new URLSearchParams();
        if (playerName) {
          query.set('player', playerName);
          if (otherPlayer) query.set('otherPlayer', otherPlayer);
        } else {
          if (fallbackPlayer) query.set('player', fallbackPlayer);
          if (fallbackKiller) query.set('otherPlayer', fallbackKiller);
        }

        const queryString = query.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Evento não encontrado.');
        const data = await res.json();
        setEvent(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, playerName, otherPlayer, fallbackPlayer, fallbackKiller]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-white"><Loader2 className="animate-spin" /></div>;
  if (error || !event) return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">{error || 'Erro desconhecido'}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            {playerName ? (
                <Link href={`/player/${playerName}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={20} /> Voltar para {playerName}
                </Link>
            ) : (
                <button 
                  onClick={() => router.back()} 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={20} /> Voltar
                </button>
            )}
        </div>

        {/* Header */}
        <div className="bg-gray-800 rounded-t-xl p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Swords className="text-red-500" /> Batalha #{event.EventId}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {format(new Date(event.TimeStamp), 'dd/MM/yyyy HH:mm:ss')}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-yellow-500 font-bold">{event.TotalVictimKillFame.toLocaleString()} Fame</span>
              <span className="text-xs text-gray-500">{event.KillArea}</span>
            </div>
          </div>
        </div>

        {/* Main Confrontation */}
        <div className="bg-gray-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Killer */}
          <div className="flex flex-col items-center border border-green-900/50 bg-green-900/10 rounded-xl p-4">
            <h2 className="text-green-400 font-bold text-xl mb-1 flex items-center gap-2">
              <Swords size={20} /> Killer
            </h2>
            <Link href={`/player/${event.Killer.Name}`} className="text-2xl font-bold hover:underline mb-1">
              {event.Killer.Name}
            </Link>
            <span className="text-gray-400 text-sm mb-4">{event.Killer.GuildName}</span>
            <div className="text-sm font-mono text-green-300 mb-4">IP: {event.Killer.AverageItemPower.toFixed(0)}</div>
            <EquipmentGrid equipment={event.Killer.Equipment} />
          </div>

          {/* Victim */}
          <div className="flex flex-col items-center border border-red-900/50 bg-red-900/10 rounded-xl p-4">
            <h2 className="text-red-400 font-bold text-xl mb-1 flex items-center gap-2">
              <Skull size={20} /> Victim
            </h2>
            <Link href={`/player/${event.Victim.Name}`} className="text-2xl font-bold hover:underline mb-1">
              {event.Victim.Name}
            </Link>
            <span className="text-gray-400 text-sm mb-4">{event.Victim.GuildName}</span>
            <div className="text-sm font-mono text-red-300 mb-4">IP: {event.Victim.AverageItemPower.toFixed(0)}</div>
            <EquipmentGrid equipment={event.Victim.Equipment} />
          </div>
        </div>

        {/* Participants / Group Members */}
        <div className="bg-gray-800 rounded-b-xl p-6 border-t border-gray-700">
           <h3 className="font-bold text-lg mb-4">Participantes ({event.Participants.length})</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
             {event.Participants.map(p => (
               <div key={p.Id} className="bg-gray-900 p-3 rounded flex flex-col text-sm">
                 <Link href={`/player/${p.Name}`} className="font-bold hover:text-blue-400 truncate">
                   {p.Name}
                 </Link>
                 <span className="text-gray-500 text-xs truncate">{p.GuildName || '-'}</span>
                 <div className="flex justify-between mt-2 text-xs">
                   <span className="text-red-400">Dmg: {p.DamageDone.toFixed(0)}</span>
                   <span className="text-green-400">Heal: {p.SupportHealingDone.toFixed(0)}</span>
                 </div>
               </div>
             ))}
             {event.Participants.length === 0 && <span className="text-gray-500">Sem participantes adicionais.</span>}
           </div>
        </div>

      </div>
    </div>
  );
}
