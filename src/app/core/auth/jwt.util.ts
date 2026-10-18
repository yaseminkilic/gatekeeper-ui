export interface JwtPayload {
  sub?: string;
  unique_name?: string;
  role?: string | string[];
  exp?: number;
  [anahtar: string]: unknown;
}

const ROL_URI = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/** JWT payload'ını okur. 
 * UYARI: imza DOĞRULANMAZ. Sonuç yalnızca arayüzü şekillendirmek (rol bazlı buton gösterme vb), güvenlik YOK.
 */
export function jwtCoz(token: string): JwtPayload | null {
  try {
    const parca = token.split('.')[1];
    if (!parca) return null;
    const b64 = parca.replace(/-/g, '+').replace(/_/g, '/');
    const dolgulu = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const bayt = Uint8Array.from(atob(dolgulu), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bayt)) as JwtPayload;
  } catch {
    return null;
  }
}

export function rolleriOku(payload: JwtPayload | null): string[] {
  if (!payload) return [];
  const ham = payload.role ?? payload[ROL_URI];
  if (Array.isArray(ham)) return ham.filter((r): r is string => typeof r === 'string');
  return typeof ham === 'string' ? [ham] : [];
}

export function jwtSuresiDolduMu(token: string, toleransSn = 10): boolean {
  const exp = jwtCoz(token)?.exp;
  if (typeof exp !== 'number') return true;
  return exp * 1000 <= Date.now() + toleransSn * 1000;
}
