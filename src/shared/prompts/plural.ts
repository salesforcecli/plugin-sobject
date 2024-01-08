/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import input from '@inquirer/input';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

export const pluralPrompt = async (label: string): Promise<string> =>
  input({
    message: messages.getMessage('pluralLabel'),
    default: `${label}s`,
  });
