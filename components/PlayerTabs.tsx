import { Dispatch, SetStateAction } from 'react';

interface PlayerTabsProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<'events' | 'builds' | 'zones'>>;
}

export default function PlayerTabs({ activeTab, setActiveTab }: PlayerTabsProps) {
  const tabs = [
    { id: 'events', label: 'Eventos' },
    { id: 'builds', label: 'Builds' },
    { id: 'zones', label: 'Zonas' },
  ] as const;

  return (
    <div className="flex border-b border-gray-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
