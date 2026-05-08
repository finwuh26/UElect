import { describe, it, expect } from 'vitest';
import { isAdmin } from '../utils/permissions';
import { PermissionFlagsBits } from 'discord.js';
import { GuildSettings } from '../types';

function makeMember(opts: {
  hasManageGuild?: boolean;
  isOwner?: boolean;
  roleIds?: string[];
  memberId?: string;
}): any {
  const memberId = opts.memberId ?? 'user123';
  return {
    id: memberId,
    guild: { ownerId: opts.isOwner ? memberId : 'owner999' },
    permissions: {
      has: (flag: bigint) => {
        if (flag === PermissionFlagsBits.ManageGuild) return opts.hasManageGuild ?? false;
        return false;
      },
    },
    roles: {
      cache: {
        has: (roleId: string) => (opts.roleIds ?? []).includes(roleId),
      },
    },
  };
}

const defaultSettings: GuildSettings = {
  guild_id: 'g1',
  default_channel_id: null,
  admin_role_id: null,
  timezone: 'Europe/London',
  update_interval_minutes: 60,
  digest_enabled: 1,
  digest_time: '09:00',
  live_results_enabled: 0,
  candidates_alerts_enabled: 1,
  polling_station_alerts_enabled: 1,
  civic_api_enabled: 0,
  embed_colour: '#2f80ed',
};

describe('isAdmin', () => {
  it('returns true for ManageGuild permission', () => {
    const member = makeMember({ hasManageGuild: true });
    expect(isAdmin(member, defaultSettings)).toBe(true);
  });

  it('returns true for guild owner', () => {
    const member = makeMember({ isOwner: true });
    expect(isAdmin(member, defaultSettings)).toBe(true);
  });

  it('returns true for admin role', () => {
    const member = makeMember({ roleIds: ['adminRole1'] });
    const settings = { ...defaultSettings, admin_role_id: 'adminRole1' };
    expect(isAdmin(member, settings)).toBe(true);
  });

  it('returns false for normal member', () => {
    const member = makeMember({});
    expect(isAdmin(member, defaultSettings)).toBe(false);
  });

  it('returns false with null settings', () => {
    const member = makeMember({});
    expect(isAdmin(member, null)).toBe(false);
  });
});
