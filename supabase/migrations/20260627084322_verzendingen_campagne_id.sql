-- Directe campagne-koppeling op verzendingen zodat tellingen per campagne kloppen.
alter table public.campagne_verzendingen
  add column if not exists campagne_id uuid references public.campagnes(id) on delete cascade;
