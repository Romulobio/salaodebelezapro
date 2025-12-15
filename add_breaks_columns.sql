-- Add lunch and dinner break columns to agenda_config table
ALTER TABLE agenda_config
ADD COLUMN IF NOT EXISTS almoco_inicio TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS almoco_fim TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS jantar_inicio TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS jantar_fim TEXT DEFAULT NULL;

-- Comment on columns
COMMENT ON COLUMN agenda_config.almoco_inicio IS 'Horário de início do almoço (HH:MM)';
COMMENT ON COLUMN agenda_config.almoco_fim IS 'Horário de fim do almoço (HH:MM)';
COMMENT ON COLUMN agenda_config.jantar_inicio IS 'Horário de início do jantar (HH:MM)';
COMMENT ON COLUMN agenda_config.jantar_fim IS 'Horário de fim do jantar (HH:MM)';
