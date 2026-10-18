import { guvenliYonlendirme } from './guvenli-yonlendirme';

describe('guvenliYonlendirme', () => {
  it('uygulama içi yolu kabul eder', () => {
    expect(guvenliYonlendirme('/users/5')).toBe('/users/5');
  });

  it('harici adresi reddeder', () => {
    expect(guvenliYonlendirme('https://evil.com')).toBe('/users');
  });

  it('protokol bağımsız adresi reddeder', () => {
    expect(guvenliYonlendirme('//evil.com')).toBe('/users');
  });

  it('ters eğik çizgi hilesini reddeder', () => {
    expect(guvenliYonlendirme('/\\evil.com')).toBe('/users');
  });

  it('boş değerde varsayılana döner', () => {
    expect(guvenliYonlendirme(null)).toBe('/users');
  });
});
