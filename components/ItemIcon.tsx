'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getItemImageUrl } from '@/utils/itemImage';
import { Loader2 } from 'lucide-react';

interface ItemIconProps {
  type: string | null | undefined;
  quality?: number;
  count?: number;
  alt?: string;
  size?: number;
  showCount?: boolean;
}

export default function ItemIcon({ 
  type, 
  quality = 1, 
  count = 1, 
  alt = 'Item', 
  size = 48,
  showCount = true 
}: ItemIconProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const url = getItemImageUrl(type, quality);

  if (!url || !type || error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-800 rounded border border-gray-700"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-600 font-bold">{alt[0]?.toUpperCase() || '-'}</span>
      </div>
    );
  }

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded animate-pulse z-0">
          <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
        </div>
      )}
      
      <Image
        src={url}
        alt={alt}
        width={size}
        height={size}
        className={`object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        unoptimized // Albion Render API handles optimization
      />

      {showCount && count > 1 && (
        <div className="absolute bottom-0 right-0 bg-black/70 text-[10px] px-1 text-white rounded-tl font-mono leading-tight z-10">
          {count}
        </div>
      )}
    </div>
  );
}
