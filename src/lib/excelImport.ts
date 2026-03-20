import * as XLSX from 'xlsx';
import type { Lancamento } from '@/types/financial';

function classifyGrupo(categoria: string, historico: string, tipo: string): string {
  const cat = (categoria || '').toUpperCase();
  const hist = (historico || '').toUpperCase();

  if (tipo === 'RECEITAS') {
    if (cat.includes('MENSALIDADE') && (cat.includes('EQUIPAMENTO') || cat.includes('ALUGUEL DE EQUIP'))) return 'RECEITA_EQUIPAMENTOS';
    if (cat.includes('ALUGUEL') && cat.includes('IMOV') || cat.includes('ALUGUEIS IMOV') || cat.includes('ALUGUEL IMOV')) return 'RECEITA_ALUGUEIS';
    if (cat.includes('IMPLANTA')) return 'RECEITA_IMPLANTACAO';
    if (cat.includes('DEVOLUÇÃO') || cat.includes('DEVOLUCAO') || cat.includes('ESTORNO')) return 'RECEITA_DEVOLUCAO_ESTORNO';
    if (cat.includes('APLICAÇ') || cat.includes('APLICAC') || cat.includes('RENDIMENTO') || hist.includes('RENDIMENTO') || hist.includes('JUROS')) return 'FINANCEIRO_RECEITA';
    if (cat.includes('RESIDUAL') && cat.includes('TECNICO')) return 'RESIDUAL_TECNICOS';
    return 'OUTRAS_RECEITAS';
  }

  if (cat.includes('FOLHA') || cat.includes('FÉRIAS') || cat.includes('FERIAS') || cat.includes('RESCISÃO') || cat.includes('RESCISAO') ||
      cat.includes('FGTS') || cat.includes('INSS') || cat.includes('IRRF') || cat.includes('SINDICATO') ||
      cat.includes('VALE ALIMENTA') || cat.includes('VALE TRANSPORT') || cat.includes('EXAME') ||
      cat.includes('AUXILIAR DE LIMPEZA') || cat.includes('PLANO DE SAÚDE') || cat.includes('PLANO DE SAUDE') ||
      cat.includes('ENCARGO')) return 'PESSOAL';

  if (cat.includes('ALUGUEL TECHNOLOG') || cat.includes('CONDOMINIO') || cat.includes('DESPESAS IMOV') ||
      cat.includes('ENERGIA IMOV') || cat.includes('AGUA') || cat.includes('IPTU')) return 'IMÓVEIS';

  if (cat.includes('PACOTES PROGRAMA') || cat.includes('SOFTWARE') || cat.includes('LICEN') ||
      cat.includes('TELEFONE') || cat.includes('TELEFONIA') || cat.includes('INTERNET') ||
      cat.includes('TECHNOBANK') || hist.includes('CLOUD') || hist.includes('VIVO')) return 'TECNOLOGIA';

  if (cat.includes('SERVIÇOS PRESTADOS') || cat.includes('SERVICOS PRESTADOS') || cat.includes('CUSTAS PROCESS') ||
      cat.includes('CONSULTORIA') || cat.includes('HONORÁRIO') || cat.includes('HONORARIO') || cat.includes('COMISSÃO') || cat.includes('COMISSAO') ||
      cat.includes('SEGURANÇA') || cat.includes('SEGURANCA') || cat.includes('LAVANDERIA')) return 'SERVIÇOS_TERCEIROS';

  if (cat.includes('TARIFA') || cat.includes('EMPRESTIMO') || cat.includes('EMPRÉSTIMO') ||
      cat.includes('CONSORCIO') || cat.includes('CONSÓRCIO') || cat.includes('TRANSFERENCIA BANK') ||
      cat.includes('TRANSFERENCIA OURIBANK') || cat.includes('PAGAMENTO EMPRESTIMO THIAGO')) return 'FINANCEIRO';

  if (cat.includes('HOSPEDAGEM') || cat.includes('VIAGEM')) return 'VIAGENS';

  if (cat.includes('IMPOSTO') || cat.includes('DAS SIMPLES') || cat.includes('DAE') || cat.includes('ISS') ||
      cat.includes('IRPJ') || cat.includes('CSRF') || cat.includes('GUIAS RECEITA') || cat.includes('TRIBUTO')) return 'IMPOSTOS';

  if (cat.includes('MATERIAL') || cat.includes('COMPRA EQUIPAMENTO') || cat.includes('SONDA') || cat.includes('PEÇA')) return 'MATERIAIS';

  return 'DEMAIS_DESPESAS';
}

function extractEmpresa(cnpj: string): string {
  const text = (cnpj || '').toUpperCase();
  if (text.includes('UNYPNEUS')) return 'UNYPNEUS';
  if (text.includes('UNYPAY')) return 'UNYPAY';
  if (text.includes('TRUCK')) return 'TRUCK';
  if (text.includes('ADM')) return 'ADM';
  return 'OUTRA';
}

function formatDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  return String(val);
}

export function parseExcelFile(file: File): Promise<Lancamento[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array', cellDates: true });
        const results: Lancamento[] = [];

        for (const sheetName of wb.SheetNames) {
          const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[sheetName], { defval: '' });
          for (const row of rows) {
            const dtPagto = formatDate(row['DT PAGTO'] || row['DT_PAGTO'] || row['DT PAGTO '] || '');
            const tipo = String(row['TIPO'] || '').toUpperCase().includes('RECEITA') ? 'RECEITAS' : 'DESPESAS';
            const categoria = String(row['CATEGORIA'] || '');
            const historico = String(row['HISTÓRICO'] || row['HISTORICO'] || '');
            const cnpj = String(row['CNPJ'] || '');
            const valor = Math.abs(parseFloat(row['VLR INDICE'] || row['VALOR'] || row['VLR_INDICE'] || 0)) || 0;
            const banco = String(row['BANCO'] || '');

            if (!dtPagto && !categoria && valor === 0) continue;

            const mesAno = dtPagto ? dtPagto.substring(0, 7) : '';

            results.push({
              id: crypto.randomUUID(),
              mesAno,
              dtPagto,
              historico,
              categoria,
              tipo,
              cnpj,
              empresa: extractEmpresa(cnpj),
              banco,
              valor,
              grupoGerencial: classifyGrupo(categoria, historico, tipo),
            });
          }
        }
        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
