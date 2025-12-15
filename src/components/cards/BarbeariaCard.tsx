import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Crown, Copy, Check, Edit, Ban, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Barbearia, useUpdateBarbearia, useDeleteBarbearia } from '@/hooks/useBarbearia';

interface BarbeariaCardProps {
  barbearia: Barbearia;
  index: number;
  planos: any[];
}

const planoBadges = {
  basico: { label: 'Básico', className: 'bg-muted text-muted-foreground' },
  profissional: { label: 'Pro', className: 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30' },
  premium: { label: 'Premium', className: 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/30' },
};

const planoValores = {
  basico: 79.90,
  profissional: 129.90,
  premium: 199.90,
};

export const BarbeariaCard = ({ barbearia, index, planos }: BarbeariaCardProps) => {
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    nome: barbearia.nome,
    proprietario_nome: barbearia.proprietario_nome,
    email: barbearia.email,
    telefone: barbearia.telefone || '',
    endereco: barbearia.endereco || '',
    plano_tipo: barbearia.plano_tipo,
  });

  const updateMutation = useUpdateBarbearia();
  const deleteMutation = useDeleteBarbearia();

  /* const plano = planoBadges[barbearia.plano_tipo as keyof typeof planoBadges] || planoBadges.basico; */
  // Lógica Híbrida: Tenta achar no array de planos (novos) ou usa fallback dos antigos
  const planFound = planos.find(p => p.id === barbearia.plano_tipo);

  // Se não achar (legado), tenta mapear pelo ID antigo
  const legacyBadge = planoBadges[barbearia.plano_tipo as keyof typeof planoBadges];

  const displayPlan = {
    label: planFound ? planFound.nome : (legacyBadge?.label || 'Plano'),
    className: legacyBadge?.className || 'bg-primary/20 text-primary border border-primary/30'
  };
  const isBlocked = barbearia.ativo === false;

  const adminLink = `${window.location.origin}/barbearia/${barbearia.slug}/login`;

  const copyAdminLink = async () => {
    try {
      await navigator.clipboard.writeText(adminLink);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleBlock = () => {
    updateMutation.mutate({
      id: barbearia.id,
      ativo: !isBlocked,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(barbearia.id);
  };

  const handleEdit = () => {
    const selectedPlano = planos.find(p => p.id === editData.plano_tipo); // Assuming select stores plan ID (UUID) OR handle legacy text types.
    // NOTE: The user's DB has plano_tipo as string (basico/pro). The new plans table has UUIDs.
    // To support both, we should store the PLAN ID in 'plano_tipo' column if possible, or mapping by name?
    // The current schema says 'plano_tipo' is string.
    // If I change 'plano_tipo' to be the UUID of the plan, it might break 'planoBadges' logic which relies on 'basico', 'profissional'.
    // Let's assume for now we migrate to using UUID or keep using ID from the plans table if I created them with text IDs?
    // I created them with UUIDs.
    // This is a transition point.
    // If I use the plan ID in `plano_tipo`, the badges logic will fail unless I update it.
    // For now, I'll pass the plan NAME or ID?
    // The previous code had ids 'basico', 'profissional'.
    // My new plans table has UUIDs.
    // The USER expects the plans created in the manager config (UUIDs) to be selectable.
    // So `plano_tipo` will become a UUID for new assignments.
    // I should update the badge logic to handle non-matching cases or just display the plan name dynamically.

    // I'll update logic below.
    // I'll update logic below.
    const selectedPlano = planos.find(p => p.id === editData.plano_tipo);

    updateMutation.mutate({
      id: barbearia.id,
      ...editData,
      plano_valor: selectedPlano?.valor || 0,
    }, {
      onSuccess: () => setEditOpen(false),
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className={cn("neon-card-hover group", isBlocked && "opacity-60")}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-foreground group-hover:neon-text transition-all">
              {barbearia.nome}
              {isBlocked && <span className="ml-2 text-xs text-destructive">(Bloqueada)</span>}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Proprietário: {barbearia.proprietario_nome}
            </p>
          </div>
          <span className={cn("px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1", displayPlan.className)}>
            {barbearia.plano_tipo === 'premium' && <Crown className="w-3 h-3" />}
            {displayPlan.label}
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

        {/* Link do Admin */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs text-muted-foreground">Link do Painel Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={adminLink}
              className="flex-1 text-xs bg-background/50 px-2 py-1 rounded border border-border truncate"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyAdminLink}
              className="shrink-0"
              title="Copiar Link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(adminLink, '_blank')}
              className="shrink-0"
              title="Abrir em nova aba"
            >
              <Link2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <span className="text-2xl font-display font-bold neon-text">
            R$ {(barbearia.plano_valor || 0).toFixed(2)}
            <span className="text-xs text-muted-foreground font-normal">/mês</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditOpen(true)}
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBlock}
              title={isBlocked ? "Desbloquear" : "Bloquear"}
              className={isBlocked ? "text-green-500 hover:text-green-600" : "text-yellow-500 hover:text-yellow-600"}
            >
              <Ban className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Excluir"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Barbearia</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a barbearia "{barbearia.nome}"?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Barbearia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Barbearia</Label>
              <Input
                value={editData.nome}
                onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Proprietário</Label>
              <Input
                value={editData.proprietario_nome}
                onChange={(e) => setEditData({ ...editData, proprietario_nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={editData.telefone}
                onChange={(e) => setEditData({ ...editData, telefone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={editData.endereco}
                onChange={(e) => setEditData({ ...editData, endereco: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select
                value={editData.plano_tipo}
                onValueChange={(value) => setEditData({ ...editData, plano_tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {planos.map((plano) => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} - R$ {plano.valor?.toFixed(2)}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
