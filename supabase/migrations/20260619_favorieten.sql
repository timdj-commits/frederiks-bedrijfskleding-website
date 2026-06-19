-- Favorieten per organisatie in het klantportaal (service-role beheerd).
create table if not exists favorieten (
  id uuid primary key default gen_random_uuid(),
  organisatie_id uuid not null,
  product_id uuid not null,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_favoriet_uniek on favorieten (organisatie_id, product_id);
alter table favorieten enable row level security;
