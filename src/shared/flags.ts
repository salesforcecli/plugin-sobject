/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// eslint-disable-next-line @typescript-eslint/require-await
export const labelValidation = async (label: string): Promise<string> => {
  if (label.length < 2) {
    throw new Error(`Label must be at least ${2} characters`);
  }
  return label;
};
