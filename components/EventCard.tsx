import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event } from '@/types/albion';
import EquipmentGrid from './EquipmentGrid';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
  playerName: string;
}

export default function EventCard({ event, playerName }: EventCardProps) {
  const router = useRouter();
  const isKiller = event.Killer.Name.toLowerCase() === playerName.toLowerCase();
  const role = isKiller ? 'Killer' : 'Victim';
  const borderColor = isKiller ? 'border-green-600/50' : 'border-red-600/50';
  const bgColor = isKiller ? 'bg-green-900/10' : 'bg-red-900/10';
  const otherPlayerName = isKiller ? event.Victim.Name : event.Killer.Name;

  return (
    <div 
      className={`relative flex flex-col md:flex-row gap-4 p-4 rounded-lg border ${borderColor} ${bgColor} hover:bg-gray-800 transition-colors`}
    >
      {/* Time & Fame */}
      <div className="flex flex-col justify-center min-w-[100px] text-sm text-gray-400">
        <span>{formatDistanceToNow(new Date(event.TimeStamp), { addSuffix: true, locale: ptBR })}</span>
        <span className="text-yellow-500 font-mono font-bold">
          {event.TotalVictimKillFame.toLocaleString()} Fame
        </span>
        <span className={`font-bold uppercase text-xs mt-1 ${isKiller ? 'text-green-400' : 'text-red-400'}`}>
          {role}
        </span>
      </div>

      {/* Players */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Killer */}
        <div className="flex flex-col items-center md:items-start flex-1 w-full md:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">Killer</span>
            <Link href={`/player/${event.Killer.Name}`} className="font-bold text-white hover:text-blue-400 truncate max-w-[150px] md:max-w-none">
              {event.Killer.Name}
            </Link>
            <span className="text-xs text-gray-500 whitespace-nowrap">({event.Killer.AverageItemPower.toFixed(0)} IP)</span>
          </div>
          {/* Responsive container for EquipmentGrid to allow scaling on small screens if needed */}
          <div className="transform scale-75 sm:scale-90 md:scale-100 origin-top md:origin-top-left transition-transform">
            <EquipmentGrid equipment={event.Killer.Equipment} size={96} />
          </div>
        </div>

        {/* VS Badge */}
        <div className="text-gray-600 font-bold text-xl px-2 my-2 md:my-0">VS</div>

        {/* Victim */}
        <div className="flex flex-col items-center md:items-end flex-1 w-full md:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">({event.Victim.AverageItemPower.toFixed(0)} IP)</span>
            <Link href={`/player/${event.Victim.Name}`} className="font-bold text-white hover:text-blue-400 truncate max-w-[150px] md:max-w-none text-right">
              {event.Victim.Name}
            </Link>
            <span className="text-sm text-gray-500">Victim</span>
          </div>
          <div className="transform scale-75 sm:scale-90 md:scale-100 origin-top md:origin-top-right transition-transform">
            <EquipmentGrid equipment={event.Victim.Equipment} size={96} />
          </div>
        </div>
      </div>

      {/* Link to Details */}
      <div className="absolute top-2 right-2 z-20 md:static md:flex md:items-center">
         <button 
          onClick={() =>
            router.push(
              `/event/${event.EventId}?player=${encodeURIComponent(playerName)}&otherPlayer=${encodeURIComponent(otherPlayerName)}`
            )
          }
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
        >
          Detalhes
        </button>
      </div>
    </div>
  );
}
