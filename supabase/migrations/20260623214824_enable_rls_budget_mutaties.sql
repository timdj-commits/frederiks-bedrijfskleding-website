-- budget_mutaties wordt uitsluitend server-side via de service-role gelezen
-- (lib/kms/rapportages.ts). RLS aanzetten sluit de publieke toegang; zonder
-- policy is alles voor anon/authenticated geweigerd, de service-role omzeilt RLS.
alter table public.budget_mutaties enable row level security;
