import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, User, Mail, Phone, MapPin, FileText, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NovaBarbearia = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    barbeariaNome: '',
    proprietarioNome: '',
    email: '',
    senha: '',
    telefone: '',
    endereco: '',
    descricao: '',
    planoTipo: 'profissional',
  });

  const planos = [
    { id: 'basico', nome: 'Básico', valor: 79.90, recursos: ['1 barbeiro', 'Agenda básica', 'Suporte email'] },
    { id: 'profissional', nome: 'Profissional', valor: 129.90, recursos: ['5 barbeiros', 'Agenda completa', 'Relatórios', 'Suporte prioritário'] },
    { id: 'premium', nome: 'Premium', valor: 199.90, recursos: ['Ilimitado', 'Todas funções', 'PIX integrado', 'Suporte 24/7', 'API acesso'] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação - substituir por integração real
    setTimeout(() => {
      const slug = form.barbeariaNome.toLowerCase().replace(/\s+/g, '-');
      toast.success(
        <div>
          <p className="font-semibold">Barbearia criada com sucesso!</p>
          <p className="text-sm mt-1">Link: /admin/{slug}</p>
        </div>
      );
      navigate('/manager');
      setLoading(false);
    }, 1500);
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout type="manager">
      <div className="p-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate('/manager')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-display font-bold neon-text">Nova Barbearia</h1>
          <p className="text-muted-foreground mt-1">Cadastre uma nova barbearia no sistema</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neon-card"
          >
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-neon-cyan" />
              Informações da Barbearia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Barbearia *</label>
                <Input
                  placeholder="Ex: Barbearia Neon Style"
                  value={form.barbeariaNome}
                  onChange={(e) => updateForm('barbeariaNome', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Proprietário *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Carlos Silva"
                    value={form.proprietarioNome}
                    onChange={(e) => updateForm('proprietarioNome', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@barbearia.com"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha de Acesso *</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={(e) => updateForm('senha', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="(11) 99999-0000"
                    value={form.telefone}
                    onChange={(e) => updateForm('telefone', e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rua, número - Cidade"
                    value={form.endereco}
                    onChange={(e) => updateForm('endereco', e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                <textarea
                  placeholder="Descreva a barbearia..."
                  value={form.descricao}
                  onChange={(e) => updateForm('descricao', e.target.value)}
                  className="w-full min-h-[100px] rounded-lg border-2 border-primary/30 bg-input/50 px-4 py-3 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Planos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neon-card"
          >
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-neon-purple" />
              Escolha o Plano
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planos.map((plano) => (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => updateForm('planoTipo', plano.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    form.planoTipo === plano.id
                      ? 'border-primary bg-primary/10 shadow-neon'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <h3 className="font-display font-semibold text-lg">{plano.nome}</h3>
                  <p className="text-3xl font-bold neon-text mt-2">
                    R$ {plano.valor.toFixed(2)}
                    <span className="text-sm text-muted-foreground font-normal">/mês</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plano.recursos.map((recurso) => (
                      <li key={recurso} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                        {recurso}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Button type="button" variant="outline" onClick={() => navigate('/manager')}>
              Cancelar
            </Button>
            <Button type="submit" variant="neon" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                'Cadastrar Barbearia'
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NovaBarbearia;
