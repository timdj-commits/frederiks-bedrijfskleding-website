-- Per-klant retouren aan/uit
alter table public.organisaties add column if not exists retouren_actief boolean not null default true;

-- Medewerker-wijzigingsverzoeken: beheerder stelt voor, Jessi keurt goed.
create table if not exists public.medewerker_verzoeken (
  id uuid primary key default gen_random_uuid(),
  organisatie_id uuid not null references public.organisaties(id) on delete cascade,
  type text not null,
  medewerker_id uuid references public.medewerkers(id) on delete set null,
  naam text,
  email text,
  functie text,
  budget numeric,
  status text not null default 'wacht',
  aangevraagd_door text,
  behandeld_door text,
  behandeld_op timestamptz,
  notitie text,
  created_at timestamptz not null default now()
);
alter table public.medewerker_verzoeken enable row level security;
create policy verzoeken_sel on public.medewerker_verzoeken for select
  using (organisatie_id = current_org());
create policy verzoeken_ins on public.medewerker_verzoeken for insert
  with check (organisatie_id = current_org() and current_rol() = any (array['beheerder','leidinggevende']));

-- In-portaal meldingen voor medewerkers.
create table if not exists public.portaal_meldingen (
  id uuid primary key default gen_random_uuid(),
  organisatie_id uuid not null references public.organisaties(id) on delete cascade,
  medewerker_id uuid references public.medewerkers(id) on delete cascade,
  tekst text not null,
  gelezen boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.portaal_meldingen enable row level security;
create policy meldingen_sel on public.portaal_meldingen for select
  using (organisatie_id = current_org() and (medewerker_id = current_medewerker_id() or current_rol() = any (array['beheerder','leidinggevende'])));
