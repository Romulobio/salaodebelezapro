import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Plus, Scissors, Clock, DollarSign, Edit2, Trash2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useBarbeariaBySlug } from '@/hooks/useBarbearia';

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  barbearia_id: string;
}

const Servicos = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: barbearia, isLoading: loadingBarbearia } = useBarbeariaBySlug(slug);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracaoMinutos: '',
  });

  useEffect(() => {
    if (barbearia?.id) {
      fetchServicos();
    }
  }, [barbearia?.id]);

  const fetchServicos = async () => {
    if (!barbearia?.id) return;

    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .order('nome');

      if (error) throw error;
      setServicos(data || []);
    } catch (error: any) {
      console.error('Error fetching servicos:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbearia?.id) return;

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('servicos')
          .update({
            nome: form.nome,
            descricao: form.descricao || null,
            preco: parseFloat(form.preco),
            duracao_minutos: parseInt(form.duracaoMinutos),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Serviço atualizado!');
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert({
            nome: form.nome,
            descricao: form.descricao || null,
            preco: parseFloat(form.preco),
            duracao_minutos: parseInt(form.duracaoMinutos),
            barbearia_id: barbearia.id,
          });

        if (error) throw error;
        toast.success('Serviço adicionado!');
      }

      await fetchServicos();
      resetForm();
    } catch (error: any) {
      console.error('Error saving servico:', error);
      toast.error(error.message || 'Erro ao salvar serviço');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ nome: '', descricao: '', preco: '', duracaoMinutos: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (servico: Servico) => {
    setForm({
      nome: servico.nome,
      descricao: servico.descricao || '',
      preco: servico.preco.toString(),
      duracaoMinutos: servico.duracao_minutos.toString(),
    });
    setEditingId(servico.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServicos(prev => prev.filter(s => s.id !== id));
      toast.success('Serviço removido!');
    } catch (error: any) {
      console.error('Error deleting servico:', error);
      toast.error(error.message || 'Erro ao remover serviço');
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
      <div className="p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold neon-text">Serviços</h1>
            <p className="text-muted-foreground mt-1">Gerencie os serviços oferecidos</p>
          </div>
          <Button variant="neon" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Serviço
          </Button>
        </motion.div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="neon-card mb-8"
          >
            <h2 className="text-xl font-display font-semibold mb-4">
              {editingId ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  placeholder="Ex: Corte Clássico"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descrição do serviço"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço (R$) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="45.00"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    className="pl-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duração (minutos) *</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="30"
                    value={form.duracaoMinutos}
                    onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
                    className="pl-12"
                    required
                  />
                </div>
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

        {/* Lista de Serviços */}
        {servicos.length === 0 ? (
          <div className="neon-card text-center py-12">
            <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-muted-foreground mb-4">Adicione seu primeiro serviço para começar</p>
            <Button variant="neon" onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Novo Serviço
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico, index) => (
              <motion.div
                key={servico.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="neon-card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-neon">
                    <Scissors className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(servico)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(servico.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-display font-semibold mb-2">{servico.nome}</h3>
                {servico.descricao && (
                  <p className="text-muted-foreground text-sm mb-4">{servico.descricao}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{servico.duracao_minutos} min</span>
                  </div>
                  <span className="text-2xl font-display font-bold neon-text">
                    R$ {servico.preco.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Servicos;
