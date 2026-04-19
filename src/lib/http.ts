export async function safeReadError(res: Response): Promise<string | null> {
  try {
    const json = (await res.json()) as { error?: string };
    return json.error ?? null;
  } catch {
    return null;
  }
}
