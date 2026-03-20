import { useMemo } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COLORS = [
  'hsl(152, 44%, 38%)', 'hsl(28, 70%, 52%)', 'hsl(4, 72%, 52%)',
  'hsl(200, 50%, 45%)', 'hsl(280, 40%, 50%)', 'hsl(45, 70%, 50%)',
  'hsl(340, 50%, 50%)', 'hsl(170, 40%, 40%)', 'hsl(220, 50%, 55%)',
];

function fmt(v: number) {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

export default function Dashboard() {
  const { data } = useFinancial();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!data.length) return null;

    const byMonth: Record<string, { receitas: number; despesas: number }> = {};
    const despByGrupo: Record<string, number> = {};
    const recByGrupo: Record<string, number> = {};
    const pessoalByMonth: Record<string, number> = {};
    const financeiroByMonth: Record<string, number> = {};

    for (const item of data) {
      const m = item.mesAno || 'SEM_DATA';
      if (!byMonth[m]) byMonth[m] = { receitas: 0, despesas: 0 };

      if (item.tipo === 'RECEITAS') {
        byMonth[m].receitas += item.valor;
        recByGrupo[item.grupoGerencial] = (recByGrupo[item.grupoGerencial] || 0) + item.valor;
      } else {
        byMonth[m].despesas += item.valor;
        despByGrupo[item.grupoGerencial] = (despByGrupo[item.grupoGerencial] || 0) + item.valor;
        if (item.grupoGerencial === 'PESSOAL') pessoalByMonth[m] = (pessoalByMonth[m] || 0) + item.valor;
        if (item.grupoGerencial === 'FINANCEIRO') financeiroByMonth[m] = (financeiroByMonth[m] || 0) + item.valor;
      }
    }

    const months = Object.keys(byMonth).sort();
    const monthlyData = months.map(m => ({
      mes: m,
      receitas: byMonth[m].receitas,
      despesas: byMonth[m].despesas,
      resultado: byMonth[m].receitas - byMonth[m].despesas,
    }));

    const totalReceitas = monthlyData.reduce((s, m) => s + m.receitas, 0);
    const totalDespesas = monthlyData.reduce((s, m) => s + m.despesas, 0);

    const despPie = Object.entries(despByGrupo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const recPie = Object.entries(recByGrupo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const pessoalData = months.map(m => ({ mes: m, valor: pessoalByMonth[m] || 0 }));
    const financeiroData = months.map(m => ({ mes: m, valor: financeiroByMonth[m] || 0 }));

    const pctPessoal = totalDespesas ? (despByGrupo['PESSOAL'] || 0) / totalDespesas * 100 : 0;
    const pctFinanceiro = totalDespesas ? (despByGrupo['FINANCEIRO'] || 0) / totalDespesas * 100 : 0;

    return { monthlyData, totalReceitas, totalDespesas, despPie, recPie, pessoalData, financeiroData, pctPessoal, pctFinanceiro };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-fade-in">
        <div className="rounded-full bg-muted p-6">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Nenhum dado importado</h2>
          <p className="text-muted-foreground max-w-md">
            Importe suas planilhas de gastos e receitas usando o botão "Importar Excel" na barra lateral.
          </p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const chartConfig = {
    receitas: { label: 'Receitas', color: 'hsl(152, 44%, 38%)' },
    despesas: { label: 'Despesas', color: 'hsl(4, 72%, 52%)' },
    resultado: { label: 'Resultado', color: 'hsl(28, 70%, 52%)' },
    valor: { label: 'Valor', color: 'hsl(152, 44%, 38%)' },
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Gerencial</h1>
        <p className="text-muted-foreground text-sm mt-1">{data.length} lançamentos · {stats.monthlyData.length} meses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5" /> Receitas
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: 'hsl(152, 44%, 38%)' }}>
              {fmt(stats.totalReceitas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <TrendingDown className="h-3.5 w-3.5" /> Despesas
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: 'hsl(4, 72%, 52%)' }}>
              {fmt(stats.totalDespesas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <DollarSign className="h-3.5 w-3.5" /> Resultado
            </div>
            <p className={`text-2xl font-bold mt-1 tabular-nums`} style={{ color: stats.totalReceitas - stats.totalDespesas >= 0 ? 'hsl(152, 44%, 38%)' : 'hsl(4, 72%, 52%)' }}>
              {fmt(stats.totalReceitas - stats.totalDespesas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <Percent className="h-3.5 w-3.5" /> Pessoal / Financeiro
            </div>
            <p className="text-lg font-bold mt-1 tabular-nums">
              {stats.pctPessoal.toFixed(1)}% / {stats.pctFinanceiro.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Evolution */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="mes" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => fmt(v)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="receitas" fill="hsl(152, 44%, 38%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" fill="hsl(4, 72%, 52%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Despesas Pie */}
        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mix de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={stats.despPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {stats.despPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Receitas Pie */}
        <Card className="animate-slide-up" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mix de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={stats.recPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {stats.recPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pessoal Line */}
        <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Curva de Pessoal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <LineChart data={stats.pessoalData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={v => fmt(v)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="valor" stroke="hsl(28, 70%, 52%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Financeiro Line */}
        <Card className="animate-slide-up" style={{ animationDelay: '450ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Peso do Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <LineChart data={stats.financeiroData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={v => fmt(v)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="valor" stroke="hsl(4, 72%, 52%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
