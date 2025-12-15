
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function TesteUpdate() {
    const [agendamentos, setAgendamentos] = useState<any[]>([]);
    const [status, setStatus] = useState('Carregando lista...');
    const [erroUpdate, setErroUpdate] = useState('');

    const carregar = async () => {
        const { data, error } = await supabase.from('agendamentos').select('*').limit(5).order('created_at', { ascending: false });
        if (error) {
            setStatus('Erro ao ver agendamentos: ' + JSON.stringify(error));
        } else {
            setAgendamentos(data || []);
            setStatus(`Encontrados ${data?.length} agendamentos.`);
        }
    };

    useEffect(() => { carregar(); }, []);

    const tentarAtualizar = async (id: string) => {
        setErroUpdate('Tentando atualizar...');
        const { data, error } = await supabase
            .from('agendamentos')
            .update({ status: 'confirmado', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) {
            setErroUpdate('ERRO UPDATE: ' + JSON.stringify(error, null, 2));
        } else {
            setErroUpdate('SUCESSO UPDATE! O banco permitiu a atualização. (Status -> confirmado)');
            carregar();
        }
    };

    return (
        <div className="p-10 text-white bg-zinc-900 min-h-screen font-mono">
            <h1 className="text-2xl mb-4">Teste de UPDATE e SELECT</h1>
            <Button onClick={carregar} variant="outline" className="mb-4 mr-2">Recarregar Lista</Button>

            <div className="mb-4">{status}</div>

            {erroUpdate && (
                <pre className="p-4 bg-red-900/50 border border-red-500 rounded my-4 whitespace-pre-wrap">
                    {erroUpdate}
                </pre>
            )}

            <div className="space-y-2">
                {agendamentos.map(ag => (
                    <div key={ag.id} className="p-4 border border-zinc-700 rounded flex justify-between items-center">
                        <div>
                            <p><strong>ID:</strong> {ag.id}</p>
                            <p><strong>Nome:</strong> {ag.cliente_nome}</p>
                            <p><strong>Status:</strong> {ag.status}</p>
                        </div>
                        <Button onClick={() => tentarAtualizar(ag.id)}>
                            Testar Atualização (Confirmar)
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
