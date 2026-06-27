-- Groeimotor: prospect-CRM + outbound campagne/sequentie-engine.
-- Alle toegang gebeurt server-side via de service-role (kmsAdmin), net als de rest van het KMS.
-- RLS staat aan zonder policy: zo is alles geweigerd voor anon/authenticated en omzeilt
-- alleen de service-role het. Voorkomt de "RLS disabled in public"-melding.

create table if not exists public.prospecten (
  id uuid primary key default gen_random_uuid(),
  bedrijfsnaam text not null,
  contactpersoon text,
  email text,
  telefoon text,
  branche text,
  plaats text,
  website text,
  grootte text,
  bron text,
  status text not null default 'nieuw',
  score integer not null default 0,
  notitie text,
  laatste_contact timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campagnes (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  type text not null default 'cold',
  status text not null default 'concept',
  van_naam text,
  van_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.campagne_stappen (
  id uuid primary key default gen_random_uuid(),
  campagne_id uuid not null references public.campagnes(id) on delete cascade,
  volgorde integer not null default 1,
  wacht_dagen integer not null default 0,
  onderwerp text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.campagne_inschrijvingen (
  id uuid primary key default gen_random_uuid(),
  campagne_id uuid not null references public.campagnes(id) on delete cascade,
  prospect_id uuid not null references public.prospecten(id) on delete cascade,
  status text not null default 'actief',
  huidige_stap integer not null default 0,
  volgende_verzending timestamptz,
  created_at timestamptz not null default now(),
  unique (campagne_id, prospect_id)
);

create table if not exists public.campagne_verzendingen (
  id uuid primary key default gen_random_uuid(),
  inschrijving_id uuid references public.campagne_inschrijvingen(id) on delete cascade,
  prospect_id uuid references public.prospecten(id) on delete set null,
  stap_id uuid references public.campagne_stappen(id) on delete set null,
  onderwerp text,
  status text not null default 'verzonden',
  error text,
  verzonden_op timestamptz not null default now()
);

create table if not exists public.afmeldingen (
  email text primary key,
  reden text,
  created_at timestamptz not null default now()
);

alter table public.prospecten enable row level security;
alter table public.campagnes enable row level security;
alter table public.campagne_stappen enable row level security;
alter table public.campagne_inschrijvingen enable row level security;
alter table public.campagne_verzendingen enable row level security;
alter table public.afmeldingen enable row level security;

create index if not exists idx_inschrijvingen_verzending on public.campagne_inschrijvingen (status, volgende_verzending);
create index if not exists idx_prospecten_status on public.prospecten (status);
