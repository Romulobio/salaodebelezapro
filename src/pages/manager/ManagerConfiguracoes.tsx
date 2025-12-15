
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Trash2, Check, Lock, CreditCard, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plano {
    id: string;
    nome: string;
    valor: number;
    descricao: string;
    beneficios: string[];
}

const ManagerConfiguracoes = () => {
    const [loading, setLoading] = useState(false);
    const [planos, setPlanos] = useState<Plano[]>([]);

    // States Formulário Plano
    const [novoPlano, setNovoPlano] = useState({
        nome: '',
        valor: '',
        descricao: '',
        beneficios: ''
    });

    // States Senha
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const carregarPlanos = async () => {
        const { data } = await supabase.from('planos').select('*').order('valor');
        if (data) setPlanos(data);
    };

    useEffect(() => {
        carregarPlanos();
    }, []);

    const handleCriarPlano = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const beneficiosArray = novoPlano.beneficios.split(',').map(b => b.trim()).filter(b => b);

        try {
            const { error } = await supabase.from('planos').insert({
                nome: novoPlano.nome,
                valor: parseFloat(novoPlano.valor),
                descricao: novoPlano.descricao,
                beneficios: beneficiosArray,
                ativo: true
            });

            if (error) throw error;

            toast.success('Plano criado com sucesso!');
            setNovoPlano({ nome: '', valor: '', descricao: '', beneficios: '' });
            carregarPlanos();
        } catch (error: any) {
            toast.error('Erro ao criar plano: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirPlano = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este plano?')) return;

        try {
            const { error } = await supabase.from('planos').delete().eq('id', id);
            if (error) throw error;
            toast.success('Plano excluído.');
            carregarPlanos();
        } catch (error: any) {
            toast.error('Erro ao excluir: ' + error.message);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas não conferem');
            return;
        }
        if (novaSenha.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: novaSenha });
            if (error) throw error;
            toast.success('Senha atualizada com sucesso!');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error: any) {
            toast.error('Erro ao atualizar senha: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout type="manager">
            <div className="p-8 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold neon-text">Configurações do Gerenciador</h1>
                    <p className="text-muted-foreground mt-1">Gerencie planos e segurança do sistema</p>
                </motion.div>

                <Tabs defaultValue="planos" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="planos" className="gap-2 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">
                            <CreditCard className="w-4 h-4" /> Gestão de Planos
                        </TabsTrigger>
                        <TabsTrigger value="seguranca" className="gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                            <Lock className="w-4 h-4" /> Segurança
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB PLANOS */}
                    <TabsContent value="planos" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Form Criar */}
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="neon-card">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-neon-green" /> Novo Plano
                                </h3>
                                <form onSubmit={handleCriarPlano} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Nome do Plano</label>
                                        <Input
                                            placeholder="Ex: Básico"
                                            value={novoPlano.nome}
                                            onChange={e => setNovoPlano({ ...novoPlano, nome: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Valor Mensal (R$)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={novoPlano.valor}
                                            onChange={e => setNovoPlano({ ...novoPlano, valor: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Descrição Curta</label>
                                        <Input
                                            placeholder="Ex: Ideal para iniciantes"
                                            value={novoPlano.descricao}
                                            onChange={e => setNovoPlano({ ...novoPlano, descricao: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Benefícios (separados por vírgula)</label>
                                        <textarea
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Ex: 2 Barbeiros, Agenda Ilimitada, Suporte VIP"
                                            value={novoPlano.beneficios}
                                            onChange={e => setNovoPlano({ ...novoPlano, beneficios: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" variant="neon" className="w-full" disabled={loading}>
                                        {loading ? 'Salvando...' : 'Criar Plano'}
                                    </Button>
                                </form>
                            </motion.div>

                            {/* Lista Planos */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <h3 className="text-lg font-semibold mb-4">Planos Ativos</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {planos.length === 0 ? (
                                        <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
                                    ) : (
                                        planos.map(plano => (
                                            <div key={plano.id} className="p-4 rounded-xl border border-border bg-card/50 flex justify-between items-start group hover:border-primary/50 transition-all">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-lg">{plano.nome}</h4>
                                                        <span className="text-neon-purple font-mono font-bold">R$ {plano.valor.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{plano.descricao}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {plano.beneficios?.map(b => (
                                                            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleExcluirPlano(plano.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </TabsContent>

                    {/* TAB SEGURANÇA */}
                    <TabsContent value="seguranca">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto mt-8">
                            <div className="neon-card">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-neon-cyan" /> Redefinir Senha do Gerenciador
                                </h3>
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nova Senha</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={novaSenha}
                                            onChange={e => setNovaSenha(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirmar Nova Senha</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmarSenha}
                                            onChange={e => setConfirmarSenha(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <Button type="submit" variant="neon" className="w-full" disabled={loading}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {loading ? 'Atualizando...' : 'Atualizar Senha'}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default ManagerConfiguracoes;
