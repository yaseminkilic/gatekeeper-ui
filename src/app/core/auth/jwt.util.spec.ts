import { jwtCoz, jwtSuresiDolduMu, rolleriOku } from './jwt.util';

function tokenUret(payload: object): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.imza`;
}

describe('jwt.util', () => {
  it('payload alanlarını okur', () => {
    const t = tokenUret({ sub: '1', unique_name: 'admin', role: 'Admin' });
    const p = jwtCoz(t);
    expect(p?.unique_name).toBe('admin');
    expect(rolleriOku(p)).toEqual(['Admin']);
  });

  it('rol dizisini de destekler', () => {
    const p = jwtCoz(tokenUret({ role: ['Admin', 'User'] }));
    expect(rolleriOku(p)).toEqual(['Admin', 'User']);
  });

  it('bozuk token için null döner', () => {
    expect(jwtCoz('bozuk')).toBeNull();
    expect(rolleriOku(null)).toEqual([]);
  });

  it('süresi dolmuş ve dolmamış token ayırt edilir', () => {
    const simdi = Math.floor(Date.now() / 1000);
    expect(jwtSuresiDolduMu(tokenUret({ exp: simdi - 60 }))).toBe(true);
    expect(jwtSuresiDolduMu(tokenUret({ exp: simdi + 600 }))).toBe(false);
  });

  it('exp yoksa süresi dolmuş sayılır', () => {
    expect(jwtSuresiDolduMu(tokenUret({ sub: '1' }))).toBe(true);
  });
});
