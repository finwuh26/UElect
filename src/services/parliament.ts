import axios from 'axios';
import logger from '../logger';
import * as cache from './cache';
import { config } from '../config';

const BASE_URL = 'https://members-api.parliament.uk/api';

export async function getCurrentMPByConstituency(name: string): Promise<unknown | null> {
  const cacheKey = `parliament:mp:${name}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/Members/Search`, {
      params: { constituency: name, IsCurrentMember: true, take: 1 },
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const d = data as Record<string, unknown>;
    const items = d?.items as Record<string, unknown>[] | undefined;
    const member = (items?.[0] as Record<string, unknown>)?.value ?? null;
    if (member) cache.set(cacheKey, member);
    return member;
  } catch (err) {
    logger.error({ err, name }, 'Parliament API getCurrentMPByConstituency error');
    return null;
  }
}

export async function getMemberById(memberId: number): Promise<unknown | null> {
  const cacheKey = `parliament:member:${memberId}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/Members/${memberId}`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const member = (data as Record<string, unknown>)?.value ?? null;
    if (member) cache.set(cacheKey, member);
    return member;
  } catch (err) {
    logger.error({ err, memberId }, 'Parliament API getMemberById error');
    return null;
  }
}

export async function searchMembers(query: string): Promise<unknown[]> {
  const cacheKey = `parliament:search:${query}`;
  const cached = cache.get<unknown[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/Members/Search`, {
      params: { Name: query, take: 10 },
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const items = (data as Record<string, unknown>)?.items as Record<string, unknown>[] ?? [];
    const members = items.map((i) => i.value);
    cache.set(cacheKey, members);
    return members;
  } catch (err) {
    logger.error({ err, query }, 'Parliament API searchMembers error');
    return [];
  }
}
