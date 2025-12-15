-- Create table for manual schedule blocks
create table if not exists public.horarios_bloqueados (
    id uuid default gen_random_uuid() primary key,
    barbearia_id uuid references public.barbearias(id) on delete cascade not null,
    data date not null,
    horarios text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    unique(barbearia_id, data)
);

-- RLS Policies
alter table public.horarios_bloqueados enable row level security;

create policy "Public read access"
    on public.horarios_bloqueados for select
    using (true);

create policy "Owners can manage blocks"
    on public.horarios_bloqueados for all
    using (auth.uid() in (
        select p.id from profiles p
        join barbearias b on b.id = horarios_bloqueados.barbearia_id
        where b.email = (select email from auth.users where id = auth.uid())
    ));
