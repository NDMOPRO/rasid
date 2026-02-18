import { useState, useEffect, useCallback } from 'react';

export type Skin = 'gold' | 'silver';

export function useSkin() {
  const [skin, setSkinState] = useState<Skin>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rasid-skin');
      if (stored === 'gold' || stored === 'silver') return stored;
      const attr = document.documentElement.getAttribute('data-skin');
      if (attr === 'gold' || attr === 'silver') return attr as Skin;
    }
    return 'gold';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    localStorage.setItem('rasid-skin', skin);
  }, [skin]);

  const setSkin = useCallback((newSkin: Skin) => {
    setSkinState(newSkin);
  }, []);

  const toggleSkin = useCallback(() => {
    setSkinState(prev => prev === 'gold' ? 'silver' : 'gold');
  }, []);

  return { skin, setSkin, toggleSkin };
}
