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
