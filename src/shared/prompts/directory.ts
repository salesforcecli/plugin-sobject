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
import { type NamedPackageDir, Messages } from '@salesforce/core';
import select from '@inquirer/select';
import { getDirectoriesThatContainObjects } from '../fs.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

export const directoryPrompt = async (packageDirs: NamedPackageDir[]): Promise<string> =>
  select({
    message: messages.getMessage('directory'),
    choices: (await getDirectoriesThatContainObjects(packageDirs.map((pd) => pd.path))).map((dir) => ({ value: dir })),
  });
