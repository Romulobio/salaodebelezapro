import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  type: 'manager' | 'admin';
  barbeariaSlug?: string;
}

export const DashboardLayout = ({ children, type, barbeariaSlug }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar type={type} barbeariaSlug={barbeariaSlug} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
