export interface Lancamento {
  id: string;
  mesAno: string;
  dtPagto: string;
  historico: string;
  categoria: string;
  tipo: 'DESPESAS' | 'RECEITAS';
  cnpj: string;
  empresa: string;
  banco: string;
  valor: number;
  grupoGerencial: string;
}

export const GRUPOS_DESPESA = [
  'PESSOAL', 'IMÓVEIS', 'TECNOLOGIA', 'SERVIÇOS_TERCEIROS',
  'FINANCEIRO', 'VIAGENS', 'IMPOSTOS', 'MATERIAIS', 'DEMAIS_DESPESAS',
] as const;

export const GRUPOS_RECEITA = [
  'RECEITA_EQUIPAMENTOS', 'RECEITA_ALUGUEIS', 'RECEITA_IMPLANTACAO',
  'RECEITA_DEVOLUCAO_ESTORNO', 'FINANCEIRO_RECEITA', 'OUTRAS_RECEITAS',
  'RESIDUAL_TECNICOS',
] as const;

export const TODOS_GRUPOS = [...GRUPOS_DESPESA, ...GRUPOS_RECEITA] as const;

export const EMPRESAS = ['UNYPNEUS', 'UNYPAY', 'TRUCK', 'ADM', 'OUTRA'] as const;

export type GrupoGerencial = typeof TODOS_GRUPOS[number];
