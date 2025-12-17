import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Scissors,
  Users,
  Calendar,
  Settings,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  QrCode,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useBarbeariaBySlug } from '@/hooks/useBarbearia';

interface SidebarProps {
  type: 'manager' | 'admin';
  barbeariaSlug?: string;
  className?: string;
  onLinkClick?: () => void;
}

export const Sidebar = ({ type, barbeariaSlug, className, onLinkClick }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Fetch barbearia name if in admin mode
  const { data: barbearia } = useBarbeariaBySlug(type === 'admin' ? barbeariaSlug : undefined);
  const displayName = type === 'manager' ? 'Gerenciador' : (barbearia?.nome || 'BarberPro');

  // Se tiver onLinkClick, assumimos que é mobile, então nunca colapsa
  const isMobile = !!onLinkClick;

  const managerLinks = [
    { href: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/manager/barbearias', icon: Store, label: 'Barbearias' },
    { href: '/manager/financeiro', icon: DollarSign, label: 'Financeiro' },
    { href: '/manager/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const adminLinks = [
    { href: `/admin/${barbeariaSlug}`, icon: LayoutDashboard, label: 'Dashboard' },
    { href: `/admin/${barbeariaSlug}/servicos`, icon: Scissors, label: 'Serviços' },
    { href: `/admin/${barbeariaSlug}/barbeiros`, icon: Users, label: 'Barbeiros' },
    { href: `/admin/${barbeariaSlug}/agenda`, icon: Calendar, label: 'Agenda' },
    { href: `/admin/${barbeariaSlug}/horarios`, icon: Clock, label: 'Horários' },
    { href: `/admin/${barbeariaSlug}/financeiro`, icon: DollarSign, label: 'Financeiro' },
    { href: `/admin/${barbeariaSlug}/clientes`, icon: Users, label: 'Clientes' },
    { href: `/admin/${barbeariaSlug}/pix`, icon: QrCode, label: 'Configurar PIX' },
    { href: `/admin/${barbeariaSlug}/configuracoes`, icon: Settings, label: 'Configurações' },
  ];

  const links = type === 'manager' ? managerLinks : adminLinks;

  return (
    <motion.aside
      initial={isMobile ? { opacity: 1, x: 0 } : { x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        isMobile ? "h-full w-full border-none" : "h-screen",
        !isMobile && (collapsed ? "w-20" : "w-64"),
        className
      )}
    >
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3" onClick={onLinkClick}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon">
            <Scissors className="w-5 h-5 text-background" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-lg neon-text truncate max-w-[160px]"
              title={displayName}
            >
              {displayName}
            </motion.span>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link, index) => {
          const isActive = location.pathname === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={link.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-neon"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                {(!collapsed || isMobile) && <span className="font-medium">{link.label}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-all"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span>Recolher</span>}
          </button>
        )}

        <Link
          to="/auth/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {(!collapsed || isMobile) && <span>Sair</span>}
        </Link>
      </div>
    </motion.aside>
  );
};
