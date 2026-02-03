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

import { sep, resolve } from 'node:path';

import { Messages, SfError } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'flags');

// eslint-disable-next-line @typescript-eslint/require-await
export const labelValidation = async (label: string): Promise<string> => {
  if (label.length < 3) {
    throw new SfError(messages.getMessage('error.labelLength', [label]));
  }
  return label;
};

/**
 * Validates that a path contains /objects/ and at least one directory beyond that
 *
 * @param path: relative or full path
 * @returns true if valid
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const isObjectsFolder = async (path: string): Promise<string> => {
  const pathParts = resolve(path.trim()).split(sep);
  // has /objects/ AND objects is not the last item (there must be some child)
  if (pathParts.includes('objects') && pathParts[pathParts.length - 1] !== 'objects') {
    return path;
  }
  throw new SfError(messages.getMessage('error.objectDirectory', [path]));
};

/**
 * Validates that a path ends in /tabs
 *
 * @param path: relative or full path
 * @returns true if valid
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const isTabsFolder = async (path: string): Promise<string> => {
  // resolve will remove trailing separator
  const trimmed = resolve(path.trim());
  if (trimmed.endsWith('tabs')) {
    return trimmed;
  }
  throw new SfError(messages.getMessage('error.tabsDirectory', [path]));
};
