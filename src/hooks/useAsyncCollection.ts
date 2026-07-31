import { useCallback, useEffect, useState } from 'react';
import type { CrudRepository } from '../services/repositories/repositoryContracts';

export function useAsyncCollection<T extends { id: string }>(repository: CrudRepository<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.findAll();
      setItems(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const executeMutation = async (operation: () => Promise<unknown>) => {
    setError(null);
    try {
      await operation();
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar os dados.');
      throw cause;
    }
  };

  const create = async (entity: T) => {
    await executeMutation(() => repository.create(entity));
  };

  const update = async (entity: T) => {
    await executeMutation(() => repository.update(entity));
  };

  const remove = async (id: string) => {
    await executeMutation(() => repository.remove(id));
  };

  const clearError = () => setError(null);

  return {
    items,
    loading,
    error,
    reload,
    create,
    update,
    remove,
    mutate: executeMutation,
    clearError,
  };
}
