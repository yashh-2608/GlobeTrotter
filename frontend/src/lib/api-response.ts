export async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error ?? "The service is temporarily unavailable")
  return payload as T
}
