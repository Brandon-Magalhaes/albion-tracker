import { Event } from '@/types/albion';
import { MapPin } from 'lucide-react';

interface ZonesCardProps {
  events: Event[];
}

export default function ZonesCard({ events }: ZonesCardProps) {
  // Check if ANY event has Location or KillArea
  const hasLocationData = events.some(e => e.Location || e.KillArea);

  if (!hasLocationData) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center py-10">
        <MapPin className="mx-auto text-gray-600 mb-3" size={32} />
        <p className="text-gray-400">A API não retornou Location nem KillArea para estes eventos.</p>
        <p className="text-sm text-gray-600 mt-1">Não é possível calcular zonas no momento.</p>
      </div>
    );
  }

  const zoneCounts: Record<string, number> = {};

  events.forEach(e => {
    // Prefer Location, fallback to KillArea
    const zone = e.Location || e.KillArea;
    if (zone) {
      // Sometimes KillArea might be "OPEN_WORLD" or similar generic names, but it's better than nothing.
      // We can format it if needed, but for now raw string is fine.
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    }
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
