-- Taken / to-do's voor het dashboard (CRM-opvolging).
create table if not exists taken (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  omschrijving text,
  organisatie_id uuid references organisaties(id) on delete set null,
  status text not null default 'open',          -- open | klaar
  prioriteit text not null default 'normaal',   -- laag | normaal | hoog
  vervaldatum date,
  toegewezen_aan text,
  created_at timestamptz not null default now(),
  afgerond_op timestamptz
);
alter table taken enable row level security;
create index if not exists idx_taken_status on taken(status, vervaldatum);
