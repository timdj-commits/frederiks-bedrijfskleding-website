-- Koppel een drukproef optioneel aan een order, zodat een goedgekeurde drukproef
-- de order automatisch naar productie (borduren/bedrukken) kan doorzetten.
alter table public.drukproeven add column if not exists order_id uuid references public.orders(id) on delete set null;
create index if not exists idx_drukproeven_order on public.drukproeven (order_id);
