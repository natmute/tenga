import { Shirt, Smartphone, Home, Sparkles, Dumbbell, BookOpen, UtensilsCrossed, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const slugToIcon: Record<string, LucideIcon> = {
  fashion: Shirt,
  electronics: Smartphone,
  'home-living': Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
  'food-drinks': UtensilsCrossed,
  'art-crafts': Palette,
};

const defaultIcon = Shirt;

export async function fetchCategories(): Promise<Category[]> {
  const { data: rows, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('name');
  if (error || !rows?.length) {
    return [];
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon: slugToIcon[r.slug] ?? defaultIcon,
    productCount: 0,
  }));
}
