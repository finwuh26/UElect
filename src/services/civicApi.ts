import { config } from '../config';
import logger from '../logger';

export async function searchRace(query: string): Promise<unknown[]> {
  if (!config.ENABLE_CIVIC_API) return [];
  logger.warn({ query }, 'CivicAPI is enabled but not implemented for UK elections');
  return [];
}

export async function getRaceById(id: string): Promise<unknown | null> {
  if (!config.ENABLE_CIVIC_API) return null;
  logger.warn({ id }, 'CivicAPI is enabled but not implemented for UK elections');
  return null;
}

export async function getStatus(): Promise<string> {
  if (!config.ENABLE_CIVIC_API) return 'disabled';
  return 'unverified_third_party';
}
