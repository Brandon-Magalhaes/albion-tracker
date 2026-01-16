import { Event } from '@/types/albion';
import ItemIcon from './ItemIcon';

interface TopWeaponsCardProps {
  events: Event[];
  playerName: string;
}

export default function TopWeaponsCard({ events, playerName }: TopWeaponsCardProps) {
  const nameLower = playerName.toLowerCase();
  const weaponCounts: Record<string, number> = {};

  events.forEach(e => {
    const isKiller = e.Killer.Name.toLowerCase() === nameLower;
    // Ensure we are looking at the correct player's equipment
    const playerObj = isKiller ? e.Killer : e.Victim;
    const weapon = playerObj.Equipment.MainHand?.Type;
    if (weapon) {
      weaponCounts[weapon] = (weaponCounts[weapon] || 0) + 1;
    }
  });

  const topWeapons = Object.entries(weaponCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full">
      <h3 className="text-lg font-bold text-white mb-4">Top 5 Armas</h3>
      <div className="space-y-3">
        {topWeapons.map(([type, count]) => (
          <div key={type} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 bg-gray-800 rounded flex items-center justify-center">
                 <ItemIcon type={type} size={80} alt={type} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-white text-sm">{type.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-500">Usado em {count} batalhas</span>
              </div>
            </div>
            <div className="text-xl font-bold text-blue-500">{count}</div>
          </div>
        ))}
        {topWeapons.length === 0 && <p className="text-gray-500">Nenhuma arma registrada.</p>}
      </div>
    </div>
  );
}
