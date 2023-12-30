/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import input from '@inquirer/input';
import { integerValidation } from '../functions.js';

const MAX_LONG_TEXT_LENGTH = 131072;
const MAX_TEXT_LENGTH = 255;

export const lengthPrompt = async (type: string): Promise<number | undefined> =>
  type === 'Text'
    ? Number(
        await input({
          message: `Length (max ${MAX_TEXT_LENGTH})`,
          default: MAX_TEXT_LENGTH.toString(),
          validate: integerValidation({ min: 1, max: MAX_TEXT_LENGTH }),
        })
      )
    : type === 'Html' || type === 'LongTextArea'
    ? Number(
        await input({
          message: `Length (max ${MAX_LONG_TEXT_LENGTH})`,
          default: MAX_LONG_TEXT_LENGTH.toString(),
          validate: integerValidation({ min: 1, max: MAX_LONG_TEXT_LENGTH }),
        })
      )
    : undefined;

export const visibleLinePrompt = async (type: string): Promise<number | undefined> =>
  type === 'Html' || type === 'LongTextArea'
    ? Number(
        await input({
          message: 'Visible Lines',
          validate: integerValidation({ min: 1, max: 1000 }),
          default: '5',
        })
      )
    : undefined;
