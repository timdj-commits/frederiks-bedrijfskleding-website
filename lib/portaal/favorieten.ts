import { kmsAdmin } from '@/lib/kms/adminClient';

/**
 * Favorieten van een organisatie. RLS staat aan zonder policies, dus we werken
 * uitsluitend via de service-role client (kmsAdmin). Alleen server-side gebruiken.
 */

/** Product-ids van de favorieten van een organisatie. */
export async function getFavorieten(orgId: string): Promise<string[]> {
  const admin = kmsAdmin();
  if (!admin) return [];
  const { data, error } = await admin
    .from('favorieten')
    .select('product_id')
    .eq('organisatie_id', orgId);
  if (error || !data) return [];
  return data.map((r) => r.product_id as string);
}

/**
 * Zet een favoriet aan of uit voor een organisatie.
 * Bestaat de favoriet al → verwijderen en false teruggeven.
 * Bestaat hij nog niet → invoegen en true teruggeven.
 */
export async function toggleFavoriet(orgId: string, productId: string): Promise<boolean> {
  const admin = kmsAdmin();
  if (!admin) return false;

  const { data: bestaand } = await admin
    .from('favorieten')
    .select('id')
    .eq('organisatie_id', orgId)
    .eq('product_id', productId)
    .maybeSingle();

  if (bestaand) {
    await admin.from('favorieten').delete().eq('id', bestaand.id);
    return false;
  }

  await admin.from('favorieten').insert({ organisatie_id: orgId, product_id: productId });
  return true;
}
