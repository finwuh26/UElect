import { describe, it, expect } from 'vitest';
import { validatePostcode, normalisePostcode, maskPostcode, hashContent } from '../utils/normalise';

describe('normalise', () => {
  it('validatePostcode SW1A 1AA', () => {
    expect(validatePostcode('SW1A 1AA')).toBe(true);
  });
  it('validatePostcode invalid', () => {
    expect(validatePostcode('invalid')).toBe(false);
  });
  it('validatePostcode EC1A 1BB', () => {
    expect(validatePostcode('EC1A 1BB')).toBe(true);
  });
  it('normalisePostcode', () => {
    expect(normalisePostcode('sw1a 1aa')).toBe('SW1A 1AA');
  });
  it('maskPostcode', () => {
    expect(maskPostcode('SW1A 1AA')).toBe('SW1A ***');
  });
  it('hashContent returns 64-char hex', () => {
    const h = hashContent({ a: 1 });
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });
});
