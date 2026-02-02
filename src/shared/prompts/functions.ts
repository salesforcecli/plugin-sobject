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
import { messages } from './nameField.js';

/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export const makeNameApiCompatible = (input: string): string =>
  input.replace(/ /g, '').replace(/-/g, '_').replace(/_{2,}/g, '_');

export const integerValidation =
  ({ min, max }: { min: number; max: number }) =>
  (input: string): true | string => {
    const value = Number(input);
    if (value < min) return messages.getMessage('numberValidationMin', [value, min]);
    if (value > max) return messages.getMessage('numberValidationMax', [value, max]);
    return true;
  };

export const toSelectOption = <T extends string>(s: T): { value: T } => ({ value: s });
