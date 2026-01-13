import { Event } from '@/types/albion';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  currentPlayerName: string;
}

export default function EventList({ events, currentPlayerName }: EventListProps) {
  if (events.length === 0) {
    return <div className="text-center text-gray-500 py-10">Nenhum evento encontrado.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event.EventId} event={event} playerName={currentPlayerName} />
      ))}
    </div>
  );
}
