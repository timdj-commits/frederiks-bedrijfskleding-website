-- RLS-hulpfuncties hoeven niet door anonieme bezoekers aangeroepen te worden.
-- Authenticated behoudt EXECUTE, want de RLS-policies roepen deze functies aan
-- in de context van de ingelogde gebruiker.
revoke execute on function public.current_org() from anon;
revoke execute on function public.current_rol() from anon;
revoke execute on function public.current_medewerker_id() from anon;
