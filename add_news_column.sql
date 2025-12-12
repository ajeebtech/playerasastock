ALTER TABLE players 
ADD COLUMN news jsonb DEFAULT '[]'::jsonb;
