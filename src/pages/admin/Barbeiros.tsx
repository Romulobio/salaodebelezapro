import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Plus, Star, Edit2, Trash2, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockBarbeiros } from '@/data/mockData';
import { toast } from 'sonner';
import { Barbeiro } from '@/types/barbershop';

const Barbeiros = () => {
  const { slug } = useParams<{ slug: string }>();
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>(mockBarbeiros);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    bio: '',
    fotoUrl: '',
    especialidades: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setBarbeiros(prev => prev.map(b => 
        b.id === editingId 
          ? { ...b, nome: form.nome, bio: form.bio, fotoUrl: form.fotoUrl, especialidades: form.especialidades.split(',').map(e => e.trim()) }
          : b
      ));
      toast.success('Barbeiro atualizado!');
    } else {
      const novo: Barbeiro = {
        id: Date.now().toString(),
        nome: form.nome,
        bio: form.bio,
        fotoUrl: form.fotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        barbeariaId: '1',
        especialidades: form.especialidades.split(',').map(e => e.trim()),
        avaliacao: 5.0,
      };
      setBarbeiros(prev => [...prev, novo]);
      toast.success('Barbeiro adicionado!');
    }
    
    resetForm();
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
      fotoUrl: barbeiro.fotoUrl || '',
      especialidades: barbeiro.especialidades.join(', '),
    });
    setEditingId(barbeiro.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setBarbeiros(prev => prev.filter(b => b.id !== id));
    toast.success('Barbeiro removido!');
  };

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold neon-text">Barbeiros</h1>
            <p className="text-muted-foreground mt-1">Gerencie a equipe de barbeiros</p>
          </div>
          <Button variant="neon" onClick={() => setShowForm(true)}>
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
                <Button type="submit" variant="neon">
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Lista de Barbeiros */}
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
                {barbeiro.fotoUrl ? (
                  <img
                    src={barbeiro.fotoUrl}
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
                    <span className="text-sm font-medium">{barbeiro.avaliacao}</span>
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
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Barbeiros;
