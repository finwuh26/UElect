import crypto from 'crypto';

export function normalisePostcode(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, ' ').trim();
}

export function validatePostcode(postcode: string): boolean {
  const pattern = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-BD-HJLNP-UW-Z]{2}$/i;
  return pattern.test(postcode.replace(/\s+/g, ''));
}

export function maskPostcode(postcode: string): string {
  const parts = postcode.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ***`;
  }
  return postcode.slice(0, -3) + '***';
}

export function hashContent(data: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
