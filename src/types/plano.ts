
export interface Plano {
    id: string;
    nome: string;
    descricao: string | null;
    valor: number;
    intervalo_dias: number;
    max_barbeiros: number | null;
    max_agendamentos: number | null;
    beneficios: string[] | null;
    ativo: boolean;
    created_at: string;
    updated_at: string;
}
