export type NormalizedElection = {
  id?: string;
  name: string;
  date?: string;
  area?: string;
  source: 'electoral_commission' | 'democracy_club' | 'parliament' | 'civic_api';
  sourceUrl?: string;
  status?: string;
};

export type NormalizedCandidate = {
  name: string;
  party?: string;
  area?: string;
  electionId?: string;
  source: string;
};

export type NormalizedResult = {
  electionId?: string;
  area?: string;
  status: 'not_started' | 'polls_open' | 'counting' | 'partial' | 'declared' | 'unverified_third_party' | 'unknown';
  winner?: string;
  candidates?: Array<{
    name: string;
    party?: string;
    votes?: number;
    elected?: boolean;
  }>;
  source: string;
  sourceUrl?: string;
};

export type SubscriptionType = 'postcode' | 'election' | 'constituency' | 'council' | 'national' | 'results' | 'digest';

export interface GuildSettings {
  guild_id: string;
  default_channel_id: string | null;
  admin_role_id: string | null;
  timezone: string;
  update_interval_minutes: number;
  digest_enabled: number;
  digest_time: string;
  live_results_enabled: number;
  civic_api_enabled: number;
  embed_colour: string;
}

export interface Subscription {
  id: number;
  guild_id: string;
  channel_id: string;
  type: SubscriptionType;
  postcode: string | null;
  election_id: string | null;
  constituency: string | null;
  council: string | null;
  region: string | null;
  enabled: number;
  created_by: string | null;
  created_at: string | null;
}
