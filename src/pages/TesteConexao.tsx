
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function TesteConexao() {
    const [status, setStatus] = useState('Aguardando...');
    const [detalhes, setDetalhes] = useState('');

    const testar = async () => {
        setStatus('Testando...');
        try {
            // 1. Teste de Leitura
            const { data: leitura, error: erroLeitura } = await supabase
                .from('agendamentos')
                .select('count')
                .limit(1);

            if (erroLeitura) {
                throw new Error('Erro na Leitura: ' + JSON.stringify(erroLeitura));
            }

            // 2. Teste de Escrita (Tentativa de Insert Fake)
            // Usaremos um ID aleatório para não atrapalhar
            const fakeId = crypto.randomUUID();
            const { error: erroEscrita } = await supabase
                .from('agendamentos')
                // @ts-ignore
                .insert({
                    id: fakeId,
                    barbearia_id: '00000000-0000-0000-0000-000000000000', // ID inválido proposital, mas testando permissão
                    status: 'pendente',
                    cliente_nome: 'Teste Debug',
                    hora: '00:00',
                    data: '2099-01-01',
                    valor_total: 0,
                    barbeiro_id: '00000000-0000-0000-0000-000000000000', // ID inválido
                    servico_id: '00000000-0000-0000-0000-000000000000' // ID inválido
                });

            // Nota: Foreign Key constraint deve falhar ANTES do RLS se RLS funcionar.
            // Se der erro de RLS (401/403), saberemos.
            // Se der erro de Foreign Key (23503), então o RLS PASSOU!

            if (erroEscrita) {
                if (erroEscrita.code === '23503') {
                    setStatus('SUCESSO! (RLS Funcionando)');
                    setDetalhes('O banco permitiu a inserção (RLS OK), mas falhou na chave estrangeira (esperado). Sua configuração está correta!');
                } else {
                    setStatus('FALHA DE PERMISSÃO OU OUTRO ERRO');
                    setDetalhes(JSON.stringify(erroEscrita, null, 2));
                }
            } else {
                setStatus('SUCESSO TOTAL');
                setDetalhes('Registro inserido (algo de errado pois os IDs eram falsos, mas a conexão funcionou)');
            }

        } catch (e: any) {
            setStatus('ERRO CRÍTICO');
            setDetalhes(e.message || String(e));
        }
    };

    return (
        <div className="p-10 text-white bg-zinc-900 min-h-screen">
            <h1 className="text-2xl mb-4">Diagnóstico de Conexão</h1>
            <Button onClick={testar}>Rodar Teste de Banco de Dados</Button>
            <div className="mt-4">
                <strong>Status:</strong> {status}
            </div>
            <pre className="mt-4 p-4 bg-black rounded border border-gray-700 whitespace-pre-wrap">
                {detalhes}
            </pre>
        </div>
    );
}
