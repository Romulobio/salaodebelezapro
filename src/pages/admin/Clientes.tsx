import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Search, History, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientMetrics {
    nome: string;
    telefone: string;
    totalVisitas: number;
    totalGasto: number;
    ultimaVisita: string;
    historico: any[];
}

const Clientes = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState<ClientMetrics[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBarbearia = async () => {
            if (!slug) return;
            const { data } = await supabase
                .from('barbearias')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();
            if (data) {
                setBarbeariaId(data.id);
            }
        };
        fetchBarbearia();
    }, [slug]);

    useEffect(() => {
        if (barbeariaId) {
            fetchClientes();
        }
    }, [barbeariaId]);

    const fetchClientes = async () => {
        if (!barbeariaId) return;

        const { data: agendamentos } = await supabase
            .from('agendamentos')
            .select(`
                *,
                servico:servicos(nome, preco)
            `)
            .eq('barbearia_id', barbeariaId)
            .order('data', { ascending: false });

        if (agendamentos) {
            const metricsMap = new Map<string, ClientMetrics>();

            agendamentos.forEach(ag => {
                const key = ag.cliente_nome; // Using name as key for now, ideal would be phone or ID

                if (!metricsMap.has(key)) {
                    metricsMap.set(key, {
                        nome: key,
                        telefone: ag.cliente_telefone || 'Não informado',
                        totalVisitas: 0,
                        totalGasto: 0,
                        ultimaVisita: ag.data, // Since we ordered by desc, first is latest
                        historico: []
                    });
                }

                const client = metricsMap.get(key)!;
                client.totalVisitas += 1;
                client.totalGasto += ag.valor_total;
                client.historico.push(ag);
            });

            setClientes(Array.from(metricsMap.values()));
        }
        setLoading(false);
    };

    const filteredClientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone.includes(searchTerm)
    );

    return (
        <DashboardLayout type="admin" barbeariaSlug={slug}>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-primary" />
                        Base de Clientes
                    </h1>
                    <p className="text-muted-foreground">
                        Histórico, frequência e métricas dos seus clientes
                    </p>
                </motion.div>

                <Card className="neon-card">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle>Lista de Clientes</CardTitle>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar nome ou telefone..."
                                    className="pl-9 bg-background/50 border-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Frequência</TableHead>
                                        <TableHead>Total Gasto</TableHead>
                                        <TableHead>Última Visita</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Carregando clientes...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredClientes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum cliente encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClientes.map((cliente) => (
                                            <TableRow key={cliente.nome} className="group hover:bg-muted/50 transition-colors">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-foreground">{cliente.nome}</p>
                                                        <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                        {cliente.totalVisitas} visitas
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-green-400 font-medium">
                                                        R$ {cliente.totalGasto.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(new Date(cliente.ultimaVisita), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <button className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ml-auto">
                                                                <History className="w-3 h-3" />
                                                                Ver Histórico
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                                                            <DialogHeader>
                                                                <DialogTitle>Histórico de {cliente.nome}</DialogTitle>
                                                                <DialogDescription>
                                                                    Total de {cliente.totalVisitas} agendamentos realizados
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <ScrollArea className="flex-1 pr-4">
                                                                <div className="space-y-4 mt-4">
                                                                    {cliente.historico.map((ag: any) => (
                                                                        <div key={ag.id} className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Calendar className="w-4 h-4 text-primary" />
                                                                                    <span className="font-medium">
                                                                                        {format(new Date(ag.data), "dd/MM/yyyy", { locale: ptBR })}
                                                                                    </span>
                                                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                                                        {ag.hora}
                                                                                    </span>
                                                                                </div>
                                                                                <span className="font-bold text-green-400 text-sm">
                                                                                    R$ {ag.valor_total.toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-sm">
                                                                                <span className="text-muted-foreground">
                                                                                    {ag.servico?.nome || 'Serviço excluído'}
                                                                                </span>
                                                                                <Badge variant="outline" className={`
                                                                                    text-xs
                                                                                    ${ag.status === 'concluido' ? 'border-green-500/50 text-green-500' : ''}
                                                                                    ${ag.status === 'confirmado' ? 'border-blue-500/50 text-blue-500' : ''}
                                                                                    ${ag.status === 'pendente' ? 'border-yellow-500/50 text-yellow-500' : ''}
                                                                                    ${ag.status === 'cancelado' ? 'border-red-500/50 text-red-500' : ''}
                                                                                `}>
                                                                                    {ag.status}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Clientes;
