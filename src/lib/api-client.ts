export async function apiFetch(url: string, options: RequestInit = {}) {
  const hasFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(hasFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
