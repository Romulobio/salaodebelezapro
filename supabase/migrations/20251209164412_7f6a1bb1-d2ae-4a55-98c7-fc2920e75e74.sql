-- Criar tabela de barbearias
CREATE TABLE public.barbearias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  proprietario_nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  plano_tipo TEXT NOT NULL DEFAULT 'basico',
  plano_valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  endereco TEXT,
  descricao TEXT,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  tipo TEXT NOT NULL DEFAULT 'cliente', -- admin, cliente
  barbearia_id UUID REFERENCES public.barbearias(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbearia_id UUID NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de barbeiros
CREATE TABLE public.barbeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbearia_id UUID NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  bio TEXT,
  foto_url TEXT,
  especialidades TEXT[],
  avaliacao NUMERIC(2,1) DEFAULT 5.0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbearia_id UUID NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  barbeiro_id UUID NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  data DATE NOT NULL,
  hora TEXT NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, confirmado, concluido, cancelado
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.barbearias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para barbearias (públicas para leitura, admins podem editar)
CREATE POLICY "Barbearias são públicas para leitura" 
ON public.barbearias FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir barbearias" 
ON public.barbearias FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.tipo = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar suas barbearias" 
ON public.barbearias FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.barbearia_id = barbearias.id
    AND profiles.tipo = 'admin'
  )
);

-- Políticas para profiles
CREATE POLICY "Perfis são visíveis para usuários autenticados" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Políticas para serviços (públicos para leitura)
CREATE POLICY "Serviços são públicos para leitura" 
ON public.servicos FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar serviços da sua barbearia" 
ON public.servicos FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.barbearia_id = servicos.barbearia_id
    AND profiles.tipo = 'admin'
  )
);

-- Políticas para barbeiros (públicos para leitura)
CREATE POLICY "Barbeiros são públicos para leitura" 
ON public.barbeiros FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar barbeiros da sua barbearia" 
ON public.barbeiros FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.barbearia_id = barbeiros.barbearia_id
    AND profiles.tipo = 'admin'
  )
);

-- Políticas para agendamentos
CREATE POLICY "Agendamentos são visíveis para admins da barbearia" 
ON public.agendamentos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.barbearia_id = agendamentos.barbearia_id
    AND profiles.tipo = 'admin'
  )
  OR cliente_id = auth.uid()
);

CREATE POLICY "Clientes podem criar agendamentos" 
ON public.agendamentos FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar agendamentos da sua barbearia" 
ON public.agendamentos FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.barbearia_id = agendamentos.barbearia_id
    AND profiles.tipo = 'admin'
  )
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_barbearias_updated_at
BEFORE UPDATE ON public.barbearias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
BEFORE UPDATE ON public.servicos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_barbeiros_updated_at
BEFORE UPDATE ON public.barbeiros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'cliente')
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar realtime para agendamentos
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;