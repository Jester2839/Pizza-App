// =========================================
// HOOK PRO NAČÍTÁNÍ PIZZA OPTIONS Z API
// =========================================

import { useState, useEffect } from 'react';
import { fetchPizzaOptions } from '../services/api';
import type { Dough, Base, Edge } from '../data/pizzaOptions';

interface UsePizzaOptionsResult {
  doughs: Dough[];
  bases: Base[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePizzaOptions(): UsePizzaOptionsResult {
  const [doughs, setDoughs] = useState<Dough[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPizzaOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPizzaOptions();
      setDoughs(data.doughs);
      setBases(data.bases);
      setEdges(data.edges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pizza options');
      console.error('Error loading pizza options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPizzaOptions();
  }, []);

  return {
    doughs,
    bases,
    edges,
    loading,
    error,
    refetch: loadPizzaOptions,
  };
}

// ==========================================
// POMOCNÉ FUNKCE
// ==========================================

export function getDefaultDough(doughs: Dough[]): Dough | undefined {
  return doughs.find((d) => d.id === 'classic');
}

export function getDefaultBase(bases: Base[]): Base | undefined {
  return bases.find((b) => b.id === 'tomato');
}

export function getDefaultEdge(edges: Edge[]): Edge | undefined {
  return edges.find((e) => e.id === 'classic');
}

export function getEdgeById(edges: Edge[], id: string): Edge | undefined {
  return edges.find((e) => e.id === id);
}