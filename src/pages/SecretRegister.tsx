import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Mail, User, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecretRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: '',
        secretKey: ''
    });

    // Chave secreta simples para "proteger" a página
    // Em produção isso deveria ser mais robusto, mas serve para o propósito atual
    const MASTER_KEY = "admin123";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.secretKey !== MASTER_KEY) {
            toast.error("Chave de Acesso Inválida! Você não tem permissão.");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nome: formData.nome,
                        tipo: 'admin', // Define como Admin Master
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                toast.success("Admin Master cadastrado com sucesso!");
                navigate("/manager");
            } else if (data.user) {
                toast.success("Cadastro realizado! Verifique o email para confirmar.");
                // Opcional: navegar para login ou manter na página
            }

        } catch (error: any) {
            toast.error("Erro ao cadastrar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold neon-text">Master Access</h1>
                    <p className="text-muted-foreground mt-2">Registro Secreto Administrativo</p>
                </div>

                <div className="neon-card bg-card/50 backdrop-blur-sm">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" /> Nome Completo
                            </label>
                            <Input
                                placeholder="Nome do Admin"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" /> Email Admin
                            </label>
                            <Input
                                type="email"
                                placeholder="admin@master.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" /> Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border/50">
                            <label className="text-sm font-medium flex items-center gap-2 text-red-400">
                                <Key className="w-4 h-4" /> Chave Mestra
                            </label>
                            <Input
                                type="password"
                                placeholder="Chave de segurança..."
                                value={formData.secretKey}
                                onChange={e => setFormData({ ...formData, secretKey: e.target.value })}
                                required
                                className="border-red-500/30 focus-visible:ring-red-500/50"
                            />
                        </div>

                        <Button type="submit" variant="neon" className="w-full mt-6" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Registrar Master Admin
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SecretRegister;
