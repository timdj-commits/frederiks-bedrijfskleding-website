-- Nieuwsbrief-inschrijvingen (leadcapture vanaf de website).
create table if not exists nieuwsbrief_inschrijvingen (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  naam text,
  bron text,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_nieuwsbrief_email on nieuwsbrief_inschrijvingen (lower(email));
alter table nieuwsbrief_inschrijvingen enable row level security;
