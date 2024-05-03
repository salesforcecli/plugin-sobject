/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import input from '@inquirer/input';
import { Messages } from '@salesforce/core/messages';
import { integerValidation } from '../functions.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'generate.field');

export const precisionPrompt = async (type: string, scale: number | undefined): Promise<number | undefined> =>
  type === 'Number' || type === 'Currency'
    ? Number(
        await input({
          message: messages.getMessage('prompts.precision'),
          validate: integerValidation({ min: 1, max: 18 - (scale ?? 0) }),
          default: (18 - (scale ?? 0)).toString(),
        })
      )
    : undefined;
export const scalePrompt = async (type: string): Promise<number | undefined> =>
  type === 'Number' || type === 'Currency' || type === 'Location'
    ? Number(
        await input({
          message: messages.getMessage('prompts.scale'),
          validate: integerValidation({ min: 0, max: 18 }),
          default: '0',
        })
      )
    : undefined;
