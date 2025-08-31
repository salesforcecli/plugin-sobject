/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
