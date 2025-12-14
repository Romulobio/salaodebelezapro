-- Adicionar colunas para PIX na tabela agenda_config
ALTER TABLE "public"."agenda_config" 
ADD COLUMN IF NOT EXISTS "pix_chave" text,
ADD COLUMN IF NOT EXISTS "pix_qrcode_base64" text;
