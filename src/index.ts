import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import logger from './logger';
import { migrate } from './db/migrate';

import * as setup from './commands/setup';
import * as subscribe from './commands/subscribe';
import * as unsubscribe from './commands/unsubscribe';
import * as configure from './commands/configure';
import * as status from './commands/status';
import * as elections from './commands/elections';
import * as candidates from './commands/candidates';
import * as pollingstation from './commands/pollingstation';
import * as results from './commands/results';
import * as alerts from './commands/alerts';
import * as sources from './commands/sources';
import * as help from './commands/help';
import * as admin from './commands/admin';
import { startScheduler } from './services/scheduler';

migrate();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, (c) => {
  logger.info({ tag: c.user.tag }, 'Bot is ready');
  startScheduler(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'uelect') return;

  const group = interaction.options.getSubcommandGroup(false);
  const sub = interaction.options.getSubcommand(false);

  try {
    if (group === null) {
      switch (sub) {
        case 'setup': return await setup.execute(interaction);
        case 'pollingstation': return await pollingstation.execute(interaction);
        case 'sources': return await sources.execute(interaction);
        case 'status': return await status.execute(interaction);
        case 'help': return await help.execute(interaction);
        default:
          logger.warn({ sub }, 'Unknown top-level subcommand');
          return;
      }
    }

    switch (group) {
      case 'subscribe': return await subscribe.execute(interaction);
      case 'unsubscribe': return await unsubscribe.execute(interaction);
      case 'config': return await configure.execute(interaction);
      case 'elections': return await elections.execute(interaction);
      case 'candidates': return await candidates.execute(interaction);
      case 'results': return await results.execute(interaction);
      case 'alerts': return await alerts.execute(interaction);
      case 'admin': return await admin.execute(interaction);
      default:
        logger.warn({ group }, 'Unknown subcommand group');
    }
  } catch (err) {
    logger.error({ err }, 'Command handler error');
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: 'An error occurred while processing your command.' }).catch(() => {});
    } else {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true }).catch(() => {});
    }
  }
});

if (!config.DISCORD_TOKEN) {
  logger.error('DISCORD_TOKEN is not set');
  process.exit(1);
}

client.login(config.DISCORD_TOKEN).catch(err => {
  logger.error({ err }, 'Failed to login');
  process.exit(1);
});
