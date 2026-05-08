import cron from 'node-cron';
import { Client } from 'discord.js';
import logger from '../logger';
import { runElectionMonitor } from '../jobs/electionMonitor';
import { runResultMonitor } from '../jobs/resultMonitor';
import { runDailyDigest } from '../jobs/dailyDigest';
import { resetAll } from '../utils/rateLimit';

const tasks: cron.ScheduledTask[] = [];

export function startScheduler(client: Client): void {
  // Hourly election monitor
  tasks.push(
    cron.schedule('0 * * * *', async () => {
      logger.info('Running election monitor');
      resetAll();
      await runElectionMonitor(client);
    }),
  );

  // Every 15 minutes result monitor
  tasks.push(
    cron.schedule('*/15 * * * *', async () => {
      logger.info('Running result monitor');
      await runResultMonitor(client);
    }),
  );

  // Daily digest at 9am
  tasks.push(
    cron.schedule('0 9 * * *', async () => {
      logger.info('Running daily digest');
      await runDailyDigest(client);
    }),
  );

  logger.info('Scheduler started');
}

export function stopScheduler(): void {
  for (const task of tasks) {
    task.stop();
  }
  tasks.length = 0;
  logger.info('Scheduler stopped');
}
