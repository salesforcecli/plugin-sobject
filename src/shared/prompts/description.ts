/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import input from '@inquirer/input';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

export const descriptionPrompt = async (): Promise<string> =>
  input({
    message: messages.getMessage('description'),
    validate: (i: string): true | string => (i.length ? true : messages.getMessage('error.noDescription')),
  });
