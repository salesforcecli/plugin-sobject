/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
