/** Backend: Api.Contracts.LoginRequest */
export interface LoginRequest {
  kullaniciAdi: string;
  sifre: string;
}

/** Backend: record LoginResponse(string AuthToken, int ExpiresIn) -> camelCase JSON */
export interface LoginResponse {
  authToken: string;
  expiresIn: number; // saniye
}
