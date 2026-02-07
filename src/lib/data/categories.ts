import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories.map((cat: { id: string; name: string; icon: string }) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
  };
}
