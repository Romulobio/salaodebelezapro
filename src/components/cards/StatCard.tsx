import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  variant?: 'default' | 'purple' | 'green' | 'pink';
}

export const StatCard = ({ title, value, icon: Icon, trend, delay = 0, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/30',
    purple: 'from-neon-purple/20 to-neon-purple/5 border-neon-purple/30',
    green: 'from-neon-green/20 to-neon-green/5 border-neon-green/30',
    pink: 'from-neon-pink/20 to-neon-pink/5 border-neon-pink/30',
  };

  const iconStyles = {
    default: 'text-neon-cyan shadow-neon',
    purple: 'text-neon-purple shadow-neon-purple',
    green: 'text-neon-green shadow-[0_0_20px_hsl(150_100%_50%_/_0.4)]',
    pink: 'text-neon-pink shadow-[0_0_20px_hsl(320_100%_60%_/_0.4)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "neon-card-hover bg-gradient-to-br",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold neon-text">{value}</h3>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trend.isPositive ? "text-neon-green" : "text-destructive"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-muted-foreground ml-1">vs mês anterior</span>
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-background/50",
          iconStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};
