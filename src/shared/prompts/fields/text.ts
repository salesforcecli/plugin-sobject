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
import { integerValidation } from '../functions.js';

const MAX_LONG_TEXT_LENGTH = 131_072;
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
