/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import select from '@inquirer/select';
import { Messages, type NamedPackageDir } from '@salesforce/core';
import { getObjectDirectories } from '../fs.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

/**
 *
 * @param packageDirs
 * @param message The message key
 */

export const objectPrompt = async (
  packageDirs: NamedPackageDir[],
  message = messages.getMessage('object')
): Promise<string> =>
  select({
    message,
    choices: (await getObjectDirectories(packageDirs.map((pd) => pd.path)))
      .sort()
      .map((objDir) => ({ value: objDir, name: objDir.split('/').pop() })),
  });
