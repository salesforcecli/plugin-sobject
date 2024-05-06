/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import input from '@inquirer/input';
import { Messages } from '@salesforce/core/messages';
import type { ValueSet, CustomValue } from '../../../node_modules/@salesforce/types/lib/metadata.js';

/**
 * recursively keep adding picklist values until the user says to stop
 */
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

export const picklistPrompts = async (soFar: CustomValue[] = []): Promise<Omit<ValueSet, 'valueSettings'>> => {
  const newItem = await input({
    validate: (i: string) => (soFar.find((v) => v.fullName === i) ? `${i} already exists` : true),
    message: soFar.length === 0 ? messages.getMessage('picklist.first') : messages.getMessage('picklist.additional'),
  });

  return newItem === undefined || newItem === ''
    ? // we're done adding items, return a ValueSet
      {
        valueSetDefinition: {
          value: soFar,
          sorted: true,
        },
      }
    : // recurse to add another item
      picklistPrompts([
        ...soFar,
        {
          fullName: newItem,
          label: newItem,
          default: soFar.length === 0,
        },
      ]);
};
