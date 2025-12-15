import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Plus, Star, Edit2, Trash2, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useBarbeariaBySlug } from '@/hooks/useBarbearia';
import { useBarbeariaPlan } from '@/hooks/useBarbeariaPlan';

interface Barbeiro {
  id: string;
  nome: string;
  bio: string | null;
  foto_url: string | null;
  especialidades: string[] | null;
  avaliacao: number | null;
  ativo: boolean;
  barbearia_id: string;
}

const Barbeiros = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: barbearia, isLoading: loadingBarbearia } = useBarbeariaBySlug(slug);
  const { data: plano } = useBarbeariaPlan(barbearia?.id, barbearia?.plano_tipo);

  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);

  const reachedLimit = plano?.max_barbeiros ? barbeiros.length >= plano.max_barbeiros : false;
  const legacyLimit = barbearia?.plano_tipo === 'basico' && barbeiros.length >= 3;
  const isBlocked = reachedLimit || legacyLimit;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    bio: '',
    fotoUrl: '',
    especialidades: '',
  });

  useEffect(() => {
    if (barbearia?.id) {
      fetchBarbeiros();
    }
  }, [barbearia?.id]);

  const fetchBarbeiros = async () => {
    if (!barbearia?.id) return;

    try {
      const { data, error } = await supabase
        .from('barbeiros')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .order('nome');

      if (error) throw error;
      setBarbeiros(data || []);
    } catch (error: any) {
      console.error('Error fetching barbeiros:', error);
      toast.error('Erro ao carregar barbeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbearia?.id) return;

    setSaving(true);

    try {
      const especialidadesArray = form.especialidades
        ? form.especialidades.split(',').map(e => e.trim()).filter(e => e)
        : null;

      if (editingId) {
        const { error } = await supabase
          .from('barbeiros')
          .update({
            nome: form.nome,
            bio: form.bio || null,
            foto_url: form.fotoUrl || null,
            especialidades: especialidadesArray,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Barbeiro atualizado!');
      } else {
        const { error } = await supabase
          .from('barbeiros')
          .insert({
            nome: form.nome,
            bio: form.bio || null,
            foto_url: form.fotoUrl || null,
            especialidades: especialidadesArray,
            barbearia_id: barbearia.id,
          });

        if (error) throw error;
        toast.success('Barbeiro adicionado!');
      }

      await fetchBarbeiros();
      resetForm();
    } catch (error: any) {
      console.error('Error saving barbeiro:', error);
      toast.error(error.message || 'Erro ao salvar barbeiro');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ nome: '', bio: '', fotoUrl: '', especialidades: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (barbeiro: Barbeiro) => {
    setForm({
      nome: barbeiro.nome,
      bio: barbeiro.bio || '',
      fotoUrl: barbeiro.foto_url || '',
      especialidades: barbeiro.especialidades?.join(', ') || '',
    });
    setEditingId(barbeiro.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('barbeiros')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBarbeiros(prev => prev.filter(b => b.id !== id));
      toast.success('Barbeiro removido!');
    } catch (error: any) {
      console.error('Error deleting barbeiro:', error);
      toast.error(error.message || 'Erro ao remover barbeiro');
    }
  };

  if (loadingBarbearia || loading) {
    return (
      <DashboardLayout type="admin" barbeariaSlug={slug}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
  // Fallback for legacy 'basico' string if not migrated yet
  const legacyLimit = barbearia?.plano_tipo === 'basico' && barbeiros.length >= 3;
          const isBlocked = reachedLimit || legacyLimit;

          // ...

          <div>
            <h1 className="text-3xl font-display font-bold neon-text">Barbeiros</h1>
            <p className="text-muted-foreground mt-1">Gerencie a equipe de barbeiros</p>
          </div>
          <Button
            variant="neon"
            onClick={() => {
              if (isBlocked) {
                toast.error(`Seu plano permite apenas ${plano?.max_barbeiros || 3} barbeiros.`);
                return;
              }
              setShowForm(true);
            }}
            disabled={isBlocked && !editingId} // Only disable if creating new
            className={isBlocked ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Barbeiro
          </Button>
        </motion.div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="neon-card mb-8"
          >
            <h2 className="text-xl font-display font-semibold mb-4">
              {editingId ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  placeholder="Nome do barbeiro"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL da Foto</label>
                <Input
                  placeholder="https://..."
                  value={form.fotoUrl}
                  onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Bio</label>
                <Input
                  placeholder="Breve descrição do barbeiro"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Especialidades (separadas por vírgula)</label>
                <Input
                  placeholder="Degradê, Barba, Corte Moderno"
                  value={form.especialidades}
                  onChange={(e) => setForm({ ...form, especialidades: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" variant="neon" disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    editingId ? 'Atualizar' : 'Adicionar'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Lista de Barbeiros */}
        {barbeiros.length === 0 ? (
          <div className="neon-card text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum barbeiro cadastrado</h3>
            <p className="text-muted-foreground mb-4">Adicione seu primeiro barbeiro para começar</p>
            <Button variant="neon" onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Novo Barbeiro
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbeiros.map((barbeiro, index) => (
              <motion.div
                key={barbeiro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="neon-card-hover group"
              >
                <div className="flex items-start gap-4 mb-4">
                  {barbeiro.foto_url ? (
                    <img
                      src={barbeiro.foto_url}
                      alt={barbeiro.nome}
                      className="w-20 h-20 rounded-xl object-cover shadow-neon"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-neon-cyan" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold">{barbeiro.nome}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{barbeiro.avaliacao || 5.0}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(barbeiro)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(barbeiro.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {barbeiro.bio && (
                  <p className="text-muted-foreground text-sm mb-4">{barbeiro.bio}</p>
                )}

                {barbeiro.especialidades && barbeiro.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {barbeiro.especialidades.map((esp) => (
                      <span
                        key={esp}
                        className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Barbeiros;
