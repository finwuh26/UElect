import axios from 'axios';
import logger from '../logger';
import * as cache from './cache';
import { config } from '../config';
import { NormalizedElection, NormalizedCandidate, NormalizedResult } from '../types';

const EC_BASE = 'https://api.electoralcommission.org.uk/api/v1';
const CANDIDATES_BASE = 'https://candidates.democracyclub.org.uk/api/v0.9';
const ELECTIONS_BASE = 'https://elections.democracyclub.org.uk/api/elections';

function normalizeElection(raw: Record<string, unknown>): NormalizedElection {
  const org = raw.organisation as Record<string, unknown> | undefined;
  const area = raw.area as Record<string, unknown> | undefined;
  return {
    id: (raw.election_id ?? raw.id) as string | undefined,
    name: (raw.election_title ?? raw.name ?? raw.election_id ?? 'Unknown Election') as string,
    date: (raw.election_date ?? raw.date) as string | undefined,
    area: (org?.common_name ?? area?.name) as string | undefined,
    source: 'democracy_club',
    sourceUrl: (raw.url ?? `https://whocanivotefor.co.uk/elections/${raw.election_id ?? raw.id}/`) as string,
    status: raw.current ? 'current' : 'upcoming',
  };
}

function normalizeCandidate(raw: Record<string, unknown>): NormalizedCandidate {
  const person = raw.person as Record<string, unknown> | undefined;
  const party = raw.party as Record<string, unknown> | undefined;
  const post = raw.post as Record<string, unknown> | undefined;
  const ballot = raw.ballot as Record<string, unknown> | undefined;
  return {
    name: (person?.name ?? raw.name ?? 'Unknown') as string,
    party: (party?.party_name ?? raw.party_name) as string | undefined,
    area: (post?.label ?? raw.area) as string | undefined,
    electionId: (ballot?.ballot_paper_id ?? raw.election_id) as string | undefined,
    source: 'democracy_club',
  };
}

export async function getElectionsByPostcode(postcode: string): Promise<NormalizedElection[]> {
  const cacheKey = `dc:elections:${postcode}`;
  const cached = cache.get<NormalizedElection[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${EC_BASE}/postcode/${encodeURIComponent(postcode)}/`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const ballots: Record<string, unknown>[] = (data as Record<string, unknown>)?.ballots as Record<string, unknown>[] ?? [];
    const elections = ballots.map(b => normalizeElection(b));
    cache.set(cacheKey, elections);
    return elections;
  } catch (err) {
    logger.error({ err, postcode }, 'Democracy Club elections by postcode error');
    return [];
  }
}

export async function getElectionById(electionId: string): Promise<NormalizedElection | null> {
  const cacheKey = `dc:election:${electionId}`;
  const cached = cache.get<NormalizedElection>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${ELECTIONS_BASE}/${encodeURIComponent(electionId)}/`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const election = normalizeElection(data as Record<string, unknown>);
    cache.set(cacheKey, election);
    return election;
  } catch (err) {
    logger.error({ err, electionId }, 'Democracy Club getElectionById error');
    return null;
  }
}

export async function getBallotsByPostcode(postcode: string): Promise<unknown[]> {
  const cacheKey = `dc:ballots:${postcode}`;
  const cached = cache.get<unknown[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${EC_BASE}/postcode/${encodeURIComponent(postcode)}/`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const ballots = (data as Record<string, unknown>)?.ballots as unknown[] ?? [];
    cache.set(cacheKey, ballots);
    return ballots;
  } catch (err) {
    logger.error({ err, postcode }, 'Democracy Club getBallotsByPostcode error');
    return [];
  }
}

export async function getCandidatesByElection(electionId: string): Promise<NormalizedCandidate[]> {
  const cacheKey = `dc:candidates:${electionId}`;
  const cached = cache.get<NormalizedCandidate[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${CANDIDATES_BASE}/ballots/${encodeURIComponent(electionId)}/`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const d = data as Record<string, unknown>;
    const memberships: Record<string, unknown>[] = (d?.candidacies ?? d?.results ?? []) as Record<string, unknown>[];
    const candidates = memberships.map(normalizeCandidate);
    cache.set(cacheKey, candidates);
    return candidates;
  } catch (err) {
    logger.error({ err, electionId }, 'Democracy Club getCandidatesByElection error');
    return [];
  }
}

export async function getResultsByElection(electionId: string): Promise<NormalizedResult | null> {
  const cacheKey = `dc:results:${electionId}`;
  const cached = cache.get<NormalizedResult>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${CANDIDATES_BASE}/ballots/${encodeURIComponent(electionId)}/`, {
      timeout: config.HTTP_TIMEOUT_MS,
    });
    const d = data as Record<string, unknown>;

    const result: NormalizedResult = {
      electionId,
      status: d?.voting_system ? 'declared' : 'unknown',
      candidates: ((d?.candidacies ?? []) as Record<string, unknown>[]).map((c) => {
        const person = c.person as Record<string, unknown> | undefined;
        const party = c.party as Record<string, unknown> | undefined;
        const res = c.result as Record<string, unknown> | undefined;
        return {
          name: (person?.name ?? 'Unknown') as string,
          party: party?.party_name as string | undefined,
          votes: res?.num_ballots_won as number | undefined,
          elected: (res?.elected ?? false) as boolean,
        };
      }),
      source: 'democracy_club',
      sourceUrl: `https://whocanivotefor.co.uk/elections/${electionId}/`,
    };

    const winner = result.candidates?.find(c => c.elected);
    if (winner) result.winner = winner.name;

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.error({ err, electionId }, 'Democracy Club getResultsByElection error');
    return null;
  }
}
