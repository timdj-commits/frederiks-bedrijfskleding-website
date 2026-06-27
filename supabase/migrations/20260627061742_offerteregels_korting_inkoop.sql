-- Kortingspercentage per offerteregel en de inkoopprijs (voor margeberekening).
alter table public.offerteregels
  add column if not exists korting_pct numeric not null default 0,
  add column if not exists inkoop numeric;
