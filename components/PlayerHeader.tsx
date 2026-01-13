import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PlayerHeaderProps {
  name: string;
}

export default function PlayerHeader({ name }: PlayerHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
        <ArrowLeft className="text-gray-400 hover:text-white" />
      </Link>
      <h1 className="text-3xl font-bold text-white">{name}</h1>
    </div>
  );
}
