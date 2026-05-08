import { GuildMember, PermissionFlagsBits } from 'discord.js';
import { GuildSettings } from '../types';

export function isAdmin(member: GuildMember, settings: GuildSettings | null): boolean {
  if (member.permissions.has(PermissionFlagsBits.ManageGuild)) return true;
  if (member.guild.ownerId === member.id) return true;
  if (settings?.admin_role_id && member.roles.cache.has(settings.admin_role_id)) return true;
  return false;
}
