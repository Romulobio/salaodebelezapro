import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ExternalLink, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Barbearia } from '@/types/barbershop';
import { cn } from '@/lib/utils';

interface BarbeariaCardProps {
  barbearia: Barbearia;
  index: number;
}

const planoBadges = {
  basico: { label: 'Básico', className: 'bg-muted text-muted-foreground' },
  profissional: { label: 'Pro', className: 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30' },
  premium: { label: 'Premium', className: 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/30' },
};

export const BarbeariaCard = ({ barbearia, index }: BarbeariaCardProps) => {
  const plano = planoBadges[barbearia.planoTipo];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="neon-card-hover group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground group-hover:neon-text transition-all">
            {barbearia.nome}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Proprietário: {barbearia.proprietarioNome}
          </p>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1", plano.className)}>
          {barbearia.planoTipo === 'premium' && <Crown className="w-3 h-3" />}
          {plano.label}
        </span>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        {barbearia.endereco && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neon-cyan" />
            <span>{barbearia.endereco}</span>
          </div>
        )}
        {barbearia.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-neon-cyan" />
            <span>{barbearia.telefone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-2xl font-display font-bold neon-text">
          R$ {barbearia.planoValor.toFixed(2)}
          <span className="text-xs text-muted-foreground font-normal">/mês</span>
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/agendar/${barbearia.slug}`}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Ver Página
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={`/admin/${barbearia.slug}`}>
              Painel Admin
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
