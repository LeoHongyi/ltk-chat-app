import { Mastra } from '@mastra/core/mastra';
import { agents } from './agents/index.js';

/**
 * Mastra instance with all registered agents
 */
export const mastra = new Mastra({
  agents,
});

export { agents };
