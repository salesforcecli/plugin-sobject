/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
