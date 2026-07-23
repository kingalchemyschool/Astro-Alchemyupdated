export interface SavedChart {
  id: string;
  name: string;
  birthInput: Record<string, unknown>;
  createdAt: string;
}

export async function fetchSavedCharts(): Promise<SavedChart[]> {
  const res = await fetch("/api/charts", { credentials: "include" });
  if (res.status === 401) return []; // Not signed in
  if (!res.ok) throw new Error("Failed to fetch charts");
  return res.json();
}

export async function saveChart(name: string, birthInput: Record<string, unknown>): Promise<SavedChart> {
  const res = await fetch("/api/charts", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, birthInput }),
  });
  if (!res.ok) throw new Error("Failed to save chart");
  return res.json();
}

export async function deleteChart(id: string): Promise<void> {
  await fetch(`/api/charts/${id}`, { method: "DELETE", credentials: "include" });
}