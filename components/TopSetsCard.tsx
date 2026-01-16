import { Event } from '@/types/albion';
import ItemIcon from './ItemIcon';

interface TopSetsCardProps {
  events: Event[];
  playerName: string;
}

export default function TopSetsCard({ events, playerName }: TopSetsCardProps) {
  const nameLower = playerName.toLowerCase();
  const setCounts: Record<string, { count: number; items: (string | null)[] }> = {};

  events.forEach(e => {
    const isKiller = e.Killer.Name.toLowerCase() === nameLower;
    const playerObj = isKiller ? e.Killer : e.Victim;
    const eq = playerObj.Equipment;
    
    // Key based on Head, Armor, Shoes
    const items = [eq.Head?.Type ?? null, eq.Armor?.Type ?? null, eq.Shoes?.Type ?? null];
    const key = items.join('|');
    
    // Skip empty sets
    if (items.every(i => i === null)) return;
    
    if (!setCounts[key]) {
      setCounts[key] = { count: 0, items };
    }
    setCounts[key].count++;
  });

  const topSets = Object.values(setCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full">
      <h3 className="text-lg font-bold text-white mb-4">Top 5 Sets (Head/Armor/Shoes)</h3>
      <div className="space-y-3">
        {topSets.map((set, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="flex gap-2">
              {set.items.map((itemType, i) => (
                <div key={i} className="relative h-16 w-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
                  <ItemIcon type={itemType} size={64} alt={itemType || 'Empty'} showCount={false} />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-green-500">{set.count}</span>
              <span className="text-xs text-gray-500">batalhas</span>
            </div>
          </div>
        ))}
        {topSets.length === 0 && <p className="text-gray-500">Nenhum set registrado.</p>}
      </div>
    </div>
  );
}
