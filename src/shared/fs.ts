/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'node:path';
import fs from 'node:fs';
import fg from 'fast-glob';
import type { CustomObject } from '@salesforce/types/metadata';
import { convertJsonToXml, parseXml } from './convert.js';
import { SaveableCustomObject, SaveablePlatformEvent } from './types.js';

const getObjectXmlByPathAsJson = async (objectFilePath: string): Promise<CustomObject> => {
  const xml = await fs.promises.readFile(objectFilePath, 'utf8');
  return parseXml<CustomObject>(xml, 'CustomObject');
};

/** globs don't support windows path, but the input might be */
const ensurePosixPath = (filePath: string): string => filePath.split(path.sep).join(path.posix.sep);

/**
 * @param targetPaths typically your pkgDirs or project path
 * @returns directories that end in `/objects/`
 */
export const getDirectoriesThatContainObjects = async (targetPaths: string[]): Promise<string[]> => {
  const globs = targetPaths.map((p) => `${ensurePosixPath(p)}/**/objects/`);
  return (await fg(globs, { onlyDirectories: true })).map((dir) => path.normalize(dir));
};

/**
 * @param targetPaths typically your pkgDirs or project path
 * @returns directories that are children of `/objects/` like `force-app/main/default/objects/Foo__c`
 */
export const getObjectDirectories = async (targetPaths: string[]): Promise<string[]> => {
  const globs = targetPaths.map((p) => `${ensurePosixPath(p)}/**/objects/*`);
  return (await fg(globs, { onlyDirectories: true })).map((dir) => path.normalize(dir));
};

/**
 * @param folder folder path to the object name (ex: `force-app/main/default/objects/Account`)
 * @returns CustomObject in json
 */
export const getObjectXmlByFolderAsJson = async (folder: string): Promise<CustomObject> => {
  const globs = `${ensurePosixPath(folder)}/*.object-meta.xml`;
  const [objectMetaPath] = await fg(globs);
  return getObjectXmlByPathAsJson(objectMetaPath);
};

/**
 *
 * @returns path where the object was written
 */
export const writeObjectFile = async (
  objectDirectory: string,
  object: SaveablePlatformEvent | SaveableCustomObject
): Promise<string> => {
  if (!object.fullName) throw new Error('object.fullName is required to write an object file');
  await fs.promises.mkdir(path.join(objectDirectory, object.fullName), { recursive: true });
  const targetFile = path.join(objectDirectory, object.fullName, `${object.fullName}.object-meta.xml`);
  await fs.promises.writeFile(targetFile, convertJsonToXml({ json: object, type: 'CustomObject' }));
  return targetFile;
};
