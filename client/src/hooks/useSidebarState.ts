import { useState, useCallback } from 'react';

const STORAGE_KEY = 'rasid-sidebar-groups';

export function useSidebarState(groupIds: string[]) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // All collapsed by default
    const initial: Record<string, boolean> = {};
    groupIds.forEach(id => { initial[id] = false; });
    return initial;
  });

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups(prev => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { openGroups, toggleGroup };
}
