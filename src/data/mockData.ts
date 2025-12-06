import { Barbearia, Barbeiro, Servico, Agendamento, DashboardData } from '@/types/barbershop';

export const mockBarbearias: Barbearia[] = [
  {
    id: '1',
    nome: 'Barbearia Neon Style',
    proprietarioNome: 'Carlos Silva',
    email: 'carlos@neonstyle.com',
    telefone: '(11) 99999-0001',
    planoTipo: 'premium',
    planoValor: 199.90,
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    descricao: 'A barbearia mais moderna da cidade',
    slug: 'neon-style',
    criadoEm: new Date('2024-01-15'),
  },
  {
    id: '2',
    nome: 'Barber Kings',
    proprietarioNome: 'João Santos',
    email: 'joao@barberkings.com',
    telefone: '(11) 99999-0002',
    planoTipo: 'profissional',
    planoValor: 129.90,
    endereco: 'Rua Augusta, 500 - São Paulo, SP',
    descricao: 'Cortes de rei para homens modernos',
    slug: 'barber-kings',
    criadoEm: new Date('2024-02-20'),
  },
  {
    id: '3',
    nome: 'Vintage Cuts',
    proprietarioNome: 'Pedro Lima',
    email: 'pedro@vintagecuts.com',
    telefone: '(11) 99999-0003',
    planoTipo: 'basico',
    planoValor: 79.90,
    endereco: 'Rua Oscar Freire, 200 - São Paulo, SP',
    descricao: 'Estilo clássico com toque moderno',
    slug: 'vintage-cuts',
    criadoEm: new Date('2024-03-10'),
  },
];

export const mockServicos: Servico[] = [
  { id: '1', nome: 'Corte Clássico', descricao: 'Corte tradicional masculino', preco: 45, duracaoMinutos: 30, barbeariaId: '1', ativo: true },
  { id: '2', nome: 'Barba Completa', descricao: 'Aparação e modelagem de barba', preco: 35, duracaoMinutos: 25, barbeariaId: '1', ativo: true },
  { id: '3', nome: 'Corte + Barba', descricao: 'Combo completo', preco: 70, duracaoMinutos: 50, barbeariaId: '1', ativo: true },
  { id: '4', nome: 'Degradê', descricao: 'Corte degradê moderno', preco: 55, duracaoMinutos: 40, barbeariaId: '1', ativo: true },
  { id: '5', nome: 'Hidratação', descricao: 'Tratamento capilar', preco: 40, duracaoMinutos: 30, barbeariaId: '1', ativo: true },
  { id: '6', nome: 'Pigmentação', descricao: 'Pigmentação de barba', preco: 80, duracaoMinutos: 45, barbeariaId: '1', ativo: true },
];

export const mockBarbeiros: Barbeiro[] = [
  { id: '1', nome: 'André Costa', bio: 'Especialista em degradê e cortes modernos', fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', barbeariaId: '1', especialidades: ['Degradê', 'Corte Moderno'], avaliacao: 4.9 },
  { id: '2', nome: 'Bruno Oliveira', bio: 'Mestre em barba e bigode', fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', barbeariaId: '1', especialidades: ['Barba', 'Bigode'], avaliacao: 4.8 },
  { id: '3', nome: 'Diego Ferreira', bio: 'Cortes clássicos e contemporâneos', fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', barbeariaId: '1', especialidades: ['Clássico', 'Contemporâneo'], avaliacao: 4.7 },
];

export const mockAgendamentos: Agendamento[] = [
  { id: '1', clienteId: 'c1', clienteNome: 'Lucas Mendes', barbeiroId: '1', barbeiroNome: 'André Costa', servicoId: '1', servicoNome: 'Corte Clássico', barbeariaId: '1', data: '2024-12-06', hora: '09:00', status: 'confirmado', valorTotal: 45, pagamentoStatus: 'pago' },
  { id: '2', clienteId: 'c2', clienteNome: 'Rafael Santos', barbeiroId: '2', barbeiroNome: 'Bruno Oliveira', servicoId: '3', servicoNome: 'Corte + Barba', barbeariaId: '1', data: '2024-12-06', hora: '10:00', status: 'confirmado', valorTotal: 70, pagamentoStatus: 'pago' },
  { id: '3', clienteId: 'c3', clienteNome: 'Felipe Almeida', barbeiroId: '1', barbeiroNome: 'André Costa', servicoId: '4', servicoNome: 'Degradê', barbeariaId: '1', data: '2024-12-06', hora: '11:00', status: 'pendente', valorTotal: 55, pagamentoStatus: 'pendente' },
  { id: '4', clienteId: 'c4', clienteNome: 'Gabriel Lima', barbeiroId: '3', barbeiroNome: 'Diego Ferreira', servicoId: '2', servicoNome: 'Barba Completa', barbeariaId: '1', data: '2024-12-06', hora: '14:00', status: 'confirmado', valorTotal: 35, pagamentoStatus: 'pago' },
  { id: '5', clienteId: 'c5', clienteNome: 'Thiago Rocha', barbeiroId: '2', barbeiroNome: 'Bruno Oliveira', servicoId: '1', servicoNome: 'Corte Clássico', barbeariaId: '1', data: '2024-12-06', hora: '15:30', status: 'confirmado', valorTotal: 45, pagamentoStatus: 'pago' },
];

export const mockDashboard: DashboardData = {
  barbearia: 'Barbearia Neon Style',
  agendamentosHoje: 12,
  totalClientes: 248,
  totalServicos: 6,
  receitaMes: 8450.00,
  proximos: mockAgendamentos.slice(0, 5).map(ag => ({
    id: ag.id,
    hora: ag.hora,
    cliente: ag.clienteNome,
    servico: ag.servicoNome,
    barbeiro: ag.barbeiroNome,
  })),
};

export const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];
