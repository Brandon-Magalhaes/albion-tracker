import { Event } from '@/types/albion';
import { Crosshair, Skull, Shield, Activity } from 'lucide-react';

interface PerformanceCardProps {
  events: Event[];
  playerName: string;
}

export default function PerformanceCard({ events, playerName }: PerformanceCardProps) {
  const nameLower = playerName.toLowerCase();
  
  let kills = 0;
  let deaths = 0;
  let assists = 0;

  events.forEach(e => {
    if (e.Killer.Name.toLowerCase() === nameLower) {
      kills++;
    } else if (e.Victim.Name.toLowerCase() === nameLower) {
      deaths++;
    } else if (e.Participants && e.Participants.some(p => p.Name.toLowerCase() === nameLower)) {
      assists++;
    }
  });
  
  const kdRatio = deaths === 0 ? kills : (kills / deaths).toFixed(2);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col justify-center h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-wider">
        <Activity size={16} className="text-blue-500" />
        <span>Performance (Últimos {kills + deaths})</span>
      </div>

      <div className="flex items-center justify-between">
        {/* K/D Big Number */}
        <div className="flex flex-col">
          <span className="text-5xl font-bold text-white tracking-tighter">{kdRatio}</span>
          <span className="text-sm text-gray-500 font-medium">K/D Ratio</span>
        </div>

        {/* Stats Grid */}
        <div className="flex gap-6 text-right">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-green-400">{kills}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 uppercase">
              <Crosshair size={12} /> Kills
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-red-400">{deaths}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 uppercase">
              <Skull size={12} /> Deaths
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-yellow-400">{assists}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 uppercase">
              <Shield size={12} /> Assists
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
