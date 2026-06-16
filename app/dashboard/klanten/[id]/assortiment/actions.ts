'use server';
import { redirect } from 'next/navigation';
import { dashAuthed } from '@/lib/kms/adminClient';
import {
  zetInAssortiment,
  zetVerstrekking,
  VERSTREKKING_TYPES,
  PERIODE_TYPES,
  type VerstrekkingType,
  type Periode,
} from '@/lib/kms/assortiment';

function getal(formData: FormData, naam: string): number | null {
  const ruw = String(formData.get(naam) ?? '').replace(/[^0-9.,]/g, '').replace(',', '.');
  return ruw === '' ? null : Number(ruw);
}

function verstrekkingType(formData: FormData, naam: string): VerstrekkingType {
  const v = String(formData.get(naam) ?? '');
  return (VERSTREKKING_TYPES as readonly string[]).includes(v) ? (v as VerstrekkingType) : 'budget';
}

function periode(formData: FormData, naam: string): Periode {
  const v = String(formData.get(naam) ?? '');
  return (PERIODE_TYPES as readonly string[]).includes(v) ? (v as Periode) : 'jaar';
}

export async function wisselAssortiment(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  const id = String(formData.get('orgId') ?? '');
  const productId = String(formData.get('productId') ?? '');
  const aan = String(formData.get('aan') ?? '') === 'true';
  if (id && productId) await zetInAssortiment(id, productId, aan);
  redirect('/dashboard/klanten/' + id + '/assortiment');
}

export async function bewaarVerstrekking(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  const id = String(formData.get('orgId') ?? '');
  const productId = String(formData.get('productId') ?? '');
  if (id && productId) {
    await zetVerstrekking(
      { orgId: id, productId },
      {
        verstrekking_type: verstrekkingType(formData, 'verstrekking_type'),
        gratis_per_periode: getal(formData, 'gratis_per_periode'),
        periode: periode(formData, 'periode'),
      },
    );
  }
  redirect('/dashboard/klanten/' + id + '/assortiment');
}
