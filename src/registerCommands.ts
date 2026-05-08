import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from './config';
import logger from './logger';

const command = new SlashCommandBuilder()
  .setName('uelect')
  .setDescription('UK election information and alerts')
  .addSubcommand(sc => sc
    .setName('setup')
    .setDescription('Configure UElect for this server')
    .addChannelOption(o => o.setName('channel').setDescription('Default channel for updates').setRequired(true))
    .addRoleOption(o => o.setName('admin_role').setDescription('Role with admin access to UElect').setRequired(false))
    .addStringOption(o => o.setName('timezone').setDescription('Server timezone (e.g. Europe/London)').setRequired(false))
    .addStringOption(o => o.setName('digest_time').setDescription('Time for daily digest (HH:MM)').setRequired(false)),
  )
  .addSubcommand(sc => sc
    .setName('pollingstation')
    .setDescription('Find your polling station')
    .addStringOption(o => o.setName('postcode').setDescription('Your UK postcode').setRequired(true)),
  )
  .addSubcommand(sc => sc.setName('sources').setDescription('View data sources used by UElect'))
  .addSubcommand(sc => sc.setName('status').setDescription('View UElect status for this server'))
  .addSubcommand(sc => sc.setName('help').setDescription('Show UElect help'))
  .addSubcommandGroup(g => g
    .setName('subscribe')
    .setDescription('Subscribe to election updates')
    .addSubcommand(sc => sc.setName('postcode').setDescription('Subscribe by postcode').addStringOption(o => o.setName('postcode').setDescription('UK postcode').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel for updates').setRequired(false)))
    .addSubcommand(sc => sc.setName('election').setDescription('Subscribe to a specific election').addStringOption(o => o.setName('election_id').setDescription('Election ID').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel for updates').setRequired(false)))
    .addSubcommand(sc => sc.setName('constituency').setDescription('Subscribe by constituency').addStringOption(o => o.setName('constituency').setDescription('Constituency name').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel for updates').setRequired(false)))
    .addSubcommand(sc => sc.setName('council').setDescription('Subscribe by council').addStringOption(o => o.setName('council').setDescription('Council name').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel for updates').setRequired(false)))
    .addSubcommand(sc => sc.setName('national').setDescription('Subscribe to national elections').addChannelOption(o => o.setName('channel').setDescription('Channel for updates').setRequired(false)))
    .addSubcommand(sc => sc.setName('results').setDescription('Subscribe to live results').addChannelOption(o => o.setName('channel').setDescription('Channel for updates').setRequired(false))),
  )
  .addSubcommandGroup(g => g
    .setName('unsubscribe')
    .setDescription('Unsubscribe from election updates')
    .addSubcommand(sc => sc.setName('postcode').setDescription('Unsubscribe from postcode').addStringOption(o => o.setName('postcode').setDescription('UK postcode').setRequired(true)))
    .addSubcommand(sc => sc.setName('election').setDescription('Unsubscribe from election').addStringOption(o => o.setName('election_id').setDescription('Election ID').setRequired(true)))
    .addSubcommand(sc => sc.setName('all').setDescription('Remove all subscriptions')),
  )
  .addSubcommandGroup(g => g
    .setName('config')
    .setDescription('Configure UElect settings')
    .addSubcommand(sc => sc.setName('view').setDescription('View current settings'))
    .addSubcommand(sc => sc.setName('channel').setDescription('Set default channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(sc => sc.setName('admin-role').setDescription('Set admin role').addRoleOption(o => o.setName('role').setDescription('Admin role').setRequired(true)))
    .addSubcommand(sc => sc.setName('interval').setDescription('Set update interval').addIntegerOption(o => o.setName('minutes').setDescription('Interval in minutes').setRequired(true)))
    .addSubcommand(sc => sc.setName('digest').setDescription('Configure daily digest').addBooleanOption(o => o.setName('enabled').setDescription('Enable/disable digest').setRequired(true)).addStringOption(o => o.setName('time').setDescription('Digest time HH:MM').setRequired(false)))
    .addSubcommand(sc => sc.setName('timezone').setDescription('Set timezone').addStringOption(o => o.setName('timezone').setDescription('Timezone').setRequired(true)))
    .addSubcommand(sc => sc.setName('colour').setDescription('Set embed colour').addStringOption(o => o.setName('colour').setDescription('Hex colour').setRequired(true))),
  )
  .addSubcommandGroup(g => g
    .setName('elections')
    .setDescription('Look up elections')
    .addSubcommand(sc => sc.setName('postcode').setDescription('Elections for a postcode').addStringOption(o => o.setName('postcode').setDescription('UK postcode').setRequired(true)))
    .addSubcommand(sc => sc.setName('national').setDescription('National elections'))
    .addSubcommand(sc => sc.setName('constituency').setDescription('Elections for a constituency').addStringOption(o => o.setName('name').setDescription('Constituency name').setRequired(true)))
    .addSubcommand(sc => sc.setName('council').setDescription('Elections for a council').addStringOption(o => o.setName('name').setDescription('Council name').setRequired(true))),
  )
  .addSubcommandGroup(g => g
    .setName('candidates')
    .setDescription('Look up candidates')
    .addSubcommand(sc => sc.setName('postcode').setDescription('Candidates for a postcode').addStringOption(o => o.setName('postcode').setDescription('UK postcode').setRequired(true)))
    .addSubcommand(sc => sc.setName('election').setDescription('Candidates for an election').addStringOption(o => o.setName('election_id').setDescription('Election ID').setRequired(true)))
    .addSubcommand(sc => sc.setName('constituency').setDescription('Candidates for a constituency').addStringOption(o => o.setName('name').setDescription('Constituency name').setRequired(true))),
  )
  .addSubcommandGroup(g => g
    .setName('results')
    .setDescription('View election results')
    .addSubcommand(sc => sc.setName('election').setDescription('Results for an election').addStringOption(o => o.setName('election_id').setDescription('Election ID').setRequired(true)))
    .addSubcommand(sc => sc.setName('constituency').setDescription('Results for a constituency').addStringOption(o => o.setName('name').setDescription('Constituency name').setRequired(true)))
    .addSubcommand(sc => sc.setName('latest').setDescription('Latest results')),
  )
  .addSubcommandGroup(g => g
    .setName('alerts')
    .setDescription('Manage alerts')
    .addSubcommand(sc => sc.setName('live-results').setDescription('Toggle live results alerts').addBooleanOption(o => o.setName('enabled').setDescription('Enable/disable').setRequired(true)))
    .addSubcommand(sc => sc.setName('candidates').setDescription('Toggle candidate alerts').addBooleanOption(o => o.setName('enabled').setDescription('Enable/disable').setRequired(true)))
    .addSubcommand(sc => sc.setName('polling-station').setDescription('Toggle polling station alerts').addBooleanOption(o => o.setName('enabled').setDescription('Enable/disable').setRequired(true)))
    .addSubcommand(sc => sc.setName('digest').setDescription('Toggle daily digest').addBooleanOption(o => o.setName('enabled').setDescription('Enable/disable').setRequired(true))),
  )
  .addSubcommandGroup(g => g
    .setName('admin')
    .setDescription('Admin commands')
    .addSubcommand(sc => sc.setName('list-subscriptions').setDescription('List all subscriptions'))
    .addSubcommand(sc => sc.setName('force-update').setDescription('Force an immediate update check'))
    .addSubcommand(sc => sc.setName('clear-cache').setDescription('Clear the data cache'))
    .addSubcommand(sc => sc.setName('audit-log').setDescription('View audit log').addIntegerOption(o => o.setName('limit').setDescription('Number of entries').setRequired(false))),
  );

async function registerCommands(): Promise<void> {
  if (!config.DISCORD_TOKEN || !config.DISCORD_CLIENT_ID) {
    logger.error('DISCORD_TOKEN and DISCORD_CLIENT_ID must be set');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
  const route = config.DISCORD_GUILD_ID
    ? Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID)
    : Routes.applicationCommands(config.DISCORD_CLIENT_ID);

  try {
    logger.info('Registering slash commands...');
    await rest.put(route, { body: [command.toJSON()] });
    logger.info('Slash commands registered successfully.');
  } catch (err) {
    logger.error({ err }, 'Failed to register slash commands');
    process.exit(1);
  }
}

if (require.main === module) {
  registerCommands();
}
