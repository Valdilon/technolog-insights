import { BarChart3, Table2, Upload, Trash2 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { useFinancial } from '@/contexts/FinancialContext';
import { useRef } from 'react';
import { parseExcelFile } from '@/lib/excelImport';
import { toast } from 'sonner';

const navItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Lançamentos', url: '/lancamentos', icon: Table2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { importData, setData, data } = useFinancial();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile(file);
      importData(rows);
      toast.success(`${rows.length} lançamentos importados`);
    } catch {
      toast.error('Erro ao importar arquivo');
    }
    e.target.value = '';
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            {!collapsed && 'Technolog'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/60"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            {!collapsed && 'Ações'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => fileRef.current?.click()} className="cursor-pointer hover:bg-sidebar-accent/60">
                  <Upload className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Importar Excel</span>}
                </SidebarMenuButton>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              </SidebarMenuItem>
              {data.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => { setData([]); toast.info('Dados limpos'); }}
                    className="cursor-pointer hover:bg-sidebar-accent/60 text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Limpar dados</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
