import { supabase } from './supabase';
import type { BackgroundOption, BackgroundCategory } from './constants';

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
      category: (row.category as BackgroundCategory) || 'custom',
      storage_path: row.storage_path,
    };
  });
}
