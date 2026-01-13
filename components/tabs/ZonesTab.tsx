import { Event } from '@/types/albion';
import ZonesCard from '@/components/ZonesCard';

interface ZonesTabProps {
  events: Event[];
}

export default function ZonesTab({ events }: ZonesTabProps) {
  return (
    <div className="w-full">
      <ZonesCard events={events} />
    </div>
  );
}
