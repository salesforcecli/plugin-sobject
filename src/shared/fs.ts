/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as fg from 'fast-glob';
import { CustomObject } from 'jsforce/api/metadata';
import { parseXml } from './convert';

export const getObjectDirectories = async (targetPaths: string[]): Promise<string[]> => {
  const globs = targetPaths.map((p) => `${p}/**/objects/`);
  return fg(globs, { onlyDirectories: true });
};

export const getObjectApiNames = async (targetPaths: string[]): Promise<string[]> => {
  const globs = targetPaths.map((p) => `${p}/**/objects/*`);
  return await fg(globs, { onlyDirectories: true });
};

export const getObjectXmlAsJson = async (targetPaths: string[], objectApiName: string): Promise<CustomObject> => {
  const globs = targetPaths.map((p) => `${p}/**/objects/${objectApiName}/${objectApiName}.object-meta.xml`);
  const [path] = await fg(globs);
  const xml = await fs.promises.readFile(path, 'utf8');
  return parseXml<CustomObject>(xml, 'CustomObject');
};
