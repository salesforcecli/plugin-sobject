/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import input from '@inquirer/input';
import { Messages } from '@salesforce/core/messages';
import { makeNameApiCompatible } from './functions.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

export const apiNamePrompt = async (label: string, objectType: ObjectType): Promise<string> =>
  input({
    message: messages.getMessage('apiName', [getSuffix(objectType)]),
    validate: (i) =>
      i.endsWith(getSuffix(objectType)) ? true : messages.getMessage('apiName', [getSuffix(objectType)]),
    default: `${makeNameApiCompatible(label)}${getSuffix(objectType)}`,
  });

const getSuffix = (objectType: ObjectType): string => {
  switch (objectType) {
    case 'CustomObject':
    case 'CustomField':
      return '__c';
    case 'PlatformEvent':
      return '__e';
  }
};

type ObjectType = 'CustomObject' | 'PlatformEvent' | 'CustomField';
