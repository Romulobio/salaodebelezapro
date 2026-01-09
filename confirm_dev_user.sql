-- RODE ESTE COMANDO NO "SQL EDITOR" DO PAINEL SUPABASE
-- Isso confirmará o email do último usuário criado e permitirá o login.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- OU, se preferir confirmar um email específico:
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'seu@email.com';
