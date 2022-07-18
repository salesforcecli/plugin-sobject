/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fg from 'fast-glob';

export const getObjectDirectories = async (targetPaths: string[]): Promise<string[]> => {
  const globs = targetPaths.map((p) => `${p}/**/objects/`);
  return fg(globs, { onlyDirectories: true });
};
