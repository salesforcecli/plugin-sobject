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
