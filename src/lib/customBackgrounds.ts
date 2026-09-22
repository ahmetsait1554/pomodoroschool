import { supabase } from './supabase';
import type { BackgroundOption } from './constants';

export type CustomBackground = BackgroundOption & { storage_path: string };

export async function fetchCustomBackgrounds(): Promise<CustomBackground[]> {
  const { data, error } = await supabase
    .from('backgrounds')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const { data: urlData } = supabase.storage.from('backgrounds').getPublicUrl(row.storage_path);
    return {
      id: `custom-${row.id}`,
      name: row.name,
      url: urlData.publicUrl,
      overlay: row.overlay,
      category: 'custom' as const,
      storage_path: row.storage_path,
    };
  });
}
