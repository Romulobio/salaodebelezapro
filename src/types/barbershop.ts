export interface Barbearia {
  id: string;
  nome: string;
  proprietarioNome: string;
  email: string;
  telefone?: string;
  planoTipo: 'basico' | 'profissional' | 'premium';
  planoValor: number;
  endereco?: string;
  descricao?: string;
  slug: string;
  logoUrl?: string;
  criadoEm: Date;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'cliente' | 'gerenciador';
  barbeariaId?: string;
  avatarUrl?: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: string;
  ativo: boolean;
}

export interface Barbeiro {
  id: string;
  nome: string;
  bio?: string;
  fotoUrl?: string;
  barbeariaId: string;
  especialidades: string[];
  avaliacao: number;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  barbeiroId: string;
  barbeiroNome: string;
  servicoId: string;
  servicoNome: string;
  barbeariaId: string;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  valorTotal: number;
  pagamentoStatus: 'pendente' | 'pago' | 'reembolsado';
}

export interface DashboardData {
  barbearia: string;
  agendamentosHoje: number;
  totalClientes: number;
  totalServicos: number;
  receitaMes: number;
  proximos: {
    id: string;
    hora: string;
    cliente: string;
    servico: string;
    barbeiro: string;
  }[];
}
