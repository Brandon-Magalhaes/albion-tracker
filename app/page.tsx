import SearchForm from '@/components/SearchForm';
import { Sword } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <Sword className="h-12 w-12 text-blue-500" />
          <h1 className="text-4xl font-bold tracking-tight">Albion Tracker</h1>
        </div>
        <p className="max-w-md text-gray-400">
          Busque por um jogador para ver suas últimas kills, deaths e estatísticas de PvP.
        </p>
        
        <SearchForm />
        
        <div className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-blue-400">Rápido</h3>
            <p className="text-sm text-gray-400">Busca otimizada com cache para resultados instantâneos.</p>
          </div>
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-green-400">Detalhado</h3>
            <p className="text-sm text-gray-400">Visualize equipamentos, IP médio e detalhes de cada batalha.</p>
          </div>
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-red-400">Estatísticas</h3>
            <p className="text-sm text-gray-400">Análise de K/D e armas mais utilizadas nas últimas lutas.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
