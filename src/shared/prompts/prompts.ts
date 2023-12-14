/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ValueSet, CustomValue } from 'jsforce/api/metadata';
import { Messages, type NamedPackageDir } from '@salesforce/core';
import { Prompter } from '@salesforce/sf-plugins-core';
import { getDirectoriesThatContainObjects, getObjectDirectories } from '../fs.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

export const makeNameApiCompatible = (input: string): string =>
  input.replace(/ /g, '').replace(/-/g, '_').replace(/_{2,}/g, '_');

type ObjectType = 'CustomObject' | 'PlatformEvent' | 'CustomField';
const getSuffix = (objectType: ObjectType): string => {
  switch (objectType) {
    case 'CustomObject':
    case 'CustomField':
      return '__c';
    case 'PlatformEvent':
      return '__e';
  }
};
export const directoryPrompt = async (packageDirs: NamedPackageDir[]): Promise<Prompter.Answers> => ({
  type: 'list',
  message: messages.getMessage('directory'),
  name: 'directory',
  choices: await getDirectoriesThatContainObjects(packageDirs.map((pd) => pd.path)),
});

export const pluralPrompt = (label: string): Prompter.Answers => ({
  type: 'input',
  message: messages.getMessage('pluralLabel'),
  name: 'pluralLabel',
  default: `${label}s`,
});

export const apiNamePrompt = (label: string, objectType: ObjectType): Prompter.Answers => ({
  type: 'input',
  message: messages.getMessage('apiName'),
  name: 'fullName',
  default: `${makeNameApiCompatible(label)}${getSuffix(objectType)}`,
});

export const descriptionPrompt = {
  type: 'input',
  message: messages.getMessage('description'),
  name: 'description',
  validate: (input: string): true | string => (input.length ? true : messages.getMessage('error.noDescription')),
};

/** Ask about the name/type for the Name field, with a followup for AutoNumber format if AutoNumber is chosen  */
export const namePrompts = (label: string): Prompter.Answers[] => [
  {
    type: 'input',
    message: messages.getMessage('nameFieldPrompts.label'),
    name: 'nameFieldLabel',
    default: `${label} Name`,
  },
  {
    type: 'list',
    message: messages.getMessage('nameFieldPrompts.type'),
    name: 'nameFieldType',
    default: 'Text',
    choices: ['Text', 'AutoNumber'],
  },
  {
    type: 'input',
    when: (answers: { nameFieldType: string }) => answers.nameFieldType === 'AutoNumber',
    message: messages.getMessage('nameFieldPrompts.autoNumberFormat'),
    name: 'autoNumberFormat',
    default: `${label}-{0}`,
  },
];
/**
 *
 * @param packageDirs
 * @param name The "name" property of the Inquirer answer object.  Supports use of the question for multiple scenarios
 */
export const objectPrompt = async (
  packageDirs: NamedPackageDir[],
  name: 'object' | 'referenceTo' = 'object',
  message = messages.getMessage('object')
): Promise<Prompter.Answers> => ({
  type: 'list',
  message,
  name,
  choices: (await getObjectDirectories(packageDirs.map((pd) => pd.path)))
    .sort()
    .map((objDir) => ({ value: objDir, name: objDir.split('/').pop() })),
});

export const integerValidation = (value: number, min: number, max: number): true | string => {
  if (value < min) return messages.getMessage('numberValidationMin', [value, min]);
  if (value > max) return messages.getMessage('numberValidationMax', [value, max]);
  return true;
};

/**
 * recursively keep adding picklist values until the user says to stop
 */

export const picklistPrompts = async (): Promise<Omit<ValueSet, 'valueSettings'>> => {
  const output: CustomValue[] = [];
  let keepAsking = true;
  const prompter = new Prompter();

  while (keepAsking) {
    // the very definition of needing a loop for an await
    // eslint-disable-next-line no-await-in-loop
    const response = await prompter.prompt<{ picklistValue: string }>({
      type: 'input',
      name: 'picklistValue',
      validate: (input: string) => (output.find((v) => v.fullName === input) ? `${input} already exists` : true),
      message: output.length === 0 ? messages.getMessage('picklist.first') : messages.getMessage('picklist.additional'),
    });

    if (response.picklistValue === undefined || response.picklistValue === '') {
      keepAsking = false;
    } else {
      output.push({
        fullName: response.picklistValue,
        label: response.picklistValue,
        default: output.length === 0,
      });
    }
  }

  return {
    valueSetDefinition: {
      value: output,
      sorted: true,
    },
  };
};
