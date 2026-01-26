import SearchForm from '@/components/SearchForm';
import TrendingPvP from '@/components/TrendingPvP';
import { Sword, Map, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-white py-16">
      <div className="flex flex-col items-center gap-6 text-center w-full max-w-4xl">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Albion Tracker
          </h1>
          <p className="max-w-xl text-lg text-gray-400">
            Veja kills, deaths, builds, zonas e performance PvP de qualquer jogador.
          </p>
        </div>
        
        {/* Search Block */}
        <div className="w-full max-w-lg relative z-20">
           <SearchForm />
        </div>

        {/* Product Shortcuts (Cards) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* PvP Card */}
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-col justify-between hover:border-blue-500/50 transition-colors group h-full">
                <div>
                    <div className="bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                        <Sword size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">PvP Tracker</h3>
                    <p className="text-gray-400 text-sm">Feed global de abates e análise detalhada de combates em tempo real.</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <span className="text-blue-400 font-medium flex items-center gap-2">
                        Explorar agora <ArrowRight size={16} />
                    </span>
                </div>
            </div>

            {/* Map Card */}
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl flex flex-col justify-between opacity-75 h-full relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-gray-700 text-xs px-2 py-1 rounded text-gray-300 font-medium">Em breve</div>
                <div>
                    <div className="bg-gray-700/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-gray-500">
                        <Map size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-300">World Map</h3>
                    <p className="text-gray-500 text-sm">Zonas de calor, rotas de gank e controle territorial de guildas.</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700/30">
                    <span className="text-gray-600 font-medium flex items-center gap-2 cursor-not-allowed">
                        Aguarde
                    </span>
                </div>
            </div>

            {/* Market Card */}
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl flex flex-col justify-between opacity-75 h-full relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-gray-700 text-xs px-2 py-1 rounded text-gray-300 font-medium">Em breve</div>
                <div>
                    <div className="bg-gray-700/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-gray-500">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-300">Market Data</h3>
                    <p className="text-gray-500 text-sm">Histórico de preços, flip de itens e análise econômica.</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700/30">
                    <span className="text-gray-600 font-medium flex items-center gap-2 cursor-not-allowed">
                        Aguarde
                    </span>
                </div>
            </div>
        </div>
        
        {/* Trending PvP */}
        <TrendingPvP />

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-800 w-full text-center">
            <p className="text-gray-600 text-sm">
                Dados fornecidos pela API pública do Albion Online. Não afiliado à Sandbox Interactive GmbH.
            </p>
        </footer>

      </div>
    </div>
  );
}
