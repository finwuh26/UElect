import axios from 'axios';
import logger from '../logger';
import * as cache from './cache';
import { config } from '../config';

const BASE_URL = 'https://api.electoralcommission.org.uk/api/v1';

async function fetchPostcode(postcode: string): Promise<unknown | null> {
  const cacheKey = `ec:${postcode}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/postcode/${encodeURIComponent(postcode)}/`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    logger.error({ err, postcode }, 'Electoral Commission API error');
    return null;
  }
}

export async function getElectionInfoByPostcode(postcode: string): Promise<unknown | null> {
  const data = await fetchPostcode(postcode);
  return data ?? null;
}

export async function getPollingStationByPostcode(postcode: string): Promise<unknown | null> {
  const data = await fetchPostcode(postcode) as Record<string, unknown> | null;
  return data?.polling_station ?? null;
}

export async function getCandidatesByPostcode(postcode: string): Promise<unknown | null> {
  const data = await fetchPostcode(postcode) as Record<string, unknown> | null;
  return data?.ballots ?? null;
}

export async function getRegistrationContactByPostcode(postcode: string): Promise<unknown | null> {
  const data = await fetchPostcode(postcode) as Record<string, unknown> | null;
  return data?.registration ?? null;
}
