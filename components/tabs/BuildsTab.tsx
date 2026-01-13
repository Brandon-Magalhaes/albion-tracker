import { Event } from '@/types/albion';
import TopWeaponsCard from '@/components/TopWeaponsCard';
import TopSetsCard from '@/components/TopSetsCard';

interface BuildsTabProps {
  events: Event[];
  playerName: string;
}

export default function BuildsTab({ events, playerName }: BuildsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TopWeaponsCard events={events} playerName={playerName} />
      <TopSetsCard events={events} playerName={playerName} />
    </div>
  );
}
