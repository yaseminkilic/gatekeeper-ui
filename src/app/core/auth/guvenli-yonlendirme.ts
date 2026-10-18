/** Open redirect koruması: yalnızca uygulama içi, tek '/' ile başlayan yollara izin ver */
export function guvenliYonlendirme(url: string | null, varsayilan = '/home'): string {
  if (!url) return varsayilan;

  const icYol =
    url.startsWith('/') && !url.startsWith('//') && !url.includes('\\') && !url.includes('://');

  return icYol ? url : varsayilan;
}
