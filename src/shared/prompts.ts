/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { NamedPackageDir } from '@salesforce/core';
import { prompt, Question, ListQuestion } from 'inquirer';
import { ValueSet, CustomValue, CustomField } from 'jsforce/api/metadata';
import { Messages } from '@salesforce/core';
import { getDirectoriesThatContainObjects, getObjectDirectories } from './fs';
import { getObjectXmlByFolderAsJson } from './fs';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-generator', 'prompts.shared', [
  'directory',
  'pluralLabel',
  'apiName',
  'description',
  'nameFieldPrompts.autoNumberFormat',
  'nameFieldPrompts.label',
  'nameFieldPrompts.type',
  'object',
  'picklist.first',
  'picklist.additional',
  'numberValidationMin',
  'numberValidationMax',
  'error.noDescription',
]);

// TODO: wanna get rid of underscore and maybe just remove disallowed characters?
export const makeNameApiCompatible = (input: string): string => input.replace(/ /g, '_').replace(/-/g, '_');

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
export const directoryPrompt = async (packageDirs: NamedPackageDir[]): Promise<ListQuestion> => ({
  type: 'list',
  message: messages.getMessage('directory'),
  name: 'directory',
  choices: await getDirectoriesThatContainObjects(packageDirs.map((pd) => pd.path)),
});

export const pluralPrompt = (label: string): Question => ({
  type: 'input',
  message: messages.getMessage('pluralLabel'),
  name: 'pluralLabel',
  default: `${label}s`,
});

export const apiNamePrompt = (label: string, objectType: ObjectType): Question => ({
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
export const namePrompts = (label: string): Array<Question | ListQuestion> => [
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
    when: (answers: { nameFieldType: 'AutoNumber' | 'Text' }) => answers.nameFieldType === 'AutoNumber',
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
export const objectPrompt = async (packageDirs: NamedPackageDir[], name = 'object'): Promise<ListQuestion> => ({
  type: 'list',
  message: messages.getMessage('object'),
  name,
  choices: (await getObjectDirectories(packageDirs.map((pd) => pd.path)))
    .sort()
    .map((objDir) => ({ value: objDir, name: objDir.split('/').pop() })),
});

export const integerValidation = (value: number, min: number, max: number): true | string => {
  if (value < min) return messages.getMessage('numberValidationMin', [value, min]);
  if (value < min) return messages.getMessage('numberValidationMax', [value, max]);
  return true;
};

/**
 * recursively keep adding picklist values until the user says to stop
 */

export const picklistPrompts = async (): Promise<Omit<ValueSet, 'valueSettings'>> => {
  const output: CustomValue[] = [];
  let keepAsking = true;

  while (keepAsking) {
    const response = await prompt<{ picklistValue: string }>({
      type: 'input',
      name: 'picklistValue',
      validate: (input: string) => (output.find((v) => v.fullName === input) ? `${input} already exists` : true),
      message: output.length === 0 ? messages.getMessage('picklist.first') : messages.getMessage('picklist.first'),
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

type RelationshipFieldProperties = Pick<
  CustomField,
  | 'referenceTo'
  | 'relationshipLabel'
  | 'relationshipName'
  | 'deleteConstraint'
  | 'reparentableMasterDetail'
  | 'writeRequiresMasterRead'
  | 'relationshipOrder'
>;

export const relationshipFieldPrompts = async ({
  type,
  packageDirs,
  childObjectFolderPath,
}: {
  type: 'MasterDetail' | 'Lookup';
  packageDirs: NamedPackageDir[];
  childObjectFolderPath: string;
}): Promise<RelationshipFieldProperties> => {
  const childObjectXml = await getObjectXmlByFolderAsJson(childObjectFolderPath);
  const response = await prompt<RelationshipFieldProperties>([
    // prompt the user to select from objects in local source
    await objectPrompt(packageDirs, 'referenceTo'),
    {
      type: 'input',
      name: 'relationshipLabel',
      message: 'Relationship label',
      default: childObjectXml.pluralLabel,
    },
    {
      type: 'input',
      name: 'relationshipName',
      message: 'Relationship name',
      default: (answers: RelationshipFieldProperties) => makeNameApiCompatible(answers.relationshipLabel),
    },
    // lookup-only
    {
      type: 'list',
      name: 'deleteConstraint',
      message: 'What happens to this field when the parent is deleted?',
      when: type === 'Lookup',
      default: 'SetNull',
      choices: [
        {
          value: 'SetNull',
          name: 'If the parent record is deleted, the lookup field is cleared.',
        },
        {
          value: 'Restrict',
          name: 'Prevent the parent record from being deleted if there are lookups that refer to it ',
        },
        {
          value: 'Cascade',
          name: 'Deletes the lookup record as well as associated lookup fields',
        },
      ],
    },
    // master-detail only
    {
      type: 'confirm',
      name: 'reparentableMasterDetail',
      message: 'Allow reparenting',
      when: type === 'MasterDetail',
      default: false,
    },
    {
      type: 'confirm',
      name: 'writeRequiresMasterRead',
      message: 'Allow write access if parent is readable',
      when: type === 'MasterDetail',
      default: false,
    },
  ]);

  return {
    ...response,
    referenceTo: response.referenceTo.split(path.sep).pop(),
  };
};
