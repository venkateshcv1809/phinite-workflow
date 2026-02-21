import pino from 'pino';
import { CONFIG } from './config';

export class Logger {
  private logger;

  constructor() {
    this.logger = pino({
      level: CONFIG.IS_LOCAL ? 'debug' : 'info',
      browser: {
        asObject: true,
        disabled: !CONFIG.IS_LOCAL,
      },
      base: { pid: process.pid },
    });
  }

  info(msg: string, data: Record<string, unknown> = {}) {
    this.logger.info(data, msg);
  }

  error(msg: string, data: unknown = {}) {
    this.logger.error(data, msg);
  }

  warn(msg: string, data: Record<string, unknown> = {}) {
    this.logger.warn(data, msg);
  }

  debug(msg: string, data: Record<string, unknown> = {}) {
    this.logger.debug(data, msg);
  }
}

export const logger = new Logger();
export default logger;
