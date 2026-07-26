import { useCallback, useEffect, useState } from 'react';
import type { CrudRepository } from '../services/repositories/repositoryContracts';

export function useAsyncCollection<T extends { id: string }>(repository: CrudRepository<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await repository.findAll();
    setItems(data);
    setLoading(false);
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = async (entity: T) => {
    await repository.create(entity);
    await reload();
  };

  const update = async (entity: T) => {
    await repository.update(entity);
    await reload();
  };

  const remove = async (id: string) => {
    await repository.remove(id);
    await reload();
  };

  return { items, loading, reload, create, update, remove };
}
