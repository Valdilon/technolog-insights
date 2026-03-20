import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Lancamento } from '@/types/financial';

interface FinancialContextType {
  data: Lancamento[];
  setData: (data: Lancamento[]) => void;
  addLancamento: (l: Omit<Lancamento, 'id'>) => void;
  updateLancamento: (id: string, l: Partial<Lancamento>) => void;
  deleteLancamento: (id: string) => void;
  importData: (rows: Lancamento[]) => void;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Lancamento[]>(() => {
    try {
      const saved = localStorage.getItem('technolog_data');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

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
    <FinancialContext.Provider value={{ data, setData, addLancamento, updateLancamento, deleteLancamento, importData }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
