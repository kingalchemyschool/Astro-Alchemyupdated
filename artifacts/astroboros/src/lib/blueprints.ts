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
  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      name: input.name?.trim() || "Untitled Blueprint",
      birth_input: input,
      is_premium: isPremium,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

// Load a shared blueprint by id. Returns null when not found.
export async function loadBlueprint(id: string): Promise<SavedBlueprint | null> {
  const { data, error } = await supabase
    .from("blueprints")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as SavedBlueprint) ?? null;
}
