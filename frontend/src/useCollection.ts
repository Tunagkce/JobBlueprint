import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

/**
 * Loads a career-profile list (experience, skills, …) and keeps it in sync after changes.
 * The list is re-read after each save so the server's ordering (e.g. newest role first) applies.
 */
export function useCollection<T extends { id: number }>(path: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [loadError, setLoadError] = useState('');

  const reload = useCallback(async () => {
    try {
      setItems(await api.get<T[]>(path));
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load this section.');
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    items,
    loadError,
    reload,
    async create(body: unknown) {
      await api.post<T>(path, body);
      await reload();
    },
    async update(id: number, body: unknown) {
      await api.put<T>(`${path}/${id}`, body);
      await reload();
    },
    async remove(id: number) {
      await api.delete(`${path}/${id}`);
      setItems((current) => current?.filter((item) => item.id !== id) ?? null);
    },
  };
}
