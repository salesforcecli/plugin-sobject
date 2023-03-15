/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { NamedPackageDir } from '@salesforce/core';
import { prompt } from 'inquirer';
import { CustomField } from 'jsforce/api/metadata';
import { Messages } from '@salesforce/core';
import { getObjectXmlByFolderAsJson } from '../fs';
import { objectPrompt, makeNameApiCompatible } from './prompts';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.relationship');

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
    await objectPrompt(packageDirs, 'referenceTo', messages.getMessage('objectPrompt')),
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
      default: (answers: RelationshipFieldProperties) =>
        answers.relationshipLabel ? makeNameApiCompatible(answers.relationshipLabel) : undefined,
    },
    // lookup-only
    {
      type: 'list',
      name: 'deleteConstraint',
      message: messages.getMessage('lookupDeleteConstraint'),
      when: type === 'Lookup',
      default: 'SetNull',
      choices: [
        {
          value: 'SetNull',
          name: messages.getMessage('lookupDeleteConstraint.setNull'),
        },
        {
          value: 'Restrict',
          name: messages.getMessage('lookupDeleteConstraint.restrict'),
        },
        {
          value: 'Cascade',
          name: messages.getMessage('lookupDeleteConstraint.cascade'),
        },
      ],
    },
    // master-detail only
    {
      type: 'confirm',
      name: 'reparentableMasterDetail',
      message: messages.getMessage('reparentableMasterDetail'),
      when: type === 'MasterDetail',
      default: false,
    },
    {
      type: 'confirm',
      name: 'writeRequiresMasterRead',
      message: messages.getMessage('writeRequiresMasterRead'),
      when: type === 'MasterDetail',
      default: false,
    },
  ]);

  return {
    ...response,
    referenceTo: response.referenceTo?.split(path.sep).pop(),
  };
};
