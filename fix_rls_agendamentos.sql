-- Política para permitir atualização de status dos agendamentos
-- Isso é necessário para que o ADMIN consiga Confirmar, Cancelar ou Concluir.

alter table "public"."agendamentos" enable row level security;

-- Permitir UPDATE para qualquer pessoa (anon) desde que tenha o ID do agendamento
-- (Idealmente seria autenticado, mas para o MVP atual é baseado em anon+logica frontend)
create policy "Permitir Atualizacao Agendamentos"
on "public"."agendamentos"
for update
to anon
using (true)
with check (true);

-- Permitir SELECT para ver os agendamentos (já deve existir, mas reforçando)
create policy "Permitir Leitura Agendamentos"
on "public"."agendamentos"
for select
to anon
using (true);
