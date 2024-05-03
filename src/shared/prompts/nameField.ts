/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core/messages';
import input from '@inquirer/input';
import select from '@inquirer/select';

import { FieldType } from '@salesforce/types/metadata';
import { NameField } from '../types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

/** Ask about the name/type for the Name field, with a followup for AutoNumber format if AutoNumber is chosen  */
export const nameFieldPrompts = async (objectLabel: string): Promise<NameField> => {
  const label = await input({
    message: messages.getMessage('nameFieldPrompts.label'),
    default: `${objectLabel} Name`,
  });

  const type = await select<FieldType>({
    message: messages.getMessage('nameFieldPrompts.type'),
    default: 'Text',
    choices: [{ value: 'Text' }, { value: 'AutoNumber' }],
  });

  const displayFormat =
    type === 'AutoNumber'
      ? await input({
          message: messages.getMessage('nameFieldPrompts.autoNumberFormat'),
          default: `${objectLabel}-{0}`,
        })
      : undefined;
  return { label, type, ...(type === 'AutoNumber' ? { displayFormat } : {}) };
};
