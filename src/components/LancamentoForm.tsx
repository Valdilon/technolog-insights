import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TODOS_GRUPOS, EMPRESAS } from '@/types/financial';
import type { Lancamento } from '@/types/financial';

const schema = z.object({
  dtPagto: z.string().min(1, 'Obrigatório'),
  historico: z.string().min(1, 'Obrigatório'),
  categoria: z.string().min(1, 'Obrigatório'),
  tipo: z.enum(['DESPESAS', 'RECEITAS']),
  cnpj: z.string(),
  empresa: z.string(),
  banco: z.string(),
  valor: z.coerce.number().positive('Deve ser positivo'),
  grupoGerencial: z.string().min(1, 'Obrigatório'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<Lancamento, 'id' | 'mesAno'>) => void;
  initial?: Lancamento | null;
}

export function LancamentoForm({ open, onClose, onSave, initial }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      dtPagto: initial.dtPagto,
      historico: initial.historico,
      categoria: initial.categoria,
      tipo: initial.tipo,
      cnpj: initial.cnpj,
      empresa: initial.empresa,
      banco: initial.banco,
      valor: initial.valor,
      grupoGerencial: initial.grupoGerencial,
    } : {
      dtPagto: '', historico: '', categoria: '', tipo: 'DESPESAS',
      cnpj: '', empresa: 'ADM', banco: '', valor: 0, grupoGerencial: 'DEMAIS_DESPESAS',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSave(values as Omit<Lancamento, 'id' | 'mesAno'>);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar' : 'Novo'} Lançamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="dtPagto" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="valor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="historico" render={({ field }) => (
              <FormItem>
                <FormLabel>Histórico</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="categoria" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="tipo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="DESPESAS">Despesas</SelectItem>
                      <SelectItem value="RECEITAS">Receitas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="grupoGerencial" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo Gerencial</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {TODOS_GRUPOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="empresa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {EMPRESAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="banco" render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="cnpj" render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">{initial ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
