/** Token eklenmeyen ve 401'de yenileme denenmeyen kimlik doğrulama uçları. */
export function authUcuMu(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/refresh');
}
