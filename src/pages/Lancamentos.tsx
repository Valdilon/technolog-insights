import { useState, useMemo } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LancamentoForm } from '@/components/LancamentoForm';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Lancamento } from '@/types/financial';
import { Badge } from '@/components/ui/badge';

export default function Lancamentos() {
  const { data, addLancamento, updateLancamento, deleteLancamento } = useFinancial();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');
  const [mesFilter, setMesFilter] = useState<string>('TODOS');
  const [empresaFilter, setEmpresaFilter] = useState<string>('TODOS');
  const [grupoFilter, setGrupoFilter] = useState<string>('TODOS');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);

  const { meses, empresas, grupos } = useMemo(() => {
    const mSet = new Set<string>();
    const eSet = new Set<string>();
    const gSet = new Set<string>();
    for (const d of data) {
      if (d.mesAno) mSet.add(d.mesAno);
      if (d.empresa) eSet.add(d.empresa);
      if (d.grupoGerencial) gSet.add(d.grupoGerencial);
    }
    return {
      meses: Array.from(mSet).sort(),
      empresas: Array.from(eSet).sort(),
      grupos: Array.from(gSet).sort(),
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(item => {
      if (tipoFilter !== 'TODOS' && item.tipo !== tipoFilter) return false;
      if (mesFilter !== 'TODOS' && item.mesAno !== mesFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return item.historico.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          item.grupoGerencial.toLowerCase().includes(q) ||
          item.empresa.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data, search, tipoFilter, mesFilter]);

  const handleSave = (values: Omit<Lancamento, 'id' | 'mesAno'>) => {
    const mesAno = values.dtPagto ? values.dtPagto.substring(0, 7) : '';
    if (editing) {
      updateLancamento(editing.id, { ...values, mesAno });
      toast.success('Lançamento atualizado');
    } else {
      addLancamento({ ...values, mesAno });
      toast.success('Lançamento adicionado');
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    deleteLancamento(id);
    toast.success('Lançamento excluído');
  };

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-6 animate-fade-in">
        <div className="rounded-full bg-muted p-6">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Nenhum lançamento</h2>
          <p className="text-muted-foreground">Importe uma planilha ou adicione manualmente.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
        </Button>
        <LancamentoForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} initial={editing} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} de {data.length} registros</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="active:scale-[0.97] transition-transform">
          <Plus className="mr-2 h-4 w-4" /> Novo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="DESPESAS">Despesas</SelectItem>
            <SelectItem value="RECEITAS">Receitas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mesFilter} onValueChange={setMesFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos meses</SelectItem>
            {meses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead>Histórico</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-[90px]">Tipo</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="text-right w-[120px]">Valor</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 200).map(item => (
              <TableRow key={item.id} className="group">
                <TableCell className="font-mono text-xs tabular-nums">{item.dtPagto}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">{item.historico}</TableCell>
                <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{item.categoria}</TableCell>
                <TableCell>
                  <Badge variant={item.tipo === 'RECEITAS' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                    {item.tipo === 'RECEITAS' ? 'REC' : 'DESP'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{item.grupoGerencial.replace(/_/g, ' ')}</TableCell>
                <TableCell className="text-xs">{item.empresa}</TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums font-medium">
                  {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7 active:scale-95" onClick={() => { setEditing(item); setFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive active:scale-95" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length > 200 && (
          <div className="p-3 text-center text-sm text-muted-foreground border-t">
            Mostrando 200 de {filtered.length} registros. Use os filtros para refinar.
          </div>
        )}
      </div>

      <LancamentoForm
        key={editing?.id || 'new'}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
