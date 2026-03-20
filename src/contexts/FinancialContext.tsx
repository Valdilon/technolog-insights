import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Lancamento } from '@/types/financial';

interface FinancialContextType {
  data: Lancamento[];
  setData: (data: Lancamento[]) => void;
  addLancamento: (l: Omit<Lancamento, 'id'>) => void;
  updateLancamento: (id: string, l: Partial<Lancamento>) => void;
  deleteLancamento: (id: string) => void;
  importData: (rows: Lancamento[]) => void;
  loading: boolean;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Lancamento[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('technolog_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
        setLoading(false);
        return;
      } catch {}
    }
    // Auto-load seed data
    fetch('/seed-data.json')
      .then(r => r.ok ? r.json() : [])
      .then((rows: Lancamento[]) => {
        if (rows.length) {
          setData(rows);
          localStorage.setItem('technolog_data', JSON.stringify(rows));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((newData: Lancamento[]) => {
    setData(newData);
    localStorage.setItem('technolog_data', JSON.stringify(newData));
  }, []);

  const addLancamento = useCallback((l: Omit<Lancamento, 'id'>) => {
    const newItem: Lancamento = { ...l, id: crypto.randomUUID() };
    persist([...data, newItem]);
  }, [data, persist]);

  const updateLancamento = useCallback((id: string, updates: Partial<Lancamento>) => {
    persist(data.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [data, persist]);

  const deleteLancamento = useCallback((id: string) => {
    persist(data.filter(item => item.id !== id));
  }, [data, persist]);

  const importData = useCallback((rows: Lancamento[]) => {
    persist([...data, ...rows]);
  }, [data, persist]);

  return (
    <FinancialContext.Provider value={{ data, setData, addLancamento, updateLancamento, deleteLancamento, importData, loading }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
