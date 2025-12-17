import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: ReactNode;
  type: 'manager' | 'admin';
  barbeariaSlug?: string;
}

export const DashboardLayout = ({ children, type, barbeariaSlug }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile, visible on medium+ screens */}
      <div className="hidden md:flex">
        <Sidebar type={type} barbeariaSlug={barbeariaSlug} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header - Visible only on mobile */}
        <header className="md:hidden border-b border-border p-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold neon-text">BarberPro</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-border w-72 bg-sidebar">
              <Sidebar
                type={type}
                barbeariaSlug={barbeariaSlug}
                onLinkClick={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-0 flex flex-col">
          <div className="flex-1">
            {children}
          </div>

          {/* Footer */}
          <footer className="py-8 px-6 border-t border-border/50 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-neon-cyan" />
                <span className="font-display text-lg">BarberPro</span>
              </div>
              <p className="text-muted-foreground text-sm">
                © 2024 BarberPro. Sistema de Gestão de Barbearias.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
```
