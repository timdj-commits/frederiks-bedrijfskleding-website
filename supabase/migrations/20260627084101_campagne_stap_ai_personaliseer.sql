-- Per stap kan AI-personalisatie aan/uit (de {{ai}}-placeholder in de body).
alter table public.campagne_stappen add column if not exists ai_personaliseer boolean not null default false;
