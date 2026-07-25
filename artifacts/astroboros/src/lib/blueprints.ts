import { supabase } from "@/lib/supabase";
import type { BirthInput } from "@/types/astro";

export interface SavedBlueprint {
  id: string;
  name: string;
  birth_input: BirthInput;
  is_premium: boolean;
  created_at: string;
}

// Persist a blueprint anonymously (no account required) and return its id.
export async function saveBlueprint(
  input: BirthInput,
  isPremium: boolean
): Promise<string> {
  const table = (supabase as unknown as {
    from: (name: string) => {
      insert: (row: Record<string, unknown>) => {
        select: (columns: string) => {
          single: () => Promise<{ data: { id: string } | null; error: Error | null }>;
        };
      };
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: SavedBlueprint | null; error: Error | null }>;
        };
      };
    };
  }).from("blueprints");

  const { data, error } = await table
    .insert({
      name: input.name?.trim() || "Untitled Blueprint",
      birth_input: input,
      is_premium: isPremium,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Blueprint was saved without an id.");
  return data.id;
}

// Load a shared blueprint by id. Returns null when not found.
export async function loadBlueprint(id: string): Promise<SavedBlueprint | null> {
  const table = (supabase as unknown as {
    from: (name: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: SavedBlueprint | null; error: Error | null }>;
        };
      };
    };
  }).from("blueprints");

  const { data, error } = await table.select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ?? null;
}
