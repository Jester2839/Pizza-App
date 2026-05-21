// =========================================
// HOOK PRO NAČÍTÁNÍ PIZZ Z API
// =========================================

import { useState, useEffect } from 'react';
import { fetchPizzas } from '../services/api';
import type { Pizza } from '../types';

interface UsePizzasResult {
  pizzas: Pizza[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePizzas(): UsePizzasResult {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPizzas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPizzas();
      setPizzas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pizzas');
      console.error('Error loading pizzas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPizzas();
  }, []);

  // Přidáme refetch funkci, pokud se data změní
  useEffect(() => {
    if (!loading && !error && pizzas.length === 0) {
      // Pokud se nenačetly pizzy a není chyba, zkusíme znovu
      loadPizzas();
    }
  }, [pizzas, loading, error]);

  return {
    pizzas,
    loading,
    error,
    refetch: loadPizzas,
  };
}