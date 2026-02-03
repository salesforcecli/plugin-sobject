/*
 * Copyright 2026, Salesforce, Inc.
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
import input from '@inquirer/input';
import { Messages } from '@salesforce/core/messages';
import type { ValueSet, CustomValue } from '@salesforce/types/metadata';

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
