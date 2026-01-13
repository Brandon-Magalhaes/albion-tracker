import { Event } from '@/types/albion';
import { MapPin } from 'lucide-react';

interface ZonesCardProps {
  events: Event[];
}

export default function ZonesCard({ events }: ZonesCardProps) {
  const zoneCounts: Record<string, number> = {};

  events.forEach(e => {
    // Some events might not have location or it might be null
    // The type says optional, but API sometimes returns empty string or null
    const loc = e.Location || 'Desconhecido';
    zoneCounts[loc] = (zoneCounts[loc] || 0) + 1;
  });

  const topZones = Object.entries(zoneCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Top Zonas de Combate</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topZones.map(([zone, count]) => (
          <div key={zone} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <MapPin className="text-gray-500" size={18} />
              <span className="font-medium text-white">{zone}</span>
            </div>
            <span className="font-bold text-blue-400">{count}</span>
          </div>
        ))}
        {topZones.length === 0 && <p className="text-gray-500">Nenhuma zona registrada.</p>}
      </div>
    </div>
  );
}
