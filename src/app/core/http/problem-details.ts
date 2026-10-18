import { HttpErrorResponse } from '@angular/common/http';

/** Backend: RFC 7807 ProblemDetails / ValidationProblemDetails (+ traceId uzantısı). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export function problemOku(hata: HttpErrorResponse): ProblemDetails | null {
  const govde: unknown = hata.error;
  return govde && typeof govde === 'object' ? (govde as ProblemDetails) : null;
}

/** Kullanıcıya gösterilecek en anlamlı mesajı seçer. */
export function problemMesaji(hata: HttpErrorResponse, varsayilan: string): string {
  const p = problemOku(hata);
  if (p?.errors) {
    const mesajlar = Object.values(p.errors).flat();
    if (mesajlar.length > 0) return mesajlar.join(' ');
  }
  return p?.title ?? varsayilan;
}
